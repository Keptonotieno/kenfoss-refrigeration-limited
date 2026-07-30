import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ProjectItem, GalleryItem } from '../types';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Info, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  ArrowRight,
  Image as ImageIcon,
  Video,
  Film,
  Search,
  Maximize2,
  Sparkles,
  Star,
  Eye,
  Filter
} from 'lucide-react';

interface ProjectsGalleryProps {
  onOpenBooking: (type?: string, prefillDetails?: string) => void;
}

export const ProjectsGallery: React.FC<ProjectsGalleryProps> = ({ onOpenBooking }) => {
  const { projects, gallery } = useAdmin();

  // Navigation View Toggle State: 'gallery' or 'cases'
  const [activeTab, setActiveTab] = useState<'gallery' | 'cases'>('gallery');

  // Case Studies Filters
  const [activeCaseCategory, setActiveCaseCategory] = useState<string>('all');
  const [selectedProjectModal, setSelectedProjectModal] = useState<ProjectItem | null>(null);
  
  // Interactive Before & After Slider State
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeSliderProject, setActiveSliderProject] = useState<ProjectItem | null>(null);

  // Live Firebase Gallery Filters
  const [gallerySearch, setGallerySearch] = useState('');
  const [galleryCategory, setGalleryCategory] = useState('all');
  const [galleryType, setGalleryType] = useState<'all' | 'image' | 'video'>('all');
  const [selectedGalleryLightbox, setSelectedGalleryLightbox] = useState<GalleryItem | null>(null);

  const activeProject = activeSliderProject || (projects && projects.length > 0 ? projects[0] : null);

  const caseCategories = ['all', 'Cold Room', 'Supermarket', 'Industrial'];

  const filteredProjects = (projects || []).filter((p) => {
    if (activeCaseCategory === 'all') return true;
    return p.category === activeCaseCategory;
  });

  // Unique gallery categories derived dynamically from live Firestore gallery items
  const galleryCategories = Array.from(
    new Set((gallery || []).map((g) => g.category))
  ).filter(Boolean);

  const filteredGallery = (gallery || []).filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(gallerySearch.toLowerCase()) ||
      item.category.toLowerCase().includes(gallerySearch.toLowerCase()) ||
      (item.client && item.client.toLowerCase().includes(gallerySearch.toLowerCase())) ||
      (item.location && item.location.toLowerCase().includes(gallerySearch.toLowerCase())) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(gallerySearch.toLowerCase())));

    const matchesCategory = galleryCategory === 'all' || item.category === galleryCategory;
    const matchesType = galleryType === 'all' || item.type === galleryType;

    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <section id="projects" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 scroll-mt-[76px] md:scroll-mt-[112px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/80 text-[#0057B8] dark:text-[#00AEEF] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-[#00AEEF]" />
            <span>Real-Time Engineering Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
            Media Gallery & Completed Projects Track Record
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Explore live photo portfolios, site installation walkthroughs, and before-and-after engineering transformations across Kenya.
          </p>

          {/* Module View Mode Switcher */}
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 mt-4 shadow-sm">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'gallery'
                  ? 'bg-[#0057B8] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#0057B8] dark:hover:text-white'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Live Media Gallery ({gallery.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('cases')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'cases'
                  ? 'bg-[#0057B8] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#0057B8] dark:hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Before & After Case Studies</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LIVE FIREBASE MEDIA GALLERY */}
        {activeTab === 'gallery' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            
            {/* Gallery Control Bar */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search Box */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search photos, equipment tags, location, or client..."
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0057B8]"
                  />
                  {gallerySearch && (
                    <button 
                      onClick={() => setGallerySearch('')} 
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Type Pills */}
                <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold self-start md:self-auto">
                  <button
                    onClick={() => setGalleryType('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      galleryType === 'all'
                        ? 'bg-[#0057B8] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All Media
                  </button>
                  <button
                    onClick={() => setGalleryType('image')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      galleryType === 'image'
                        ? 'bg-[#0057B8] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Photos</span>
                  </button>
                  <button
                    onClick={() => setGalleryType('video')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                      galleryType === 'video'
                        ? 'bg-[#0057B8] text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Film className="w-3 h-3" />
                    <span>Videos</span>
                  </button>
                </div>

              </div>

              {/* Dynamic Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                <button
                  onClick={() => setGalleryCategory('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    galleryCategory === 'all'
                      ? 'bg-[#FF7A00] text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  All Categories ({gallery.length})
                </button>
                {galleryCategories.map((cat) => {
                  const count = gallery.filter((g) => g.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setGalleryCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        galleryCategory === cat
                          ? 'bg-[#FF7A00] text-white shadow-md'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gallery Grid */}
            {filteredGallery.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 rounded-full flex items-center justify-center mx-auto text-[#0057B8] dark:text-[#00AEEF]">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Gallery Media Found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try clearing your search filters to browse photos and videos of our installations.
                </p>
                <button
                  onClick={() => {
                    setGallerySearch('');
                    setGalleryCategory('all');
                    setGalleryType('all');
                  }}
                  className="px-4 py-2 bg-[#0057B8] hover:bg-blue-600 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Reset Gallery Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGallery.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedGalleryLightbox(item)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col justify-between"
                  >
                    {/* Media Image / Video Container */}
                    <div className="relative h-56 bg-slate-900 overflow-hidden">
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
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase bg-slate-900/90 text-white border border-slate-700 backdrop-blur-md flex items-center gap-1 shadow">
                          {item.type === 'video' ? <Video className="w-3 h-3 text-purple-400" /> : <ImageIcon className="w-3 h-3 text-emerald-400" />}
                          {item.category}
                        </span>

                        {item.featured && (
                          <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[10px] uppercase rounded-lg shadow flex items-center gap-1">
                            <Star className="w-3 h-3 fill-slate-950" />
                            <span>Featured</span>
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay Hint */}
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-4 py-2 bg-slate-900/90 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-slate-700 shadow-xl">
                          <Maximize2 className="w-4 h-4 text-[#00AEEF]" />
                          <span>View Lightbox HD</span>
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-[#0057B8] dark:group-hover:text-[#00AEEF] transition-colors line-clamp-1">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-y-1 gap-x-3 text-[11px] text-slate-500 dark:text-slate-400 mt-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                          {item.client && (
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                              <Building2 className="w-3 h-3 text-[#0057B8] dark:text-[#00AEEF]" />
                              <span className="truncate max-w-[140px]">{item.client}</span>
                            </span>
                          )}
                          {item.location && (
                            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                              <MapPin className="w-3 h-3 text-[#FF7A00]" />
                              <span className="truncate max-w-[140px]">{item.location}</span>
                            </span>
                          )}
                        </div>

                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {item.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded text-[10px] font-mono">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                        <span className="text-[#0057B8] dark:text-[#00AEEF] font-bold flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: BEFORE & AFTER CASE STUDIES */}
        {activeTab === 'cases' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* Interactive Before & After Showcase */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-[#00AEEF] uppercase tracking-wider block">
                    INTERACTIVE COMPARISON SLIDER
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Before & After Engineering Transformation
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(projects || []).map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setActiveSliderProject(proj);
                        setSliderPosition(50);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeProject?.id === proj.id
                          ? 'bg-[#FF7A00] text-white shadow'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {proj.client}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Container */}
              {activeProject && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Visual Comparison Stage */}
                  <div className="lg:col-span-7">
                    <div className="relative h-80 sm:h-[400px] rounded-2xl overflow-hidden select-none border border-slate-700 shadow-2xl">
                      
                      {/* AFTER Image (Full background) */}
                      <img
                        src={activeProject.imageAfter}
                        alt="Engineered Result"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-emerald-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow border border-emerald-400 uppercase tracking-wider z-10">
                        AFTER: KENFOSS ENGINEERED
                      </div>

                      {/* BEFORE Image (Clipped overlay) */}
                      <div
                        className="absolute inset-0 overflow-hidden"
                        style={{ width: `${sliderPosition}%` }}
                      >
                        <img
                          src={activeProject.imageBefore || activeProject.imageAfter}
                          alt="Legacy System Before Repair"
                          className="absolute inset-0 w-full h-full object-cover max-w-none"
                          style={{ width: '100%', height: '100%' }}
                        />
                        <div className="absolute top-4 left-4 bg-slate-900/90 text-amber-400 text-[11px] font-black px-3 py-1 rounded-full shadow border border-slate-700 uppercase tracking-wider z-10">
                          BEFORE: LEGACY / FAULTY
                        </div>
                      </div>

                      {/* Drag Handle Divider Line */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize z-20"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#FF7A00] text-white flex items-center justify-center shadow-lg border-2 border-white">
                          <SlidersHorizontal className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Range Slider Overlay Control */}
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPosition}
                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                      />

                    </div>
                    <p className="text-[11px] text-slate-400 text-center mt-2">
                      Drag the center handle left or right to inspect the engineering upgrade
                    </p>
                  </div>

                  {/* Case details for active slider */}
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <span className="text-xs font-bold text-[#00AEEF] uppercase">{activeProject.category} Case Study</span>
                      <h4 className="text-2xl font-black text-white">{activeProject.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">Client: {activeProject.client} • Location: {activeProject.location}</p>
                    </div>

                    <div className="space-y-3 text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                      <div>
                        <strong className="text-amber-400 block mb-0.5">Initial Problem:</strong>
                        <p className="leading-relaxed">{activeProject.challenge}</p>
                      </div>
                      <div className="pt-2 border-t border-slate-800">
                        <strong className="text-emerald-400 block mb-0.5">Kenfoss Solution:</strong>
                        <p className="leading-relaxed">{activeProject.solution}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenBooking('quote', `Inquiry for project similar to: ${activeProject.title}`)}
                      className="w-full py-3 bg-[#FF7A00] hover:bg-[#e06c00] text-white font-bold text-xs rounded-xl shadow transition-colors cursor-pointer"
                    >
                      Request Similar Commercial Installation Quote
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Case Category Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {caseCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCaseCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCaseCategory === cat
                      ? 'bg-[#0057B8] text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'all' ? 'All Completed Projects' : cat}
                </button>
              ))}
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div className="relative h-64 bg-slate-900 overflow-hidden">
                    <img
                      src={p.imageAfter}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 bg-[#0057B8] text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                      {p.category}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[11px] font-bold text-[#00AEEF] block">{p.client}</span>
                      <h3 className="text-lg font-bold drop-shadow">{p.title}</h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                        {p.summary}
                      </p>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                        {p.specs.slice(0, 2).map((s, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                            <span className="text-slate-400 text-[10px] block font-semibold">{s.label}</span>
                            <span className="font-bold text-[#1E293B] dark:text-slate-100">{s.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedProjectModal(p)}
                      className="w-full py-2.5 bg-white dark:bg-slate-900 hover:bg-[#0057B8] text-[#0057B8] dark:text-[#00AEEF] hover:text-white border border-blue-200 dark:border-blue-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
                    >
                      <Info className="w-4 h-4" />
                      <span>Inspect Project Specifications</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* Case Study Modal */}
      {selectedProjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedProjectModal(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              <span className="text-xs font-bold text-[#0057B8] dark:text-[#00AEEF] uppercase tracking-wider">
                {selectedProjectModal.category} Project Case Study
              </span>
              <h3 className="text-2xl font-black text-[#1E293B] dark:text-slate-100">
                {selectedProjectModal.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Client: {selectedProjectModal.client} • Location: {selectedProjectModal.location} • Completed: {selectedProjectModal.completedDate}
              </p>
            </div>

            <div className="rounded-xl overflow-hidden h-64 bg-slate-900">
              <img
                src={selectedProjectModal.imageAfter}
                alt={selectedProjectModal.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Technical Specifications Table */}
            <div>
              <h4 className="text-xs font-bold text-[#1E293B] dark:text-slate-100 uppercase tracking-wider mb-2">Technical Specifications & Hardware Installed</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {selectedProjectModal.specs.map((spec, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">{spec.label}:</span>
                    <span className="font-bold text-[#1E293B] dark:text-slate-100">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <h5 className="font-bold text-[#1E293B] dark:text-slate-100">Challenge:</h5>
                <p>{selectedProjectModal.challenge}</p>
              </div>
              <div>
                <h5 className="font-bold text-[#0057B8] dark:text-[#00AEEF]">Kenfoss Engineering Solution:</h5>
                <p>{selectedProjectModal.solution}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  const details = `Quotation for similar project: ${selectedProjectModal.title}`;
                  setSelectedProjectModal(null);
                  onOpenBooking('quote', details);
                }}
                className="w-full py-3 bg-[#FF7A00] hover:bg-[#e06c00] text-white font-bold text-xs rounded-xl shadow cursor-pointer"
              >
                Request Similar System Quotation
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Public Gallery Lightbox Modal */}
      {selectedGalleryLightbox && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 sm:p-6">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <button
              onClick={() => setSelectedGalleryLightbox(null)}
              className="absolute top-4 right-4 z-20 p-2.5 text-white bg-slate-950/80 hover:bg-slate-950 rounded-full border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Media Stage */}
            <div className="relative bg-slate-950 flex items-center justify-center min-h-[300px] sm:min-h-[420px] max-h-[60vh] overflow-hidden">
              {selectedGalleryLightbox.type === 'video' ? (
                <video src={selectedGalleryLightbox.url} controls autoPlay className="max-w-full max-h-[60vh] object-contain" />
              ) : (
                <img src={selectedGalleryLightbox.url} alt={selectedGalleryLightbox.title} className="max-w-full max-h-[60vh] object-contain" />
              )}
            </div>

            {/* Details */}
            <div className="p-6 space-y-4 bg-slate-900 border-t border-slate-800 overflow-y-auto">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-lg text-xs font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {selectedGalleryLightbox.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Uploaded: {new Date(selectedGalleryLightbox.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white">{selectedGalleryLightbox.title}</h2>

              {selectedGalleryLightbox.description && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedGalleryLightbox.description}
                </p>
              )}

              <div className="flex flex-wrap gap-5 pt-2 text-xs text-slate-300 border-t border-slate-800">
                {selectedGalleryLightbox.client && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#00AEEF]" />
                    <span>Client: <strong className="text-white">{selectedGalleryLightbox.client}</strong></span>
                  </div>
                )}
                {selectedGalleryLightbox.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#FF7A00]" />
                    <span>Location: <strong className="text-white">{selectedGalleryLightbox.location}</strong></span>
                  </div>
                )}
              </div>

              {selectedGalleryLightbox.tags && selectedGalleryLightbox.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedGalleryLightbox.tags.map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-950 text-slate-400 border border-slate-800 rounded-lg text-xs font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    const details = `Inquiry regarding gallery item: ${selectedGalleryLightbox.title}`;
                    setSelectedGalleryLightbox(null);
                    onOpenBooking('quote', details);
                  }}
                  className="px-5 py-2.5 bg-[#FF7A00] hover:bg-[#e06c00] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Book Installation Similar to This
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </section>
  );
};
