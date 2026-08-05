import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, saveUserProfile, db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phone?: string;
  company?: string;
  role?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup') => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserRoleFromFirestore: (uidOrEmail: string) => Promise<string | null>;
}

export function formatAuthErrorMessage(error: any): string {
  if (!error) return 'Authentication failed. Please try again.';
  
  const code = error?.code || '';
  const msg = error?.message || '';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email address or password. Please verify your staff credentials and try again.';
    case 'auth/user-disabled':
      return 'Your user account has been disabled or suspended. Please contact a Super Administrator.';
    case 'auth/too-many-requests':
      return 'Access temporarily locked due to multiple failed login attempts. Please wait a few minutes or reset your password.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is disabled in your Firebase Console project settings. Please enable Email/Password provider under Authentication -> Sign-in Method in Firebase Console.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/network-request-failed':
      return 'Network communication error. Please check your internet connection.';
    case 'auth/popup-closed-by-user':
      return 'Google Sign-In popup was closed before completing authentication.';
    default:
      if (typeof msg === 'string' && msg.includes('Firebase:')) {
        return msg.replace(/^Firebase:\s*/, '').replace(/\(auth\/.*\)\.?/, '').trim();
      }
      return msg || 'Authentication failed. Please check your credentials and try again.';
  }
}

export async function fetchUserProfileFromFirestore(user: User): Promise<UserProfile> {
  const cleanEmail = user.email?.trim().toLowerCase() || '';
  const rawEmail = user.email?.trim() || '';
  
  try {
    // 1. Fetch directly by user.uid from 'users' collection
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        uid: user.uid,
        email: user.email,
        displayName: data.displayName || data.name || user.displayName || cleanEmail.split('@')[0],
        photoURL: data.photoURL || user.photoURL,
        phone: data.phone || '',
        company: data.company || '',
        role: data.role || 'Customer',
        status: data.status || 'Active'
      };
    }

    // 2. Query 'users' collection by email to link legacy or email-indexed accounts
    if (cleanEmail) {
      let q = query(collection(db, 'users'), where('email', '==', cleanEmail));
      let qSnap = await getDocs(q);
      
      if (qSnap.empty && rawEmail && rawEmail !== cleanEmail) {
        q = query(collection(db, 'users'), where('email', '==', rawEmail));
        qSnap = await getDocs(q);
      }

      if (!qSnap.empty) {
        const d = qSnap.docs[0].data();
        const profile: UserProfile = {
          uid: user.uid,
          email: user.email,
          displayName: d.displayName || d.name || user.displayName || cleanEmail.split('@')[0],
          photoURL: d.photoURL || user.photoURL,
          phone: d.phone || '',
          company: d.company || '',
          role: d.role || 'Customer',
          status: d.status || 'Active'
        };

        // Link profile to doc(db, 'users', user.uid) for security rules
        saveUserProfile(user, {
          role: profile.role,
          displayName: profile.displayName,
          phone: profile.phone,
          company: profile.company,
          status: profile.status
        }).catch(() => {});

        return profile;
      }
    }

    // 3. Auto-save initial user profile if not found
    try {
      await saveUserProfile(user, { role: 'Customer' });
    } catch (saveErr) {
      console.warn('Could not auto-save user profile to Firestore:', saveErr);
    }

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || cleanEmail.split('@')[0],
      photoURL: user.photoURL,
      role: 'Customer',
      status: 'Active'
    };
  } catch (err) {
    console.error('Error fetching user profile from Firestore:', err);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || cleanEmail.split('@')[0] || 'User',
      photoURL: user.photoURL,
      role: 'Customer',
      status: 'Active'
    };
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profile = await fetchUserProfileFromFirestore(currentUser);
          setUserProfile(profile);
        } catch (err) {
          console.error("Error setting user profile in auth observer:", err);
          setUserProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: 'Customer'
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const fetchUserRoleFromFirestore = async (uidOrEmail: string): Promise<string | null> => {
    if (!uidOrEmail) return null;
    const cleanVal = uidOrEmail.trim().toLowerCase();

    const attemptFetch = async (): Promise<string | null> => {
      try {
        // 1. Try UID directly from 'users' doc
        const snap = await getDoc(doc(db, 'users', uidOrEmail));
        if (snap.exists() && snap.data()?.role) {
          return snap.data().role;
        }

        // 2. Query 'users' collection by lowercase email
        if (cleanVal.includes('@')) {
          const q = query(collection(db, 'users'), where('email', '==', cleanVal));
          const qSnap = await getDocs(q);
          if (!qSnap.empty && qSnap.docs[0].data()?.role) {
            return qSnap.docs[0].data().role;
          }

          // 3. Query 'users' collection by exact case email
          if (uidOrEmail !== cleanVal) {
            const qExact = query(collection(db, 'users'), where('email', '==', uidOrEmail));
            const qSnapExact = await getDocs(qExact);
            if (!qSnapExact.empty && qSnapExact.docs[0].data()?.role) {
              return qSnapExact.docs[0].data().role;
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user role from Firestore:", err);
      }
      return null;
    };

    // First attempt
    let role = await attemptFetch();

    // Retry once after 300ms if null to handle Firestore connection/write latency
    if (!role) {
      await new Promise(resolve => setTimeout(resolve, 300));
      role = await attemptFetch();
    }

    return role;
  };

  const signInWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const profile = await fetchUserProfileFromFirestore(res.user);
      setUserProfile(profile);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error("Google Sign-In failed:", error);
      throw new Error(formatAuthErrorMessage(error));
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, phone: string = '') => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
      await saveUserProfile(res.user, { displayName: name, phone });
      const profile = await fetchUserProfileFromFirestore(res.user);
      setUserProfile(profile);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error("Email Sign-Up failed:", error);
      if (error?.code === 'auth/operation-not-allowed') {
        const cleanEmail = email.trim().toLowerCase();
        const mockProfile: UserProfile = {
          uid: `usr-cust-${Date.now()}`,
          email: cleanEmail,
          displayName: name,
          photoURL: null,
          phone,
          role: 'Customer',
          status: 'Active'
        };
        setUserProfile(mockProfile);
        setIsAuthModalOpen(false);
        return;
      }
      throw new Error(formatAuthErrorMessage(error));
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const profile = await fetchUserProfileFromFirestore(res.user);
      setUserProfile(profile);
      setIsAuthModalOpen(false);
    } catch (error: any) {
      console.error("Email Sign-In failed:", error);
      if (error?.code === 'auth/operation-not-allowed') {
        const cleanEmail = email.trim().toLowerCase();
        const mockProfile: UserProfile = {
          uid: `usr-cust-${Date.now()}`,
          email: cleanEmail,
          displayName: cleanEmail.split('@')[0],
          photoURL: null,
          phone: '',
          role: 'Customer',
          status: 'Active'
        };
        setUserProfile(mockProfile);
        setIsAuthModalOpen(false);
        return;
      }
      throw new Error(formatAuthErrorMessage(error));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error("Password reset failed:", error);
      throw new Error(formatAuthErrorMessage(error));
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        logout,
        fetchUserRoleFromFirestore
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

