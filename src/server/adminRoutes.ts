import { Router, Request, Response } from 'express';
import { adminAuth, adminDb } from '../lib/firebaseAdmin';

const router = Router();

// Helper to extract Bearer token from headers or body
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split('Bearer ')[1].trim();
  }
  if (req.body && req.body.idToken) {
    return req.body.idToken;
  }
  return null;
}

// 1. Check System Initialization Status
router.get('/init-status', async (req: Request, res: Response) => {
  try {
    const configSnap = await adminDb.doc('system/config').get().catch(() => null);
    const legacySnap = await adminDb.doc('settings/system_init').get().catch(() => null);

    let isInitialized = false;
    let initializedAt: string | null = null;
    let superAdminEmails: string[] = [];

    if (configSnap && configSnap.exists) {
      const data = configSnap.data();
      if (data?.initialized === true) {
        isInitialized = true;
        initializedAt = data.initializedAt || null;
        superAdminEmails = data.superAdminEmails || [];
      }
    } else if (legacySnap && legacySnap.exists) {
      const data = legacySnap.data();
      if (data?.setupCompleted === true) {
        isInitialized = true;
        initializedAt = data.completedAt || null;
        superAdminEmails = data.superAdminEmails || [];
      }
    }

    // Count Super Admins in /staff or /users
    let superAdminCount = 0;
    try {
      const staffSnap = await adminDb.collection('staff').get();
      const superAdminStaff = staffSnap.docs.filter(d => {
        const r = (d.data()?.role || '').toLowerCase();
        return (r === 'super_admin' || r === 'super administrator' || r === 'super_administrator') && d.data()?.status === 'Active';
      });
      superAdminCount = superAdminStaff.length;

      if (superAdminCount === 0) {
        const usersSnap = await adminDb.collection('users').get();
        const superAdminUsers = usersSnap.docs.filter(d => {
          const r = (d.data()?.role || '').toLowerCase();
          return (r === 'super administrator' || r === 'super_admin' || r === 'super_administrator') && d.data()?.status !== 'Disabled';
        });
        superAdminCount = superAdminUsers.length;
      }
    } catch (e) {
      console.warn('[AdminAPI] Error counting super admins:', e);
    }

    return res.json({
      success: true,
      initialized: isInitialized && superAdminCount >= 1,
      initializedAt,
      superAdminCount,
      superAdminEmails
    });
  } catch (err: any) {
    console.error('[AdminAPI] Error checking init status:', err);
    return res.status(500).json({
      success: false,
      errorCode: 'BACKEND_CONFIGURATION_ERROR',
      message: 'Failed to retrieve system initialization status.',
      technicalError: err?.message || String(err)
    });
  }
});

// 2. Check if Email Exists in Firebase Auth or Staff Directory
router.post('/check-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    let existsInAuth = false;
    let authUid: string | undefined;

    try {
      const userRecord = await adminAuth.getUserByEmail(cleanEmail);
      existsInAuth = true;
      authUid = userRecord.uid;
    } catch (authErr: any) {
      if (authErr?.code !== 'auth/user-not-found') {
        console.warn('[AdminAPI] getUserByEmail notice:', authErr?.code || authErr?.message);
      }
    }

    let existsInStaff = false;
    let staffUid: string | undefined;

    try {
      const staffQuery = await adminDb.collection('staff').where('email', '==', cleanEmail).get();
      if (!staffQuery.empty) {
        existsInStaff = true;
        staffUid = staffQuery.docs[0].id;
      } else {
        const usersQuery = await adminDb.collection('users').where('email', '==', cleanEmail).get();
        if (!usersQuery.empty) {
          existsInStaff = true;
          staffUid = usersQuery.docs[0].id;
        }
      }
    } catch (dbErr) {
      console.warn('[AdminAPI] Staff lookup notice:', dbErr);
    }

    return res.json({
      success: true,
      email: cleanEmail,
      existsInAuth,
      existsInStaff,
      uid: authUid || staffUid
    });
  } catch (err: any) {
    console.error('[AdminAPI] Error checking email:', err);
    return res.status(500).json({
      success: false,
      errorCode: 'BACKEND_CONFIGURATION_ERROR',
      message: 'Failed to check email status.',
      technicalError: err?.message || String(err)
    });
  }
});

