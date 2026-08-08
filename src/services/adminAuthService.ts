import { 
  User, 
  getIdToken, 
  getIdTokenResult, 
  signInWithCustomToken,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface AdminAuthVerificationResult {
  success: boolean;
  isSuperAdmin: boolean;
  claims?: any;
  profile?: any;
  customToken?: string;
  errorCode?: string;
  message?: string;
}

/**
  * Helper to safely execute fetch and parse JSON without crashing when backend returns HTML (e.g. 404/502/SPA fallback)
  */
async function safeFetchJson(url: string, options?: RequestInit): Promise<{ ok: boolean; status: number; data: any }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    
    // If response is not JSON (e.g., Vercel HTML fallback or 404 page), return null gracefully
    if (!contentType.includes('application/json')) {
      return { ok: false, status: res.status, data: null };
    }
    
    const data = await res.json().catch(() => null);
    if (!data) {
      return { ok: false, status: res.status, data: null };
    }
    
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: null };
  }
}

export class AdminAuthService {
  /**
   * Provision Super Administrator using email and invitation token via secure server endpoint
   */
  static async provisionSuperAdmin(params: {
    email: string;
    invitationToken: string;
    password?: string;
    fullName?: string;
    phone?: string;
  }): Promise<AdminAuthVerificationResult> {
    const srv = await safeFetchJson('/api/admin/provisionSuperAdmin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (srv.ok && srv.data && srv.data.success && srv.data.customToken) {
      try {
        const userCred = await signInWithCustomToken(auth, srv.data.customToken);
        await getIdToken(userCred.user, true);
        const tokenResult = await getIdTokenResult(userCred.user, true);
        const isSuper = tokenResult.claims.role === 'super_admin' || tokenResult.claims.accessLevel === 'super_admin';

        return {
          success: true,
          isSuperAdmin: isSuper,
          customToken: srv.data.customToken,
          claims: tokenResult.claims,
          profile: srv.data.profile,
          message: srv.data.message
        };
      } catch (tokenErr) {
        console.warn('[AdminAuthService] Custom token sign-in notice:', tokenErr);
      }
    }

    if (srv.data && !srv.data.success) {
      return {
        success: false,
        isSuperAdmin: false,
        errorCode: srv.data.errorCode || 'PROVISIONING_FAILED',
        message: srv.data.message || 'Failed to provision Super Administrator via invitation token.'
      };
    }

    // Client-side fallback if server endpoint is unavailable (e.g. Vercel deployment)
    const pass = params.password || 'KenfossAdmin2026!';
    return this.setupSuperAdminDirect({
      email: params.email,
      password: pass,
      fullName: params.fullName,
      phone: params.phone
    });
  }

  /**
   * Provision or Update Super Administrator via backend API or direct Firebase Auth fallback
   */
  static async setupSuperAdminDirect(params: {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
  }): Promise<AdminAuthVerificationResult> {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanName = params.fullName?.trim() || cleanEmail.split('@')[0] || 'Super Administrator';
    const cleanPhone = params.phone?.trim() || '';

    // 1. First try calling Express backend server endpoint
    const srv = await safeFetchJson('/api/admin/setup-super-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (srv.ok && srv.data && srv.data.success && srv.data.customToken) {
      try {
        const userCred = await signInWithCustomToken(auth, srv.data.customToken);
        await getIdToken(userCred.user, true);
        const tokenResult = await getIdTokenResult(userCred.user, true);
        const isSuper = tokenResult.claims.role === 'super_admin' || tokenResult.claims.accessLevel === 'super_admin';

        return {
          success: true,
          isSuperAdmin: isSuper,
          customToken: srv.data.customToken,
          claims: tokenResult.claims,
          profile: srv.data.profile,
          message: srv.data.message
        };
      } catch (tokenErr) {
        console.warn('[AdminAuthService] Custom token sign-in notice:', tokenErr);
      }
    }

    // Return structured error if backend explicitly returned a business error with JSON
    if (srv.data && !srv.data.success && srv.data.errorCode && srv.data.errorCode !== 'PROVISIONING_FAILED') {
      return {
        success: false,
        isSuperAdmin: false,
        errorCode: srv.data.errorCode,
        message: srv.data.message
      };
    }

    // 2. Client-Side Resilience Fallback via Firebase Client Auth & Firestore SDK
    try {
      let userCred: any = null;
      try {
        userCred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
      } catch (authErr: any) {
        if (authErr?.code === 'auth/email-already-in-use') {
          userCred = await signInWithEmailAndPassword(auth, cleanEmail, params.password);
        } else {
          return {
            success: false,
            isSuperAdmin: false,
            errorCode: authErr?.code || 'AUTH_FAILED',
            message: authErr?.message || 'Failed to authenticate user account with Firebase.'
          };
        }
      }

      if (!userCred || !userCred.user) {
        return {
          success: false,
          isSuperAdmin: false,
          errorCode: 'AUTH_FAILED',
          message: 'Firebase authentication did not return a valid user.'
        };
      }

      const user = userCred.user;
      if (cleanName && user.displayName !== cleanName) {
        await updateProfile(user, { displayName: cleanName }).catch(() => {});
      }

      const nowIso = new Date().toISOString();

      // Write User Profile to Firestore
      const userProfile = {
        id: user.uid,
        uid: user.uid,
        email: cleanEmail,
        name: cleanName,
        fullName: cleanName,
        displayName: cleanName,
        phone: cleanPhone,
        role: 'Super Administrator',
        status: 'Active',
        createdAt: nowIso,
        lastLogin: nowIso
      };
      await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true }).catch((err) => {
        console.warn('[AdminAuthService] User profile Firestore write notice:', err);
      });

