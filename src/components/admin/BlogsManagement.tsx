import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BlogPost } from '../../types';
import { FileText, Plus, Search, Edit, Trash2, X, Tag, Eye } from 'lucide-react';

export const BlogsManagement: React.FC = () => {
  const { blogs, addBlogPost, updateBlogPost, deleteBlogPost, currentUser } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);

  const [formData, setFormData] = useState<Omit<BlogPost, 'id' | 'slug'>>({
    title: '',
    category: 'Refrigeration',
    excerpt: '',
    content: '',
    author: {
      name: currentUser?.name || 'Eng. Ken Munene',
      role: 'Lead Refrigeration Engineer',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
    },
    date: new Date().toISOString().slice(0, 10),
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
    tags: ['Refrigeration', 'Maintenance', 'Kenya']
  });

  const [tagsText, setTagsText] = useState('Refrigeration, Maintenance, Kenya');

  const filteredBlogs = blogs.filter(b => {
    return b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           b.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      category: 'Refrigeration',
      excerpt: '',
      content: '',
      author: {
        name: currentUser?.name || 'Eng. Ken Munene',
        role: 'Lead Refrigeration Engineer',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
      },
      date: new Date().toISOString().slice(0, 10),
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
      tags: ['Refrigeration', 'Maintenance', 'Kenya']
    });
    setTagsText('Refrigeration, Maintenance, Kenya');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BlogPost) => {
    setEditingBlog(b);
    setFormData({
      title: b.title,
      category: b.category,
      excerpt: b.excerpt,
      content: b.content,
      author: b.author,
      date: b.date,
      readTime: b.readTime,
      image: b.image,
      tags: b.tags
    });
    setTagsText(b.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTags = tagsText.split(',').map(t => t.trim()).filter(Boolean);
    const blogPayload = { ...formData, tags: parsedTags };

    if (editingBlog) {
      updateBlogPost({ ...editingBlog, ...blogPayload });
    } else {
      addBlogPost(blogPayload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Delete article "${title}"?`)) {
      deleteBlogPost(id);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            Blog & Knowledge Hub Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish technical guides, maintenance best practices, and HVAC insights.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Article</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBlogs.map((b) => (
          <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group">
            <div className="relative h-44 bg-slate-950 overflow-hidden">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-black uppercase bg-slate-950/80 text-blue-400 border border-slate-800">
                {b.category}
              </span>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-bold text-white text-base leading-snug">{b.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{b.excerpt}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">{b.date} • {b.readTime}</span>

                <div className="flex items-center space-x-1">
                  <button onClick={() => handleOpenEdit(b)} className="p-2 bg-slate-800 text-slate-200 rounded-xl">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(b.id, b.title)} className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
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
              {editingBlog ? 'Edit Blog Article' : 'Write New Blog Article'}
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Article Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Maintenance">Maintenance</option>
                    <option value="Refrigeration">Refrigeration</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Cold Rooms">Cold Rooms</option>
                    <option value="Energy Saving">Energy Saving</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Image URL</label>
                  <input
                    type="url"
                    required
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Article Excerpt</label>
                <input
                  type="text"
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Full Content</label>
                <textarea
                  rows={5}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">SEO Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
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
                Publish Article
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