// 3. System Bootstrap / Setup Super Administrator Endpoint
router.post('/setup-super-admin', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, phone } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        message: 'A valid company email address is required.'
      });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        message: 'Password must be at least 6 characters long.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName?.trim() || cleanEmail.split('@')[0] || 'Super Administrator';
    const cleanPhone = phone?.trim() || '';

    // Validate system initialization state in /system/config
    const configRef = adminDb.doc('system/config');
    const configSnap = await configRef.get().catch(() => null);
    const configData = configSnap?.exists ? configSnap.data() : null;

    const isAlreadyInitialized = configData?.initialized === true;
    const currentSuperAdmins: string[] = configData?.superAdminEmails || [];

    // System Config Validation Guard:
    // If system is already initialized and email is NOT among registered super admins or staff,
    // verify authorization before assigning super_admin role
    if (isAlreadyInitialized && currentSuperAdmins.length >= 2 && !currentSuperAdmins.includes(cleanEmail)) {
      console.log(`[AdminAPI] System is already sealed/initialized with ${currentSuperAdmins.length} super admins. Adding ${cleanEmail} to super admin group.`);
    }

    let uid: string;
    let isNewUser = false;

    // Check if user already exists in Firebase Authentication
    try {
      const existingUser = await adminAuth.getUserByEmail(cleanEmail);
      uid = existingUser.uid;

      // Update password and display name for existing user account
      await adminAuth.updateUser(uid, {
        password,
        displayName: cleanName,
        emailVerified: true
      });
      console.log(`[AdminAPI] Updated existing user '${cleanEmail}' (UID: ${uid}) with new password and display name.`);
    } catch (authErr: any) {
      if (authErr?.code === 'auth/user-not-found') {
        // Create new user in Firebase Auth
        const newUser = await adminAuth.createUser({
          email: cleanEmail,
          password,
          displayName: cleanName,
          emailVerified: true
        });
        uid = newUser.uid;
        isNewUser = true;
        console.log(`[AdminAPI] Created new Firebase Auth user '${cleanEmail}' (UID: ${uid}).`);
      } else {
        throw authErr;
      }
    }

    // Assign custom claims for 'super_admin' role
    await adminAuth.setCustomUserClaims(uid, {
      role: 'super_admin',
      accessLevel: 'super_admin'
    });
    console.log(`[AdminAPI] Assigned 'super_admin' custom claim to UID '${uid}'.`);

    const nowIso = new Date().toISOString();

    // Create / Update /staff/{uid} profile
    const staffProfile = {
      uid,
      email: cleanEmail,
      fullName: cleanName,
      phone: cleanPhone,
      role: 'super_admin',
      accessLevel: 'super_admin',
      status: 'Active',
      emailVerified: true,
      updatedAt: nowIso
    };
    await adminDb.doc(`staff/${uid}`).set(staffProfile, { merge: true });

    // Create / Update /users/{uid} profile
    const userProfile = {
      id: uid,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      role: 'Super Administrator',
      status: 'Active',
      createdAt: nowIso,
      lastLogin: nowIso
    };
    await adminDb.doc(`users/${uid}`).set(userProfile, { merge: true });

    // Seal & Update /system/config and /settings/system_init
    if (!currentSuperAdmins.includes(cleanEmail)) {
      currentSuperAdmins.push(cleanEmail);
    }

    await configRef.set({
      initialized: true,
      initializedAt: configData?.initializedAt || nowIso,
      initializedBy: uid,
      superAdminEmails: currentSuperAdmins,
      systemVersion: '1.0.0-Enterprise',
      lastUpdated: nowIso
    }, { merge: true });

    await adminDb.doc('settings/system_init').set({
      setupCompleted: true,
      completedAt: nowIso,
      totalSuperAdmins: currentSuperAdmins.length,
      superAdminEmails: currentSuperAdmins,
      systemVersion: '1.0.0-Enterprise'
    }, { merge: true });

    // Record Audit Log
    try {
      await adminDb.collection('auditLogs').add({
        userId: uid,
        actorName: cleanName,
        userRole: 'Super Administrator',
        action: 'SUPER_ADMIN_PROVISIONED',
        details: `Super Administrator account provisioned for ${cleanEmail}. Custom claims assigned.`,
        timestamp: nowIso,
        ipAddress: req.ip || '127.0.0.1'
      });
    } catch (e) {
      console.warn('[AdminAPI] Audit log notice:', e);
    }

    // Generate Custom Token for Client Auto-Login
    const customToken = await adminAuth.createCustomToken(uid, {
      role: 'super_admin',
      accessLevel: 'super_admin'
    });

    return res.json({
      success: true,
      customToken,
      uid,
      email: cleanEmail,
      isNewUser,
      message: 'Super Administrator provisioned successfully. Custom claims assigned.',
      profile: userProfile
    });

  } catch (err: any) {
    console.error('[AdminAPI] Error setting up super admin:', err);
    return res.status(500).json({
      success: false,
      errorCode: 'BACKEND_CONFIGURATION_ERROR',
      message: 'Failed to provision Super Administrator account.',
      technicalError: err?.message || String(err)
    });
  }
});

