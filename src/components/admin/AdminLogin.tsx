import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminInvitationService, AdminInvitation } from '../../services/adminService';
import { 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  Building2,
  X,
  CheckCircle2,
  Lock,
  UserPlus,
  User as UserIcon,
  Phone
} from 'lucide-react';

interface AdminLoginProps {
  onClose?: () => void;
  onCancel?: () => void;
  initialError?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onClose, onCancel, initialError }) => {
  const { login, forgotPassword, loginWithInvitationCode } = useAdmin();
  const dismiss = onClose || onCancel;

  const [mode, setMode] = useState<'signin' | 'forgot' | 'redeem'>('signin');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');

  // Invitation Code State
  const [invitationCode, setInvitationCode] = useState('');
  const [validatedInvitation, setValidatedInvitation] = useState<AdminInvitation | null>(null);

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto-detect invitation code from URL query parameter
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const codeFromUrl = urlParams.get('invite') || urlParams.get('code');
      if (codeFromUrl) {
        setInvitationCode(codeFromUrl.toUpperCase());
        setMode('redeem');
        handleValidateCode(codeFromUrl.toUpperCase());
      }
    } catch (e) {
      console.error('Error parsing URL params:', e);
    }
  }, []);

  const handleValidateCode = async (codeToTest?: string) => {
    const targetCode = codeToTest || invitationCode;
    if (!targetCode) {
      setError('Please enter a single-use invitation code.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await AdminInvitationService.validateInvitationCode(targetCode);
      if (!res.valid || !res.invitation) {
        setError(res.reason || 'Invalid or expired invitation code.');
        setValidatedInvitation(null);
      } else {
        setValidatedInvitation(res.invitation);
        setSuccessMsg(`Valid invitation code! Linked Role: ${res.invitation.role} (${res.invitation.email}).`);
      }
    } catch (err: any) {
      setError(err.message || 'Validation error occurred.');
      setValidatedInvitation(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitationCode) return;

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await loginWithInvitationCode(invitationCode);
      if (res.success) {
        setSuccessMsg(res.message);
        if (dismiss) setTimeout(dismiss, 600);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Invitation redemption failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please enter your staff email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed. Please verify your credentials.');
      } else {
        setSuccessMsg('Authenticated! Opening portal...');
        if (dismiss) setTimeout(dismiss, 500);
      }
    } catch (err: any) {
      setError(err.message || 'Login error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!resetEmail) {
      setError('Please enter your staff email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await forgotPassword(resetEmail);
      if (!res.success) {
        setError(res.message);
      } else {
        setSuccessMsg(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Password recovery request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Subtle Mesh */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0057B8]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative z-10 space-y-5">
        
        {dismiss && (
          <button 
            onClick={dismiss}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0057B8] text-white shadow-lg shadow-blue-900/40 mb-1">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Kenfoss Admin Portal
          </h1>
          <p className="text-xs text-slate-400">
            Enterprise Management System for Authorized Staff
          </p>
        </div>

        {/* Security Notice: Restricted Public Registration */}
        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-start space-x-2.5">
          <Lock className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-white">Restricted Access:</strong> Staff account creation (Manager & Technician) is managed exclusively by the Super Administrator inside the Staff Management module. Self-registration is disabled.
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* SIGN IN VIEW */}
        {mode === 'signin' && (
          <form onSubmit={handleSignInSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kenfoss.co.ke"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setError(null); setSuccessMsg(null); setMode('forgot'); }}
                  className="text-[11px] text-[#00AEEF] hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8] transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-[#0057B8] focus:ring-0"
                />
                <span>Remember Me</span>
              </label>

              <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL Secured</span>
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => { setError(null); setSuccessMsg(null); setMode('redeem'); }}
                className="text-xs text-[#00AEEF] hover:underline cursor-pointer font-medium flex items-center justify-center gap-1.5 mx-auto"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Have a single-use staff invitation code? Redeem Code</span>
              </button>
            </div>
          </form>
        )}

        {/* REDEEM INVITATION CODE VIEW */}
        {mode === 'redeem' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-1 border border-amber-500/20">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">Accept Staff Invitation</h3>
              <p className="text-xs text-slate-400">
                Enter the 8-character single-use invitation code provided by Super Admin.
              </p>
            </div>

            <form onSubmit={handleRedeemSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Invitation Code (e.g. KEN-A3X9K12L)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                    placeholder="KEN-XXXXXXXX"
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-400 focus:outline-none focus:border-[#0057B8]"
                  />
                  <button
                    type="button"
                    onClick={() => handleValidateCode()}
                    disabled={isLoading || !invitationCode}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    Validate
                  </button>
                </div>
              </div>

              {validatedInvitation && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Target Email:</span>
                    <span className="text-blue-400 font-mono font-bold">{validatedInvitation.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Assigned Role:</span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded">{validatedInvitation.role}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Expires At:</span>
                    <span className="text-slate-300 font-mono text-[10px]">{new Date(validatedInvitation.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !invitationCode}
                className="w-full py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Activating Account...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Redeem Code & Activate Access</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setError(null); setSuccessMsg(null); setMode('signin'); }}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 cursor-pointer transition-colors"
              >
                ← Back to Staff Sign In
              </button>
            </form>
          </div>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-1 border border-blue-500/20">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-white">Reset Password</h3>
              <p className="text-xs text-slate-400">
                Enter your staff email address to receive a password reset link.
              </p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Staff Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@kenfoss.co.ke"
                    className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Sending Link...</span>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setError(null); setSuccessMsg(null); setMode('signin'); }}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 cursor-pointer transition-colors"
              >
                ← Back to Sign In
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
