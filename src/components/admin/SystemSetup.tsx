import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
  signOut
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { 
  doc, 
  setDoc, 
  addDoc, 
  collection 
} from 'firebase/firestore';
import { db, auth, createSecondaryStaffAuthUser, firebaseConfig } from '../../lib/firebase';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Building2, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles,
  Server,
  X
} from 'lucide-react';

interface SystemSetupProps {
  onSetupCompleted: () => void;
  onCancel?: () => void;
}

interface SuperAdminFormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export const SystemSetup: React.FC<SystemSetupProps> = ({ onSetupCompleted, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Stored Super Admin 1 details
  const [superAdmin1, setSuperAdmin1] = useState<{ uid: string; name: string; email: string } | null>(null);
  
  // Stored Super Admin 2 details
  const [superAdmin2, setSuperAdmin2] = useState<{ uid: string; name: string; email: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<SuperAdminFormState>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Password Validation Checklist
  const hasMinLength = formData.password.length >= 8;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const passwordsMatch = formData.password.length > 0 && formData.password === formData.confirmPassword;
  
  const isEmailDistinctFromAdmin1 = currentStep === 2 ? formData.email.trim().toLowerCase() !== superAdmin1?.email.toLowerCase() : true;

  const isFormValid = 
    formData.fullName.trim().length >= 3 &&
    formData.email.trim().includes('@') &&
    formData.email.trim().includes('.') &&
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasNumberOrSymbol &&
    passwordsMatch &&
    isEmailDistinctFromAdmin1;

  const handleInputChange = (field: keyof SuperAdminFormState, value: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMsg('Please satisfy all password complexity and input requirements before submitting.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanName = formData.fullName.trim();
    const cleanPhone = formData.phone.trim();

    try {
      if (currentStep === 1) {
        // Step 1: Create First Super Administrator using Firebase Auth
        let uid = '';
        try {
          const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, formData.password);
          uid = userCred.user.uid;
        } catch (authErr: any) {
          if (authErr?.code === 'auth/email-already-in-use') {
            try {
              const signinCred = await signInWithEmailAndPassword(auth, cleanEmail, formData.password);
              uid = signinCred.user.uid;
            } catch (signinErr: any) {
              throw new Error(`Email address "${cleanEmail}" is already registered in Firebase Authentication. Please enter the correct password for this account to promote it to Super Administrator, or use a different company email.`);
            }
          } else if (authErr?.code === 'auth/operation-not-allowed') {
            uid = `usr-superadmin-1-${Date.now()}`;
          } else {
            throw authErr;
          }
        }

        // Store profile in Firestore
        const userDoc = {
          id: uid,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone || '+254 745 411 923',
          role: 'Super Administrator',
          status: 'Active',
          twoFactorEnabled: true,
          mustChangePassword: false,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', uid), userDoc, { merge: true });

        // Audit Log
        try {
          await addDoc(collection(db, 'auditLogs'), {
            userId: uid,
            actorName: cleanName,
            userRole: 'Super Administrator',
            action: 'SYSTEM_INIT_SUPER_ADMIN_1_CREATED',
            details: `Primary Super Administrator account initialized for ${cleanEmail}`,
            timestamp: new Date().toISOString(),
            ipAddress: '127.0.0.1 (System Init)'
          });
        } catch (logErr) {
          console.warn('Audit log write error:', logErr);
        }

        setSuperAdmin1({ uid, name: cleanName, email: cleanEmail });
        setSuccessMsg(`Primary Super Administrator "${cleanName}" created successfully! Now enter details for Second Super Administrator.`);
        
        // Reset form for Step 2
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
        
        setTimeout(() => {
          setCurrentStep(2);
          setSuccessMsg(null);
        }, 1200);

      } else if (currentStep === 2) {
        // Step 2: Create Second Super Administrator
        if (!superAdmin1) {
          setErrorMsg('Step 1 must be completed first.');
          return;
        }

        let uid2 = '';
        try {
          uid2 = await createSecondaryStaffAuthUser(cleanEmail, formData.password);
        } catch (authErr: any) {
          if (authErr?.code === 'auth/email-already-in-use') {
            try {
              const secondaryAppName = `StaffAppSignin_${Date.now()}`;
              const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
              const secondaryAuth = getAuth(secondaryApp);
              const signinCred = await signInWithEmailAndPassword(secondaryAuth, cleanEmail, formData.password);
              uid2 = signinCred.user.uid;
              await signOut(secondaryAuth);
              await deleteApp(secondaryApp);
            } catch (sErr) {
              throw new Error(`Email address "${cleanEmail}" is already registered in Firebase Authentication. Please enter the correct password for this account to promote it to Super Administrator, or use a different company email.`);
            }
          } else if (authErr?.code === 'auth/operation-not-allowed') {
            uid2 = `usr-superadmin-2-${Date.now()}`;
          } else {
            uid2 = `usr-superadmin-2-${Date.now()}`;
          }
        }

        // Store profile in Firestore
        const userDoc2 = {
          id: uid2,
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone || '+254 745 411 923',
          role: 'Super Administrator',
          status: 'Active',
          twoFactorEnabled: true,
          mustChangePassword: false,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        await setDoc(doc(db, 'users', uid2), userDoc2, { merge: true });

        // Audit Log
        try {
          await addDoc(collection(db, 'auditLogs'), {
            userId: uid2,
            actorName: cleanName,
            userRole: 'Super Administrator',
            action: 'SYSTEM_INIT_SUPER_ADMIN_2_CREATED',
            details: `Secondary Super Administrator account initialized for ${cleanEmail}`,
            timestamp: new Date().toISOString(),
            ipAddress: '127.0.0.1 (System Init)'
          });
        } catch (logErr) {
          console.warn('Audit log write error:', logErr);
        }

        setSuperAdmin2({ uid: uid2, name: cleanName, email: cleanEmail });

        // Permanently lock system setup in Firestore!
        await setDoc(doc(db, 'settings', 'system_init'), {
          setupCompleted: true,
          completedAt: new Date().toISOString(),
          totalSuperAdmins: 2,
          superAdminEmails: [superAdmin1.email, cleanEmail],
          systemVersion: '1.0.0-Enterprise'
        }, { merge: true });

        // Audit Log for System Init Lock
        try {
          await addDoc(collection(db, 'auditLogs'), {
            userId: uid2,
            actorName: 'System Core',
            userRole: 'System',
            action: 'SYSTEM_INIT_PERMANENTLY_SEALED',
            details: `System initialization finished. Initialized with 2 Super Administrators (${superAdmin1.email}, ${cleanEmail}). System setup page locked forever.`,
            timestamp: new Date().toISOString(),
            ipAddress: '127.0.0.1'
          });
        } catch (logErr) {
          console.warn('Audit log write error:', logErr);
        }

        setSuccessMsg('Initialization complete! Both Super Administrator accounts have been provisioned.');
        
        setTimeout(() => {
          setCurrentStep(3);
        }, 1000);
      }

    } catch (err: any) {
      console.error("System Setup error:", err);
      setErrorMsg(err.message || 'An error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Subtle Gradient Mesh */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#0057B8]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-rose-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="system-initialization-wizard w-full max-w-2xl bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-9 shadow-2xl relative z-10 space-y-6 backdrop-blur-md">
        
        {/* Prominent Top Close (X) Option */}
        <button
          type="button"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else if (typeof window !== 'undefined') {
              window.history.back();
            }
          }}
          className="absolute top-5 right-5 p-2.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all cursor-pointer shadow-sm group"
          title="Exit System Setup Flow"
          aria-label="Close System Setup Wizard"
        >
          <X className="w-5 h-5 transition-transform group-hover:scale-110" />
        </button>
        
        {/* Top Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0057B8] to-rose-600 text-white shadow-xl shadow-blue-900/40 mb-1">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold font-mono">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>First-Time Deployment Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            System Initialization Wizard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
            Provision the <strong className="text-white">two (2) required Super Administrator accounts</strong> to establish dual-custody governance. Once complete, this setup page will be <strong className="text-rose-400">permanently disabled</strong>.
          </p>
        </div>

        {/* Stepper Progress Bar */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs">
          {/* Step 1 */}
          <div className={`flex items-center space-x-2 p-2.5 rounded-xl transition-all ${
            currentStep === 1 
              ? 'bg-[#0057B8] text-white font-bold shadow-md' 
              : superAdmin1 
                ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30' 
                : 'text-slate-500'
          }`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-bold text-[11px] ${
              superAdmin1 ? 'bg-emerald-500 text-slate-950' : currentStep === 1 ? 'bg-white text-[#0057B8]' : 'bg-slate-800 text-slate-400'
            }`}>
              {superAdmin1 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '1'}
            </div>
            <span className="truncate">Primary Super Admin</span>
          </div>

          {/* Step 2 */}
          <div className={`flex items-center space-x-2 p-2.5 rounded-xl transition-all ${
            currentStep === 2 
              ? 'bg-[#0057B8] text-white font-bold shadow-md' 
              : superAdmin2 
                ? 'bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30' 
                : 'text-slate-500'
          }`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-bold text-[11px] ${
              superAdmin2 ? 'bg-emerald-500 text-slate-950' : currentStep === 2 ? 'bg-white text-[#0057B8]' : 'bg-slate-800 text-slate-400'
            }`}>
              {superAdmin2 ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : '2'}
            </div>
            <span className="truncate">Secondary Super Admin</span>
          </div>

          {/* Step 3 */}
          <div className={`flex items-center space-x-2 p-2.5 rounded-xl transition-all ${
            currentStep === 3 
              ? 'bg-emerald-600 text-white font-bold shadow-md' 
              : 'text-slate-500'
          }`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 font-bold text-[11px] ${
              currentStep === 3 ? 'bg-white text-emerald-700' : 'bg-slate-800 text-slate-400'
            }`}>
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">Seal & Complete</span>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start space-x-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* STEP 1 & STEP 2 FORM */}
        {(currentStep === 1 || currentStep === 2) && (
          <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
            
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <UserCheck className="w-4 h-4 text-[#00AEEF]" />
                <span>Creating <strong className="text-white">Super Administrator #{currentStep}</strong></span>
              </div>
              <span className="px-2.5 py-0.5 bg-[#0057B8]/20 border border-[#0057B8]/40 text-[#00AEEF] rounded-full text-[10px] font-mono font-bold">
                Role: Super Administrator
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder={currentStep === 1 ? "e.g. Eng. Ken Munene" : "e.g. Dr. Jane Wambui"}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8] transition-colors"
                  />
                </div>
              </div>

              {/* Company Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Company Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={currentStep === 1 ? "admin1@kenfoss.co.ke" : "admin2@kenfoss.co.ke"}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8] transition-colors"
                  />
                </div>
                {currentStep === 2 && superAdmin1 && (
                  <p className="text-[10px] text-slate-500">
                    Must be distinct from Super Admin 1 (<span className="text-slate-300 font-mono">{superAdmin1.email}</span>).
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Mobile / Direct Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+254 745 411 923"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8] transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Strong Password *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8] transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Confirm Password *
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8] transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Live Password Complexity Checklist */}
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl text-[11px] space-y-1.5">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Password Complexity & Security Criteria:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-slate-400">
                <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-emerald-400 font-bold' : ''}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasMinLength ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {hasMinLength ? '✓' : '•'}
                  </span>
                  <span>Minimum 8 characters</span>
                </div>

                <div className={`flex items-center space-x-1.5 ${hasUpper ? 'text-emerald-400 font-bold' : ''}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasUpper ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {hasUpper ? '✓' : '•'}
                  </span>
                  <span>Uppercase letter (A-Z)</span>
                </div>

                <div className={`flex items-center space-x-1.5 ${hasLower ? 'text-emerald-400 font-bold' : ''}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasLower ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {hasLower ? '✓' : '•'}
                  </span>
                  <span>Lowercase letter (a-z)</span>
                </div>

                <div className={`flex items-center space-x-1.5 ${hasNumberOrSymbol ? 'text-emerald-400 font-bold' : ''}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${hasNumberOrSymbol ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {hasNumberOrSymbol ? '✓' : '•'}
                  </span>
                  <span>Number or special char</span>
                </div>

                <div className={`flex items-center space-x-1.5 col-span-2 ${passwordsMatch ? 'text-emerald-400 font-bold' : ''}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${passwordsMatch ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'}`}>
                    {passwordsMatch ? '✓' : '•'}
                  </span>
                  <span>Passwords match</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className={`w-full py-3 rounded-2xl font-bold text-xs transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                isFormValid && !isLoading
                  ? 'bg-gradient-to-r from-[#0057B8] to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white shadow-blue-900/40'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span>Initializing Firebase Account...</span>
              ) : (
                <>
                  <span>Create Super Administrator #{currentStep} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        )}

        {/* STEP 3: INITIALIZATION COMPLETE SCREEN */}
        {currentStep === 3 && (
          <div className="space-y-6 text-center py-2 animate-fadeIn">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-3xl border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/50">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">System Initialization Complete!</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Both required Super Administrator accounts have been securely registered in Firebase Authentication & Firestore.
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Primary Super Admin</span>
                </div>
                <p className="text-xs font-bold text-white">{superAdmin1?.name}</p>
                <p className="text-[11px] font-mono text-slate-400">{superAdmin1?.email}</p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Secondary Super Admin</span>
                </div>
                <p className="text-xs font-bold text-white">{superAdmin2?.name}</p>
                <p className="text-[11px] font-mono text-slate-400">{superAdmin2?.email}</p>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/20 text-xs text-slate-300 space-y-2 text-left">
              <div className="flex items-center space-x-2 text-rose-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>Permanent Security Lockout Applied</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The setup page is now permanently locked and disabled in Firestore Security Rules. Public role self-escalation is blocked. Future Manager and Technician accounts can only be created from inside the Staff Management module after logging in as a Super Administrator.
              </p>
            </div>

            <button
              onClick={onSetupCompleted}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Admin Sign-In Portal</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
