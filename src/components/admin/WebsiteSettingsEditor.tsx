import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  Settings, 
  Save, 
  CheckCircle2, 
  ShieldAlert, 
  Palette, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  RotateCcw,
  Globe,
  BarChart2,
  Share2,
  Image as ImageIcon,
  ExternalLink,
  Info,
  Lock,
  MessageSquare,
  Upload
} from 'lucide-react';
import { WebsiteSettings } from '../../types';

export const WebsiteSettingsEditor: React.FC = () => {
  const { websiteSettings, updateWebsiteSettings, currentUser } = useAdmin();

  const [formData, setFormData] = useState<WebsiteSettings>(websiteSettings);
  const [activeTab, setActiveTab] = useState<'branding' | 'seo' | 'analytics' | 'social' | 'footer'>('branding');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const ogFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, ogImageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (websiteSettings) {
      setFormData(websiteSettings);
    }
  }, [websiteSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await updateWebsiteSettings(formData);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3500);
    } catch (err: any) {
      console.error("Error updating website settings:", err);
      setErrorMsg("Failed to sync website settings to Firebase. Please check your inputs.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm("Reset website, SEO & branding settings to system default values?")) {
      const defaults: WebsiteSettings = {
        companyName: 'Kenfoss Refrigeration Limited',
        siteTitle: 'Kenfoss Refrigeration Limited | EPRA Certified Engineers',
        tagline: 'Precision Refrigeration & HVAC Engineering Solutions Across Kenya',
        logoUrl: '',
        faviconUrl: '',
        ogImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200',
        primaryColor: '#0057B8',
        secondaryColor: '#FF7A00',
        footerCopyright: '© 2026 Kenfoss Refrigeration Limited. All Rights Reserved.',
        footerText: '© 2026 Kenfoss Refrigeration Limited. All Rights Reserved. Reg. EPRA/C1/2026/KE.',
        epraNotice: 'EPRA Class C1 Certified Electrical & Mechanical Engineering Contractor',
        metaDescription: 'Kenya’s premier EPRA-certified corporate refrigeration and HVAC engineering firm. Commercial cold rooms, supermarket chillers, and residential inverter fridge repairs.',
        metaKeywords: 'Refrigeration Kenya, Cold Room Repair Nairobi, Fridge Repair Nairobi, HVAC Engineer Kenya, Bitzer Compressor Repair',
        googleAnalyticsId: 'G-KENFOSS2026',
        gtmContainerId: '',
        facebookPixelId: '',
        facebookUrl: 'https://facebook.com/kenfossrefrigeration',
        linkedinUrl: 'https://linkedin.com/company/kenfoss-refrigeration',
        twitterUrl: 'https://twitter.com/kenfoss_ke',
        instagramUrl: 'https://instagram.com/kenfoss_refrigeration',
        whatsappNumber: '254745411923',
        enableMaintenanceMode: false
      };
      setFormData(defaults);
      updateWebsiteSettings(defaults);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-black text-white">
              Website & SEO Settings Engine
            </h1>
            <span className="px-2.5 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-bold rounded-full border border-purple-500/20">
              Live Firebase Sync
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure site branding, logos, favicons, meta tags, Google Analytics, social profiles, and maintenance mode. Updates publish in real time across the public website and customer portal.
          </p>
        </div>

        <button
          onClick={handleResetToDefault}
          type="button"
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-slate-700/60"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset System Defaults</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'branding', label: 'Brand & Logos', icon: Palette },
          { id: 'seo', label: 'SEO & Search Snippet', icon: Search },
          { id: 'analytics', label: 'Analytics & Pixels', icon: BarChart2 },
          { id: 'social', label: 'Social & WhatsApp', icon: Share2 },
          { id: 'footer', label: 'Footer & Legal', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                active 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
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
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-purple-400" />
          <span>Website settings successfully updated & synced to Firebase! Changes are live immediately.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        {/* TAB 1: BRANDING & LOGOS */}
        {activeTab === 'branding' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-purple-400" />
                Brand Identity & Visual Logos
              </h3>
              <p className="text-xs text-slate-400">
                Set company legal name, public title, brand logo image URLs, favicons, and accent colors.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Kenfoss Refrigeration Limited"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Website Title (Browser Tab Title)</label>
                <input
                  type="text"
                  required
                  value={formData.siteTitle}
                  onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                  placeholder="Kenfoss Refrigeration Limited | EPRA Certified Engineers"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Company Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Precision Refrigeration & HVAC Engineering Solutions Across Kenya"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Brand Logo (URL or Local File)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 shrink-0 border border-slate-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                    <span>Upload</span>
                  </button>
                  <input type="file" ref={logoFileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                </div>
                <p className="text-[10px] text-slate-500">PNG/SVG image or base64 file from local disk.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Favicon URL (.ico / .png)</label>
                <input
                  type="url"
                  value={formData.faviconUrl}
                  onChange={(e) => setFormData({ ...formData, faviconUrl: e.target.value })}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <p className="text-[10px] text-slate-500">16x16 or 32x32 browser tab icon.</p>
              </div>
            </div>

            {/* Accent Colors */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">Theme Primary & Secondary Colors</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Primary Corporate Blue Accent</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.primaryColor || '#0057B8'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer border border-slate-800"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor || '#0057B8'}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Secondary Orange Accent</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={formData.secondaryColor || '#FF7A00'}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer border border-slate-800"
                    />
                    <input
                      type="text"
                      value={formData.secondaryColor || '#FF7A00'}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEO & GOOGLE PREVIEW */}
        {activeTab === 'seo' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-purple-400" />
                SEO Metadata & Social Sharing Cards
              </h3>
              <p className="text-xs text-slate-400">
                Manage global search engine descriptions, target keywords, social card preview images, and inspect live Google Search preview.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Global Meta Description (150 - 160 Characters Recommended)</label>
              <textarea
                rows={3}
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Kenya’s premier EPRA-certified corporate refrigeration and HVAC engineering firm..."
                className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
              />
              <div className="flex justify-between text-[10px] text-slate-500 px-1">
                <span>Google snippet recommendation: 150-160 characters</span>
                <span className={formData.metaDescription?.length > 160 ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                  {formData.metaDescription?.length || 0} chars
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Meta Keywords (Comma Separated)</label>
              <input
                type="text"
                value={formData.metaKeywords}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                placeholder="Refrigeration Kenya, Cold Room Repair Nairobi, Fridge Repair Nairobi, Bitzer Compressor"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">OpenGraph Social Share Card Image URL (Facebook/LinkedIn/Twitter)</label>
              <input
                type="url"
                value={formData.ogImageUrl || ''}
                onChange={(e) => setFormData({ ...formData, ogImageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            {/* LIVE GOOGLE SEARCH SNIPPET PREVIEW */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800/80 pb-2">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Search className="w-3.5 h-3.5" />
                  Live Google Search Result Preview
                </span>
                <span className="text-slate-500 font-mono">Desktop Snippet</span>
              </div>

              <div className="pt-1 space-y-1 max-w-xl">
                <div className="flex items-center gap-2 text-[12px] text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[9px]">K</span>
                  <span className="text-slate-300 font-mono text-[11px]">https://kenfoss.co.ke</span>
                </div>
                <h4 className="text-base font-bold text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
                  {formData.siteTitle || formData.companyName || 'Kenfoss Refrigeration Limited'}
                </h4>
                <p className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
                  {formData.metaDescription || 'No description entered yet. Fill in the description above to preview Google search appearance.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ANALYTICS & PIXELS */}
        {activeTab === 'analytics' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-400" />
                Analytics & Marketing Pixel Tracking
              </h3>
              <p className="text-xs text-slate-400">
                Connect Google Analytics 4, Tag Manager, and Meta Pixel for real-time web traffic & lead attribution.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Google Analytics 4 Measurement ID (GA4)</label>
              <input
                type="text"
                value={formData.googleAnalyticsId}
                onChange={(e) => setFormData({ ...formData, googleAnalyticsId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
              <p className="text-[10px] text-slate-500">Format: G-XXXXXXXXXX. Injected into site head asynchronously.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Google Tag Manager (GTM) Container ID</label>
                <input
                  type="text"
                  value={formData.gtmContainerId || ''}
                  onChange={(e) => setFormData({ ...formData, gtmContainerId: e.target.value })}
                  placeholder="GTM-XXXXXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Meta (Facebook) Pixel ID</label>
                <input
                  type="text"
                  value={formData.facebookPixelId || ''}
                  onChange={(e) => setFormData({ ...formData, facebookPixelId: e.target.value })}
                  placeholder="123456789012345"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIAL & WHATSAPP */}
        {activeTab === 'social' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                Social Media Profiles & Instant WhatsApp Dispatch
              </h3>
              <p className="text-xs text-slate-400">
                Links used across website header, footer, contact forms, and instant floating WhatsApp widget.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">WhatsApp Hotline Number (Country code without +)</label>
                <input
                  type="text"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  placeholder="254745411923"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-bold focus:outline-none focus:border-purple-500 font-mono"
                />
                <p className="text-[10px] text-slate-500">e.g. 254745411923 for floating WhatsApp chat widget.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Facebook Page URL</label>
                <input
                  type="url"
                  value={formData.facebookUrl || ''}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/kenfossrefrigeration"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">LinkedIn Company URL</label>
                <input
                  type="url"
                  value={formData.linkedinUrl || ''}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/company/kenfoss-refrigeration"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Twitter / X Profile URL</label>
                <input
                  type="url"
                  value={formData.twitterUrl || ''}
                  onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                  placeholder="https://twitter.com/kenfoss_ke"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Instagram Handle URL</label>
                <input
                  type="url"
                  value={formData.instagramUrl || ''}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  placeholder="https://instagram.com/kenfoss_refrigeration"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: FOOTER & MAINTENANCE */}
        {activeTab === 'footer' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-purple-400" />
                Footer Notices, EPRA Certification & System Maintenance
              </h3>
              <p className="text-xs text-slate-400">
                Update legal copyright notices, regulatory EPRA license mentions, and system maintenance mode toggle.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Footer Primary Copyright Line</label>
              <input
                type="text"
                value={formData.footerCopyright}
                onChange={(e) => setFormData({ ...formData, footerCopyright: e.target.value })}
                placeholder="© 2026 Kenfoss Refrigeration Limited. All Rights Reserved."
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Detailed Footer Text (Sub-line)</label>
                <input
                  type="text"
                  value={formData.footerText}
                  onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                  placeholder="© 2026 Kenfoss Refrigeration Limited. All Rights Reserved. Reg. EPRA/C1/2026/KE."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">EPRA Certification Notice</label>
                <input
                  type="text"
                  value={formData.epraNotice || ''}
                  onChange={(e) => setFormData({ ...formData, epraNotice: e.target.value })}
                  placeholder="EPRA Class C1 Certified Electrical & Mechanical Engineering Contractor"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-medium focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* MAINTENANCE MODE TOGGLE */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Public Website Maintenance Mode</h4>
                  <p className="text-[11px] text-amber-300/80">
                    When enabled, search engines are instructed not to index updates, and public visitors receive a scheduled maintenance notice.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, enableMaintenanceMode: !formData.enableMaintenanceMode })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer shrink-0 ${
                  formData.enableMaintenanceMode ? 'bg-amber-500' : 'bg-slate-800'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.enableMaintenanceMode ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        )}

        {/* Submit Action Button */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-purple-400" />
            Changes take effect immediately upon saving to Firebase.
          </p>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20 flex items-center space-x-2 cursor-pointer transition-transform hover:scale-[1.02]"
          >
            {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Syncing to Firebase...' : 'Save & Publish Website Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