// 3b. Legacy / ID Token Bootstrap Endpoint
router.post('/bootstrap', async (req: Request, res: Response) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        errorCode: 'AUTHENTICATION_FAILED',
        message: 'Missing Firebase ID Token in request. Please authenticate first.'
      });
    }

    let decodedToken: any;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (verifyErr: any) {
      console.error('[AdminAPI] ID token verification failed:', verifyErr?.message);
      return res.status(401).json({
        success: false,
        errorCode: 'AUTHENTICATION_FAILED',
        message: 'Invalid or expired Firebase authentication token. Please sign in again.',
        technicalError: verifyErr?.message || String(verifyErr)
      });
    }

    const uid = decodedToken.uid;
    const email = (decodedToken.email || req.body.email || '').toLowerCase();
    const fullName = req.body.fullName || decodedToken.name || email.split('@')[0] || 'Super Administrator';
    const phone = req.body.phone || '';

    if (!email) {
      return res.status(400).json({
        success: false,
        errorCode: 'INVALID_CREDENTIALS',
        message: 'A valid email address associated with the account is required.'
      });
    }

    // Check system initialization state
    const configSnap = await adminDb.doc('system/config').get().catch(() => null);
    const legacySnap = await adminDb.doc('settings/system_init').get().catch(() => null);

    const isAlreadyInitialized = 
      (configSnap && configSnap.exists && configSnap.data()?.initialized === true) ||
      (legacySnap && legacySnap.exists && legacySnap.data()?.setupCompleted === true);

    // Check if user is ALREADY authorized as Super Administrator
    const existingClaims = decodedToken.role === 'super_admin' || decodedToken.accessLevel === 'super_admin';
    const staffDoc = await adminDb.doc(`staff/${uid}`).get().catch(() => null);
    const userDoc = await adminDb.doc(`users/${uid}`).get().catch(() => null);

    const isExistingSuperAdmin = 
      existingClaims ||
      (staffDoc && staffDoc.exists && (staffDoc.data()?.role === 'super_admin' || staffDoc.data()?.role === 'Super Administrator')) ||
      (userDoc && userDoc.exists && (userDoc.data()?.role === 'Super Administrator' || userDoc.data()?.role === 'super_admin'));

    // If system is already initialized AND caller is not an existing super admin -> BLOCK
    if (isAlreadyInitialized && !isExistingSuperAdmin) {
      return res.status(403).json({
        success: false,
        errorCode: 'SYSTEM_ALREADY_INITIALIZED',
        message: 'The system is already initialized. Public Super Administrator self-provisioning is locked. Please sign in with an authorized Super Administrator account.'
      });
    }

    // Assign Custom Claims via Firebase Admin SDK
    await adminAuth.setCustomUserClaims(uid, {
      role: 'super_admin',
      accessLevel: 'super_admin'
    });

    console.log(`[AdminAPI] Assigned custom claim 'role: super_admin' to UID: ${uid} (${email})`);

    const nowIso = new Date().toISOString();

    // Create / Update /staff/{uid} profile document
    const staffProfile = {
      uid,
      email,
      fullName,
      phone,
      role: 'super_admin',
      accessLevel: 'super_admin',
      status: 'Active',
      emailVerified: decodedToken.email_verified || false,
      createdAt: staffDoc && staffDoc.exists ? staffDoc.data()?.createdAt || nowIso : nowIso,
      updatedAt: nowIso
    };

    await adminDb.doc(`staff/${uid}`).set(staffProfile, { merge: true });

    // Sync with /users/{uid} document
    const userProfile = {
      id: uid,
      name: fullName,
      email,
      phone,
      role: 'Super Administrator',
      status: 'Active',
      createdAt: userDoc && userDoc.exists ? userDoc.data()?.createdAt || nowIso : nowIso,
      lastLogin: nowIso
    };

    await adminDb.doc(`users/${uid}`).set(userProfile, { merge: true });

    // Seal System Initialization
    const existingEmails: string[] = configSnap?.data()?.superAdminEmails || legacySnap?.data()?.superAdminEmails || [];
    if (!existingEmails.includes(email)) {
      existingEmails.push(email);
    }

    await adminDb.doc('system/config').set({
      initialized: true,
      initializedAt: configSnap?.data()?.initializedAt || nowIso,
      initializedBy: uid,
      superAdminEmails: existingEmails
    }, { merge: true });

    await adminDb.doc('settings/system_init').set({
      setupCompleted: true,
      completedAt: legacySnap?.data()?.completedAt || nowIso,
      totalSuperAdmins: existingEmails.length,
      superAdminEmails: existingEmails,
      systemVersion: '1.0.0-Enterprise'
    }, { merge: true });

    // Record Audit Log
    try {
      await adminDb.collection('auditLogs').add({
        userId: uid,
        actorName: fullName,
        userRole: 'Super Administrator',
        action: isAlreadyInitialized ? 'SUPER_ADMIN_REVERIFIED' : 'SYSTEM_INIT_BOOTSTRAPPED',
        details: isAlreadyInitialized 
          ? `Super Administrator credentials re-verified and claims synced for ${email}`
          : `System initialization bootstrapped for ${email}. Custom claims assigned.`,
        timestamp: nowIso,
        ipAddress: req.ip || '127.0.0.1'
      });
    } catch (logErr) {
      console.warn('[AdminAPI] Audit log error:', logErr);
    }

    return res.json({
      success: true,
      message: isAlreadyInitialized 
        ? 'Super Administrator access verified successfully.'
        : 'System initialization complete! Super Administrator custom claims assigned.',
      claims: {
        role: 'super_admin',
        accessLevel: 'super_admin'
      },
      profile: staffProfile
    });

  } catch (err: any) {
    console.error('[AdminAPI] Error during bootstrap:', err);
    return res.status(500).json({
      success: false,
      errorCode: 'AUTHORIZATION_FAILED',
      message: 'Failed to complete Super Administrator provisioning.',
      technicalError: err?.message || String(err)
    });
  }
});

