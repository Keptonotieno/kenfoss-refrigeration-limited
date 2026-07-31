import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  PhoneCall, 
  MapPin, 
  Mail, 
  Clock, 
  Save, 
  CheckCircle2, 
  Globe, 
  RefreshCw, 
  AlertCircle, 
  RotateCcw,
  Eye,
  ExternalLink,
  MessageSquare,
  Facebook,
  Linkedin,
  Twitter,
  Instagram
} from 'lucide-react';

export const ContactInfoEditor: React.FC = () => {
  const { contactInfo, updateContactInfo } = useAdmin();

  const [formData, setFormData] = useState(contactInfo);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData(contactInfo);
  }, [contactInfo]);

  const validateForm = (): boolean => {
    if (!formData.mainPhone?.trim()) {
      setErrorMsg("Primary Phone Line is required.");
      return false;
    }
    if (!formData.emergencyPhone?.trim()) {
      setErrorMsg("24/7 Emergency Dispatch phone line is required.");
      return false;
    }
    if (!formData.email?.trim() || !formData.email.includes('@')) {
      setErrorMsg("Please provide a valid official email address.");
      return false;
    }
    if (!formData.address?.trim()) {
      setErrorMsg("Business Street Address is required.");
      return false;
    }
    if (!formData.city?.trim()) {
      setErrorMsg("City / County / Region is required.");
      return false;
    }
    if (!formData.workingHours?.trim()) {
      setErrorMsg("Operating Hours are required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const res = await updateContactInfo(formData);
      if (res.success) {
        setSuccessMsg(res.message || "Contact information saved successfully to Firebase & updated across the website!");
        setTimeout(() => setSuccessMsg(null), 5000);
      } else {
        setErrorMsg(res.message || "Failed to save contact information.");
      }
    } catch (err: any) {
      console.error("Error updating contact info:", err);
      setErrorMsg(err.message || "Failed to update contact information. Please check network connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm("Reset contact information to default Kenfoss Kenya office details?")) {
      const defaultInfo = {
        mainPhone: '+254 745 411 923',
        secondaryPhone: '+254 745 411 923',
        emergencyPhone: '+254 745 411 923',
        email: 'info@kenfoss.co.ke',
        address: "Ivy's Park Business Park, Next to Mark Hotel, Thika Superhighway Service Lane",
        city: 'Ruiru, Kiambu County, Kenya',
        workingHours: 'Mon - Sat: 7:30 AM - 6:00 PM | 24/7 Emergency Hotline',
        googleMapsEmbedUrl: 'https://maps.google.com/maps?q=Kenfoss+Refrigeration+limited,+Ivy%E2%80%99s+Park+Business+Park,+Next+to+Mark+Hotel,+Thika+Superhighway+Service+Lane,+Ruiru,+Kiambu+County&t=&z=16&ie=UTF8&iwloc=B&output=embed',
        facebookUrl: 'https://facebook.com/kenfossrefrigeration',
        linkedinUrl: 'https://linkedin.com/company/kenfoss-refrigeration',
        twitterUrl: 'https://twitter.com/kenfoss_ke',
        instagramUrl: 'https://instagram.com/kenfoss_refrigeration',
        whatsappNumber: '254745411923'
      };
      setFormData(defaultInfo);
      setIsSaving(true);
      const res = await updateContactInfo(defaultInfo);
      setIsSaving(false);
      if (res.success) {
        setSuccessMsg("Reset to default contact details successfully.");
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-emerald-400" />
            Company Contact & Location Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Edit company phone numbers, emergency lines, office address, operating hours, WhatsApp hotline, and Google Maps embed links. Changes persist to Firebase Firestore and update the public website in real time.
          </p>
        </div>

        <button
          onClick={handleResetToDefault}
          type="button"
          disabled={isSaving}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[11px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[11px] cursor-pointer"
          >
            OK
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        {/* Phone Numbers & Hotlines */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            <PhoneCall className="w-4 h-4" /> Phone Numbers & Hotlines
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Primary Phone Line *</label>
              <input
                type="text"
                required
                value={formData.mainPhone}
                onChange={(e) => setFormData({ ...formData, mainPhone: e.target.value })}
                placeholder="+254 745 411 923"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Secondary / Office Line</label>
              <input
                type="text"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                placeholder="+254 745 411 923"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">24/7 Emergency Hotline *</label>
              <input
                type="text"
                required
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="+254 745 411 923"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-amber-400 font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Email & Digital Support */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" /> Email & Digital Support
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Official Company Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@kenfoss.co.ke"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">WhatsApp Support Number (Country Code + Digits) *</label>
              <input
                type="text"
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value.replace(/[^\d]/g, '') })}
                placeholder="254745411923"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500">e.g., 254745411923 (used for floating WhatsApp click-to-chat)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Street / Building Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ivy's Park Business Park, Next to Mark Hotel"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">City / County / Region *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ruiru, Kiambu County, Kenya"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Operating Hours *</label>
              <input
                type="text"
                required
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                placeholder="Mon - Sat: 7:30 AM - 6:00 PM | 24/7 Emergency"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Google Maps Embed iframe URL</label>
            <input
              type="text"
              value={formData.googleMapsEmbedUrl}
              onChange={(e) => setFormData({ ...formData, googleMapsEmbedUrl: e.target.value })}
              placeholder="https://maps.google.com/maps?q=..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Social Media Links */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Social Media Profiles
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Facebook URL</label>
              <input
                type="url"
                value={formData.facebookUrl || ''}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">LinkedIn URL</label>
              <input
                type="url"
                value={formData.linkedinUrl || ''}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Twitter / X URL</label>
              <input
                type="url"
                value={formData.twitterUrl || ''}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                placeholder="https://twitter.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Instagram URL</label>
              <input
                type="url"
                value={formData.instagramUrl || ''}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 cursor-pointer transition-transform hover:scale-[1.02]"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving Changes to Database...' : 'Save & Instantly Update Website'}</span>
          </button>
        </div>

      </form>

      {/* Live Website Preview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          Live Website Contact Card Preview
        </h3>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-xs">
              <PhoneCall className="w-4 h-4 text-[#FF7A00]" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Primary & Emergency Line</span>
                <span className="text-white font-extrabold">{formData.mainPhone}</span>
                {formData.emergencyPhone && (
                  <span className="text-amber-400 text-[11px] block font-semibold">Emergency: {formData.emergencyPhone}</span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <Mail className="w-4 h-4 text-[#00AEEF]" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Official Email</span>
                <span className="text-white font-medium">{formData.email}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">WhatsApp Support</span>
                <span className="text-emerald-400 font-mono font-bold">+{formData.whatsappNumber}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-3 text-xs">
              <MapPin className="w-4 h-4 text-[#FF7A00] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Physical Location</span>
                <p className="text-white font-medium">{formData.address}</p>
                <p className="text-slate-400 text-[11px]">{formData.city}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <Clock className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">Business Hours</span>
                <span className="text-emerald-400 font-bold">{formData.workingHours}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

