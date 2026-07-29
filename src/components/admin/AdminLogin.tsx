import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { UserRole } from '../../types';
import { 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight, 
  UserPlus, 
  Building2,
  X,
  CheckCircle2,
  User,
  Ticket
} from 'lucide-react';

interface AdminLoginProps {
  onClose?: () => void;
  onCancel?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onClose, onCancel }) => {
  const { login, registerWithCode, forgotPassword } = useAdmin();
  const dismiss = onClose || onCancel;

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('Technician');
  const [regCode, setRegCode] = useState('');
  const [signUpPass, setSignUpPass] = useState('');
  const [signUpConfirmPass, setSignUpConfirmPass] = useState('');

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');

  // Status State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!signUpName || !signUpEmail || !regCode || !signUpPass || !signUpConfirmPass) {
      setError('Please fill in all required fields including registration code.');
      return;
    }

    if (signUpPass.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (signUpPass !== signUpConfirmPass) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerWithCode(signUpName, signUpEmail, signUpPass, signUpRole, regCode);
      if (!res.success) {
        setError(res.message);
      } else {
        setSuccessMsg(res.message);
        if (dismiss) setTimeout(dismiss, 600);
      }
    } catch (err: any) {
      setError(err.message || 'Account registration failed.');
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
            Secure Management System for Authorized Staff
          </p>
        </div>

        {/* Tab Switcher (Sign In vs Sign Up) */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#0057B8] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-xl transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#0057B8] text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Staff Account
            </button>
          </div>
        )}

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
                  placeholder="name@kenfoss.co.ke"
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
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* SIGN UP VIEW (Create Staff Account) */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Staff Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Samuel Ochieng"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  placeholder="name@kenfoss.co.ke"
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Assigned Role
                </label>
                <select
                  value={signUpRole}
                  onChange={(e) => setSignUpRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                >
                  <option value="Technician">Technician</option>
                  <option value="Manager">Manager</option>
                  <option value="Super Administrator">Super Admin / Owner</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Registration Code
                </label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regCode}
                    onChange={(e) => setRegCode(e.target.value.toUpperCase())}
                    placeholder="KEN-XXXXXXXX"
                    className="w-full pl-8 pr-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-400 uppercase focus:outline-none focus:border-[#0057B8]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={signUpPass}
                  onChange={(e) => setSignUpPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={signUpConfirmPass}
                  onChange={(e) => setSignUpConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Staff Account</span>
                </>
              )}
            </button>
          </form>
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
