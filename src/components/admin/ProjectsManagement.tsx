import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ProjectItem } from '../../types';
import { FolderGit2, Plus, Search, Edit, Trash2, X, MapPin, Calendar, Building2 } from 'lucide-react';

export const ProjectsManagement: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProj, setEditingProj] = useState<ProjectItem | null>(null);

  const [formData, setFormData] = useState<Omit<ProjectItem, 'id'>>({
    title: '',
    client: '',
    category: 'Cold Room',
    location: '',
    completedDate: '2026-06',
    imageAfter: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    summary: '',
    specs: [{ label: 'Capacity', value: '25MT' }, { label: 'Temp Range', value: '-18°C to -22°C' }],
    challenge: '',
    solution: ''
  });

  const filteredProjects = projects.filter(p => {
    return p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.location.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenAdd = () => {
    setEditingProj(null);
    setFormData({
      title: '',
      client: '',
      category: 'Cold Room',
      location: 'Nairobi, Kenya',
      completedDate: new Date().toISOString().slice(0, 7),
      imageAfter: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
      summary: '',
      specs: [{ label: 'Capacity', value: '25MT' }, { label: 'Temp Range', value: '-18°C to -22°C' }],
      challenge: '',
      solution: ''
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
      imageAfter: p.imageAfter,
      summary: p.summary,
      specs: p.specs,
      challenge: p.challenge,
      solution: p.solution
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProj) {
      updateProject({ ...editingProj, ...formData });
    } else {
      addProject(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete project showcase "${title}"?`)) {
      deleteProject(id);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-[#00AEEF]" />
            Completed Projects Showcase
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage engineering case studies, client testimonials, and technical specifications for portfolio display.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Completed Project</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects by title, client, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((p) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group hover:border-blue-500/50 transition-all">
            <div className="relative h-48 overflow-hidden bg-slate-950">
              <img
                src={p.imageAfter}
                alt={p.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-950/80 text-cyan-400 border border-slate-800">
                {p.category}
              </span>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-extrabold text-white text-base leading-snug">{p.title}</h3>
                <div className="flex items-center space-x-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-500" /> {p.client}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-500" /> {p.location}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{p.summary}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {p.completedDate}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
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
              {editingProj ? 'Edit Project Details' : 'Add Project Showcase'}
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Project Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 50MT Horticultural Modular Cold Room"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Client Name</label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="FreshHarvest Ltd"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Cold Room">Cold Room</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Supermarket">Supermarket</option>
                    <option value="Appliance Repair">Appliance Repair</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Naivasha, Kenya"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Completion Month/Year</label>
                  <input
                    type="text"
                    required
                    value={formData.completedDate}
                    onChange={(e) => setFormData({ ...formData, completedDate: e.target.value })}
                    placeholder="2026-05"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Project Image URL</label>
                <input
                  type="url"
                  required
                  value={formData.imageAfter}
                  onChange={(e) => setFormData({ ...formData, imageAfter: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Summary</label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Engineering overview..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
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
                {editingProj ? 'Save Project' : 'Publish Project'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