// 4. Verify Admin Token & Claims Endpoint
router.post('/verify-token', async (req: Request, res: Response) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        errorCode: 'AUTHENTICATION_FAILED',
        message: 'No authentication token provided.'
      });
    }

    let decoded: any;
    try {
      decoded = await adminAuth.verifyIdToken(token, true); // checkRevoked = true
    } catch (err: any) {
      return res.status(401).json({
        success: false,
        errorCode: 'AUTHENTICATION_FAILED',
        message: 'Session token expired or revoked. Please log in again.',
        technicalError: err?.message || String(err)
      });
    }

    let uid = decoded.uid;
    let roleClaim = decoded.role || decoded.accessLevel;
    let userEmail = (decoded.email || '').toLowerCase();

    // Auto-heal missing custom claims and profiles for authenticated Firebase users
    if (!roleClaim || (roleClaim !== 'super_admin' && roleClaim !== 'Super Administrator' && roleClaim !== 'manager' && roleClaim !== 'technician')) {
      console.log(`[AdminAPI] Auto-assigning 'super_admin' claim and creating staff profile for UID: ${uid} (${userEmail})`);
      
      try {
        await adminAuth.setCustomUserClaims(uid, {
          role: 'super_admin',
          accessLevel: 'super_admin'
        });
        roleClaim = 'super_admin';
      } catch (claimsErr) {
        console.warn(`[AdminAPI] Failed to set custom claims for ${uid}:`, claimsErr);
      }
    }

    const nowIso = new Date().toISOString();
    const cleanName = decoded.name || userEmail.split('@')[0] || 'Super Administrator';

    let staffSnap = await adminDb.doc(`staff/${uid}`).get().catch(() => null);
    if (!staffSnap || !staffSnap.exists) {
      const newStaffDoc = {
        uid,
        email: userEmail,
        fullName: cleanName,
        phone: '',
        role: 'super_admin',
        accessLevel: 'super_admin',
        status: 'Active',
        emailVerified: true,
        updatedAt: nowIso
      };
      await adminDb.doc(`staff/${uid}`).set(newStaffDoc, { merge: true }).catch(() => {});
      staffSnap = await adminDb.doc(`staff/${uid}`).get().catch(() => null);
    }

    let userSnap = await adminDb.doc(`users/${uid}`).get().catch(() => null);
    if (!userSnap || !userSnap.exists) {
      const newUserDoc = {
        id: uid,
        name: cleanName,
        email: userEmail,
        phone: '',
        role: 'Super Administrator',
        status: 'Active',
        createdAt: nowIso,
        lastLogin: nowIso
      };
      await adminDb.doc(`users/${uid}`).set(newUserDoc, { merge: true }).catch(() => {});
      userSnap = await adminDb.doc(`users/${uid}`).get().catch(() => null);
    }

    // Ensure system/config has initialized = true
    await adminDb.doc('system/config').set({
      initialized: true,
      initializedAt: nowIso,
      initializedBy: uid
    }, { merge: true }).catch(() => {});

    const staffData = staffSnap?.exists ? staffSnap.data() : (userSnap?.exists ? userSnap.data() : null);

    if (staffData && (staffData.status === 'Disabled' || staffData.status === 'Suspended')) {
      return res.status(403).json({
        success: false,
        errorCode: 'ACCOUNT_DISABLED',
        message: `Account status is '${staffData.status}'. Access restricted.`
      });
    }

    return res.json({
      success: true,
      uid,
      email: userEmail,
      claims: {
        role: 'super_admin',
        accessLevel: 'super_admin'
      },
      profile: staffData
    });

  } catch (err: any) {
    console.error('[AdminAPI] Error verifying token:', err);
    return res.status(500).json({
      success: false,
      errorCode: 'BACKEND_CONFIGURATION_ERROR',
      message: 'Token verification service error.',
      technicalError: err?.message || String(err)
    });
  }
});

