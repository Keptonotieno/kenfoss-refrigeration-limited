import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Clock, Moon, Smile, Globe, MapPin, ExternalLink, Navigation, Car, Copy, Check, Phone, Smartphone, Bot, Sparkles } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface FloatingWhatsAppProps {
  onOpenChatbot?: () => void;
}

interface KenyaTimeInfo {
  timeString: string;
  dayName: string;
  isBusinessHours: boolean;
  userTimeString?: string;
  userTimeZoneName?: string;
  isOutsideKenya: boolean;
}

const getKenyaTimeInfo = (): KenyaTimeInfo => {
  const now = new Date();

  // Time formatter in Kenya timezone (Africa/Nairobi)
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Nairobi',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Nairobi',
    weekday: 'short',
  });

  const hour24Formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Nairobi',
    hour: 'numeric',
    hour12: false,
  });

  const minuteFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Nairobi',
    minute: 'numeric',
  });

  const timeString = timeFormatter.format(now);
  const dayName = dayFormatter.format(now);
  const hour24 = parseInt(hour24Formatter.format(now), 10);
  const minute = parseInt(minuteFormatter.format(now), 10);

  const totalMinutes = hour24 * 60 + minute;

  // Kenya Business Hours: Monday to Saturday 7:30 AM (450 mins) to 6:00 PM (1080 mins)
  const isSunday = dayName === 'Sun';
  const isBusinessHours = !isSunday && totalMinutes >= 450 && totalMinutes < 1080;

  // Detect visitor local timezone
  let userTimeZone = '';
  try {
    userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    userTimeZone = '';
  }

  const isOutsideKenya = !!userTimeZone && userTimeZone !== 'Africa/Nairobi';

  let userTimeString = '';
  let userTimeZoneName = '';

  if (isOutsideKenya) {
    try {
      const userTimeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      userTimeString = userTimeFormatter.format(now);

      const tzParts = userTimeZone.split('/');
      const city = tzParts.length > 1 ? tzParts[tzParts.length - 1].replace(/_/g, ' ') : userTimeZone;

      const offsetFormatter = new Intl.DateTimeFormat('en-US', {
        timeZoneName: 'short',
      });
      const formattedParts = offsetFormatter.formatToParts(now);
      const tzPart = formattedParts.find((p) => p.type === 'timeZoneName');
      const tzCode = tzPart ? tzPart.value : '';

      userTimeZoneName = tzCode ? `${city} (${tzCode})` : city;
    } catch {
      userTimeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      userTimeZoneName = 'Your Local Time';
    }
  }

  return {
    timeString,
    dayName,
    isBusinessHours,
    userTimeString,
    userTimeZoneName,
    isOutsideKenya,
  };
};

