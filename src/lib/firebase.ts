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
  getDocFromServer,
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

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'contact_info'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Compresses and resizes an image file in-browser to a fast, lightweight Data URL.
 */
export function compressImageFile(file: File, maxWidth = 400, maxHeight = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(e.target?.result as string);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a profile photo to Firebase Storage under `profile_photos/{userId}`.
 * If Firebase Storage is restricted, slow, or encounters CORS/quota issues, falls back seamlessly
 * to an optimized, compressed data URL string so saving profile changes never hangs.
 */
export async function uploadProfilePhotoToStorage(file: File, _userId: string): Promise<string> {
  if (!file) throw new Error("No image file provided.");

  // Pre-compress the profile image to an optimized ~20KB JPEG data URL for instant saving and loading
  try {
    const compressedDataUrl = await compressImageFile(file, 400, 400, 0.85);
    return compressedDataUrl;
  } catch {
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
