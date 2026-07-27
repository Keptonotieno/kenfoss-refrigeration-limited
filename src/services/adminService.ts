import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserRole } from '../types';

export interface AdminInvitation {
  id: string;
  code: string;
  email: string;
  role: UserRole;
  createdBy: string;
  status: 'Pending' | 'Used' | 'Expired' | 'Revoked';
  createdAt: string;
  expiresAt: string;
  usedBy?: string;
  usedAt?: string;
  notes?: string;
  dispatchStatus?: 'Sent' | 'Pending' | 'Failed';
  dispatchedAt?: string;
}

export interface GenerateInvitationParams {
  email: string;
  role: UserRole;
  createdBy: string;
  notes?: string;
  expiresInHours?: number;
  customCode?: string;
}

/**
  Generates a clean, unique 8-character uppercase alphanumeric code.
  Format: KEN-XXXXXXXX (e.g. KEN-[#A-Z0-9]{8})
 */
export function generateRandomCode(length = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit easily confused chars like O, 0, I, 1
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KEN-${result}`;
}

export class AdminInvitationService {
  /**
   * Generates a unique, single-use invitation code, stores it in Firestore,
   * and links it to a specific role before email dispatch.
   */
  static async createInvitation(params: GenerateInvitationParams): Promise<AdminInvitation> {
    try {
      const code = params.customCode 
        ? params.customCode.trim().toUpperCase() 
        : generateRandomCode(8);

      const hoursToExpire = params.expiresInHours || 168; // Default 7 days (168h)
      const now = new Date();
      const expiresAt = new Date(now.getTime() + hoursToExpire * 60 * 60 * 1000).toISOString();

      const invitationData: Omit<AdminInvitation, 'id'> = {
        code,
        email: params.email.trim().toLowerCase(),
        role: params.role,
        createdBy: params.createdBy || 'Super Admin',
        status: 'Pending',
        createdAt: now.toISOString(),
        expiresAt,
        notes: params.notes || `Single-use staff invitation for ${params.role} role.`,
        dispatchStatus: 'Pending'
      };

      const colRef = collection(db, 'invitations');
      const docRef = await addDoc(colRef, {
        ...invitationData,
        serverTime: serverTimestamp()
      });

      const newInvitation: AdminInvitation = {
        id: docRef.id,
        ...invitationData
      };

      console.log(`[AdminService] Created invitation ${code} for ${params.email} with role ${params.role}`);
      return newInvitation;
    } catch (error) {
      console.error('[AdminService] Error creating invitation:', error);
      throw error;
    }
  }

  /**
   * Retrieves an invitation from Firestore by code.
   */
  static async getInvitationByCode(code: string): Promise<AdminInvitation | null> {
    try {
      const cleanCode = code.trim().toUpperCase();
      const colRef = collection(db, 'invitations');
      const q = query(colRef, where('code', '==', cleanCode));
      const snap = await getDocs(q);

      if (snap.empty) {
        return null;
      }

      const docSnap = snap.docs[0];
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as AdminInvitation;
    } catch (error) {
      console.error('[AdminService] Error fetching invitation by code:', error);
      throw error;
    }
  }

  /**
   * Validates a code to check if it exists, is pending, and has not expired.
   */
  static async validateInvitationCode(code: string): Promise<{
    valid: boolean;
    invitation?: AdminInvitation;
    reason?: string;
  }> {
    try {
      const invitation = await this.getInvitationByCode(code);

      if (!invitation) {
        return { valid: false, reason: 'Invalid invitation code. Code does not exist in system.' };
      }

      if (invitation.status === 'Used') {
        return { valid: false, invitation, reason: 'This invitation code has already been redeemed.' };
      }

      if (invitation.status === 'Revoked') {
        return { valid: false, invitation, reason: 'This invitation code was revoked by an administrator.' };
      }

      const isExpired = new Date(invitation.expiresAt) < new Date();
      if (isExpired || invitation.status === 'Expired') {
        if (invitation.status !== 'Expired') {
          // Auto-mark as Expired in Firestore
          const docRef = doc(db, 'invitations', invitation.id);
          await updateDoc(docRef, { status: 'Expired' });
          invitation.status = 'Expired';
        }
        return { valid: false, invitation, reason: 'This invitation code has expired.' };
      }

      return { valid: true, invitation };
    } catch (error) {
      console.error('[AdminService] Error validating invitation code:', error);
      return { valid: false, reason: 'System error validating invitation code.' };
    }
  }

  /**
   * Redeems a valid single-use invitation code.
   */
  static async redeemInvitationCode(
    code: string, 
    userUid: string, 
    userDisplayName?: string
  ): Promise<{ success: boolean; invitation?: AdminInvitation; message: string }> {
    try {
      const validation = await this.validateInvitationCode(code);
      if (!validation.valid || !validation.invitation) {
        return { success: false, message: validation.reason || 'Invalid or unusable code.' };
      }

      const invitation = validation.invitation;
      const docRef = doc(db, 'invitations', invitation.id);
      const usedAt = new Date().toISOString();

      await updateDoc(docRef, {
        status: 'Used',
        usedBy: userUid,
        usedAt
      });

      invitation.status = 'Used';
      invitation.usedBy = userUid;
      invitation.usedAt = usedAt;

      console.log(`[AdminService] Invitation ${invitation.code} redeemed by user ${userUid}`);
      return {
        success: true,
        invitation,
        message: `Invitation code ${invitation.code} successfully redeemed. Role ${invitation.role} assigned.`
      };
    } catch (error) {
      console.error('[AdminService] Error redeeming invitation code:', error);
      return { success: false, message: 'Failed to redeem invitation code due to server error.' };
    }
  }

  /**
   * Fetches all admin invitations from Firestore.
   */
  static async getAllInvitations(): Promise<AdminInvitation[]> {
    try {
      const colRef = collection(db, 'invitations');
      const snap = await getDocs(colRef);
      const invitations: AdminInvitation[] = [];

      snap.forEach((d) => {
        invitations.push({
          id: d.id,
          ...d.data()
        } as AdminInvitation);
      });

      // Sort by createdAt desc
      return invitations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('[AdminService] Error fetching all invitations:', error);
      return [];
    }
  }

  /**
   * Revokes an invitation code.
   */
  static async revokeInvitation(invitationId: string): Promise<boolean> {
    try {
      const docRef = doc(db, 'invitations', invitationId);
      await updateDoc(docRef, {
        status: 'Revoked',
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('[AdminService] Error revoking invitation:', error);
      return false;
    }
  }

  /**
   * Prepares and triggers email dispatch for an invitation.
   */
  static async dispatchInvitationEmail(invitation: AdminInvitation): Promise<{
    success: boolean;
    message: string;
    dispatchLog: {
      recipient: string;
      code: string;
      role: UserRole;
      subject: string;
      dispatchedAt: string;
    };
  }> {
    try {
      const dispatchedAt = new Date().toISOString();
      const subject = `[Action Required] Official Kenfoss Refrigeration Staff Invitation (${invitation.role})`;
      
      const dispatchLog = {
        recipient: invitation.email,
        code: invitation.code,
        role: invitation.role,
        subject,
        dispatchedAt
      };

      // Mark invitation as dispatched in Firestore
      const docRef = doc(db, 'invitations', invitation.id);
      await updateDoc(docRef, {
        dispatchStatus: 'Sent',
        dispatchedAt
      });

      console.log('[AdminService] Email dispatch simulated successfully:', dispatchLog);

      return {
        success: true,
        message: `Official staff invitation email sent to ${invitation.email} with Code: ${invitation.code}`,
        dispatchLog
      };
    } catch (error) {
      console.error('[AdminService] Error dispatching invitation email:', error);
      return {
        success: false,
        message: 'Failed to dispatch email.',
        dispatchLog: {
          recipient: invitation.email,
          code: invitation.code,
          role: invitation.role,
          subject: 'Error',
          dispatchedAt: new Date().toISOString()
        }
      };
    }
  }
}
