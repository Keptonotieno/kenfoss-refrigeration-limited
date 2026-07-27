import { 
  sendPasswordResetEmail, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, saveUserProfile } from '../lib/firebase';

export const authService = {
  /**
   * Sends a password reset email via Firebase Auth.
   * @param email User's account email address
   */
  async sendPasswordReset(email: string): Promise<void> {
    if (!email || !email.trim()) {
      throw new Error('Please enter a valid email address.');
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  },

  /**
   * Signs in a user with email and password.
   */
  async loginWithEmail(email: string, pass: string): Promise<void> {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      await saveUserProfile(res.user);
    } catch (error: any) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  },

  /**
   * Registers a new user with email, password, display name, and optional phone.
   */
  async registerWithEmail(email: string, pass: string, name: string, phone: string = ''): Promise<void> {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName: name });
      await saveUserProfile(res.user, { displayName: name, phone });
    } catch (error: any) {
      console.error('Email registration error:', error);
      throw error;
    }
  },

  /**
   * Signs in a user using Google OAuth popup.
   */
  async loginWithGoogle(): Promise<void> {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      await saveUserProfile(res.user);
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    }
  },

  /**
   * Signs out current user.
   */
  async logoutUser(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }
};
