import React, { useState, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BlogPost } from '../../types';
import { 
  FileText, Plus, Search, Edit, Trash2, X, Tag, Eye, Filter, 
  CheckCircle2, Clock, Globe, Sparkles, LayoutGrid, List, Copy, 
  Star, Image as ImageIcon, Upload, ArrowUpRight, Share2, AlertTriangle,
  Type, Bold, Italic, Heading1, Heading2, ListOrdered, Quote, Code,
  HelpCircle, ExternalLink, RefreshCw, BarChart2, ShieldCheck, UserCheck
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Refrigeration',
  'Cold Rooms',
  'HVAC',
  'Maintenance',
  'Energy Saving',
  'Industry News',
  'Case Studies'
];

const UNSPLASH_IMAGE_PRESETS = [
  { label: 'Cold Room Facility', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800' },
  { label: 'Bitzer Compressor Rack', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800' },
  { label: 'HVAC Ducting & Chiller', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800' },
  { label: 'Technician Inspection', url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&q=80&w=800' },
  { label: 'Solar Powered Cooling', url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&q=80&w=800' }
];

const QUICK_TEMPLATES = [
  {
    title: 'Cold Room Maintenance Checklist Template',
    category: 'Cold Rooms',
    content: `## Executive Overview\nRegular preventative maintenance for commercial cold rooms prevents costly product spoilage, lowers monthly energy consumption by up to 25%, and extends compressor service lifespan.\n\n> ⚠️ Engineering Tip: Ensure door gaskets are inspected weekly. A 1mm gasket gap can increase compressor runtime by 15%.\n\n### Essential Maintenance Protocol:\n- Check evaporator coil icing and defrost drain heater lines.\n- Inspect condenser fins for dust accumulation and wash with coil cleaner.\n- Monitor suction pressure and discharge pressure gauges.\n- Test door heater wires and safety release escape plunger inside room.\n\n\`\`\`\nRecommended Storage Temp:\n- Fresh Meat: -2°C to 0°C\n- Dairy & Milk: 2°C to 4°C\n- Frozen Fish: -20°C to -22°C\n\`\`\``
  },
  {
    title: 'R22 Refrigerant Phase-Out Guide for Kenya',
    category: 'Refrigeration',
    content: `## Introduction to Montreal Protocol Compliance in Kenya\nIn line with NEMA and EPRA environmental guidelines, R22 HCFC refrigerant gas is being phased out in favor of eco-friendly HFC/HFO blends like R404A, R134a, and R448A.\n\n### Key Retrofit Considerations:\n- Polyolester (POE) oil replacement for mineral oil compatibility.\n- Expansion valve sizing for different gas mass-flow rates.\n- Pressure testing with dry nitrogen up to 25 bar before charging.\n\n> Quote: "Retrofitting old refrigeration plants safely reduces carbon emissions while protecting equipment investments."`
  }
];

export const BlogsManagement: React.FC = () => {
  const { blogs, addBlogPost, updateBlogPost, deleteBlogPost, currentUser } = useAdmin();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [previewBlog, setPreviewBlog] = useState<BlogPost | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<{ id: string; title: string } | null>(null);

  const [editorTab, setEditorTab] = useState<'content' | 'media' | 'seo' | 'author' | 'preview'>('content');

  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Refrigeration',
    excerpt: '',
    content: '',
    authorName: '',
    authorRole: '',
    authorAvatar: '',
    authorEmail: '',
    date: new Date().toISOString().slice(0, 10),
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    tagsText: 'Refrigeration, Maintenance, Kenya',
    status: 'Published' as 'Published' | 'Draft' | 'Archived',
    featured: false,
    seoTitle: '',
    seoDescription: '',
    seoKeywordsText: ''
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const totalArticles = blogs.length;
  const publishedCount = blogs.filter(b => b.status === 'Published').length;
  const draftCount = blogs.filter(b => b.status === 'Draft').length;
  const totalViews = blogs.reduce((acc, b) => acc + (b.viewsCount || 0), 0);

  // Filtered List
  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Open Editor for Add New
  const handleOpenAdd = () => {
    setEditingBlog(null);
    setEditorTab('content');
    setFormData({
      title: '',
      slug: '',
      category: 'Refrigeration',
      excerpt: '',
      content: '',
      authorName: currentUser?.name || 'Eng. Ken Munene',
      authorRole: currentUser?.role || 'Lead Refrigeration Engineer',
      authorAvatar: currentUser?.avatar || '',
      authorEmail: currentUser?.email || 'info@kenfoss.co.ke',
      date: new Date().toISOString().slice(0, 10),
      readTime: '5 min read',
      image: UNSPLASH_IMAGE_PRESETS[0].url,
      tagsText: 'Refrigeration, Maintenance, Kenya',
      status: 'Published',
      featured: false,
      seoTitle: '',
      seoDescription: '',
      seoKeywordsText: 'Cold Rooms Kenya, Refrigeration Maintenance, HVAC Engineer'
    });
    setIsEditorModalOpen(true);
  };

  // Open Editor for Editing
  const handleOpenEdit = (b: BlogPost) => {
    setEditingBlog(b);
    setEditorTab('content');
    setFormData({
      title: b.title,
      slug: b.slug,
      category: b.category,
      excerpt: b.excerpt,
      content: b.content,
      authorName: b.author.name,
      authorRole: b.author.role,
      authorAvatar: b.author.avatar,
      authorEmail: b.author.email || '',
      date: b.date,
      readTime: b.readTime,
      image: b.image,
      tagsText: b.tags.join(', '),
      status: b.status || 'Published',
      featured: !!b.featured,
      seoTitle: b.seoTitle || b.title,
      seoDescription: b.seoDescription || b.excerpt,
      seoKeywordsText: (b.seoKeywords || b.tags).join(', ')
    });
    setIsEditorModalOpen(true);
  };

  // Duplicate Blog Post
  const handleDuplicate = (b: BlogPost) => {
    const duplicatedTitle = `${b.title} (Copy)`;
    const newSlug = `${b.slug}-copy-${Date.now().toString().slice(-4)}`;
    
    addBlogPost({
      title: duplicatedTitle,
      slug: newSlug,
      category: b.category,
      excerpt: b.excerpt,
      content: b.content,
      author: b.author,
      date: new Date().toISOString().slice(0, 10),
      readTime: b.readTime,
      image: b.image,
      tags: [...b.tags],
      status: 'Draft',
      featured: false,
      seoTitle: b.seoTitle,
      seoDescription: b.seoDescription,
      seoKeywords: b.seoKeywords
    });
  };

  // Toggle Featured Status
  const handleToggleFeatured = (b: BlogPost) => {
    updateBlogPost({
      ...b,
      featured: !b.featured
    });
  };

  // Quick Status Toggle
  const handleQuickStatusChange = (b: BlogPost, newStatus: 'Published' | 'Draft' | 'Archived') => {
    updateBlogPost({
      ...b,
      status: newStatus
    });
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in required fields (Title and Article Content).');
      return;
    }

    const parsedTags = formData.tagsText.split(',').map(t => t.trim()).filter(Boolean);
    const parsedSeoKeywords = formData.seoKeywordsText.split(',').map(t => t.trim()).filter(Boolean);

    // Calculate reading time automatically
    const words = formData.content.split(/\s+/).filter(Boolean).length;
    const computedReadTime = `${Math.max(1, Math.ceil(words / 200))} min read`;

    const blogPayload = {
      title: formData.title,
      slug: formData.slug,
      category: formData.category,
      excerpt: formData.excerpt,
      content: formData.content,
      author: {
        name: formData.authorName || 'Kenfoss Staff',
        role: formData.authorRole || 'Refrigeration Engineer',
        avatar: formData.authorAvatar || '',
        email: formData.authorEmail
      },
      date: formData.date,
      readTime: computedReadTime,
      image: formData.image,
      tags: parsedTags.length > 0 ? parsedTags : [formData.category, 'Kenya'],
      status: formData.status,
      featured: formData.featured,
      seoTitle: formData.seoTitle || formData.title,
      seoDescription: formData.seoDescription || formData.excerpt,
      seoKeywords: parsedSeoKeywords
    };

    if (editingBlog) {
      updateBlogPost({
        ...editingBlog,
        ...blogPayload
      });
    } else {
      addBlogPost(blogPayload);
    }

    setIsEditorModalOpen(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingBlog) {
      deleteBlogPost(deletingBlog.id);
      setDeletingBlog(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Rich Text Insertion Helper
  const insertTextAtCursor = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || 'Sample text';
    const replacement = `${before}${selectedText}${after}`;

    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 50);
  };

  // Handle Local Image Upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('File size exceeds 3MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Module Header & High Level Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-black uppercase border border-blue-500/20 mb-2">
              <Globe className="w-3.5 h-3.5" />
              <span>Kenfoss Knowledge Hub & SEO Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <FileText className="w-7 h-7 text-blue-400" />
              Blog & Engineering Articles Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Create, publish, and manage technical guides, EPRA refrigerant phase-out insights, and HVAC maintenance best practices with instant website synchronization.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-900/40 shrink-0 self-start lg:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
        </div>

        {/* Analytics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-black">Total Articles</span>
            <p className="text-lg font-black text-white">{totalArticles}</p>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase font-black flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Live Published
            </span>
            <p className="text-lg font-black text-emerald-400">{publishedCount}</p>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-amber-400 uppercase font-black flex items-center gap-1">
              <Clock className="w-3 h-3" /> Drafts
            </span>
            <p className="text-lg font-black text-amber-400">{draftCount}</p>
          </div>
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-cyan-400 uppercase font-black flex items-center gap-1">
              <BarChart2 className="w-3 h-3" /> Total Article Views
            </span>
            <p className="text-lg font-black text-cyan-400">{totalViews}</p>
          </div>
        </div>
      </div>

      {/* Search, Filters & View Toggle Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, topic, or SEO tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Archived">Archived</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-950 p-1 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Empty State */}
      {filteredBlogs.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Articles Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No engineering articles match your current search criteria or status filter.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publish First Article</span>
          </button>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && filteredBlogs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((b) => (
            <div 
              key={b.id} 
              className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-slate-700 transition-all duration-300"
            >
              <div className="relative h-48 bg-slate-950 overflow-hidden">
                <img 
                  src={b.image} 
                  alt={b.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                
                {/* Category Badge */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-950/80 text-blue-400 border border-slate-800 backdrop-blur-sm">
                  {b.category}
                </span>

                {/* Status Badge */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleFeatured(b)}
                    className={`p-1.5 rounded-lg text-xs backdrop-blur-md transition-colors cursor-pointer ${
                      b.featured ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900/80 text-slate-400 hover:text-amber-400'
                    }`}
                    title={b.featured ? 'Featured Article' : 'Mark as Featured'}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border backdrop-blur-sm ${
                    b.status === 'Published' 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : b.status === 'Draft'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {b.status || 'Published'}
                  </span>
                </div>

                {/* Read Time */}
                <span className="absolute bottom-3 right-3 text-slate-300 text-[10px] font-mono bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1 border border-slate-800">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>{b.readTime}</span>
                </span>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-bold text-white text-base leading-snug group-hover:text-blue-400 transition-colors line-clamp-2">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {b.excerpt}
                  </p>
                </div>

                {/* Author & Footer */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2">
                      <img src={b.author.avatar} alt={b.author.name} className="w-6 h-6 rounded-full bg-slate-800" />
                      <span className="font-medium text-slate-300 truncate max-w-[120px]">{b.author.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{b.date}</span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    
                    {/* Status Dropdown */}
                    <select
                      value={b.status || 'Published'}
                      onChange={(e) => handleQuickStatusChange(b, e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 text-slate-300 text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => { setPreviewBlog(b); setIsPreviewModalOpen(true); }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                        title="Preview Article"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(b)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                        title="Duplicate Post"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Edit Article"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => { setDeletingBlog({ id: b.id, title: b.title }); setIsDeleteModalOpen(true); }}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && filteredBlogs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Article</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Author</th>
                  <th className="px-4 py-3.5">Publish Date</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredBlogs.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="px-4 py-3 max-w-xs">
                      <div className="flex items-center space-x-3">
                        <img src={b.image} alt={b.title} className="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-950 border border-slate-800" />
                        <div className="truncate">
                          <p className="font-bold text-white truncate flex items-center gap-1.5">
                            {b.featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                            <span>{b.title}</span>
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono truncate">{b.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded font-semibold text-[10px]">
                        {b.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <img src={b.author.avatar} alt={b.author.name} className="w-5 h-5 rounded-full" />
                        <span className="text-slate-300 truncate">{b.author.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                      {b.date}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status || 'Published'}
                        onChange={(e) => handleQuickStatusChange(b, e.target.value as any)}
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-md border focus:outline-none bg-slate-950 ${
                          b.status === 'Published' 
                            ? 'text-emerald-400 border-emerald-500/30' 
                            : b.status === 'Draft'
                            ? 'text-amber-400 border-amber-500/30'
                            : 'text-slate-400 border-slate-700'
                        }`}
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => { setPreviewBlog(b); setIsPreviewModalOpen(true); }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(b)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                          title="Duplicate"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setDeletingBlog({ id: b.id, title: b.title }); setIsDeleteModalOpen(true); }}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL RICH ARTICLE EDITOR MODAL */}
      {isEditorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <form 
            onSubmit={handleSubmit} 
            className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative my-6 max-h-[92vh] flex flex-col justify-between overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingBlog ? 'Edit Engineering Article' : 'Write New Engineering Article'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Full publishing workflow, rich markdown formatting, image assets, and SEO indexing setup.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center space-x-1 border-b border-slate-800 shrink-0 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setEditorTab('content')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  editorTab === 'content' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>Content & Text</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('media')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  editorTab === 'media' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media & Cover Image</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('seo')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  editorTab === 'seo' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>SEO & Indexing</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('author')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  editorTab === 'author' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Author & Schedule</span>
              </button>

              <button
                type="button"
                onClick={() => setEditorTab('preview')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  editorTab === 'preview' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Live Preview</span>
              </button>
            </div>

            {/* Modal Body Scroll Area */}
            <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-4">
              
              {/* TAB 1: Content & Text */}
              {editorTab === 'content' && (
                <div className="space-y-4">
                  
                  {/* Article Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex justify-between">
                      <span>Article Title *</span>
                      <span className="text-[10px] text-slate-500 font-mono">{formData.title.length} chars</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10 Critical Cold Room Maintenance Steps for Kenyan Commercial Facilities"
                      value={formData.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        const autoSlug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                        setFormData(prev => ({ 
                          ...prev, 
                          title: newTitle,
                          slug: editingBlog ? prev.slug : autoSlug,
                          seoTitle: prev.seoTitle === prev.title ? newTitle : prev.seoTitle
                        }));
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>

                  {/* Category & Slug Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Engineering Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        {CATEGORY_OPTIONS.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">URL Slug / Permalinks</label>
                      <input
                        type="text"
                        placeholder="cold-room-maintenance-steps"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">Article Excerpt / Teaser</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="A short 2-sentence summary that appears on blog cards and search engine snippets..."
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value, seoDescription: formData.seoDescription || e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                    />
                  </div>

                  {/* Content Formatting Toolbar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-300">Article Body (Markdown & Formatted Text)</label>
                      
                      {/* Templates Quick Insert */}
                      <select
                        onChange={(e) => {
                          const tmpl = QUICK_TEMPLATES.find(t => t.title === e.target.value);
                          if (tmpl) {
                            if (confirm('Load template into article editor?')) {
                              setFormData(prev => ({
                                ...prev,
                                title: prev.title || tmpl.title,
                                category: tmpl.category,
                                content: tmpl.content
                              }));
                            }
                          }
                        }}
                        className="bg-slate-950 border border-slate-800 text-[11px] font-bold text-blue-400 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="">⚡ Quick Engineering Template...</option>
                        {QUICK_TEMPLATES.map(t => (
                          <option key={t.title} value={t.title}>{t.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
                      
                      {/* Rich Formatting Toolbar */}
                      <div className="p-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center gap-1">
                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('## ', '')}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                          title="Heading 2"
                        >
                          H2
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('### ', '')}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold cursor-pointer"
                          title="Subheading H3"
                        >
                          H3
                        </button>

                        <div className="h-4 w-px bg-slate-800 mx-1" />

                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('**', '**')}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                          title="Bold Text"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('*', '*')}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                          title="Italic Text"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>

                        <div className="h-4 w-px bg-slate-800 mx-1" />

                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('- ', '')}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                          title="Bulleted List"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('> ', '')}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                          title="Callout / Engineering Quote"
                        >
                          <Quote className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => insertTextAtCursor('```\n', '\n```')}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
                          title="Technical Specs / Code Block"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>

                        <span className="ml-auto text-[10px] text-slate-500 font-mono">
                          {formData.content.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>

                      {/* Main Textarea */}
                      <textarea
                        ref={textareaRef}
                        rows={10}
                        required
                        placeholder="Write article details here using Markdown syntax (## Headings, **bold**, - bullet points, > callouts)..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        className="w-full p-3 bg-slate-950 text-slate-100 text-xs font-mono focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: Media & Cover Image */}
              {editorTab === 'media' && (
                <div className="space-y-5">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300">Featured Cover Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        required
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-4 h-4 text-blue-400" />
                        <span>Upload File</span>
                      </button>
                      
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageFileUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  </div>

                  {/* Image Preview Box */}
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400">Cover Image Preview</span>
                    <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-52 relative group">
                      <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs text-white font-bold bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
                          Primary Cover Photo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* High Quality Presets */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Select Stock Industrial Photography Presets</span>
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {UNSPLASH_IMAGE_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: preset.url })}
                          className={`p-2 rounded-2xl border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                            formData.image === preset.url 
                              ? 'bg-blue-600/20 border-blue-500 text-white' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <img src={preset.url} alt={preset.label} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          <span className="text-[11px] font-bold leading-tight line-clamp-2">{preset.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: SEO & Indexing */}
              {editorTab === 'seo' && (
                <div className="space-y-5">
                  
                  {/* Google SERP Snippet Preview */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-black text-slate-500 flex items-center gap-1">
                      <Search className="w-3 h-3 text-blue-400" /> Google Search Engine Preview
                    </span>

                    <div className="space-y-1">
                      <div className="text-[11px] text-emerald-400 font-mono truncate">
                        https://kenfoss.co.ke › blog › {formData.slug || 'article-slug'}
                      </div>
                      <div className="text-sm font-bold text-blue-400 hover:underline cursor-pointer truncate">
                        {formData.seoTitle || formData.title || 'Article Title - Kenfoss Engineering'}
                      </div>
                      <div className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {formData.seoDescription || formData.excerpt || 'Article summary description snippet...'}
                      </div>
                    </div>
                  </div>

                  {/* Meta Title */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex justify-between">
                      <span>Meta Title (Search Engine Display)</span>
                      <span className={`text-[10px] font-mono ${(formData.seoTitle || formData.title).length > 60 ? 'text-rose-400' : 'text-slate-500'}`}>
                        {(formData.seoTitle || formData.title).length} / 60 chars
                      </span>
                    </label>
                    <input
                      type="text"
                      placeholder="Title optimized for Google search results"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Meta Description */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300 flex justify-between">
                      <span>Meta Description</span>
                      <span className={`text-[10px] font-mono ${(formData.seoDescription || formData.excerpt).length > 160 ? 'text-rose-400' : 'text-slate-500'}`}>
                        {(formData.seoDescription || formData.excerpt).length} / 160 chars
                      </span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Short description for Google search engines..."
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* SEO Tags */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-300">SEO Focus Keywords & Article Tags (Comma Separated)</label>
                    <input
                      type="text"
                      value={formData.tagsText}
                      onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex flex-wrap gap-1 pt-1">
                      {formData.tagsText.split(',').map(t => t.trim()).filter(Boolean).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: Author & Schedule */}
              {editorTab === 'author' && (
                <div className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Author Name</label>
                      <input
                        type="text"
                        required
                        value={formData.authorName}
                        onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Author Designation / Role</label>
                      <input
                        type="text"
                        required
                        value={formData.authorRole}
                        onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Publish Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Published">Published (Live on Website)</option>
                        <option value="Draft">Draft (Saved in Portal)</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-300">Publish Date</label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Featured Checkbox */}
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-amber-400" /> Feature on Website Hero
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Highlights this article with a special badge in the website Knowledge Hub.
                      </p>
                    </div>

                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </div>

                </div>
              )}

              {/* TAB 5: Live Preview */}
              {editorTab === 'preview' && (
                <div className="p-6 bg-slate-950 border border-slate-800 rounded-3xl space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-extrabold text-blue-400 uppercase tracking-widest">
                      {formData.category} • Live Article Reader Mockup
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{formData.date} • {formData.readTime}</span>
                  </div>

                  <h1 className="text-2xl font-black text-white">{formData.title || 'Untitled Article'}</h1>
                  
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <img src={formData.authorAvatar} alt="Avatar" className="w-6 h-6 rounded-full" />
                    <span className="font-bold text-slate-200">{formData.authorName}</span>
                    <span>({formData.authorRole})</span>
                  </div>

                  <div className="rounded-2xl overflow-hidden h-52 bg-slate-900 border border-slate-800">
                    <img src={formData.image} alt="Cover" className="w-full h-full object-cover" />
                  </div>

                  <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800 pt-4">
                    {formData.content || 'Article text content preview will appear here...'}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                  formData.status === 'Published' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  Status: {formData.status}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditorModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-900/40"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingBlog ? 'Save Article Changes' : 'Publish Article Now'}</span>
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* PUBLIC PREVIEW MODAL */}
      {isPreviewModalOpen && previewBlog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full p-6 space-y-5 relative shadow-2xl my-8">
            <button
              onClick={() => setIsPreviewModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                {previewBlog.category} • Article Preview
              </span>
              <h2 className="text-xl font-black text-white mt-1">{previewBlog.title}</h2>
              <div className="flex items-center space-x-3 text-xs text-slate-400 mt-2">
                <span className="font-bold text-slate-200">{previewBlog.author.name}</span>
                <span>•</span>
                <span>{previewBlog.date}</span>
                <span>•</span>
                <span>{previewBlog.readTime}</span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden h-56 bg-slate-950">
              <img src={previewBlog.image} alt={previewBlog.title} className="w-full h-full object-cover" />
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 italic">
              "{previewBlog.excerpt}"
            </div>

            <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line max-h-60 overflow-y-auto pr-2">
              {previewBlog.content}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
              <div className="flex flex-wrap gap-1">
                {previewBlog.tags.map((tag, idx) => (
                  <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && deletingBlog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Delete Article?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to delete <span className="text-white font-bold">"{deletingBlog.title}"</span>? This will permanently remove it from the website and portal.
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-rose-900/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
