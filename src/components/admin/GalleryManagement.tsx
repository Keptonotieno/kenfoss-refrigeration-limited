import React, { useState, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { GalleryItem } from '../../types';
import { 
  Image, 
  Video, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Search, 
  Star, 
  Eye, 
  Upload, 
  Sparkles, 
  Tag, 
  MapPin, 
  Building2, 
  Check, 
  AlertTriangle,
  Film,
  Zap,
  Info,
  Maximize2
} from 'lucide-react';

const CATEGORIES = [
  'Cold Rooms',
  'HVAC & VRF',
  'Supermarket Chillers',
  'Milk Cooling Plants',
  'Industrial Refrigeration',
  'Field Team & Installations',
  'Spare Parts & Racks'
];

export const GalleryManagement: React.FC = () => {
  const { gallery, addGalleryItem, updateGalleryItem, deleteGalleryItem } = useAdmin();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'video'>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    type: 'image' | 'video';
    category: string;
    url: string;
    description: string;
    tagsInput: string;
    featured: boolean;
    location: string;
    client: string;
    fileSizeKb?: number;
    dimensions?: string;
  }>({
    title: '',
    type: 'image',
    category: 'Cold Rooms',
    url: '',
    description: '',
    tagsInput: '',
    featured: false,
    location: '',
    client: ''
  });

  // Image Optimization Engine State
  const [isCompressing, setIsCompressing] = useState(false);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
  const [maxDimension, setMaxDimension] = useState<number>(1200);
  const [imageQuality, setImageQuality] = useState<number>(0.82);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      type: 'image',
      category: 'Cold Rooms',
      url: '',
      description: '',
      tagsInput: 'Cold Rooms, EPRA Certified, Kenfoss',
      featured: false,
      location: 'Nairobi, Kenya',
      client: ''
    });
    setOriginalSize(null);
    setCompressedSize(null);
    setCompressionRatio(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      type: item.type,
      category: item.category,
      url: item.url,
      description: item.description || '',
      tagsInput: item.tags ? item.tags.join(', ') : '',
      featured: !!item.featured,
      location: item.location || '',
      client: item.client || '',
      fileSizeKb: item.fileSizeKb,
      dimensions: item.dimensions
    });
    setOriginalSize(null);
    setCompressedSize(item.fileSizeKb ? Math.round(item.fileSizeKb * 1024) : null);
    setCompressionRatio(null);
    setIsModalOpen(true);
  };

  // Canvas Image Compression Utility
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('video/')) {
      setFormData(prev => ({ ...prev, type: 'video' }));
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData(prev => ({
            ...prev,
            url: event.target?.result as string,
            fileSizeKb: Math.round(file.size / 1024)
          }));
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image or video file.');
      return;
    }

    setIsCompressing(true);
    setOriginalSize(file.size);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate scaling maintaining aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', imageQuality);
          
          // Estimate byte size of base64 data URL
          const head = 'data:image/jpeg;base64,';
          const sizeInBytes = Math.round((dataUrl.length - head.length) * 3 / 4);
          const sizeInKb = Math.round(sizeInBytes / 1024);

          const savedPercent = Math.round(((file.size - sizeInBytes) / file.size) * 100);

          setCompressedSize(sizeInBytes);
          setCompressionRatio(savedPercent > 0 ? savedPercent : 0);

          setFormData(prev => ({
            ...prev,
            type: 'image',
            url: dataUrl,
            fileSizeKb: sizeInKb,
            dimensions: `${width}x${height}px`
          }));
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        setIsCompressing(false);
        alert('Failed to process selected image.');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) {
      alert('Please upload an image file or provide a media URL.');
      return;
    }

    const tagsArray = formData.tagsInput
      ? formData.tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    if (editingItem) {
      updateGalleryItem({
        ...editingItem,
        title: formData.title,
        type: formData.type,
        category: formData.category,
        url: formData.url,
        description: formData.description,
        tags: tagsArray,
        featured: formData.featured,
        location: formData.location,
        client: formData.client,
        fileSizeKb: formData.fileSizeKb,
        dimensions: formData.dimensions
      });
    } else {
      addGalleryItem({
        title: formData.title,
        type: formData.type,
        category: formData.category,
        url: formData.url,
        description: formData.description,
        tags: tagsArray,
        featured: formData.featured,
        location: formData.location,
        client: formData.client,
        fileSizeKb: formData.fileSizeKb,
        dimensions: formData.dimensions
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteGalleryItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const toggleFeaturedStatus = (item: GalleryItem) => {
    updateGalleryItem({
      ...item,
      featured: !item.featured
    });
  };

  // Filter Logic
  const filteredGallery = gallery.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.client && item.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.tags && item.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesFeatured = !featuredOnly || item.featured;

    return matchesSearch && matchesCategory && matchesType && matchesFeatured;
  });

  // Analytics Metrics
  const totalItems = gallery.length;
  const imageCount = gallery.filter(g => g.type === 'image').length;
  const videoCount = gallery.filter(g => g.type === 'video').length;
  const featuredCount = gallery.filter(g => g.featured).length;
  const totalKb = gallery.reduce((acc, g) => acc + (g.fileSizeKb || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Firebase Storage & Firestore Sync</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Image className="w-7 h-7 text-emerald-400" />
            Media Gallery Management
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Upload, optimize, and organize photos and video walkthroughs of Kenfoss installations across Kenya. Automatically syncs with the public website in real time.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-2xl flex items-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-900/30 self-start md:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Upload & Optimize Media</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
            <Image className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{totalItems}</div>
            <div className="text-[11px] font-bold text-slate-400">Total Media Files</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Image className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{imageCount}</div>
            <div className="text-[11px] font-bold text-slate-400">Optimized Photos</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{videoCount}</div>
            <div className="text-[11px] font-bold text-slate-400">Video Walkthroughs</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">{featuredCount}</div>
            <div className="text-[11px] font-bold text-slate-400">Featured Showcase</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Pills */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by title, location, client, or tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
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

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl text-xs font-bold">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  selectedType === 'all' ? 'bg-[#0057B8] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedType('image')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedType === 'image' ? 'bg-[#0057B8] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Image className="w-3.5 h-3.5" />
                <span>Photos</span>
              </button>
              <button
                onClick={() => setSelectedType('video')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedType === 'video' ? 'bg-[#0057B8] text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Videos</span>
              </button>
            </div>

            <button
              onClick={() => setFeaturedOnly(!featuredOnly)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                featuredOnly
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${featuredOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>Featured Only</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
            }`}
          >
            All Categories ({gallery.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = gallery.filter(g => g.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Cards Grid */}
      {filteredGallery.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <Image className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Media Items Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or filter criteria, or click below to upload a new media asset.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#0057B8] hover:bg-blue-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Media</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGallery.map((item) => (
            <div 
              key={item.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-slate-700 transition-all duration-300"
            >
              {/* Media Thumbnail Container */}
              <div className="relative h-52 bg-slate-950 overflow-hidden cursor-pointer" onClick={() => setPreviewItem(item)}>
                {item.type === 'video' ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                    <video src={item.url} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute w-12 h-12 bg-emerald-600/90 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Film className="w-6 h-6 ml-0.5" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                )}

                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-950/85 text-emerald-400 border border-slate-800 backdrop-blur-md flex items-center gap-1 shadow">
                    {item.type === 'video' ? <Video className="w-3 h-3 text-purple-400" /> : <Image className="w-3 h-3 text-emerald-400" />}
                    {item.category}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFeaturedStatus(item);
                    }}
                    className={`p-1.5 rounded-lg backdrop-blur-md border transition-all pointer-events-auto cursor-pointer ${
                      item.featured
                        ? 'bg-amber-500/90 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-950/70 text-slate-400 border-slate-800 hover:text-amber-400'
                    }`}
                    title={item.featured ? 'Featured on Website' : 'Click to feature on homepage'}
                  >
                    <Star className={`w-3.5 h-3.5 ${item.featured ? 'fill-slate-950' : ''}`} />
                  </button>
                </div>

                {/* Zoom Overlay Hint */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                  <span className="px-3 py-1.5 bg-slate-900/90 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 shadow-lg">
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View HD Lightbox</span>
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </h3>
                  
                  {item.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Metadata line: Client & Location */}
                  <div className="flex flex-wrap gap-y-1 gap-x-3 text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
                    {item.client && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Building2 className="w-3 h-3 text-blue-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{item.client}</span>
                      </span>
                    )}
                    {item.location && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{item.location}</span>
                      </span>
                    )}
                  </div>

                  {/* Tags Pill Row */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {item.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-950 text-slate-400 border border-slate-800 rounded-md text-[10px] font-mono">
                          #{tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-mono self-center">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <div className="flex items-center gap-2">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.fileSizeKb && (
                      <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 text-emerald-400 rounded text-[9px] font-bold">
                        {item.fileSizeKb} KB
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer"
                      title="Delete Item"
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

      {/* Create / Edit Modal with Image Optimization Canvas Engine */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest block">
                {editingItem ? 'Edit Media Asset' : 'New Media Upload'}
              </span>
              <h3 className="text-xl font-black text-white">
                {editingItem ? 'Update Gallery Item details' : 'Upload & Optimize Portfolio Photo'}
              </h3>
            </div>

            <div className="space-y-4">
              
              {/* Media Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Media Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Bitzer Parallel Rack Overhaul - Naivasha Cold Storage"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Type & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Media Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'image' | 'video' })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="image">Photo / Image</option>
                    <option value="video">Video Walkthrough</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category Tag</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Client / Facility Name</label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="e.g. FreshHarvest Kenya Ltd"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Location / County</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Industrial Area, Nairobi"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Image Canvas Compression Box */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    <span>Image Optimization & Upload Engine</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Auto Canvas Resizer</span>
                </div>

                {/* Upload Zone */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-emerald-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/50 hover:bg-slate-900"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-white">
                    Click or Drag local photo to compress & upload
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Supports JPG, PNG, WebP & MP4 (Automatically optimizes heavy camera photos down to &lt;300KB)
                  </p>
                </div>

                {/* Image Compression Stats Badge */}
                {isCompressing && (
                  <div className="text-xs text-emerald-400 animate-pulse flex items-center justify-center gap-2 py-2">
                    <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>Optimizing and compressing image via HTML5 Canvas...</span>
                  </div>
                )}

                {originalSize && compressedSize && (
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs flex items-center justify-between text-emerald-300 font-mono">
                    <div>
                      <span>Original: {Math.round(originalSize / 1024)} KB</span>
                      <span className="mx-2">→</span>
                      <span className="font-bold">Optimized: {Math.round(compressedSize / 1024)} KB</span>
                    </div>
                    {compressionRatio !== null && (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[10px]">
                        -{compressionRatio}% saved
                      </span>
                    )}
                  </div>
                )}

                {/* Manual URL Input Fallback */}
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Or enter Image / Video Web URL:</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                {/* Live Preview Box */}
                {formData.url && (
                  <div className="relative h-32 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                    {formData.type === 'video' ? (
                      <video src={formData.url} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={formData.url} alt="Upload Preview" className="w-full h-full object-cover" />
                    )}
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-950/80 text-white text-[10px] font-mono rounded border border-slate-800">
                      {formData.dimensions || 'Image Preview'}
                    </span>
                  </div>
                )}
              </div>

              {/* Tags Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Search Tags (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.tagsInput}
                  onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                  placeholder="Cold Rooms, Bitzer, Naivasha, Flower Export"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Engineering Walkthrough / Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe technical specs, equipment models installed, or commissioning details..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {/* Featured Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-950 border-slate-800"
                />
                <span className="text-xs font-bold text-slate-200">
                  Feature this media asset on the Homepage Engineering Gallery
                </span>
              </label>

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
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingItem ? 'Save Updates' : 'Publish to Gallery'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Media Item?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently remove "<span className="text-white font-semibold">{itemToDelete.title}</span>"? This will remove it from Firestore and the public website.
              </p>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Fullscreen Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 z-20 p-2.5 text-white bg-slate-950/80 hover:bg-slate-950 rounded-full border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Stage area */}
            <div className="relative bg-slate-950 flex items-center justify-center min-h-[300px] sm:min-h-[420px] max-h-[60vh] overflow-hidden">
              {previewItem.type === 'video' ? (
                <video src={previewItem.url} controls autoPlay className="max-w-full max-h-[60vh] object-contain" />
              ) : (
                <img src={previewItem.url} alt={previewItem.title} className="max-w-full max-h-[60vh] object-contain" />
              )}
            </div>

            {/* Info details */}
            <div className="p-6 space-y-3 bg-slate-900 border-t border-slate-800 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {previewItem.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Uploaded: {new Date(previewItem.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white">{previewItem.title}</h2>

              {previewItem.description && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {previewItem.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
                {previewItem.client && (
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    <span>Client: <strong className="text-white">{previewItem.client}</strong></span>
                  </div>
                )}
                {previewItem.location && (
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>Location: <strong className="text-white">{previewItem.location}</strong></span>
                  </div>
                )}
              </div>

              {previewItem.tags && previewItem.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {previewItem.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-950 text-slate-400 border border-slate-800 rounded-lg text-xs font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
