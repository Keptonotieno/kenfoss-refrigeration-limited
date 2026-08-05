import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { BlogPost } from '../types';
import { ImageWithFallback } from './common/ImageWithFallback';
import { SEO } from './SEO';
import { BookOpen, Clock, Tag, X, User, ArrowRight } from 'lucide-react';

export const BlogSection: React.FC = () => {
  const { blogs } = useAdmin();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  const publishedBlogs = (blogs || []).filter(b => b.status === 'Published');

  const categories = Array.from(new Set(['all', ...publishedBlogs.map(b => b.category).filter(Boolean)]));

  const filteredPosts = publishedBlogs.filter((post) => {
    if (selectedCategory === 'all') return true;
    return post.category === selectedCategory;
  });

  return (
    <section id="blog" className="py-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 scroll-mt-[76px] md:scroll-mt-[112px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/80 text-[#0057B8] dark:text-[#00AEEF] px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest border border-blue-200 dark:border-blue-800">
            <BookOpen className="w-4 h-4" />
            <span>Kenfoss Knowledge Hub</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#1E293B] dark:text-slate-100 tracking-tight">
            Engineering Insights & Maintenance Guides
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Expert articles written by our EPRA-certified engineers on cold room efficiency, refrigerant phase-outs, and appliance care in Kenya.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0057B8] text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'All Articles' : cat}
            </button>
          ))}
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="relative h-48 bg-slate-900 overflow-hidden">
                <ImageWithFallback
                  src={post.image}
                  alt={post.title}
                  category={post.category}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  containerClassName="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                <span className="absolute top-3 left-3 bg-[#0057B8] text-white text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                  {post.category}
                </span>

                <span className="absolute bottom-3 right-3 text-white text-[10px] bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#FF7A00]" />
                  <span>{post.readTime}</span>
                </span>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#1E293B] dark:text-slate-100 group-hover:text-[#0057B8] dark:group-hover:text-[#00AEEF] transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-2 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center space-x-2">
                      <ImageWithFallback
                        src={post.author.avatar}
                        alt={post.author.name}
                        category="avatar"
                        className="w-6 h-6 rounded-full"
                        containerClassName="w-6 h-6 shrink-0"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{post.author.name}</span>
                    </div>
                    <span>{post.date}</span>
                  </div>

                  <button
                    onClick={() => setActiveArticle(post)}
                    className="w-full py-2 px-3 bg-white dark:bg-slate-900 hover:bg-[#0057B8] text-[#0057B8] dark:text-[#00AEEF] hover:text-white border border-blue-200 dark:border-blue-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Read Full Guide</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <SEO
            title={`${activeArticle.title} | Kenfoss Engineering Guide`}
            description={activeArticle.excerpt}
            keywords={[activeArticle.category, ...activeArticle.tags]}
            canonicalUrl={`https://kenfoss.co.ke/#blog-${activeArticle.id}`}
            ogImage={activeArticle.image}
            ogType="article"
            schemaData={{
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "headline": activeArticle.title,
              "image": activeArticle.image,
              "author": {
                "@type": "Person",
                "name": activeArticle.author.name
              },
              "publisher": {
                "@type": "Organization",
                "name": "Kenfoss Refrigeration Limited"
              },
              "datePublished": activeArticle.date,
              "description": activeArticle.excerpt
            }}
          />
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              <span className="text-xs font-bold text-[#0057B8] dark:text-[#00AEEF] uppercase tracking-wider">
                {activeArticle.category} • Kenfoss Engineering Guide
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#1E293B] dark:text-slate-100 mt-1">
                {activeArticle.title}
              </h3>
              <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">{activeArticle.author.name} ({activeArticle.author.role})</span>
                <span>•</span>
                <span>{activeArticle.date}</span>
                <span>•</span>
                <span>{activeArticle.readTime}</span>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden h-64 bg-slate-900">
              <ImageWithFallback
                src={activeArticle.image}
                alt={activeArticle.title}
                category={activeArticle.category}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
              />
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-3 font-normal">
              {activeArticle.content.split('\n\n').map((paragraph, pIdx) => {
                if (paragraph.startsWith('## ')) {
                  return <h3 key={pIdx} className="text-lg font-black text-slate-900 dark:text-white pt-2 border-b border-slate-100 dark:border-slate-800 pb-1">{paragraph.replace('## ', '')}</h3>;
                }
                if (paragraph.startsWith('### ')) {
                  return <h4 key={pIdx} className="text-base font-bold text-slate-800 dark:text-slate-100 pt-1">{paragraph.replace('### ', '')}</h4>;
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote key={pIdx} className="p-3 bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-[#0057B8] rounded-r-xl text-slate-700 dark:text-blue-200 text-xs italic font-medium">
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }
                if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                  const items = paragraph.split('\n').map(item => item.replace(/^[-*]\s+/, ''));
                  return (
                    <ul key={pIdx} className="list-disc list-inside space-y-1 pl-2 text-slate-700 dark:text-slate-300">
                      {items.map((it, i) => <li key={i}>{it}</li>)}
                    </ul>
                  );
                }
                if (paragraph.startsWith('```')) {
                  return (
                    <pre key={pIdx} className="p-3 bg-slate-950 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto border border-slate-800">
                      {paragraph.replace(/```[a-z]*/g, '').trim()}
                    </pre>
                  );
                }
                return (
                  <p key={pIdx} className="whitespace-pre-line leading-relaxed">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex flex-wrap gap-1">
                {activeArticle.tags.map((tag, idx) => (
                  <span key={idx} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded font-medium">
                    #{tag}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
