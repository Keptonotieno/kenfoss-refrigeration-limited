import React, { useState, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { TestimonialItem } from '../../types';
import { 
  Star, CheckCircle2, XCircle, Trash2, Plus, Search, Edit3, X, 
  Quote, ShieldCheck, Filter, Upload, Sparkles, Building2, User, 
  MapPin, Clock, LayoutGrid, List, Check, ThumbsUp, AlertTriangle, Eye
} from 'lucide-react';

const SERVICE_OPTIONS = [
  'Commercial Cold Room Repair',
  'Cold Room Installation & Build',
  'VRF HVAC System Maintenance',
  'Supermarket Chiller Overhaul',
  'Milk Cooling Plant Servicing',
  'Pharmaceutical Cold Chain Storage',
  'Industrial Refrigeration Diagnostic',
  'Preventative Maintenance Contract'
];

const AVATAR_PRESETS = [
  { label: 'Executive Male 1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { label: 'Corporate Female 1', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
  { label: 'Operations Director', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
  { label: 'Engineering Manager', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200' },
  { label: 'Facility Manager', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' }
];

export const TestimonialsManagement: React.FC = () => {
  const { 
    testimonials, 
    addTestimonial, 
    updateTestimonial, 
    approveTestimonial, 
    rejectTestimonial, 
    toggleFeaturedTestimonial, 
    deleteTestimonial 
  } = useAdmin();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Approved' | 'Pending' | 'Rejected'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [deletingId, setDeletingId] = useState<{ id: string; name: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    location: 'Nairobi',
    rating: 5,
    comment: '',
    avatar: AVATAR_PRESETS[0].url,
    verifiedService: SERVICE_OPTIONS[0],
    date: new Date().toISOString().slice(0, 10),
    status: 'Approved' as 'Approved' | 'Pending' | 'Rejected',
    featured: false,
    email: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const totalCount = testimonials.length;
  const approvedCount = testimonials.filter(t => t.status === 'Approved').length;
  const pendingCount = testimonials.filter(t => t.status === 'Pending').length;
  const featuredCount = testimonials.filter(t => t.featured).length;
  
  const avgRating = totalCount > 0 
    ? (testimonials.reduce((acc, t) => acc + (t.rating || 5), 0) / totalCount).toFixed(1)
    : '5.0';

  // Filtered List
  const filtered = testimonials.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || (t.status || 'Approved') === statusFilter;
    const matchesFeatured = featuredFilter === 'all' || (featuredFilter === 'featured' && t.featured);
    const matchesService = serviceFilter === 'all' || t.verifiedService === serviceFilter;

    return matchesSearch && matchesStatus && matchesFeatured && matchesService;
  });

  // Handle Add Open
  const handleOpenAdd = () => {
    setEditingTestimonial(null);
    setFormData({
      name: '',
      role: 'Operations Manager',
      company: '',
      location: 'Nairobi',
      rating: 5,
      comment: '',
      avatar: AVATAR_PRESETS[0].url,
      verifiedService: SERVICE_OPTIONS[0],
      date: new Date().toISOString().slice(0, 10),
      status: 'Approved',
      featured: false,
      email: ''
    });
    setIsEditorModalOpen(true);
  };

  // Handle Edit Open
  const handleOpenEdit = (t: TestimonialItem) => {
    setEditingTestimonial(t);
    setFormData({
      name: t.name,
      role: t.role,
      company: t.company,
      location: t.location || 'Nairobi',
      rating: t.rating || 5,
      comment: t.comment,
      avatar: t.avatar || AVATAR_PRESETS[0].url,
      verifiedService: t.verifiedService || SERVICE_OPTIONS[0],
      date: t.date || new Date().toISOString().slice(0, 10),
      status: t.status || 'Approved',
      featured: !!t.featured,
      email: t.email || ''
    });
    setIsEditorModalOpen(true);
  };

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) {
      alert('Customer name and feedback message are required.');
      return;
    }

    if (editingTestimonial) {
      updateTestimonial({
        ...editingTestimonial,
        ...formData
      });
    } else {
      addTestimonial(formData);
    }

    setIsEditorModalOpen(false);
  };

  // Handle Image File Upload
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size exceeds 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (deletingId) {
      deleteTestimonial(deletingId.id);
      setDeletingId(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-black uppercase border border-amber-500/20 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Social Proof & Review Moderation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
              Customer Testimonials & Reviews
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Moderate incoming customer reviews, edit testimonials, feature high-impact feedback, and approve website displays in real-time.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-5 py-3 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-blue-900/40 shrink-0 self-start lg:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Manual Testimonial</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-black">Total Reviews</span>
            <p className="text-lg font-black text-white">{totalCount}</p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-amber-400 uppercase font-black flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pending Review
            </span>
            <p className="text-lg font-black text-amber-400">{pendingCount}</p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-emerald-400 uppercase font-black flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Approved Live
            </span>
            <p className="text-lg font-black text-emerald-400">{approvedCount}</p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-yellow-400 uppercase font-black flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Featured
            </span>
            <p className="text-lg font-black text-yellow-400">{featuredCount}</p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-cyan-400 uppercase font-black">Avg Rating</span>
            <p className="text-lg font-black text-cyan-400 flex items-center gap-1">
              {avgRating} <span className="text-xs text-slate-500">/ 5.0</span>
            </p>
          </div>
        </div>

      </div>

      {/* Filter & View Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by customer name, company, or feedback text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending Review</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={featuredFilter}
            onChange={(e) => setFeaturedFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Reviews</option>
            <option value="featured">Featured Only</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Services</option>
            {SERVICE_OPTIONS.map(srv => (
              <option key={srv} value={srv}>{srv}</option>
            ))}
          </select>

          {/* Toggle View */}
          <div className="flex items-center bg-slate-950 p-1 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${viewMode === 'table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 flex items-center justify-center mx-auto">
            <Star className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Testimonials Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No customer feedback matches your search keyword or selected filter parameters.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Testimonial</span>
          </button>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((t) => (
            <div 
              key={t.id} 
              className={`bg-slate-900 border rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition-all relative overflow-hidden group ${
                t.featured ? 'border-amber-500/60 ring-1 ring-amber-500/30' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <Quote className="absolute top-4 right-4 w-12 h-12 text-slate-800/40 pointer-events-none group-hover:text-amber-500/10 transition-colors" />

              <div className="space-y-4 relative z-10">
                
                {/* User Info & Rating */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={t.avatar} 
                      alt={t.name} 
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-700 shrink-0 bg-slate-950" 
                    />
                    <div>
                      <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>{t.name}</span>
                        {t.featured && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-[9px] font-black uppercase">
                            Featured
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400">{t.role}, <span className="text-slate-300 font-medium">{t.company}</span></p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{t.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center space-x-1 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < (t.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                      />
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                  "{t.comment}"
                </p>

                {/* Service Badge & Date */}
                <div className="flex items-center justify-between text-[11px]">
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg font-bold">
                    {t.verifiedService}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">{t.date}</span>
                </div>

              </div>

              {/* Action Bar Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between relative z-10">
                
                {/* Status Indicator */}
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${
                    t.status === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : t.status === 'Pending'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }`}>
                    {t.status || 'Approved'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1.5">
                  
                  {/* Toggle Featured Button */}
                  <button
                    onClick={() => toggleFeaturedTestimonial(t.id)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      t.featured 
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                        : 'bg-slate-800 text-slate-400 hover:text-amber-400'
                    }`}
                    title={t.featured ? 'Unmark as Featured' : 'Feature on Homepage'}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>

                  {/* Approve Action */}
                  {t.status !== 'Approved' && (
                    <button
                      onClick={() => approveTestimonial(t.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                      title="Approve for Website"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}

                  {/* Reject Action */}
                  {t.status !== 'Rejected' && t.status === 'Pending' && (
                    <button
                      onClick={() => rejectTestimonial(t.id)}
                      className="p-2 bg-slate-800 hover:bg-rose-950/80 text-rose-400 rounded-xl transition-colors cursor-pointer"
                      title="Reject Review"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                    title="Edit Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => { setDeletingId({ id: t.id, name: t.name }); setIsDeleteModalOpen(true); }}
                    className="p-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filtered.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-black border-b border-slate-800 tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Rating & Service</th>
                  <th className="px-4 py-3.5">Feedback</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-950/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-xl object-cover shrink-0 bg-slate-950 border border-slate-800" />
                        <div>
                          <p className="font-bold text-white flex items-center gap-1">
                            {t.name}
                            {t.featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                          </p>
                          <p className="text-[10px] text-slate-400">{t.role}, {t.company}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 space-y-1">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: t.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <span className="text-[10px] text-blue-400 font-semibold block">{t.verifiedService}</span>
                    </td>

                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-xs text-slate-300 italic line-clamp-2">
                        "{t.comment}"
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                        t.status === 'Approved'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : t.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}>
                        {t.status || 'Approved'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        
                        <button
                          onClick={() => toggleFeaturedTestimonial(t.id)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            t.featured ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>

                        {t.status !== 'Approved' && (
                          <button
                            onClick={() => approveTestimonial(t.id)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                            title="Approve"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(t)}
                          className="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => { setDeletingId({ id: t.id, name: t.name }); setIsDeleteModalOpen(true); }}
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

      {/* CREATE / EDIT MODAL */}
      {isEditorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleSubmit} 
            className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative my-6 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingTestimonial ? 'Edit Customer Review' : 'Add New Customer Review'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Curate client feedback for public display on the main Kenfoss website.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Inputs */}
            <div className="space-y-4">
              
              {/* Customer Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Customer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Mwangi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="dmwangi@freshharvest.co.ke"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Role & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Job Role / Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Operations Manager"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="FreshHarvest Logistics Ltd"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Location & Verified Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">City / Location</label>
                  <input
                    type="text"
                    required
                    placeholder="Nairobi, Industrial Area"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Verified Service Rendered</label>
                  <select
                    value={formData.verifiedService}
                    onChange={(e) => setFormData({ ...formData, verifiedService: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {SERVICE_OPTIONS.map(srv => (
                      <option key={srv} value={srv}>{srv}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Rating Score (1 - 5 Stars)</label>
                <div className="flex items-center space-x-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: starVal })}
                      className="p-1 transition-transform hover:scale-110 cursor-pointer"
                    >
                      <Star 
                        className={`w-6 h-6 ${starVal <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-xs font-bold text-amber-400">
                    {formData.rating}.0 / 5.0 Rating
                  </span>
                </div>
              </div>

              {/* Testimonial Comment */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Testimonial Feedback Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write customer feedback detailed quote..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>

              {/* Avatar Selection & Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Customer Photo / Avatar URL</label>
                <div className="flex items-center gap-2">
                  <img src={formData.avatar} alt="Avatar" className="w-10 h-10 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0" />
                  <input
                    type="url"
                    required
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload</span>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarFileUpload} accept="image/*" className="hidden" />
                </div>

                {/* Avatar Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: preset.url })}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                        formData.avatar === preset.url ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status, Featured & Date Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Approval Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Approved">Approved (Live)</option>
                    <option value="Pending">Pending Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Publish Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Featured Highlight</span>
                    </span>
                  </label>
                </div>
              </div>

            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditorModalOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-blue-900/40 cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingTestimonial ? 'Update Testimonial' : 'Publish Testimonial'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && deletingId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Delete Customer Review?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to permanently delete the testimonial from <strong className="text-slate-200">{deletingId.name}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg shadow-rose-900/40"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
