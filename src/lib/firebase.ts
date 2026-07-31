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
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';

import firebaseConfigJson from '../../firebase-applet-config.json';

export const firebaseConfig = {
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
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Uploads a profile photo to Firebase Storage under `profile_photos/{userId}`.
 * If Firebase Storage is restricted or encounters CORS issues, falls back seamlessly to data URL string.
 */
export async function uploadProfilePhotoToStorage(file: File, userId: string): Promise<string> {
  if (!file) throw new Error("No image file provided.");

  try {
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const storageRef = ref(storage, `profile_photos/${userId}_${Date.now()}.${fileExtension}`);
    const uploadTask = await uploadBytesResumable(storageRef, file);
    const downloadUrl = await getDownloadURL(uploadTask.ref);
    return downloadUrl;
  } catch (storageErr) {
    console.warn("Firebase storage error, falling back to data URL encoding:", storageErr);
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}

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
      role: additionalData.role || 'Customer',
      status: additionalData.status || 'Active',
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
  } catch (error: any) {
    await deleteApp(secondaryApp).catch(() => {});
    if (error?.code === 'auth/operation-not-allowed') {
      console.warn("Firebase Auth Email/Password provider is disabled in Firebase console. Generating staff record ID for Firestore.");
      return `usr-staff-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
    throw error;
  }
}
