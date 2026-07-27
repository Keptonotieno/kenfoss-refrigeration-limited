import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  UserPlus, 
  RefreshCw, 
  Building2,
  X,
  CheckCircle2
} from 'lucide-react';

interface AdminLoginProps {
  onClose?: () => void;
  onCancel?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onClose, onCancel }) => {
  const { login, validateInvitationCode, forgotPassword, resetPassword } = useAdmin();
  const dismiss = onClose || onCancel;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / View states
  const [view, setView] = useState<'login' | 'forgot' | 'restricted_signup'>('login');
  const [inviteCode, setInviteCode] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [newPassword, setNewPassword] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email) {
      setError('Please enter your staff email address.');
      return;
    }

    const res = login(email, password || 'Kenfoss2026!');
    if (!res.success) {
      setError(res.error || 'Authentication failed.');
    } else {
      setSuccessMsg('Authentication successful! Opening Admin Portal...');
      if (dismiss) setTimeout(dismiss, 500);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Kenfoss2026!');
    setError(null);
    const res = login(demoEmail, 'Kenfoss2026!');
    if (!res.success) {
      setError(res.error || 'Quick login failed.');
    } else {
      setSuccessMsg('Logged in successfully! Opening Admin Portal...');
      if (dismiss) setTimeout(dismiss, 500);
    }
  };

  const handleValidateInvite = (codeToUse?: string) => {
    const code = codeToUse || inviteCode;
    setError(null);
    setSuccessMsg(null);

    if (!code.trim()) {
      setError('Please enter an 8-digit invitation code.');
      return;
    }

    const res = validateInvitationCode(code);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMsg(res.message);
      if (dismiss) setTimeout(dismiss, 600);
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const res = forgotPassword(resetEmail);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMsg(res.message);
      setResetStep(2);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = resetPassword(resetEmail, newPassword);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccessMsg(res.message);
      setTimeout(() => setView('login'), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Gradient Mesh */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0057B8]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Close Button if rendered inside modal or header */}
        {dismiss && (
          <button 
            onClick={dismiss}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0057B8] text-white shadow-lg shadow-blue-900/50 mb-2">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Kenfoss Admin Portal
          </h1>
          <p className="text-xs text-slate-400">
            Secure Management System for Authorized Staff Only
          </p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kenfoss.co.ke"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#0057B8] transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setError(null); setSuccessMsg(null); setView('forgot'); }}
                  className="text-xs text-[#00AEEF] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#0057B8] transition-colors"
                />
              </div>
            </div>

            {/* Remember Me & 2FA notice */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-[#0057B8] focus:ring-0"
                />
                <span>Remember session</span>
              </label>
              <span className="text-[10px] text-slate-500 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>SSL Encrypted</span>
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-900/40 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Sign In to Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Restricted Access Banner */}
            <div className="pt-3 border-t border-slate-800 text-center space-y-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                <div className="flex items-center justify-center space-x-1 text-amber-400 font-bold mb-0.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authorized Staff Only</span>
                </div>
                The Admin Portal is restricted to <strong className="text-slate-200 font-semibold">Owner (Super Administrator), Managers, and Technicians</strong>. Customers must sign in via the Client Portal.
              </div>

              <button
                type="button"
                onClick={() => setView('restricted_signup')}
                className="text-xs text-slate-400 hover:text-white underline inline-flex items-center space-x-1"
              >
                <UserPlus className="w-3.5 h-3.5 text-blue-400" />
                <span>Have an official invitation link?</span>
              </button>
            </div>

            {/* Quick Demo Selector for Reviewers */}
            <div className="pt-3 border-t border-slate-800/60">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 text-center mb-2">
                Quick Demo Role Login
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('admin@kenfoss.co.ke')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-blue-900/30 border border-slate-800 hover:border-blue-500 rounded-lg text-[10px] text-slate-300 font-bold text-center transition-colors cursor-pointer"
                >
                  Super Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('manager@kenfoss.co.ke')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-amber-900/30 border border-slate-800 hover:border-amber-500 rounded-lg text-[10px] text-slate-300 font-bold text-center transition-colors cursor-pointer"
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin('tech.john@kenfoss.co.ke')}
                  className="py-1.5 px-2 bg-slate-950 hover:bg-emerald-900/30 border border-slate-800 hover:border-emerald-500 rounded-lg text-[10px] text-slate-300 font-bold text-center transition-colors cursor-pointer"
                >
                  Technician
                </button>
              </div>
            </div>

          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'forgot' && (
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-blue-500/20">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white">Reset Staff Account Password</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your registered corporate email address to send a single-use password recovery link.
              </p>
            </div>

            {resetStep === 1 ? (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    Corporate Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="admin@kenfoss.co.ke"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#0057B8] transition-colors"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
                  <span className="font-bold text-slate-300 block uppercase">Quick Autofill Authorized Staff Email:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setResetEmail('admin@kenfoss.co.ke')}
                      className="px-2 py-0.5 bg-blue-900/30 hover:bg-blue-900/50 border border-blue-500/40 text-blue-300 rounded font-mono text-[10px] cursor-pointer"
                    >
                      admin@kenfoss.co.ke
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetEmail('manager@kenfoss.co.ke')}
                      className="px-2 py-0.5 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-500/40 text-amber-300 rounded font-mono text-[10px] cursor-pointer"
                    >
                      manager@kenfoss.co.ke
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetEmail('tech.john@kenfoss.co.ke')}
                      className="px-2 py-0.5 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 rounded font-mono text-[10px] cursor-pointer"
                    >
                      tech.john@kenfoss.co.ke
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Recovery Email Link</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-3">
                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs text-blue-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Recovery Link Dispatched</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    A single-use recovery code has been sent to <strong className="text-white">{resetEmail}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPassword('Kenfoss2026!New');
                    }}
                    className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 border border-blue-400/40 text-blue-300 font-mono text-[10px] font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    ⚡ Simulate Opening Recovery Link in Email
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">Must contain at least 8 characters.</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Update Password & Return to Login</span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="text-[11px] text-slate-400 hover:text-white underline cursor-pointer"
                  >
                    Didn't receive email? Try another address
                  </button>
                </div>
              </form>
            )}

            <button
              type="button"
              onClick={() => { setError(null); setSuccessMsg(null); setResetStep(1); setView('login'); }}
              className="w-full text-center text-xs text-slate-400 hover:text-white pt-2 cursor-pointer transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

        {/* RESTRICTED SIGNUP NOTICE VIEW */}
        {view === 'restricted_signup' && (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs leading-relaxed space-y-2">
              <Lock className="w-8 h-8 text-amber-400 mx-auto" />
              <h4 className="font-extrabold text-sm text-white">Public Sign Up is Restricted</h4>
              <p>
                To maintain system security and compliance with EPRA regulations, self-service account registration is disabled.
              </p>
              <p className="text-slate-300">
                Official staff invitation links are issued by Super Administrator (<strong className="text-white">admin@kenfoss.co.ke</strong>).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-left">
                Enter Invitation Code
              </label>
              <input
                type="text"
                placeholder="e.g. KEN-SUPER-2026"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-center text-sm text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />

              <div className="pt-1 text-[11px] text-slate-400">
                <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                  Active Demo Invitation Codes (Click to autofill):
                </span>
                <div className="flex flex-wrap justify-center gap-1.5 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => { setInviteCode('KEN-SUPER-2026'); handleValidateInvite('KEN-SUPER-2026'); }}
                    className="px-2 py-1 bg-slate-950 hover:bg-blue-900/40 border border-slate-800 hover:border-blue-500 rounded text-blue-400 font-bold transition-colors cursor-pointer"
                  >
                    KEN-SUPER-2026
                  </button>
                  <button
                    type="button"
                    onClick={() => { setInviteCode('KEN-MGR-2026'); handleValidateInvite('KEN-MGR-2026'); }}
                    className="px-2 py-1 bg-slate-950 hover:bg-amber-900/40 border border-slate-800 hover:border-amber-500 rounded text-amber-400 font-bold transition-colors cursor-pointer"
                  >
                    KEN-MGR-2026
                  </button>
                  <button
                    type="button"
                    onClick={() => { setInviteCode('KEN-TECH-2026'); handleValidateInvite('KEN-TECH-2026'); }}
                    className="px-2 py-1 bg-slate-950 hover:bg-emerald-900/40 border border-slate-800 hover:border-emerald-500 rounded text-emerald-400 font-bold transition-colors cursor-pointer"
                  >
                    KEN-TECH-2026
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleValidateInvite()}
                className="w-full py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-md mt-2"
              >
                Validate Invitation Code
              </button>
            </div>

            <button
              type="button"
              onClick={() => { setError(null); setSuccessMsg(null); setView('login'); }}
              className="text-xs text-slate-400 hover:text-white pt-2 cursor-pointer"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