const DRAFT_STORAGE_KEY = 'kenfoss_whatsapp_draft_msg';
const MAX_MSG_LENGTH = 300;
const COMMON_EMOJIS = ['👋', '❄️', '🔧', '⚡', '🧊', '🌡️', '🛠️', '🚚', '📍', '👍', '❓', '🙏', '😊', '🏢', '💬', '✨'];

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onOpenChatbot }) => {
  const { contactInfo } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const fullRuiruAddress = contactInfo
    ? `${contactInfo.address}, ${contactInfo.city}`
    : "Ivy's Park Business Park, Next to Mark Hotel, Thika Superhighway Service Lane, Ruiru, Kiambu County, Kenya";

  const displayPhone = contactInfo?.mainPhone || contactInfo?.emergencyPhone || '+254 745 411 923';
  const telNumber = `tel:${displayPhone.replace(/[^0-9+]/g, '')}`;
  const smsMessage = `Kenfoss Refrigeration Ruiru Office: ${fullRuiruAddress} | Directions: https://maps.google.com/?q=Kenfoss+Refrigeration+limited+Ruiru`;
  const smsUrl = `sms:?body=${encodeURIComponent(smsMessage)}`;

  const handleCopyAddress = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullRuiruAddress);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = fullRuiruAddress;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };
  const [msgText, setMsgText] = useState<string>(() => {
    try {
      return localStorage.getItem(DRAFT_STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [kenyaTime, setKenyaTime] = useState<KenyaTimeInfo>(getKenyaTimeInfo());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (msgText.trim()) {
        localStorage.setItem(DRAFT_STORAGE_KEY, msgText);
      } else {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [msgText]);

  useEffect(() => {
    // Update live clock every second
    const timer = setInterval(() => {
      setKenyaTime(getKenyaTimeInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close when clicking outside the chat box
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const whatsappPhone = contactInfo?.whatsappNumber || '254745411923';

  const handleInsertEmoji = (emoji: string) => {
    if (msgText.length + emoji.length <= MAX_MSG_LENGTH) {
      setMsgText((prev) => prev + emoji);
    }
  };

  const handleSend = () => {
    const text = msgText || 'Hello Kenfoss Refrigeration, I need urgent engineering service assistance.';
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`, '_blank');
    setMsgText('');
    setShowEmojiPicker(false);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }
    setIsOpen(false);
  };

  return (
    <div 
      ref={containerRef}
      className="floating-whatsapp-container fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 pointer-events-none flex flex-col items-end"
    >
      
      {/* Expanded Quick Chat Box */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-84 sm:w-90 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200 text-slate-800 dark:text-slate-100">
          
          {/* Header */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#0057B8] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                    KF
                  </div>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-slate-900 rounded-full ${
                    kenyaTime.isBusinessHours ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Kenfoss Support Team</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowLocationModal(true);
                      }}
                      title="Click to view office location map preview"
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/60 dark:hover:bg-blue-800 text-[#0057B8] dark:text-blue-300 transition-all cursor-pointer flex items-center gap-0.5 shadow-2xs hover:scale-105 active:scale-95"
                    >
                      <MapPin className="w-2.5 h-2.5 text-[#0057B8] dark:text-blue-300 shrink-0" />
                      <span>Ruiru, KE</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {kenyaTime.isBusinessHours 
                      ? 'Online • Typical response < 3 mins' 
                      : '24/7 Emergency On-Call Duty'}
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                aria-label="Close WhatsApp chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dynamic Local Kenya Time & Business Hours Status Badge */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-700/80 text-xs flex flex-col space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                  <Clock className="w-3.5 h-3.5 text-[#00AEEF] shrink-0 animate-pulse" />
                  <span>Kenya Time (EAT):</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{kenyaTime.timeString}</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">{kenyaTime.dayName}</span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                {kenyaTime.isBusinessHours ? (
                  <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>In Business Hours (7:30 AM – 6:00 PM)</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                    <Moon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Outside Business Hours</span>
                  </div>
                )}
              </div>

              {/* Visitor Local Time Badge (shown if outside Kenya) */}
              {kenyaTime.isOutsideKenya && kenyaTime.userTimeString && (
                <div className="pt-1.5 mt-0.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] bg-blue-50/80 dark:bg-blue-950/40 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center space-x-1 min-w-0 pr-1">
                    <Globe className="w-3 h-3 text-blue-500 shrink-0" />
                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate">Your Time ({kenyaTime.userTimeZoneName}):</span>
                  </div>
                  <span className="font-mono font-bold text-blue-700 dark:text-blue-300 shrink-0">{kenyaTime.userTimeString}</span>
                </div>
              )}
            </div>
          </div>

          {/* Business Hours Context Message */}
          <div className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
            kenyaTime.isBusinessHours 
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
          }`}>
            {kenyaTime.isBusinessHours ? (
              <p>👋 <strong>Jambo!</strong> Our Nairobi/Ruiru support office is currently open. Send us a message for immediate service dispatch or quotes.</p>
            ) : (
              <p>🌙 <strong>Jambo!</strong> Standard office hours are closed (Mon-Sat 7:30 AM–6:00 PM EAT), but our <strong>24/7 Emergency Technicians</strong> are on call for urgent cold room & HVAC repairs.</p>
            )}
          </div>

          {/* Ask Gemini AI Assistant Direct Trigger */}
          {onOpenChatbot && (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenChatbot();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-blue-900/90 to-blue-800 hover:from-blue-800 hover:to-blue-700 text-white text-xs font-medium shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-sky-300" />
                </div>
                <div className="text-left">
                  <span className="font-bold block text-white text-[11px] flex items-center gap-1">
                    Ask Gemini AI Assistant <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
                  </span>
                  <span className="text-[10px] text-blue-200">Instant multi-turn fault diagnostic & thermodynamics</span>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded text-white group-hover:bg-white/30 transition-colors">
                Chat AI
              </span>
            </button>
          )}

          {/* Quick Reply Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              { label: 'Cold Room Maintenance', msg: 'Hi Kenfoss, I need assistance with Cold Room Maintenance.' },
              { label: 'Emergency Repair', msg: 'Hello, I require urgent Emergency Repair service for our refrigeration system.' },
              { label: 'Request Quote', msg: 'Jambo Kenfoss! I would like to request a custom project quote.' },
              { label: 'HVAC Installation', msg: 'Hi team, I need inquiries regarding commercial HVAC installation.' },
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => setMsgText(chip.msg)}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full transition-colors cursor-pointer font-medium"
              >
                + {chip.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5 pt-1">
            {/* Quick Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className="bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-lg space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center space-x-1">
                    <Smile className="w-3 h-3 text-amber-500" />
                    <span>Quick Emojis</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-sm transition-transform active:scale-90 cursor-pointer"
                      title={`Add ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Type message (e.g. Cold room quote, Emergency repair)..."
                  value={msgText}
                  maxLength={MAX_MSG_LENGTH}
                  onChange={(e) => setMsgText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-2.5 pr-9 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0057B8]"
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className={`absolute right-2 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 p-1 rounded-full transition-colors cursor-pointer ${
                    showEmojiPicker ? 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' : ''
                  }`}
                  title="Insert Emoji"
                  aria-label="Insert Emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between px-1 text-[10px]">
                <span className="text-slate-400">Keep message clear & concise</span>
                <span className={`font-mono font-medium ${
                  msgText.length >= MAX_MSG_LENGTH
                    ? 'text-red-500 font-bold'
                    : msgText.length >= MAX_MSG_LENGTH * 0.85
                    ? 'text-amber-500 font-semibold'
                    : 'text-slate-400'
                }`}>
                  {msgText.length} / {MAX_MSG_LENGTH}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSend}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Start WhatsApp Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto relative group bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
        aria-label={isOpen ? "Close WhatsApp chat" : "Contact on WhatsApp"}
      >
        {!isOpen && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
        {isOpen ? (
          <X className="w-6 h-6 relative z-10 transition-transform duration-200 rotate-0" />
        ) : (
          <MessageSquare className="w-6 h-6 relative z-10" />
        )}
      </button>

      {/* Location Map Preview Popup Modal */}
      {showLocationModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200 pointer-events-auto overflow-y-auto"
          onClick={() => setShowLocationModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm max-h-[90vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-3.5 flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#00AEEF]/20 border border-[#00AEEF]/40 flex items-center justify-center text-[#00AEEF] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    Kenfoss Office Location
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold">HQ</span>
                  </h4>
                  <p className="text-[10px] text-slate-300">
                    Ivy's Park Business Park, Ruiru, Kiambu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close location map"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Embedded Map iframe */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-200 dark:bg-slate-800 aspect-video">
                <iframe
                  title="Kenfoss Ruiru Office Location"
                  src={contactInfo?.googleMapsEmbedUrl || "https://maps.google.com/maps?q=Kenfoss+Refrigeration+limited,+Ivy%E2%80%99s+Park+Business+Park,+Next+to+Mark+Hotel,+Thika+Superhighway+Service+Lane,+Ruiru,+Kiambu+County&t=&z=16&ie=UTF8&iwloc=B&output=embed"}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  className="w-full h-full"
                />
              </div>

              {/* Address Details & Actions */}
              <div className="mt-3 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-2 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[11px]">
                  <Navigation className="w-3.5 h-3.5 text-[#00AEEF] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Thika Superhighway Service Lane</p>
                    <p className="text-slate-500 dark:text-slate-400">Next to Mark Hotel, Ruiru • Open 24/7 for Emergency Services</p>
                  </div>
                </div>

                {/* Thika Superhighway Real-Time Traffic Link */}
                <a
                  href="https://www.google.com/maps/@-1.1620371,36.9586472,13z/data=!5m1!1e1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-[11px] transition-all group cursor-pointer"
                  title="Check live congestion and traffic updates on Thika Superhighway before visiting Ruiru office"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Car className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-amber-100 text-[11px]">Thika Superhighway Live Traffic</span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-medium">View real-time traffic updates & route delays</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </a>

                {/* Click to Call Ruiru Office Direct Link */}
                <a
                  href={telNumber}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-[11px] transition-all group cursor-pointer"
                  title={`Click to call Kenfoss Ruiru Office directly at ${displayPhone}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-emerald-100 text-[11px]">Click to Call Ruiru Office</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium">{displayPhone} • Direct Phone Line</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-lg shadow-xs group-hover:bg-emerald-500 transition-colors shrink-0 flex items-center gap-1">
                    <Phone className="w-3 h-3 fill-current" />
                    Call
                  </span>
                </a>

                <div className="grid grid-cols-2 gap-1.5 sm:flex sm:items-center">
                  <a
                    href="https://www.google.com/maps/dir//Kenfoss+Refrigeration+limited,+Ivy%E2%80%99s+Park+Business+Park,+Next+to+Mark+Hotel,+Thika+Superhighway+Service+Lane,+Ruiru,+Kiambu+County/@-1.1620371,36.9537816,17z/data=!4m16!1m7!3m6!1s0x182f1510aee81ec1:0xc2b97e14e1f71921!2sKenfoss+Refrigeration+limited!8m2!3d-1.1620371!4d36.9586472!16s%2Fg%2F11xp9xzg41!4m7!1m0!1m5!1m1!1s0x182f1510aee81ec1:0xc2b97e14e1f71921!2m2!1d36.9586472!2d-1.1620371?entry=ttu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-[#00AEEF] hover:bg-blue-600 text-white font-bold py-2 px-2 rounded-lg text-xs transition-colors shadow-xs"
                    title="Open Google Maps driving directions"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span>Directions</span>
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className={`flex-1 flex items-center justify-center gap-1 font-bold py-2 px-2 rounded-lg text-xs transition-all cursor-pointer border ${
                      addressCopied
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700'
                    }`}
                    title="Copy exact Ruiru office address for Uber, Bolt, or courier services"
                  >
                    {addressCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#00AEEF] dark:text-blue-400 shrink-0" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>

                  <a
                    href={smsUrl}
                    className="flex-1 flex items-center justify-center gap-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-2 rounded-lg text-xs transition-colors shadow-xs"
                    title="Send office location & directions pre-filled via SMS"
                  >
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Share SMS</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowLocationModal(false)}
                    className="px-2.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

