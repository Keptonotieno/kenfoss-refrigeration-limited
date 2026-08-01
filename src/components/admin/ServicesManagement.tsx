import React, { useState, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ServiceItem, ServiceCategory } from '../../types';
import { Briefcase, Plus, Search, Edit, Trash2, X, Check, Upload } from 'lucide-react';

export const ServicesManagement: React.FC = () => {
  const { services, addService, updateService, deleteService } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Omit<ServiceItem, 'id'>>({
    title: '',
    category: 'commercial',
    shortDesc: '',
    fullDesc: '',
    iconName: 'Wrench',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    startingPrice: 'KSh 15,000',
    pricingNote: 'Inclusive of diagnostic & labor',
    estimatedTime: '2 - 4 Hours',
    features: ['24/7 Rapid Response', 'EPRA Certified Engineers', 'Genuine OEM Spare Parts']
  });

  const [featuresText, setFeaturesText] = useState('24/7 Rapid Response\nEPRA Certified Engineers\nGenuine OEM Spare Parts');

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new window.Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
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
            setFormData(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.85) }));
          } else {
            setFormData(prev => ({ ...prev, image: evt.target?.result as string }));
          }
        };
        img.onerror = () => {
          setFormData(prev => ({ ...prev, image: evt.target?.result as string }));
        };
        img.src = evt.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const filteredServices = services.filter(s => {
    return s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           s.shortDesc.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      title: '',
      category: 'commercial',
      shortDesc: '',
      fullDesc: '',
      iconName: 'Wrench',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
      startingPrice: 'KSh 15,000',
      pricingNote: 'Inclusive of diagnostic & labor',
      estimatedTime: '2 - 4 Hours',
      features: ['24/7 Rapid Response', 'EPRA Certified Engineers', 'Genuine OEM Spare Parts']
    });
    setFeaturesText('24/7 Rapid Response\nEPRA Certified Engineers\nGenuine OEM Spare Parts');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: ServiceItem) => {
    setEditingService(s);
    setFormData({
      title: s.title,
      category: s.category,
      shortDesc: s.shortDesc,
      fullDesc: s.fullDesc,
      iconName: s.iconName,
      image: s.image,
      startingPrice: s.startingPrice,
      pricingNote: s.pricingNote || '',
      estimatedTime: s.estimatedTime,
      features: s.features
    });
    setFeaturesText(s.features.join('\n'));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedFeatures = featuresText.split('\n').filter(f => f.trim() !== '');
    const servicePayload = { ...formData, features: parsedFeatures };

    if (editingService) {
      updateService({ ...editingService, ...servicePayload });
    } else {
      addService(servicePayload);
    }
    setIsModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deletingService) {
      deleteService(deletingService.id);
      setDeletingService(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-400" />
            Service Portfolio & Offerings Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add, update, or modify refrigeration and HVAC services offered across Kenya.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search services by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* SERVICES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((s) => (
          <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-blue-500/50 transition-all">
            <div className="relative h-40 overflow-hidden bg-slate-950">
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-950/80 text-blue-400 backdrop-blur-md border border-slate-800">
                {s.category}
              </span>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-extrabold text-white text-base leading-snug">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{s.shortDesc}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Starting From</span>
                  <span className="font-bold text-emerald-400 text-sm">{s.startingPrice}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(s)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingService(s)}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">
              {editingService ? 'Edit Service Details' : 'Add New Service Listing'}
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Service Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Commercial Cold Room Overhaul"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ServiceCategory })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Starting Price</label>
                  <input
                    type="text"
                    required
                    value={formData.startingPrice}
                    onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                    placeholder="e.g. KSh 12,500"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Service Image (URL or Local Disk File)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://... or upload image"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Browse...</span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                {formData.image && (
                  <div className="mt-2 h-20 w-32 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 relative">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Short Summary Description</label>
                <input
                  type="text"
                  required
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  placeholder="Brief 1-sentence teaser"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Detailed Full Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.fullDesc}
                  onChange={(e) => setFormData({ ...formData, fullDesc: e.target.value })}
                  placeholder="Full scope of engineering service..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Key Features (One per line)</label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="24/7 Rapid Response&#10;EPRA Certified&#10;1-Year Warranty"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                {editingService ? 'Save Service' : 'Create Service'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Service Offering</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to delete <span className="text-white font-semibold">"{deletingService.title}"</span>? This will remove it from the website services section.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingService(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Delete Service
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
