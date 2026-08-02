import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  Wrench, 
  Download, 
  Copy, 
  Check, 
  Upload, 
  RefreshCw, 
  Layers, 
  Sliders, 
  Eye,
  Zap
} from 'lucide-react';

interface GeminiImageStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookService?: (prefillNotes: string) => void;
}

const PRESET_PROMPTS = [
  "Modern walk-in cold room with digital temperature display showing -18°C and glass display doors",
  "Commercial supermarket display chiller with fresh produce and LED strip lighting",
  "High-efficiency Bitzer compressor rack system inside a pharmaceutical cold storage facility",
  "Industrial HVAC air handler unit installed on a commercial roof in Kenya",
  "Precision wine cellar refrigeration system with climate controls"
];

export const GeminiImageStudioModal: React.FC<GeminiImageStudioModalProps> = ({
  isOpen,
  onClose,
  onBookService
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateOrEdit = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setEditNotes(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          imageToEdit: activeTab === 'edit' ? uploadedImage : null
        })
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        if (data.resultText) {
          setEditNotes(data.resultText);
        }
      } else {
        alert(data.error || 'Image generation failed. Please try again.');
      }
    } catch (err) {
      console.error('Image studio error:', err);
      alert('Unable to process image request. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const a = document.createElement('a');
    a.href = generatedImageUrl;
    a.download = `kenfoss-ai-concept-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyLink = () => {
    if (!generatedImageUrl) return;
    navigator.clipboard.writeText(generatedImageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <ImageIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Gemini AI Image Studio</h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  <Sparkles className="w-3 h-3 text-purple-500" /> gemini-3.1-flash-image-preview
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate cold room architectural mockups or edit existing HVAC equipment photos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer text-xs ${
              activeTab === 'create'
                ? 'bg-[#0057B8] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Create New Visualization</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all cursor-pointer text-xs ${
              activeTab === 'edit'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-300" />
            <span>Edit Existing Image</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* If Edit tab: File Upload input */}
            {activeTab === 'edit' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Upload Image to Edit:
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0057B8] dark:hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-colors relative bg-slate-50 dark:bg-slate-800/40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadedImage ? (
                    <div className="relative group">
                      <img
                        src={uploadedImage}
                        alt="Uploaded for editing"
                        className="max-h-36 mx-auto rounded-lg object-cover shadow-sm"
                      />
                      <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block mt-1">
                        Click or drag to replace image
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-slate-500 dark:text-slate-400">
                      <Upload className="w-8 h-8 mx-auto text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                        Drop photo or click to browse
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        JPG, PNG or WebP up to 10MB
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Prompt Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {activeTab === 'create' ? 'Describe the refrigeration / HVAC scene to generate:' : 'Describe edits or modifications to make:'}
              </label>
              <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  activeTab === 'create'
                    ? "e.g., A modern walk-in blast freezer with stainless steel walls and digital panel showing -25°C..."
                    : "e.g., Change the digital temperature panel to display -22°C and add LED lighting..."
                }
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
              />
            </div>

            {/* Aspect Ratio Selector (for Create) */}
            {activeTab === 'create' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Aspect Ratio:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: '16:9', label: '16:9 (Landscape)' },
                    { id: '1:1', label: '1:1 (Square)' },
                    { id: '4:3', label: '4:3 (Standard)' }
                  ].map((ar) => (
                    <button
                      key={ar.id}
                      type="button"
                      onClick={() => setAspectRatio(ar.id)}
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        aspectRatio === ar.id
                          ? 'border-[#0057B8] bg-blue-50 dark:bg-blue-950 text-[#0057B8] dark:text-blue-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {ar.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Prompt Ideas */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Quick Prompts:
              </span>
              <div className="space-y-1">
                {PRESET_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="w-full text-left text-[11px] bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 p-2 rounded-lg transition-colors truncate cursor-pointer block border border-slate-200/60 dark:border-slate-700/60"
                  >
                    ✨ {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              onClick={handleGenerateOrEdit}
              disabled={!prompt.trim() || isGenerating || (activeTab === 'edit' && !uploadedImage)}
              className="w-full bg-gradient-to-r from-[#0057B8] to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini AI is processing image...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{activeTab === 'create' ? 'Generate AI Image' : 'Process Image Edit'}</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Result Preview Column */}
          <div className="lg:col-span-7 flex flex-col">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Result Preview:
            </label>
            <div className="flex-1 min-h-[280px] bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
              
              {generatedImageUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-between gap-3">
                  <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-xl bg-slate-900/50">
                    <img
                      src={generatedImageUrl}
                      alt="AI Generated HVAC Concept"
                      referrerPolicy="no-referrer"
                      className="max-h-[380px] w-auto max-w-full object-contain rounded-xl shadow-lg"
                    />
                  </div>

                  {editNotes && (
                    <div className="w-full text-xs bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/60">
                      <strong>AI Edit Notes:</strong> {editNotes}
                    </div>
                  )}

                  <div className="w-full flex items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 bg-[#0057B8] hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied Link' : 'Copy Image'}</span>
                      </button>
                    </div>

                    {onBookService && (
                      <button
                        type="button"
                        onClick={() => onBookService(`Custom AI Cold Room Concept: ${prompt}`)}
                        className="flex items-center gap-1 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        <span>Quote this Design</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 text-slate-400 space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    No image generated yet
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Enter a prompt or select a preset on the left, then click "Generate AI Image".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
