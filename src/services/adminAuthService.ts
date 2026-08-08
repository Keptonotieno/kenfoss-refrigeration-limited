import { User, getIdToken, getIdTokenResult, signInWithCustomToken } from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface AdminAuthVerificationResult {
  success: boolean;
  isSuperAdmin: boolean;
  claims?: any;
  profile?: any;
  customToken?: string;
  errorCode?: string;
  message?: string;
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
    try {
      const res = await fetch('/api/admin/provisionSuperAdmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.customToken) {
        return {
          success: false,
          isSuperAdmin: false,
          errorCode: data.errorCode || 'PROVISIONING_FAILED',
          message: data.message || 'Failed to provision Super Administrator via invitation token.'
        };
      }

      // Sign in on client using generated custom token
      const userCred = await signInWithCustomToken(auth, data.customToken);
      await getIdToken(userCred.user, true);
      const tokenResult = await getIdTokenResult(userCred.user, true);

      const isSuper = tokenResult.claims.role === 'super_admin' || tokenResult.claims.accessLevel === 'super_admin';

      return {
        success: true,
        isSuperAdmin: isSuper,
        customToken: data.customToken,
        claims: tokenResult.claims,
        profile: data.profile,
        message: data.message
      };
    } catch (err: any) {
      console.error('[AdminAuthService] Error in provisionSuperAdmin:', err);
      return {
        success: false,
        isSuperAdmin: false,
        errorCode: 'SERVER_ERROR',
        message: err?.message || 'Failed to communicate with provisioning server.'
      };
    }
  }

  /**
   * Provision or Update Super Administrator via secure backend, assign custom claims, and sign in with custom token
   */
  static async setupSuperAdminDirect(params: {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
  }): Promise<AdminAuthVerificationResult> {
    try {
      const res = await fetch('/api/admin/setup-super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.customToken) {
        return {
          success: false,
          isSuperAdmin: false,
          errorCode: data.errorCode || 'PROVISIONING_FAILED',
          message: data.message || 'Failed to provision Super Administrator account via server.'
        };
      }

      // Sign in on client using the generated custom token!
      const userCred = await signInWithCustomToken(auth, data.customToken);

      // Refresh token on client to confirm claims
      await getIdToken(userCred.user, true);
      const tokenResult = await getIdTokenResult(userCred.user, true);

      const isSuper = tokenResult.claims.role === 'super_admin' || tokenResult.claims.accessLevel === 'super_admin';

      return {
        success: true,
        isSuperAdmin: isSuper,
        customToken: data.customToken,
        claims: tokenResult.claims,
        profile: data.profile,
        message: data.message
      };

    } catch (err: any) {
      console.error('[AdminAuthService] Error in setupSuperAdminDirect:', err);
      return {
        success: false,
        isSuperAdmin: false,
        errorCode: 'BACKEND_CONFIGURATION_ERROR',
        message: err?.message || 'Failed to connect to backend server for Super Admin provisioning.'
      };
    }
  }

  /**
   * Check if the system has been initialized according to backend
   */
  static async checkInitStatus(): Promise<{ initialized: boolean; superAdminCount: number; initializedAt?: string }> {
    try {
      const res = await fetch('/api/admin/init-status');
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      return {
        initialized: !!data.initialized,
        superAdminCount: data.superAdminCount || 0,
        initializedAt: data.initializedAt
      };
    } catch (err) {
      console.warn('[AdminAuthService] Error checking init status from backend:', err);
      return { initialized: false, superAdminCount: 0 };
    }
  }

  /**
   * Check if an email is already registered in Firebase Auth or Staff Directory
   */
  static async checkEmailExists(email: string): Promise<{ existsInAuth: boolean; existsInStaff: boolean; uid?: string }> {
    try {
      const res = await fetch('/api/admin/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) return { existsInAuth: false, existsInStaff: false };
      const data = await res.json();
      return {
        existsInAuth: !!data.existsInAuth,
        existsInStaff: !!data.existsInStaff,
        uid: data.uid
      };
    } catch (err) {
      console.warn('[AdminAuthService] Error checking email:', err);
      return { existsInAuth: false, existsInStaff: false };
    }
  }

  /**
   * Call backend bootstrap endpoint with ID token to set Super Admin custom claims & create staff profile
   */
  static async bootstrapAdmin(user: User, fullName?: string, phone?: string): Promise<AdminAuthVerificationResult> {
    try {
      const idToken = await getIdToken(user, true); // Get fresh ID token
      const res = await fetch('/api/admin/bootstrap', {
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

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          isSuperAdmin: false,
          errorCode: data.errorCode || 'AUTHORIZATION_FAILED',
          message: data.message || 'Failed to complete Super Administrator provisioning.'
        };
      }

      // Force refresh the token on client so new claims are loaded into the client SDK!
      await getIdToken(user, true);
      const tokenResult = await getIdTokenResult(user, true);
      const isSuper = tokenResult.claims.role === 'super_admin' || tokenResult.claims.accessLevel === 'super_admin';

      return {
        success: true,
        isSuperAdmin: isSuper,
        claims: tokenResult.claims,
        profile: data.profile,
        message: data.message
      };

    } catch (err: any) {
      console.error('[AdminAuthService] Error bootstrapping admin:', err);
      return {
        success: false,
        isSuperAdmin: false,
        errorCode: 'BACKEND_CONFIGURATION_ERROR',
        message: err?.message || 'Network error communicating with backend server.'
      };
    }
  }

  /**
   * Force refresh token & verify admin custom claims
   */
  static async verifyAndRefreshToken(user: User): Promise<AdminAuthVerificationResult> {
    try {
      // Force refresh ID token
      await getIdToken(user, true);
      const tokenResult = await getIdTokenResult(user, true);

      const claims = tokenResult.claims;
      const role = claims.role || claims.accessLevel;

      const isSuper = role === 'super_admin' || role === 'Super Administrator';
      const isStaff = isSuper || role === 'manager' || role === 'technician' || role === 'admin';

      if (!isStaff) {
        // Try calling backend to verify if user should be bootstrapped or has staff profile
        const idToken = tokenResult.token;
        const res = await fetch('/api/admin/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          }
        });

        const data = await res.json();
        if (!data.success) {
          return {
            success: false,
            isSuperAdmin: false,
            errorCode: data.errorCode || 'ADMIN_CLAIM_MISSING',
            message: data.message || 'Account lacks administrator claims.'
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
