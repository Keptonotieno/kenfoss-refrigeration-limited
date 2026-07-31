import React, { useState, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ProjectItem } from '../../types';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  MapPin, 
  Calendar, 
  Building2, 
  Upload, 
  Zap, 
  Check, 
  AlertTriangle,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

const CATEGORIES = ['Cold Room', 'Supermarket', 'Industrial', 'HVAC', 'Milk Cooling'];

export const ProjectsManagement: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState<ProjectItem | null>(null);
  const [projToDelete, setProjToDelete] = useState<ProjectItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    client: string;
    category: string;
    location: string;
    completedDate: string;
    imageAfter: string;
    imageBefore: string;
    summary: string;
    specs: { label: string; value: string }[];
    challenge: string;
    solution: string;
  }>({
    title: '',
    client: '',
    category: 'Cold Room',
    location: 'Nairobi, Kenya',
    completedDate: new Date().toISOString().slice(0, 7),
    imageAfter: '',
    imageBefore: '',
    summary: '',
    specs: [{ label: 'Capacity', value: '25MT' }, { label: 'Temp Range', value: '-18°C to -22°C' }],
    challenge: '',
    solution: ''
  });

  // Image Upload Engine State
  const fileInputBeforeRef = useRef<HTMLInputElement>(null);
  const fileInputAfterRef = useRef<HTMLInputElement>(null);
  const [isCompressingBefore, setIsCompressingBefore] = useState(false);
  const [isCompressingAfter, setIsCompressingAfter] = useState(false);

  const handleOpenAdd = () => {
    setEditingProj(null);
    setFormData({
      title: '',
      client: '',
      category: 'Cold Room',
      location: 'Nairobi, Kenya',
      completedDate: new Date().toISOString().slice(0, 7),
      imageAfter: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      imageBefore: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800',
      summary: '',
      specs: [
        { label: 'Capacity', value: '50 MT Modular Storage' },
        { label: 'Temp Range', value: '-18°C to -22°C' },
        { label: 'Compressor', value: 'Bitzer Semi-Hermetic 15HP' }
      ],
      challenge: 'High power consumption and erratic temperature fluctuations causing fruit spoilage.',
      solution: 'Replaced outdated split compressor with Bitzer multi-compressor rack and polyurethane cold paneling.'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProjectItem) => {
    setEditingProj(p);
    setFormData({
      title: p.title,
      client: p.client,
      category: p.category,
      location: p.location,
      completedDate: p.completedDate,
      imageAfter: p.imageAfter || '',
      imageBefore: p.imageBefore || '',
      summary: p.summary,
      specs: p.specs && p.specs.length > 0 ? p.specs : [{ label: 'Capacity', value: 'N/A' }],
      challenge: p.challenge || '',
      solution: p.solution || ''
    });
    setIsModalOpen(true);
  };

  // Canvas Image Compression Helper
  const compressImage = (file: File, callback: (base64Url: string) => void, setCompressing: (val: boolean) => void) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    setCompressing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          callback(dataUrl);
        }
        setCompressing(false);
      };
      img.onerror = () => {
        setCompressing(false);
        alert('Failed to process image.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddSpec = () => {
    setFormData(prev => ({
      ...prev,
      specs: [...prev.specs, { label: '', value: '' }]
    }));
  };

  const handleRemoveSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index)
    }));
  };

  const handleSpecChange = (index: number, field: 'label' | 'value', val: string) => {
    setFormData(prev => {
      const newSpecs = [...prev.specs];
      newSpecs[index] = { ...newSpecs[index], [field]: val };
      return { ...prev, specs: newSpecs };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageAfter) {
      alert('Please provide an Engineered (After) project image URL or upload a photo.');
      return;
    }

    const cleanedSpecs = formData.specs.filter(s => s.label.trim() && s.value.trim());

    if (editingProj) {
      updateProject({
        ...editingProj,
        title: formData.title,
        client: formData.client,
        category: formData.category,
        location: formData.location,
        completedDate: formData.completedDate,
        imageAfter: formData.imageAfter,
        imageBefore: formData.imageBefore || formData.imageAfter,
        summary: formData.summary,
        specs: cleanedSpecs.length > 0 ? cleanedSpecs : [{ label: 'Status', value: 'Commissioned' }],
        challenge: formData.challenge,
        solution: formData.solution
      });
    } else {
      addProject({
        title: formData.title,
        client: formData.client,
        category: formData.category,
        location: formData.location,
        completedDate: formData.completedDate,
        imageAfter: formData.imageAfter,
        imageBefore: formData.imageBefore || formData.imageAfter,
        summary: formData.summary,
        specs: cleanedSpecs.length > 0 ? cleanedSpecs : [{ label: 'Status', value: 'Commissioned' }],
        challenge: formData.challenge,
        solution: formData.solution
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (projToDelete) {
      deleteProject(projToDelete.id);
      setProjToDelete(null);
    }
  };

  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Firestore Real-Time Sync</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FolderGit2 className="w-7 h-7 text-[#00AEEF]" />
            Completed Projects Showcase
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Manage engineering case studies, before/after comparisons, client installations, and technical specifications for live website display.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-3 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-2xl flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-900/30 self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project Case Study</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search projects by title, client, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-3 text-slate-500 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              All Categories ({projects.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = projects.filter(p => p.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <FolderGit2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Projects Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or click below to add a new project case study.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#0057B8] hover:bg-blue-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project Case Study</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((p) => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-blue-500/50 transition-all">
              
              {/* Image Banner */}
              <div className="relative h-52 overflow-hidden bg-slate-950">
                <img
                  src={p.imageAfter}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-950/85 text-[#00AEEF] border border-slate-800 backdrop-blur-md">
                    {p.category}
                  </span>
                  {p.imageBefore && (
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Before/After Included</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-blue-400 transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-blue-400" /> {p.client}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-400" /> {p.location}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{p.summary}</p>
                  
                  {/* Specs Pills */}
                  {p.specs && p.specs.length > 0 && (
                    <div className="grid grid-cols-2 gap-1.5 pt-2">
                      {p.specs.slice(0, 2).map((s, idx) => (
                        <div key={idx} className="bg-slate-950 p-2 rounded-xl border border-slate-800 text-[11px]">
                          <span className="text-slate-500 block text-[9px] uppercase font-bold">{s.label}</span>
                          <span className="text-slate-200 font-semibold truncate block">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Completed: {p.completedDate}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
                      title="Edit Project"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setProjToDelete(p)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-black text-blue-400 uppercase tracking-widest block">
                {editingProj ? 'Edit Project Details' : 'New Project Case Study'}
              </span>
              <h3 className="text-xl font-black text-white">
                {editingProj ? 'Update Completed Project Showcase' : 'Publish Completed Engineering Showcase'}
              </h3>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Project Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 50MT Horticultural Cold Storage Installation"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Client / Facility Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="FreshHarvest Kenya Ltd"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category Tag</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Location / County *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Naivasha, Nakuru County"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Completion Month/Year *</label>
                  <input
                    type="text"
                    required
                    value={formData.completedDate}
                    onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                    placeholder="2026-06"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Before and After Image Upload Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* AFTER IMAGE (COMMISSIONED RESULT) */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Engineered Result (AFTER Photo) *</span>
                  </label>
                  <div 
                    onClick={() => fileInputAfterRef.current?.click()}
                    className="border border-dashed border-slate-800 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer bg-slate-900/50 transition-colors"
                  >
                    <input
                      ref={fileInputAfterRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) compressImage(file, (url) => setFormData(prev => ({ ...prev, imageAfter: url })), setIsCompressingAfter);
                      }}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-white block">Upload AFTER Image</span>
                  </div>
                  {isCompressingAfter && <div className="text-[10px] text-emerald-400 animate-pulse text-center">Compressing image...</div>}
                  <input
                    type="url"
                    value={formData.imageAfter}
                    onChange={(e) => setFormData({ ...formData, imageAfter: e.target.value })}
                    placeholder="Or enter image URL..."
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-white focus:outline-none focus:border-emerald-500"
                  />
                  {formData.imageAfter && (
                    <img src={formData.imageAfter} alt="After Preview" className="h-20 w-full object-cover rounded-lg border border-slate-800" />
                  )}
                </div>

                {/* BEFORE IMAGE (FAULTY/LEGACY) */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Faulty / Initial (BEFORE Photo)</span>
                  </label>
                  <div 
                    onClick={() => fileInputBeforeRef.current?.click()}
                    className="border border-dashed border-slate-800 hover:border-amber-500 rounded-xl p-3 text-center cursor-pointer bg-slate-900/50 transition-colors"
                  >
                    <input
                      ref={fileInputBeforeRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) compressImage(file, (url) => setFormData(prev => ({ ...prev, imageBefore: url })), setIsCompressingBefore);
                      }}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-white block">Upload BEFORE Image</span>
                  </div>
                  {isCompressingBefore && <div className="text-[10px] text-amber-400 animate-pulse text-center">Compressing image...</div>}
                  <input
                    type="url"
                    value={formData.imageBefore}
                    onChange={(e) => setFormData({ ...formData, imageBefore: e.target.value })}
                    placeholder="Or enter image URL..."
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-white focus:outline-none focus:border-amber-500"
                  />
                  {formData.imageBefore && (
                    <img src={formData.imageBefore} alt="Before Preview" className="h-20 w-full object-cover rounded-lg border border-slate-800" />
                  )}
                </div>

              </div>

              {/* Summary */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Engineering Executive Summary *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Brief overview of project scope, client goals, and outcome..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Technical Specifications Key-Value Editor */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Technical Specifications Table</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Spec Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.specs.map((spec, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Label (e.g. Capacity)"
                        value={spec.label}
                        onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 50 MT Cold Room)"
                        value={spec.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                      {formData.specs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSpec(idx)}
                          className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Challenge & Solution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-400">Client Problem / Challenge</label>
                  <textarea
                    rows={2}
                    value={formData.challenge}
                    onChange={(e) => setFormData({ ...formData, challenge: e.target.value })}
                    placeholder="Describe legacy equipment failures or temperature issues..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-400">Kenfoss Engineering Solution</label>
                  <textarea
                    rows={2}
                    value={formData.solution}
                    onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                    placeholder="Describe equipment installed and efficiency gains achieved..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingProj ? 'Save Project Updates' : 'Publish Project'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Project Case Study?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove "<span className="text-white font-semibold">{projToDelete.title}</span>"? This will remove it from Firestore and the public website showcase.
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setProjToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