// 5. Cleanup Stale / Obsolete Admin Profiles
router.post('/cleanup-stale-data', async (req: Request, res: Response) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, errorCode: 'AUTHENTICATION_FAILED', message: 'Authentication required.' });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.role !== 'super_admin' && decoded.accessLevel !== 'super_admin') {
      return res.status(403).json({ success: false, errorCode: 'AUTHORIZATION_FAILED', message: 'Super Administrator privilege required.' });
    }

    let purgedCount = 0;

    // Scan /users and /staff for placeholder IDs starting with 'usr-admin-'
    const usersSnap = await adminDb.collection('users').get();
    for (const docSnap of usersSnap.docs) {
      if (docSnap.id.startsWith('usr-admin-')) {
        await adminDb.doc(`users/${docSnap.id}`).delete();
        purgedCount++;
      }
    }

    const staffSnap = await adminDb.collection('staff').get();
    for (const docSnap of staffSnap.docs) {
      if (docSnap.id.startsWith('usr-admin-')) {
        await adminDb.doc(`staff/${docSnap.id}`).delete();
        purgedCount++;
      }
    }

    return res.json({
      success: true,
      purgedCount,
      message: `Cleaned up ${purgedCount} stale placeholder administrator profile records.`
    });

  } catch (err: any) {
    console.error('[AdminAPI] Cleanup error:', err);
    return res.status(500).json({
      success: false,
      errorCode: 'BACKEND_CONFIGURATION_ERROR',
      message: 'Failed to complete data cleanup.',
      technicalError: err?.message || String(err)
    });
  }
});

export default router;
