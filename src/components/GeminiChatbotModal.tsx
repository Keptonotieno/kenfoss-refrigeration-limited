import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Zap, 
  Brain, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Wrench, 
  RefreshCw,
  PhoneCall,
  User,
  ShieldCheck,
  ChevronRight,
  Archive,
  History,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Download
} from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
  sources?: { title: string; uri: string }[];
}

export interface ArchivedChatSession {
  id: string;
  title: string;
  archivedAt: string;
  messageCount: number;
  messages: ChatMessage[];
}

type AssistantRole = 'general' | 'fast' | 'complex';

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookService?: (prefillNotes: string) => void;
}

const ACTIVE_CHAT_KEY = 'kenfoss_gemini_active_chat';
const ARCHIVED_CHATS_KEY = 'kenfoss_gemini_chat_archives';

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  role: 'model',
  content: "Hello! I am **Kenfoss Gemini AI Assistant**. I can help you diagnose refrigeration equipment faults, calculate cold storage capacities, lookup OEM error codes, or answer technical HVAC questions.\n\nHow can I assist you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  modelUsed: 'gemini-3.5-flash'
};

const SAMPLE_PROMPTS = [
  "My commercial display chiller is not reaching set temperature (+2°C). What should I inspect?",
  "Explain error code 22E on Samsung inverter refrigerators.",
  "How do I size a walk-in freezer for 3,000 kg of fresh poultry?",
  "What are safe R600a refrigerant operating pressures?",
  "Why is ice building up heavily on my evaporator coils?"
];

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  onBookService
}) => {
  const { contactInfo } = useAdmin();
  const [activeRole, setActiveRole] = useState<AssistantRole>('general');
  
  // Persistent active messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved active Gemini chat:', e);
    }
    return [DEFAULT_WELCOME_MESSAGE];
  });

  // Persistent archived sessions
  const [archives, setArchives] = useState<ArchivedChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(ARCHIVED_CHATS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved Gemini archives:', e);
    }
    return [];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dialog and Toast State
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showArchivesModal, setShowArchivesModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Sync active messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_CHAT_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('LocalStorage active chat error:', e);
    }
  }, [messages]);

  // Sync archives to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ARCHIVED_CHATS_KEY, JSON.stringify(archives));
    } catch (e) {
      console.warn('LocalStorage archives error:', e);
    }
  }, [archives]);

  const scrollToBottom = (smooth = true) => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'nearest' });
      } else if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        });
      }
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    scrollToBottom(true);

    const containerEl = chatContainerRef.current;
    if (!containerEl) return;

    let rafId: number | null = null;
    const handleResize = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        scrollToBottom(true);
      });
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(containerEl);
    Array.from(containerEl.children).forEach((child) => resizeObserver.observe(child));

    const images = containerEl.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', handleResize, { once: true });
      }
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      images.forEach((img) => img.removeEventListener('load', handleResize));
    };
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let requestedModel = 'gemini-3.5-flash';
      if (activeRole === 'fast') requestedModel = 'gemini-3.1-flash-lite';
      if (activeRole === 'complex') requestedModel = 'gemini-3.1-pro-preview';

      const historyForApi = messages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForApi,
          message: query,
          role: activeRole,
          requestedModel
        })
      });

      const data = await response.json();

      if (data.success) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: 'model',
          content: data.reply || 'No response generated.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: data.modelUsed || requestedModel,
          sources: data.sources
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `err-${Date.now()}`,
          role: 'model',
          content: `⚠️ System Note: ${data.error || 'Failed to connect to AI server. Please check your network or try again.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'system'
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      const networkErrMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: '⚠️ Service temporary unavailable. Please call our engineering desk directly at +254 745 411 923.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'system'
      };
      setMessages((prev) => [...prev, networkErrMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Archive & Clear Handler
  const handleArchiveAndClear = () => {
    if (messages.length === 0) return;

    // Derive session title from first user query
    const firstUserMsg = messages.find(m => m.role === 'user');
    let title = firstUserMsg 
      ? firstUserMsg.content.slice(0, 50).replace(/\n/g, ' ')
      : `Diagnostic Session (${new Date().toLocaleDateString()})`;
    if (firstUserMsg && firstUserMsg.content.length > 50) {
      title += '...';
    }

    const archiveItem: ArchivedChatSession = {
      id: `archive-${Date.now()}`,
      title,
      archivedAt: `${new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      messageCount: messages.length,
      messages: [...messages]
    };

    setArchives(prev => [archiveItem, ...prev]);

    // Reset active chat
    const resetMsg: ChatMessage = {
      id: `welcome-reset-${Date.now()}`,
      role: 'model',
      content: 'Chat history cleared and archived to local storage. How else can I assist with your Kenfoss refrigeration systems today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash'
    };
    setMessages([resetMsg]);

    setShowClearConfirmModal(false);
    showToast('Chat history archived to local storage and active session cleared!');
  };

  // Permanent Delete Without Archive Handler
  const handleClearWithoutArchive = () => {
    const resetMsg: ChatMessage = {
      id: `welcome-reset-${Date.now()}`,
      role: 'model',
      content: 'Chat history cleared. How else can I assist with your Kenfoss refrigeration systems today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash'
    };
    setMessages([resetMsg]);

    setShowClearConfirmModal(false);
    showToast('Chat conversation cleared permanently.');
  };

  // Restore Archived Conversation Handler
  const handleRestoreArchive = (session: ArchivedChatSession) => {
    setMessages(session.messages);
    setShowArchivesModal(false);
    showToast(`Restored conversation: "${session.title}"`);
  };

  // Delete Single Archived Session
  const handleDeleteArchive = (id: string) => {
    setArchives(prev => prev.filter(a => a.id !== id));
    showToast('Archived conversation deleted.');
  };

  // Clear All Archives
  const handleClearAllArchives = () => {
    if (archives.length === 0) return;
    setArchives([]);
    showToast('All archived conversations cleared from local storage.');
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-3xl h-[92vh] sm:h-[85vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Feedback Banner */}
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[130] bg-slate-900 text-white border border-blue-500/40 px-4 py-2 rounded-xl shadow-2xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0057B8] to-[#00AEEF] flex items-center justify-center text-white shadow-md shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Kenfoss Gemini AI Assistant</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/80 text-[#0057B8] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  <Sparkles className="w-3 h-3 text-[#FF7A00]" /> Multi-Turn Chat
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI Refrigeration, Cold Room, & HVAC Diagnostic Advisor
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* View Archives Button */}
            <button
              onClick={() => setShowArchivesModal(true)}
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-[#0057B8] dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="View & Restore Archived Conversations"
            >
              <History className="w-4 h-4 text-[#0057B8]" />
              <span className="hidden sm:inline">Archives</span>
              {archives.length > 0 && (
                <span className="ml-0.5 bg-[#0057B8] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {archives.length}
                </span>
              )}
            </button>

            {/* Clear Chat Button */}
            <button
              onClick={() => setShowClearConfirmModal(true)}
              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title="Clear or Archive Chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Assistant Role / Model Mode Selector Bar */}
        <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0 mr-1">AI Mode:</span>
          
          <button
            type="button"
            onClick={() => setActiveRole('general')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-xs ${
              activeRole === 'general'
                ? 'bg-[#0057B8] text-white shadow-xs font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>General HVAC (<code className="text-[10px] opacity-90">gemini-3.5-flash</code>)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('fast')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-xs ${
              activeRole === 'fast'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Fast Lookup (<code className="text-[10px] opacity-90">gemini-3.1-flash-lite</code>)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveRole('complex')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-xs ${
              activeRole === 'complex'
                ? 'bg-purple-700 text-white shadow-xs font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-300" />
            <span>Complex Thermodynamics (<code className="text-[10px] opacity-90">gemini-3.1-pro-preview</code>)</span>
          </button>
        </div>

        {/* Scrollable Conversation Thread */}
        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[92%] sm:max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-xs ${
                    isUser
                      ? 'bg-slate-700 dark:bg-slate-600'
                      : 'bg-gradient-to-tr from-[#0057B8] to-[#00AEEF]'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble Container */}
                <div className="flex flex-col space-y-1">
                  <div className={`flex items-center gap-2 text-[10px] text-slate-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="font-medium text-slate-600 dark:text-slate-300">{isUser ? 'You' : 'Kenfoss AI'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && (
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.2 rounded font-mono text-[9px]">
                        {msg.modelUsed}
                      </span>
                    )}
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                      isUser
                        ? 'bg-[#0057B8] text-white rounded-tr-xs font-normal'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200/80 dark:border-slate-700/80'
                    }`}
                  >
                    {/* Message Body formatting */}
                    <div className="whitespace-pre-wrap font-sans space-y-2">
                      {msg.content}
                    </div>

                    {/* Grounded Search Sources if present */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700/80 text-[10px]">
                        <span className="font-bold text-slate-500 dark:text-slate-400 block mb-1">
                          Verified Technical Sources:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.sources.map((src, i) => (
                            <a
                              key={i}
                              href={src.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-300 hover:underline"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              <span className="max-w-[150px] truncate">{src.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assistant Card Footer Buttons */}
                    {!isUser && (
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[10px]">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="flex items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 font-semibold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Response</span>
                            </>
                          )}
                        </button>

                        {onBookService && (
                          <button
                            onClick={() => onBookService(`AI Diagnostic Query: ${msg.content.slice(0, 120)}...`)}
                            className="flex items-center gap-1 bg-[#FF7A00]/10 hover:bg-[#FF7A00]/20 text-[#FF7A00] font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Book Technician</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center text-xs text-slate-500 dark:text-slate-400">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0057B8] to-[#00AEEF] flex items-center justify-center text-white animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0057B8]" />
                <span>Kenfoss AI is processing your request...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Suggestions Bar (if message history is short) */}
        {messages.length <= 3 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Suggested Questions:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_PROMPTS.map((promptText, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(promptText)}
                  disabled={isLoading}
                  className="text-left text-[11px] bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <ChevronRight className="w-3 h-3 text-[#0057B8] shrink-0" />
                  <span className="truncate max-w-[280px]">{promptText}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your refrigeration issue, error code, or HVAC question..."
              disabled={isLoading}
              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0057B8]"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-[#0057B8] hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
            <span>Powered by Gemini • Kenfoss EPRA Certified HVAC Engineering</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" /> Safe Diagnostic Advice
            </span>
          </div>
        </div>

        {/* MODAL 1: CLEAR CHAT CONFIRMATION DIALOG */}
        {showClearConfirmModal && (
          <div className="absolute inset-0 z-[120] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">Clear Conversation History?</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    You are about to clear your current active chat containing <strong className="text-slate-900 dark:text-slate-200">{messages.length} message(s)</strong>.
                  </p>
                </div>
              </div>

              {/* Session Preview Box */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Session Summary:</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                  {messages.find(m => m.role === 'user')?.content || 'General diagnostic conversation'}
                </p>
                <div className="text-[10px] text-slate-400 flex items-center gap-2 pt-1">
                  <span>Messages: {messages.length}</span>
                  <span>•</span>
                  <span>Started: {messages[0]?.timestamp || 'Now'}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Choose <strong className="text-[#0057B8] dark:text-blue-400">"Archive & Clear"</strong> to save a full backup copy to your browser's local storage so you can restore or reference it anytime later.
              </p>

              {/* Dialog Actions */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleArchiveAndClear}
                  className="w-full py-2.5 px-4 bg-[#0057B8] hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive & Clear Chat (Recommended)</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearWithoutArchive}
                  className="w-full py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Permanently Without Archiving</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowClearConfirmModal(false)}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer mt-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: ARCHIVED CONVERSATIONS DRAWER / MANAGER */}
        {showArchivesModal && (
          <div className="absolute inset-0 z-[120] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
            <div 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Archives Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#0057B8] dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Archived Conversations</span>
                      <span className="bg-blue-100 dark:bg-blue-950 text-[#0057B8] dark:text-blue-300 text-xs px-2 py-0.5 rounded-full font-mono">
                        {archives.length}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Saved locally in your browser storage. Restore anytime.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowArchivesModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Archives Content List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {archives.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <Archive className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Archived Conversations</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Whenever you clear an active AI chat, select <strong className="text-slate-600 dark:text-slate-200">"Archive & Clear"</strong> to preserve a backup copy here.
                      </p>
                    </div>
                  </div>
                ) : (
                  archives.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h5>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span>{item.archivedAt}</span>
                            <span>•</span>
                            <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded">
                              {item.messageCount} messages
                            </span>
                          </div>
                        </div>

                        {/* Card Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleRestoreArchive(item)}
                            className="px-3 py-1.5 bg-[#0057B8] hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            title="Restore this conversation into active chat"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteArchive(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                            title="Delete this archive"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Snippet Preview */}
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                        "{item.messages.find(m => m.role === 'user')?.content || item.messages[0]?.content}"
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Archives Footer */}
              {archives.length > 0 && (
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Total stored archives: {archives.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearAllArchives}
                    className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All Archives</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

