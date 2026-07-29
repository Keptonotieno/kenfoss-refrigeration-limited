import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = firebaseConfigJson.firestoreDatabaseId && firebaseConfigJson.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Helper to save or update user profile document in Firestore
export async function saveUserProfile(user: User, additionalData: Record<string, any> = {}) {
  if (!user) return;
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || additionalData.displayName || 'Kenfoss User',
      photoURL: user.photoURL || '',
      phone: additionalData.phone || '',
      company: additionalData.company || '',
      role: additionalData.role || 'client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...additionalData
    });
  } else {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName || snap.data()?.displayName,
      photoURL: user.photoURL || snap.data()?.photoURL,
      updatedAt: new Date().toISOString(),
      ...additionalData
    }, { merge: true });
  }
}

// Helper to save booking request to Firestore
export async function saveBookingToFirestore(bookingData: any) {
  try {
    const colRef = collection(db, 'bookings');
    const docRef = await addDoc(colRef, {
      ...bookingData,
      createdAt: new Date().toISOString(),
      serverTime: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving booking to Firestore:", error);
    throw error;
  }
}

// Helper to save contact inquiry to Firestore
export async function saveContactToFirestore(contactData: any) {
  try {
    const colRef = collection(db, 'contacts');
    const docRef = await addDoc(colRef, {
      ...contactData,
      createdAt: new Date().toISOString(),
      serverTime: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving contact message to Firestore:", error);
    throw error;
  }
}

// Helper to save AI Diagnostic log to Firestore
export async function saveDiagnosticToFirestore(diagnosticData: any) {
  try {
    const colRef = collection(db, 'diagnostics');
    const docRef = await addDoc(colRef, {
      ...diagnosticData,
      createdAt: new Date().toISOString(),
      serverTime: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving diagnostic report to Firestore:", error);
    throw error;
  }
}

// Helper to create a staff account in Firebase Auth without logging out current Super Admin
export async function createSecondaryStaffAuthUser(email: string, pass: string): Promise<string> {
  const secondaryAppName = `StaffApp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    const uid = userCredential.user.uid;
    await signOut(secondaryAuth);
    await deleteApp(secondaryApp);
    return uid;
  } catch (error) {
    await deleteApp(secondaryApp).catch(() => {});
    throw error;
  }
}
