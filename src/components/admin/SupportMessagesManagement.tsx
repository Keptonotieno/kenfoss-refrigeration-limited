import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ContactMessageRecord, MessageSentiment } from '../../types';
import { 
  MessageSquare, 
  AlertTriangle, 
  Frown, 
  HelpCircle, 
  Info, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Trash2, 
  ExternalLink,
  Clock,
  Send,
  MessageCircle
} from 'lucide-react';

export const SupportMessagesManagement: React.FC = () => {
  const { contactMessages, markMessageRead, deleteContactMessage } = useAdmin();

  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMessage, setActiveMessage] = useState<ContactMessageRecord | null>(null);

  // Sentiment Counts
  const totalCount = contactMessages.length;
  const urgentCount = contactMessages.filter(m => m.sentiment === 'urgent').length;
  const frustratedCount = contactMessages.filter(m => m.sentiment === 'frustrated').length;
  const inquiringCount = contactMessages.filter(m => m.sentiment === 'inquiring').length;
  const unreadCount = contactMessages.filter(m => m.status === 'Unread').length;

  // Filtered Messages
  const filteredMessages = contactMessages.filter(m => {
    const matchesSentiment = selectedSentiment === 'all' || (m.sentiment || 'general') === selectedSentiment;
    const matchesStatus = selectedStatus === 'all' || m.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || 
      m.name.toLowerCase().includes(q) || 
      m.email.toLowerCase().includes(q) || 
      m.phone.toLowerCase().includes(q) || 
      m.subject.toLowerCase().includes(q) || 
      m.message.toLowerCase().includes(q);

    return matchesSentiment && matchesStatus && matchesSearch;
  });

  const getSentimentBadge = (sentiment?: MessageSentiment) => {
    switch (sentiment) {
      case 'urgent':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <AlertTriangle className="w-3 h-3 mr-0.5 text-rose-400" />
            <span>Urgent</span>
          </span>
        );
      case 'frustrated':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Frown className="w-3 h-3 mr-0.5 text-amber-400" />
            <span>Frustrated</span>
          </span>
        );
      case 'inquiring':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-blue-500/20 text-blue-400 border border-blue-500/40">
            <HelpCircle className="w-3 h-3 mr-0.5 text-blue-400" />
            <span>Inquiring</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-300 border border-slate-700">
            <Info className="w-3 h-3 mr-0.5 text-slate-400" />
            <span>General</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/30">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support Desk Sentiment Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Customer Messages & Chat Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Automated AI sentiment classification prioritizes high-impact messages from website forms and AI chatbot sessions for immediate customer service response.
          </p>
        </div>

        {/* Quick Stats Pill Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto shrink-0">
          <div className="p-3 bg-slate-950/80 border border-rose-500/30 rounded-2xl text-center">
            <span className="text-xs font-extrabold text-rose-400 uppercase block">Urgent</span>
            <span className="text-xl font-black text-rose-300">{urgentCount}</span>
          </div>
          <div className="p-3 bg-slate-950/80 border border-amber-500/30 rounded-2xl text-center">
            <span className="text-xs font-extrabold text-amber-400 uppercase block">Frustrated</span>
            <span className="text-xl font-black text-amber-300">{frustratedCount}</span>
          </div>
          <div className="p-3 bg-slate-950/80 border border-blue-500/30 rounded-2xl text-center">
            <span className="text-xs font-extrabold text-blue-400 uppercase block">Inquiring</span>
            <span className="text-xl font-black text-blue-300">{inquiringCount}</span>
          </div>
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-center">
            <span className="text-xs font-extrabold text-slate-400 uppercase block">Unread</span>
            <span className="text-xl font-black text-white">{unreadCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Sentiment Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedSentiment('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              selectedSentiment === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Messages ({totalCount})
          </button>

          <button
            onClick={() => setSelectedSentiment('urgent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1 ${
              selectedSentiment === 'urgent'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-950 text-rose-400 hover:bg-rose-500/10 border border-rose-500/30'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Urgent ({urgentCount})</span>
          </button>

          <button
            onClick={() => setSelectedSentiment('frustrated')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1 ${
              selectedSentiment === 'frustrated'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-950 text-amber-400 hover:bg-amber-500/10 border border-amber-500/30'
            }`}
          >
            <Frown className="w-3.5 h-3.5" />
            <span>Frustrated ({frustratedCount})</span>
          </button>

          <button
            onClick={() => setSelectedSentiment('inquiring')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center space-x-1 ${
              selectedSentiment === 'inquiring'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-950 text-blue-400 hover:bg-blue-500/10 border border-blue-500/30'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Inquiring ({inquiringCount})</span>
          </button>
        </div>

        {/* Right Controls: Search and Status Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, phone, text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Unread">Unread</option>
            <option value="Read">Read</option>
            <option value="Replied">Replied</option>
          </select>
        </div>

      </div>

      {/* Messages List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Showing {filteredMessages.length} of {contactMessages.length} records</span>
          {selectedSentiment !== 'all' && (
            <span className="text-amber-400 font-bold">Filtered by: {selectedSentiment.toUpperCase()}</span>
          )}
        </div>

        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 font-semibold text-xs">No customer support messages found matching your criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredMessages.map((m) => (
              <div 
                key={m.id}
                onClick={() => {
                  setActiveMessage(m);
                  if (m.status === 'Unread') markMessageRead(m.id);
                }}
                className={`p-5 transition-colors cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  m.status === 'Unread' 
                    ? 'bg-slate-950/90 hover:bg-slate-800/60 border-l-4 border-l-blue-500' 
                    : 'hover:bg-slate-800/30'
                }`}
              >
                {/* Left Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getSentimentBadge(m.sentiment)}
                    <h3 className="text-sm font-bold text-white">{m.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">({m.phone})</span>
                    <span className="text-[10px] text-slate-500 ml-auto md:ml-2">
                      {new Date(m.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 line-clamp-1">
                    <span className="text-slate-400">Subject: </span>{m.subject}
                  </p>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans">
                    {m.message}
                  </p>
                </div>

                {/* Right Actions */}
                <div className="flex items-center space-x-2 shrink-0 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 w-full md:w-auto justify-end">
                  
                  {/* WhatsApp Direct Action */}
                  <a
                    href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${m.name}, regarding your Kenfoss inquiry: "${m.subject}"`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer flex items-center space-x-1"
                    title="Reply via WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="hidden sm:inline font-bold text-[11px]">WhatsApp</span>
                  </a>

                  {/* Phone Call Action */}
                  <a
                    href={`tel:${m.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer flex items-center space-x-1"
                    title="Call Customer"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="hidden sm:inline font-bold text-[11px]">Call</span>
                  </a>

                  {/* Email Action */}
                  <a
                    href={`mailto:${m.email}?subject=RE: ${encodeURIComponent(m.subject)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer flex items-center space-x-1"
                    title="Email Customer"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline font-bold text-[11px]">Email</span>
                  </a>

                  {/* Delete Action */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete message from ${m.name}?`)) {
                        deleteContactMessage(m.id);
                      }
                    }}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl text-xs transition-colors cursor-pointer"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                {getSentimentBadge(activeMessage.sentiment)}
                <h3 className="font-extrabold text-white text-base">Customer Support Detail</h3>
              </div>
              <button
                onClick={() => setActiveMessage(null)}
                className="text-slate-400 hover:text-white font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-black">Customer Info</span>
                <p className="font-bold text-white text-sm">{activeMessage.name}</p>
                <div className="flex flex-wrap items-center gap-3 text-slate-300 pt-1">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-blue-400" />{activeMessage.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-cyan-400" />{activeMessage.email}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-black">Subject</span>
                <p className="font-bold text-white">{activeMessage.subject}</p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-black">Message Content</span>
                <p className="text-slate-200 leading-relaxed font-sans text-xs whitespace-pre-wrap">
                  {activeMessage.message}
                </p>
              </div>

              <div className="text-[10px] text-slate-500 flex justify-between pt-1">
                <span>Received: {new Date(activeMessage.createdAt).toLocaleString()}</span>
                <span>ID: {activeMessage.id}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <a
                href={`tel:${activeMessage.phone}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Phone</span>
              </a>

              <a
                href={`https://wa.me/${activeMessage.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${activeMessage.name}, Kenfoss support responding to your message: "${activeMessage.subject}"`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>

              <button
                onClick={() => setActiveMessage(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
