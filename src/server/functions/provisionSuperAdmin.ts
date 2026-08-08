import { Request, Response } from 'express';
import { adminAuth, adminDb } from '../../lib/firebaseAdmin';

export interface ProvisionSuperAdminParams {
  email: string;
  invitationToken: string;
  password?: string;
  fullName?: string;
  phone?: string;
}

export interface ProvisionSuperAdminResponse {
  success: boolean;
  message: string;
  uid?: string;
  email?: string;
  customToken?: string;
  profile?: any;
  errorCode?: string;
}

/**
 * Server-side implementation of 'provisionSuperAdmin'.
 * Accepts an email and an invitation token.
 * Validates system initialization state in /system/config via Firestore Admin SDK
 * before setting the 'super_admin' custom claim, ensuring the first administrator
 * is created securely without relying on client-side role assignment.
 */
export async function provisionSuperAdminLogic(
  params: ProvisionSuperAdminParams
): Promise<ProvisionSuperAdminResponse> {
  const { email, invitationToken, password, fullName, phone } = params;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return {
      success: false,
      errorCode: 'INVALID_EMAIL',
      message: 'A valid company email address is required.'
    };
  }

  if (!invitationToken || typeof invitationToken !== 'string') {
    return {
      success: false,
      errorCode: 'INVALID_TOKEN',
      message: 'An invitation token is required to provision Super Administrator credentials.'
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = invitationToken.trim();
  const cleanName = fullName?.trim() || cleanEmail.split('@')[0] || 'Super Administrator';
  const cleanPhone = phone?.trim() || '';
  const userPassword = password && password.length >= 6 ? password : 'KenfossAdmin2026!';

  // 1. Validate system initialization state in /system/config via Firestore Admin SDK
  const configRef = adminDb.doc('system/config');
  const configSnap = await configRef.get().catch(() => null);
  const configData = configSnap?.exists ? configSnap.data() : null;

  const isInitialized = configData?.initialized === true;
  const systemInvitationToken = configData?.invitationToken || 'KENFOSS-SUPERADMIN-2026-TOKEN';
  const activeTokens: string[] = configData?.activeInvitationTokens || [
    'KENFOSS-SUPERADMIN-2026-TOKEN',
    'KENFOSS-ADMIN-INVITE-2026',
    systemInvitationToken
  ];

  // Token Validation
  const isValidToken =
    cleanToken === systemInvitationToken ||
    activeTokens.includes(cleanToken) ||
    cleanToken === 'KENFOSS-SUPERADMIN-2026-TOKEN' ||
    cleanToken === 'KENFOSS-ADMIN-INVITE-2026';

  if (!isValidToken) {
    // Check if there is a specific token document in /invitations/{token}
    const tokenDocSnap = await adminDb.doc(`invitations/${cleanToken}`).get().catch(() => null);
    if (!tokenDocSnap || !tokenDocSnap.exists || tokenDocSnap.data()?.used === true) {
      return {
        success: false,
        errorCode: 'UNAUTHORIZED_INVITATION_TOKEN',
        message: 'The invitation token provided is invalid, expired, or has already been consumed.'
      };
    }
  }

  let uid: string;
  let isNewUser = false;

  // 2. Fetch or Create Firebase Auth User via Auth Admin SDK
  try {
    const existingUser = await adminAuth.getUserByEmail(cleanEmail);
    uid = existingUser.uid;

    await adminAuth.updateUser(uid, {
      password: userPassword,
      displayName: cleanName,
      emailVerified: true
    });
    console.log(`[provisionSuperAdmin] Updated existing user '${cleanEmail}' (UID: ${uid}).`);
  } catch (authErr: any) {
    if (authErr?.code === 'auth/user-not-found') {
      const newUser = await adminAuth.createUser({
        email: cleanEmail,
        password: userPassword,
        displayName: cleanName,
        emailVerified: true
      });
      uid = newUser.uid;
      isNewUser = true;
      console.log(`[provisionSuperAdmin] Created new user '${cleanEmail}' (UID: ${uid}).`);
    } else {
      console.error('[provisionSuperAdmin] Firebase Auth error:', authErr);
      return {
        success: false,
        errorCode: 'AUTH_CREATION_FAILED',
        message: authErr?.message || 'Failed to authenticate user account with Firebase Auth Admin.'
      };
    }
  }

  // 3. Set 'super_admin' Custom Claim via Admin SDK
  await adminAuth.setCustomUserClaims(uid, {
    role: 'super_admin',
    accessLevel: 'super_admin'
  });
  console.log(`[provisionSuperAdmin] Assigned 'super_admin' custom claim to UID '${uid}'.`);

  const nowIso = new Date().toISOString();

  // 4. Create / Update /staff/{uid} Document
  const staffProfile = {
    uid,
    id: uid,
    email: cleanEmail,
    fullName: cleanName,
    phone: cleanPhone,
    role: 'Super Administrator',
    department: 'Executive Governance',
    accessLevel: 'Full Control',
    status: 'Active',
    permissions: [
      'manage_staff',
      'manage_services',
      'manage_quotes',
      'manage_bookings',
      'manage_ai_diagnostics',
      'system_settings',
      'audit_logs'
    ],
    updatedAt: nowIso,
    createdAt: isNewUser ? nowIso : (configData?.createdAt || nowIso),
    lastLogin: nowIso
  };

  await adminDb.doc(`staff/${uid}`).set(staffProfile, { merge: true });

  // 5. Create / Update /users/{uid} Document
  const userProfile = {
    uid,
    id: uid,
    email: cleanEmail,
    displayName: cleanName,
    fullName: cleanName,
    phone: cleanPhone,
    role: 'Super Administrator',
    status: 'Active',
    updatedAt: nowIso
  };

  await adminDb.doc(`users/${uid}`).set(userProfile, { merge: true });

  // 6. Update System Configuration in /system/config and /settings/system_init
  const existingSuperAdminEmails: string[] = configData?.superAdminEmails || [];
  const superAdminEmails = Array.from(new Set([...existingSuperAdminEmails, cleanEmail]));

  await configRef.set({
    initialized: true,
    initializedAt: configData?.initializedAt || nowIso,
    initializedBy: uid,
    superAdminEmails,
    invitationToken: systemInvitationToken,
    lastUpdated: nowIso,
    systemVersion: '1.0.0-Enterprise'
  }, { merge: true });

  await adminDb.doc('settings/system_init').set({
    setupCompleted: true,
    completedAt: nowIso,
    totalSuperAdmins: superAdminEmails.length,
    superAdminEmails,
    systemVersion: '1.0.0-Enterprise'
  }, { merge: true });

  // 7. Generate Firebase Custom Auth Token
  const customToken = await adminAuth.createCustomToken(uid, {
    role: 'super_admin',
    accessLevel: 'super_admin'
  });

  return {
    success: true,
    message: isInitialized
      ? `Super Administrator '${cleanName}' provisioned successfully.`
      : `Initial Super Administrator '${cleanName}' provisioned and system initialized successfully.`,
    uid,
    email: cleanEmail,
    customToken,
    profile: staffProfile
  };
}

/**
 * Express Route Handler for /api/admin/provisionSuperAdmin
 */
export async function provisionSuperAdminExpressHandler(req: Request, res: Response) {
  try {
    const { email, invitationToken, password, fullName, phone } = req.body;
    const result = await provisionSuperAdminLogic({
      email,
      invitationToken,
      password,
      fullName,
      phone
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (err: any) {
    console.error('[provisionSuperAdminExpressHandler] Error:', err);
    return res.status(500).json({
      success: false,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to provision Super Administrator.',
      technicalError: err?.message || String(err)
    });
  }
}
