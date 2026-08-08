import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminAuthService } from '../../services/adminAuthService';
import { AdminLogin } from './AdminLogin';
import { SystemSetup } from './SystemSetup';
import { auth } from '../../lib/firebase';
import { getIdTokenResult, getIdToken } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

interface AdminRouteGuardProps {
  children: React.ReactNode;
  onCloseAdmin?: () => void;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children, onCloseAdmin }) => {
  const { isAuthenticated, currentUser, isSystemInitialized, refreshSystemSetupState } = useAdmin();
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [claimVerified, setClaimVerified] = useState<boolean>(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAdminClaims() {
      if (!isSystemInitialized) {
        if (isMounted) {
          setIsVerifying(false);
          setClaimVerified(false);
        }
        return;
      }

      const fbUser = auth.currentUser;
      if (!isAuthenticated || !fbUser) {
        if (isMounted) {
          setIsVerifying(false);
          setClaimVerified(false);
        }
        return;
      }

      try {
        setIsVerifying(true);
        setClaimError(null);

        // Get fresh ID token result from Firebase Auth
        await getIdToken(fbUser, true);
        const tokenResult = await getIdTokenResult(fbUser, true);
        const claims = tokenResult.claims;

        const roleClaim = (claims.role || claims.accessLevel || '') as string;
        const validRoles = ['super_admin', 'super administrator', 'manager', 'technician', 'admin', 'staff'];
        
        const hasClaim = roleClaim && validRoles.includes(roleClaim.toLowerCase());

        if (hasClaim) {
          if (isMounted) {
            setClaimVerified(true);
            setIsVerifying(false);
          }
          return;
        }

        // Call backend server verification endpoint as secondary check
        const verifyResult = await AdminAuthService.verifyAndRefreshToken(fbUser);
        if (verifyResult.success && (verifyResult.isSuperAdmin || verifyResult.claims?.role)) {
          if (isMounted) {
            setClaimVerified(true);
            setIsVerifying(false);
          }
          return;
        }

        // If custom claim is missing
        if (isMounted) {
          setClaimVerified(false);
          setClaimError(verifyResult.message || "ADMIN_CLAIM_MISSING: The authenticated user account lacks required administrator custom claims. Token verification failed.");
          setIsVerifying(false);
        }

      } catch (err: any) {
        console.error('[AdminRouteGuard] Verification error:', err);
        if (isMounted) {
          setClaimVerified(false);
          setClaimError(`ADMIN_CLAIM_MISSING: ${err?.message || 'Server token verification failed.'}`);
          setIsVerifying(false);
        }
      }
    }

    verifyAdminClaims();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isSystemInitialized, currentUser?.id]);

  // System Setup View
  if (!isSystemInitialized || showSetup) {
    return (
      <SystemSetup
        onSetupCompleted={() => {
          setShowSetup(false);
          refreshSystemSetupState();
        }}
        onCancel={() => {
          setShowSetup(false);
          if (!isSystemInitialized && onCloseAdmin) {
            onCloseAdmin();
          }
        }}
      />
    );
  }

  // Not Logged In -> Show Admin Login
  if (!isAuthenticated || !auth.currentUser) {
    return (
      <AdminLogin
        onCancel={onCloseAdmin}
        onSwitchToSetup={() => setShowSetup(true)}
      />
    );
  }

  // Verification loading spinner
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-center">
        <div className="space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-[#0057B8]/10 text-[#0057B8] flex items-center justify-center mx-auto border border-[#0057B8]/30">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-black text-white">Verifying Security Credentials...</h3>
          <p className="text-xs text-slate-400">
            Validating Firebase ID token and server-side administrator custom claims.
          </p>
        </div>
      </div>
    );
  }

  // Verification failed or custom claim missing -> Redirect to Login with error message
  if (!claimVerified || claimError) {
    return (
      <AdminLogin
        onCancel={onCloseAdmin}
        onSwitchToSetup={() => setShowSetup(true)}
        initialError={claimError || "ADMIN_CLAIM_MISSING: Account is authenticated but lacks Super Administrator custom claims. Access denied."}
      />
    );
  }

  // Authenticated & Verified -> Render Admin Portal
  return <>{children}</>;
};