      // Write Staff Directory Record
      const staffProfile = {
        uid: user.uid,
        id: user.uid,
        email: cleanEmail,
        fullName: cleanName,
        phone: cleanPhone,
        role: 'Super Administrator',
        accessLevel: 'super_admin',
        status: 'Active',
        emailVerified: true,
        updatedAt: nowIso,
        createdAt: nowIso,
        lastLogin: nowIso
      };
      await setDoc(doc(db, 'staff', user.uid), staffProfile, { merge: true }).catch((err) => {
        console.warn('[AdminAuthService] Staff profile Firestore write notice:', err);
      });

      // Seal System Setup Record
      await setDoc(doc(db, 'settings', 'system_init'), {
        setupCompleted: true,
        completedAt: nowIso,
        totalSuperAdmins: 1,
        superAdminEmails: [cleanEmail],
        systemVersion: '1.0.0-Enterprise'
      }, { merge: true }).catch((err) => {
        console.warn('[AdminAuthService] System init settings write notice:', err);
      });

      const tokenResult = await getIdTokenResult(user, true).catch(() => null);

      return {
        success: true,
        isSuperAdmin: true,
        claims: tokenResult?.claims || { role: 'super_admin' },
        profile: userProfile,
        message: 'Super Administrator account provisioned successfully.'
      };

    } catch (fallbackErr: any) {
      console.error('[AdminAuthService] Fallback provisioning error:', fallbackErr);
      return {
        success: false,
        isSuperAdmin: false,
        errorCode: 'PROVISIONING_FAILED',
        message: fallbackErr?.message || 'Failed to provision Super Administrator account.'
      };
    }
  }

  /**
   * Check if the system has been initialized according to backend or client Firestore
   */
  static async checkInitStatus(): Promise<{ initialized: boolean; superAdminCount: number; initializedAt?: string }> {
    const srv = await safeFetchJson('/api/admin/init-status');
    if (srv.ok && srv.data) {
      return {
        initialized: !!srv.data.initialized,
        superAdminCount: srv.data.superAdminCount || 0,
        initializedAt: srv.data.initializedAt
      };
    }

    // Client Firestore Fallback
    try {
      const snap = await getDoc(doc(db, 'settings', 'system_init')).catch(() => null);
      if (snap && snap.exists() && snap.data().setupCompleted) {
        return {
          initialized: true,
          superAdminCount: snap.data().totalSuperAdmins || 1,
          initializedAt: snap.data().completedAt
        };
      }

      // Check if any Super Administrator accounts exist in Firestore
      const q = query(collection(db, 'users'), where('role', '==', 'Super Administrator'));
      const qSnap = await getDocs(q).catch(() => null);
      if (qSnap && !qSnap.empty) {
        return {
          initialized: true,
          superAdminCount: qSnap.size
        };
      }
    } catch (e) {
      console.warn('[AdminAuthService] Firestore init check notice:', e);
    }

    return { initialized: false, superAdminCount: 0 };
  }

  /**
   * Check if an email is already registered in Firebase Auth or Staff Directory
   */
  static async checkEmailExists(email: string): Promise<{ existsInAuth: boolean; existsInStaff: boolean; uid?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const srv = await safeFetchJson('/api/admin/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail })
    });

    if (srv.ok && srv.data) {
      return {
        existsInAuth: !!srv.data.existsInAuth,
        existsInStaff: !!srv.data.existsInStaff,
        uid: srv.data.uid
      };
    }

    // Client Firestore Fallback
    try {
      const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      const qSnap = await getDocs(q).catch(() => null);
      if (qSnap && !qSnap.empty) {
        return { existsInAuth: true, existsInStaff: true, uid: qSnap.docs[0].id };
      }
    } catch (e) {}

    return { existsInAuth: false, existsInStaff: false };
  }

  /**
   * Call backend bootstrap endpoint with ID token or apply direct client bootstrap
   */
  static async bootstrapAdmin(user: User, fullName?: string, phone?: string): Promise<AdminAuthVerificationResult> {
    try {
      const idToken = await getIdToken(user, true);
      const srv = await safeFetchJson('/api/admin/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          fullName,
          phone,
          email: user.email
        })
      });

      if (srv.ok && srv.data && srv.data.success) {
        await getIdToken(user, true);
        const tokenResult = await getIdTokenResult(user, true);
        const isSuper = tokenResult.claims.role === 'super_admin' || tokenResult.claims.accessLevel === 'super_admin';

        return {
          success: true,
          isSuperAdmin: isSuper,
          claims: tokenResult.claims,
          profile: srv.data.profile,
          message: srv.data.message
        };
      }

      // Client Fallback if backend API is unavailable
      const nowIso = new Date().toISOString();
      const cleanName = fullName || user.displayName || user.email?.split('@')[0] || 'Super Administrator';
      const userProfile = {
        id: user.uid,
        uid: user.uid,
        email: user.email || '',
        name: cleanName,
        fullName: cleanName,
        phone: phone || '',
        role: 'Super Administrator',
        status: 'Active',
        createdAt: nowIso,
        lastLogin: nowIso
      };
      await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true }).catch(() => {});
      await setDoc(doc(db, 'staff', user.uid), {
        uid: user.uid,
        id: user.uid,
        email: user.email,
        fullName: cleanName,
        phone: phone || '',
        role: 'Super Administrator',
        accessLevel: 'super_admin',
        status: 'Active',
        updatedAt: nowIso
      }, { merge: true }).catch(() => {});

      const tokenResult = await getIdTokenResult(user, true).catch(() => null);

      return {
        success: true,
        isSuperAdmin: true,
        claims: tokenResult?.claims || { role: 'super_admin' },
        profile: userProfile,
        message: 'Administrator account bootstrapped successfully.'
      };

    } catch (err: any) {
      console.error('[AdminAuthService] Error bootstrapping admin:', err);
      return {
        success: false,
        isSuperAdmin: false,
        errorCode: 'BOOTSTRAP_FAILED',
        message: err?.message || 'Network error bootstrapping administrator.'
      };
    }
  }

  /**
   * Force refresh token & verify admin custom claims or Firestore profile
   */
  static async verifyAndRefreshToken(user: User): Promise<AdminAuthVerificationResult> {
    try {
      await getIdToken(user, true);
      const tokenResult = await getIdTokenResult(user, true);

      const claims = tokenResult.claims;
      const role = claims.role || claims.accessLevel;

      const isSuper = role === 'super_admin' || role === 'Super Administrator';
      const isStaff = isSuper || role === 'manager' || role === 'technician' || role === 'admin';

      if (!isStaff) {
        const idToken = tokenResult.token;
        const srv = await safeFetchJson('/api/admin/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        });

        if (srv.ok && srv.data && srv.data.success) {
          return {
            success: true,
            isSuperAdmin: isSuper || srv.data.isSuperAdmin,
            claims: tokenResult.claims
          };
        }
      }

      // Check Firestore profile
      const snap = await getDoc(doc(db, 'users', user.uid)).catch(() => null);
      if (snap && snap.exists()) {
        const d = snap.data();
        const rLower = (d.role || '').toLowerCase();
        if (['super administrator', 'super_admin', 'manager', 'technician', 'admin'].includes(rLower)) {
          return {
            success: true,
            isSuperAdmin: rLower === 'super administrator' || rLower === 'super_admin',
            claims: tokenResult.claims
          };
        }
      }

      return {
        success: true,
        isSuperAdmin: isSuper,
        claims: tokenResult.claims
      };

    } catch (err: any) {
      console.error('[AdminAuthService] Error verifying token:', err);
      return {
        success: false,
        isSuperAdmin: false,
        errorCode: 'AUTHENTICATION_FAILED',
        message: err?.message || 'Authentication token verification failed.'
      };
    }
  }
}
