import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';

export const ChangePasswordModal: React.FC = () => {
  const { currentUser, completePasswordChange, logout } = useAdmin();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completePasswordChange(newPassword);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while updating password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
        
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-white">First Login: Change Password</h2>
          <p className="text-xs text-slate-400">
            Welcome, <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.role}). You are currently logged in with a temporary password.
          </p>
        </div>

        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-2xl text-xs flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 shrink-0 text-amber-400" />
          <span>For security reasons, you must set a new permanent password before accessing the dashboard.</span>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="font-bold text-sm text-white">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" /> New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new secure password"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" /> Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new secure password"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Updating Password in Firebase...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Set New Password & Access Dashboard</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={logout}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Sign Out & Return Later
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
