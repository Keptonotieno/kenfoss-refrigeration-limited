import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Settings, Save, CheckCircle2, ShieldAlert, Palette, Search, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react';

export const WebsiteSettingsEditor: React.FC = () => {
  const { websiteSettings, updateWebsiteSettings } = useAdmin();

  const [formData, setFormData] = useState(websiteSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    setFormData(websiteSettings);
  }, [websiteSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await updateWebsiteSettings(formData);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      console.error("Error updating website settings:", err);
      setErrorMsg("Failed to update website settings. Please check your inputs and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm("Reset website & branding settings to default values?")) {
      const defaults = {
        companyName: 'Kenfoss Refrigeration Limited',
        tagline: 'Precision Refrigeration & HVAC Engineering Solutions Across Kenya',
        logoUrl: '',
        faviconUrl: '',
        primaryColor: '#0057B8',
        secondaryColor: '#FF7A00',
        footerCopyright: '© 2026 Kenfoss Refrigeration Limited. All Rights Reserved. Reg. EPRA/C1/2026/KE.',
        metaDescription: 'Kenya’s premier EPRA-certified corporate refrigeration and HVAC engineering firm. Commercial cold rooms, supermarket chillers, and residential inverter fridge repairs.',
        metaKeywords: 'Refrigeration Kenya, Cold Room Repair Nairobi, Fridge Repair Nairobi, HVAC Engineer Kenya, Bitzer Compressor Repair',
        googleAnalyticsId: 'G-KENFOSS2026',
        siteTitle: 'Kenfoss Refrigeration Limited | EPRA Certified Engineers',
        footerText: '© 2026 Kenfoss Refrigeration Limited. All Rights Reserved.',
        enableMaintenanceMode: false
      };
      setFormData(defaults as any);
      updateWebsiteSettings(defaults as any);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            Global Website & Branding Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Customize brand logos, page metadata, primary theme accent colors, footer details, and Google Analytics.
          </p>
        </div>

        <button
          onClick={handleResetToDefault}
          type="button"
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>Website settings updated successfully! Changes published across all public routes.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        {/* Branding & Logo */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Palette className="w-4 h-4" /> Company Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Website Name / Title</label>
              <input
                type="text"
                required
                value={formData.siteTitle}
                onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Logo URL</label>
              <input
                type="url"
                required
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Primary Accent Brand Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 bg-transparent rounded cursor-pointer border border-slate-800"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Secondary Accent Brand Color</label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-10 h-10 bg-transparent rounded cursor-pointer border border-slate-800"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEO & Meta */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Search className="w-4 h-4" /> SEO & Search Engine Indexing
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300">Global Meta Description</label>
            <textarea
              rows={2}
              value={formData.metaDescription}
              onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Google Analytics / Tag ID</label>
              <input
                type="text"
                value={formData.googleAnalyticsId}
                onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Footer Copyright Notice</label>
              <input
                type="text"
                value={formData.footerText}
                onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode Toggle */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h4 className="text-xs font-bold text-white">Public Maintenance Mode</h4>
              <p className="text-[11px] text-amber-300/80">When enabled, public visitors see a maintenance banner.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, enableMaintenanceMode: !formData.enableMaintenanceMode })}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              formData.enableMaintenanceMode ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
              formData.enableMaintenanceMode ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg flex items-center space-x-2 cursor-pointer transition-transform hover:scale-[1.02]"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving Settings...' : 'Save Website Settings'}</span>
        </button>

      </form>

    </div>
  );
};
