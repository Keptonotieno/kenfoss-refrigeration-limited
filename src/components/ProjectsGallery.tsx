import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { ProjectItem } from '../types';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Info, 
  X, 
  SlidersHorizontal,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

interface ProjectsGalleryProps {
  onOpenBooking: (type?: string, prefillDetails?: string) => void;
}

export const ProjectsGallery: React.FC<ProjectsGalleryProps> = ({ onOpenBooking }) => {
  const { projects } = useAdmin();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProjectModal, setSelectedProjectModal] = useState<ProjectItem | null>(null);
  
  // Interactive Before & After Slider State
  const [sliderPosition, setSliderPosition] = useState(50);
  const [activeSliderProject, setActiveSliderProject] = useState<ProjectItem | null>(null);

  const activeProject = activeSliderProject || (projects && projects.length > 0 ? projects[0] : null);

  const categories = ['all', 'Cold Room', 'Supermarket', 'Industrial'];

  const filteredProjects = (projects || []).filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  return (
    <section id="projects" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 scroll-mt-[76px] md:scroll-mt-[112px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/80 text-[#0057B8] dark:text-[#00AEEF] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-blue-200 dark:border-blue-800">
            <span>Engineering Track Record</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
            Featured Commercial & Industrial Projects
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Explore how Kenfoss engineers transformed energy efficiency, cold chain security, and cooling performance for Kenya's leading corporations.
          </p>
        </div>

        {/* Interactive Before & After Showcase */}
        <div className="mb-16 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
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
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#FF7A00]" />
                  <span>{activeProject.location} • {activeProject.completedDate}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-800/90 rounded-xl border border-slate-700 space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block">The Engineering Challenge:</span>
                  <p className="text-slate-300 mt-0.5">{activeProject.challenge}</p>
                </div>
                <div className="pt-2 border-t border-slate-700">
                  <span className="text-[#00AEEF] font-bold block">Kenfoss Solution Delivered:</span>
                  <p className="text-white mt-0.5">{activeProject.solution}</p>
                </div>
              </div>

              {activeProject.testimonial && (
                <div className="p-3 bg-blue-950/60 border border-blue-900 rounded-xl text-xs italic text-blue-200">
                  "{activeProject.testimonial.quote}"
                  <span className="block font-bold not-italic text-white mt-1 text-[11px]">
                    — {activeProject.testimonial.author}, {activeProject.testimonial.title}
                  </span>
                </div>
              )}

              <button
                onClick={() => setSelectedProjectModal(activeProject)}
                className="w-full py-3 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>View Full Technical Case Study</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}
      </div>

        {/* Project Category Filter Buttons */}
        <div className="flex justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeCategory === cat
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

    </section>
  );
};
