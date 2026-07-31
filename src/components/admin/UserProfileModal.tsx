import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { UserAvatar } from '../common/UserAvatar';
import { uploadProfilePhotoToStorage } from '../../lib/firebase';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Camera, 
  Trash2, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Clock, 
  Loader2,
  Sparkles
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile } = useAdmin();

  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentUser?.avatar || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAvatarPreview(currentUser.avatar || null);
      setSelectedFile(null);
      setFeedback(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Please select a valid image file (JPG, PNG, WEBP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Image size exceeds 5MB limit. Please choose a smaller file.' });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFeedback(null);
  };

  const handleRemovePhoto = async () => {
    setSelectedFile(null);
    setAvatarPreview('');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      let finalAvatarUrl = avatarPreview;

      // 1. If a new photo file was picked, upload to Firebase Storage
      if (selectedFile) {
        setIsUploadingPhoto(true);
        finalAvatarUrl = await uploadProfilePhotoToStorage(selectedFile, currentUser.id);
        setIsUploadingPhoto(false);
      }

      // 2. Call AdminContext updateUserProfile to save permanently in Firestore
      const res = await updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatar: finalAvatarUrl === null ? '' : finalAvatarUrl
      });

      if (!res.success) {
        setFeedback({ type: 'error', message: res.message });
      } else {
        setFeedback({ type: 'success', message: 'Profile & avatar updated successfully!' });
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setFeedback({ type: 'error', message: err.message || 'Failed to update user profile.' });
    } finally {
      setIsSaving(false);
      setIsUploadingPhoto(false);
    }
  };

  const isSuperAdmin = currentUser.role === 'Super Administrator';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Account Profile & Settings</h3>
              <p className="text-[11px] text-slate-400">Manage your account details and profile photo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {feedback && (
          <div className={`p-3.5 rounded-2xl border text-xs flex items-center space-x-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Profile Avatar Upload Section */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="relative group shrink-0">
            <UserAvatar
              src={avatarPreview || undefined}
              name={name || currentUser.name}
              role={currentUser.role}
              size="xl"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-slate-950/60 rounded-full flex flex-col items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-blue-500/50"
              title="Click to upload profile photo"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span>Upload</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              className="hidden"
            />
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Profile Photo</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-800 text-slate-400 border border-slate-700">
                Optional
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Upload a custom profile photo (stored in Firebase). If no photo is uploaded, a professional default avatar is displayed.
            </p>
            <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                <Camera className="w-3.5 h-3.5 text-blue-400" />
                <span>Select Image</span>
              </button>
              {(avatarPreview || selectedFile) && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer border border-rose-500/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kepton Otieno"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center space-x-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +254 712 345 678"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

          </div>

          {/* Account Read-only Specs */}
          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center space-x-1">
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Account Credentials & Security Scope</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
              <div>
                <span className="text-[10px] text-slate-500 block">Email Address</span>
                <span className="font-mono text-white text-xs">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Assigned Staff Role</span>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase mt-0.5 ${
                  isSuperAdmin ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  currentUser.role === 'Manager' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">2FA Security Status</span>
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1 mt-0.5">
                  <ShieldCheck className={`w-3.5 h-3.5 ${currentUser.twoFactorEnabled ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span>{currentUser.twoFactorEnabled ? '2-Factor Auth Active' : '2FA Disabled'}</span>
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Account UID</span>
                <span className="font-mono text-[10px] text-slate-400 truncate block" title={currentUser.id}>
                  {currentUser.id}
                </span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploadingPhoto}
              className="px-5 py-2 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-blue-900/40 transition-colors disabled:opacity-50"
            >
              {isSaving || isUploadingPhoto ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isUploadingPhoto ? 'Uploading Image...' : 'Saving Changes...'}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
