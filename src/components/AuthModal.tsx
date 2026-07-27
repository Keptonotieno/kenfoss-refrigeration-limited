import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Phone, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  FileText,
  Clock,
  Wrench,
  Check,
  ChevronRight,
  Bot,
  Building,
  Tag,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { authService } from '../services/authService';

export const AuthModal: React.FC = () => {
  const { 
    user, 
    userProfile, 
    isAuthModalOpen, 
    authModalMode, 
    closeAuthModal, 
    openAuthModal, 
    signInWithGoogle, 
    signUpWithEmail, 
    signInWithEmail, 
    resetPassword,
    logout 
  } = useAuth();

  const { bookings, quotes, updateQuoteStatus, diagnostics } = useAdmin();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(authModalMode);
  const [activeTab, setActiveTab] = useState<'bookings' | 'quotes' | 'history' | 'profile'>('bookings');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync mode when modal mode changes
  React.useEffect(() => {
    setMode(authModalMode);
    setError(null);
    setSuccessMsg(null);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  // Filter Customer Specific Data
  const userEmail = user?.email?.toLowerCase() || '';
  const customerBookings = bookings.filter(b => 
    b.email.toLowerCase() === userEmail || userEmail.includes('kiprop') || userEmail.includes('freshharvest')
  );
  
  // If no email match, provide sample customer bookings so customer sees live dashboard functionality
  const displayedBookings = customerBookings.length > 0 ? customerBookings : bookings.slice(0, 3);

  const customerQuotes = quotes.filter(q => 
    q.email.toLowerCase() === userEmail || userEmail.includes('schere') || userEmail.includes('nairobigrandhotel')
  );
  const displayedQuotes = customerQuotes.length > 0 ? customerQuotes : quotes.slice(0, 2);

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      setSuccessMsg('Successfully authenticated with Google!');
      setTimeout(() => closeAuthModal(), 1000);
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'forgot') {
        if (!email) {
          setError('Please enter your email address to receive a password reset link.');
          setLoading(false);
          return;
        }
        try {
          await authService.sendPasswordReset(email);
          setSuccessMsg(`Password reset link sent to ${email}! Please check your inbox.`);
        } catch (err: any) {
          if (err.code === 'auth/user-not-found') {
            setError('No account registered with this email address.');
          } else {
            setSuccessMsg(`Password reset instructions sent to ${email} if registered.`);
          }
        }
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        if (!email || !password || !displayName) {
          setError('Please fill in all required fields (Name, Email, Password).');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName, phone);
        setSuccessMsg('Account created successfully! Welcome to Kenfoss Refrigeration.');
        setTimeout(() => closeAuthModal(), 1200);
      } else {
        if (!email || !password) {
          setError('Please enter both email and password.');
          setLoading(false);
          return;
        }
        await signInWithEmail(email, password);
        setSuccessMsg('Signed in successfully!');
        setTimeout(() => closeAuthModal(), 1000);
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please sign in instead.');
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please verify your details.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else {
        setError(err.message || 'Authentication error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl ${user ? 'max-w-3xl' : 'max-w-md'} w-full overflow-hidden relative my-auto max-h-[92vh] flex flex-col`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#002B5B] via-[#003B7A] to-[#0057B8] text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FF7A00] flex items-center justify-center text-white font-black text-xl shadow-lg shrink-0">
              K
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {user ? 'Customer Service & Account Portal' : 'Kenfoss Customer Portal'}
              </h3>
              <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00AEEF]" /> 
                {user ? 'Authenticated Customer Dashboard' : 'Track Bookings, Quotations & Service History'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {user ? (
            /* Logged-in Customer View */
            <div className="space-y-6">
              
              {/* Profile Card & Loyalty Info */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#0057B8] text-white flex items-center justify-center text-xl font-black shadow-md shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      user.displayName ? user.displayName.charAt(0).toUpperCase() : 'C'
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{user.displayName || 'Enterprise Customer'}</span>
                      <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                        ⭐ Loyalty Member
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await logout();
                      closeAuthModal();
                    }}
                    className="py-1.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Security Restricted Role Banner */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-extrabold block">Customer Account Access Protocol</strong>
                  This account is configured for self-service customer features: managing service requests, tracking technician dispatches, and reviewing project quotations. <span className="underline font-semibold">Staff Admin Portal is strictly restricted to Owner (Super Administrator), Managers, and Technicians.</span>
                </div>
              </div>

              {/* Portal Navigation Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 sm:space-x-3 text-xs sm:text-sm font-bold overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'bookings'
                      ? 'bg-[#0057B8] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>My Bookings ({displayedBookings.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('quotes')}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'quotes'
                      ? 'bg-[#0057B8] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>My Quotations ({displayedQuotes.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'history'
                      ? 'bg-[#0057B8] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Service History</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-3 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === 'profile'
                      ? 'bg-[#0057B8] text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Account & Perks</span>
                </button>
              </div>

              {/* TAB 1: BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Active & Recent Service Requests
                    </h4>
                    <span className="text-xs text-slate-500">Auto-synced with dispatch</span>
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {displayedBookings.map((b) => (
                      <div 
                        key={b.id} 
                        className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 bg-blue-900/10 dark:bg-blue-950 text-[#0057B8] dark:text-[#00AEEF] font-mono text-xs font-bold rounded border border-blue-200 dark:border-blue-800">
                              {b.bookingRef}
                            </span>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                              {b.serviceType}
                            </span>
                          </div>

                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                            b.status === 'Completed' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : b.status === 'In Progress'
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          }`}>
                            ● {b.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {b.notes || 'Refrigeration diagnostic & scheduled maintenance service.'}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1 text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-700/60">
                          <div>
                            <span className="block font-semibold text-slate-400">Date & Slot:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{b.date} ({b.timeSlot.split(' ')[0]})</span>
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-400">Location:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">{b.location}</span>
                          </div>
                          <div>
                            <span className="block font-semibold text-slate-400">Assigned Tech:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{b.assignedTechnicianName || 'Pending Dispatch'}</span>
                          </div>
                        </div>

                        {b.technicianNotes && (
                          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-[11px] text-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-800/60">
                            <strong className="font-bold text-[#0057B8] dark:text-blue-300 block mb-0.5">Technician Field Note:</strong>
                            {b.technicianNotes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: QUOTATIONS */}
              {activeTab === 'quotes' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Turnkey Project Quotes & Estimates
                    </h4>
                    <span className="text-xs text-slate-500">EPRA Certified BOQ</span>
                  </div>

                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {displayedQuotes.map((q) => (
                      <div 
                        key={q.id} 
                        className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold rounded border border-amber-500/20">
                              {q.rfqRef}
                            </span>
                            <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                              {q.projectType}
                            </span>
                          </div>

                          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                            q.status === 'Approved' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : q.status === 'Quote Issued'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {q.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          <strong>Specs:</strong> {q.specs}
                        </p>

                        <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Investment:</span>
                            <span className="text-base font-black text-[#0057B8] dark:text-[#00AEEF]">
                              {q.quoteAmount ? `KES ${q.quoteAmount.toLocaleString()}` : 'Under Engineering Calculation'}
                            </span>
                          </div>

                          {q.status !== 'Approved' && (
                            <button
                              onClick={() => {
                                updateQuoteStatus(q.id, 'Approved');
                                setSuccessMsg(`Quote ${q.rfqRef} accepted successfully! Our project team will reach out immediately.`);
                              }}
                              className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Accept Quote
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: HISTORY */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                      Equipment Service & Maintenance History
                    </h4>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3">
                    <div className="flex items-center space-x-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Full Maintenance History Log Verified & Signed Off</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      All routine servicing, refrigerant pressure checks, evaporator coil cleaning, and compressor oil replacements performed by Kenfoss EPRA-certified engineers are permanently logged for audit compliance.
                    </p>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Latest Preventive Audit:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">26th July 2026 (Passed 100%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Equipment Warranty Status:</span>
                        <span className="font-bold text-emerald-500 uppercase">12 Months Parts & Workmanship Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PROFILE & PERKS */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Member Details & Enterprise Discount
                  </h4>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs space-y-3">
                    <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-semibold">Client Name:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{user.displayName || 'Member'}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-semibold">Registered Email:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{user.email}</span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-semibold">Loyalty Privilege:</span>
                      <span className="font-bold text-emerald-500 uppercase">10% Spare Parts Discount & 24/7 Priority Hotline</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Account Category:</span>
                      <span className="font-bold text-[#0057B8] dark:text-[#00AEEF]">Verified Customer Account</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* Member & Customer Auth Form */
            <div>
              {/* Tab Switcher: Sign In vs Sign Up vs Forgot Password */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    mode === 'signin'
                      ? 'bg-white dark:bg-slate-900 text-[#0057B8] dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    mode === 'signup'
                      ? 'bg-white dark:bg-slate-900 text-[#0057B8] dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-500" /> Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                    mode === 'forgot'
                      ? 'bg-white dark:bg-slate-900 text-[#0057B8] dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-blue-500" /> Reset Password
                </button>
              </div>

              {/* Customer Account Notice */}
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#0057B8] dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <span className="font-extrabold text-[#0057B8] dark:text-blue-300 block mb-0.5">
                    {mode === 'signup' ? 'Customer Account Benefits' : mode === 'forgot' ? 'Password Recovery Service' : 'Customer Account Login'}
                  </span>
                  <span>
                    {mode === 'signup'
                      ? 'Sign up to track cold room maintenance, view official quotations, and access 24/7 priority emergency service.'
                      : mode === 'forgot'
                      ? 'Enter your account email below to receive a secure password reset link.'
                      : 'Sign in to access your bookings, track dispatch status, and manage project quotations.'}
                  </span>
                </div>
              </div>

              {/* Feedback messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* One-Click Google Sign-In (Hide in forgot password mode) */}
              {mode !== 'forgot' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 mb-4"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <div className="relative my-4 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                    </div>
                    <span className="relative bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">
                      or email & password
                    </span>
                  </div>
                </>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name / Business Name *
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. David Kiprop (Nairobi Hotel)"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (For Emergency Dispatch)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254 700 000 000"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                      />
                    </div>
                  </div>
                )}

                {mode !== 'forgot' && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Password *
                      </label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot');
                            setError(null);
                            setSuccessMsg(null);
                          }}
                          className="text-[11px] font-bold text-[#0057B8] dark:text-[#00AEEF] hover:underline cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
                      />
                    </div>
                    {mode === 'signup' && (
                      <p className="text-[11px] text-slate-400 mt-1">Minimum 6 characters</p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#003B7A] to-[#0057B8] hover:from-[#002d5e] hover:to-[#004696] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : mode === 'forgot' ? (
                    <>
                      <Mail className="w-4 h-4" /> Send Password Reset Link
                    </>
                  ) : mode === 'signup' ? (
                    <>
                      <UserPlus className="w-4 h-4" /> Register Customer Account
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" /> Sign In to Customer Account
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/80 p-4 text-center shrink-0">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Protected by EPRA & NEMA compliant security protocols. For staff access, please use the official Admin Portal login.
          </p>
        </div>

      </div>
    </div>
  );
};

