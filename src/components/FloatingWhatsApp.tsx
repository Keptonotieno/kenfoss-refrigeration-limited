import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Clock, Moon, Smile, Globe, MapPin, ExternalLink, Navigation, Car, Bus, Copy, Check, CheckCheck, Phone, Smartphone, Share2, Mail, Mic, MicOff, Bot, Sparkles, RotateCcw, Volume2, VolumeX, Camera, Image } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

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

export interface ChatMessage {
  id: string;
  sender: 'user' | 'support';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  imageUrl?: string;
  imageName?: string;
}

// Auto-correction dictionary for common HVAC & Kenfoss dictation & typing terms
const DICTATION_AUTO_CORRECTIONS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bcold\s*room(s)?\b/gi, replacement: 'Cold Room$1' },
  { pattern: /\bcoldroom(s)?\b/gi, replacement: 'Cold Room$1' },
  { pattern: /\b(ken\s*foss|canfoss|can\s*foss|kenfos)\b/gi, replacement: 'Kenfoss' },
  { pattern: /\bhvac\b/gi, replacement: 'HVAC' },
  { pattern: /\bblast\s*freezer(s)?\b/gi, replacement: 'Blast Freezer$1' },
  { pattern: /\bchiller\s*unit(s)?\b/gi, replacement: 'Chiller Unit$1' },
  { pattern: /\bmortuary\s*cooler(s)?\b/gi, replacement: 'Mortuary Cooler$1' },
  { pattern: /\bac\s*unit(s)?\b/gi, replacement: 'A/C Unit$1' },
  { pattern: /\bair\s*con(ditioner|ditioning)?\b/gi, replacement: 'Air Conditioner' },
  { pattern: /\bruiru\b/gi, replacement: 'Ruiru' },
  { pattern: /\bfreon\b/gi, replacement: 'Freon' },
  { pattern: /\brefrigeration\b/gi, replacement: 'Refrigeration' },
  { pattern: /\bheat\s*pump(s)?\b/gi, replacement: 'Heat Pump$1' },
];

export const applyAutoCorrection = (text: string): string => {
  if (!text) return text;
  let corrected = text;
  DICTATION_AUTO_CORRECTIONS.forEach(({ pattern, replacement }) => {
    corrected = corrected.replace(pattern, replacement);
  });
  return corrected;
};

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
const CHAT_HISTORY_STORAGE_KEY = 'kenfoss_whatsapp_chat_history';
const MAX_MSG_LENGTH = 300;
const COMMON_EMOJIS = ['👋', '❄️', '🔧', '⚡', '🧊', '🌡️', '🛠️', '🚚', '📍', '👍', '❓', '🙏', '😊', '🏢', '💬', '✨'];

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ onOpenChatbot }) => {
  const { contactInfo, websiteSettings, services } = useAdmin();
  const companyName = websiteSettings?.companyName || 'Kenfoss Refrigeration';
  const [isOpen, setIsOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const fullRuiruAddress = contactInfo
    ? [contactInfo.address, contactInfo.city].filter(Boolean).join(', ')
    : "Ivy's Park Business Park, Next to Mark Hotel, Thika Superhighway Service Lane, Ruiru, Kiambu County, Kenya";

  const displayPhone = contactInfo?.mainPhone || contactInfo?.emergencyPhone || '+254 745 411 923';
  const whatsappPhone = (contactInfo?.whatsappNumber || '254745411923').replace(/[^0-9]/g, '');
  const telNumber = `tel:${displayPhone.replace(/[^0-9+]/g, '')}`;
  const smsMessage = `${companyName} Office: ${fullRuiruAddress} | Directions: https://maps.google.com/?q=Kenfoss+Refrigeration+limited+Ruiru`;
  const smsUrl = `sms:?body=${encodeURIComponent(smsMessage)}`;

  const emailSubject = `${companyName} HQ Location`;
  const emailBody = `${companyName} Office: ${fullRuiruAddress}\n\nGoogle Maps Location & Directions: https://maps.google.com/?q=Kenfoss+Refrigeration+limited+Ruiru`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const whatsappShareMessage = `${companyName} Office: ${fullRuiruAddress}\n\nDirections: https://maps.google.com/?q=Kenfoss+Refrigeration+limited+Ruiru`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappShareMessage)}`;

  const mapLocationUrl = 'https://maps.google.com/?q=Kenfoss+Refrigeration+limited+Ruiru';
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(mapLocationUrl)}`;
  const xShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${companyName} HQ Location: ${fullRuiruAddress}`)}&url=${encodeURIComponent(mapLocationUrl)}`;

  const handleShareLocation = async () => {
    const shareData = {
      title: 'Kenfoss Refrigeration HQ Location',
      text: `Kenfoss Refrigeration Ruiru Office: ${fullRuiruAddress}`,
      url: 'https://maps.google.com/?q=Kenfoss+Refrigeration+limited+Ruiru',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: unknown) {
        // If user canceled the share sheet (AbortError), do not trigger SMS fallback
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        window.location.href = smsUrl;
        return;
      }
    }

    // Direct fallback for browsers without Web Share API support
    window.location.href = smsUrl;
  };

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
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'welcome-msg',
        sender: 'support',
        text: 'Jambo! 👋 Welcome to Kenfoss Support. How can our engineering team assist you with Cold Rooms, Commercial HVAC, or Emergency Repairs today?',
        timestamp: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()),
      }
    ];
  });
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<{ url: string; name: string } | null>(null);
  const [selectedImageModalUrl, setSelectedImageModalUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setSpeechError('Image file is too large (max 10MB). Please select a smaller photo.');
      setTimeout(() => setSpeechError(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAttachedImage({
          url: reader.result,
          name: file.name || 'faulty-equipment.jpg',
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const speakMessage = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean emojis & extra whitespaces for smooth speech output
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText || text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };
    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(chatHistory));
    } catch {
      // ignore localStorage errors
    }
  }, [chatHistory]);

  const handleClearChat = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    const defaultMsg: ChatMessage[] = [
      {
        id: `welcome-msg-${Date.now()}`,
        sender: 'support',
        text: 'Jambo! 👋 Welcome to Kenfoss Support. How can our engineering team assist you with Cold Rooms, Commercial HVAC, or Emergency Repairs today?',
        timestamp: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()),
      }
    ];
    setChatHistory(defaultMsg);
    try {
      localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const toggleVoiceDictation = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setSpeechError('Voice dictation is not supported in this browser. Try Chrome, Edge, or Safari.');
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    try {
      setSpeechError(null);
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      const initialText = msgText ? (msgText.trimEnd() + ' ') : '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        const rawText = (initialText + transcript).slice(0, MAX_MSG_LENGTH);
        const updated = applyAutoCorrection(rawText);
        setMsgText(updated);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech detected. Please speak clearly into your microphone.');
        } else {
          setSpeechError(`Voice dictation error: ${event.error}`);
        }
        setTimeout(() => setSpeechError(null), 5000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechError('Could not start voice dictation.');
      setTimeout(() => setSpeechError(null), 5000);
    }
  };

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

  const handleInsertEmoji = (emoji: string) => {
    if (msgText.length + emoji.length <= MAX_MSG_LENGTH) {
      setMsgText((prev) => prev + emoji);
    }
  };

  const handleSend = () => {
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsListening(false);
    }

    const hasImage = !!attachedImage;
    const defaultText = hasImage
      ? `📷 Attached photo of faulty equipment for ${companyName} engineering inspection.`
      : `Hello ${companyName}, I need urgent engineering service assistance.`;
    const textToSend = msgText.trim() || defaultText;
    const newMsgId = `usr-${Date.now()}`;
    const timeStr = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date());

    const userMsg: ChatMessage = {
      id: newMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: timeStr,
      status: 'sent',
      ...(attachedImage ? { imageUrl: attachedImage.url, imageName: attachedImage.name } : {}),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setMsgText('');
    setAttachedImage(null);
    setShowEmojiPicker(false);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore localStorage errors
    }

    // Publish Real-Time Notification to Firestore for Admin Portal listener
    const notifId = `notif-wa-${Date.now()}`;
    const notifTitle = hasImage
      ? '📷 WhatsApp Equipment Photo Received'
      : '💬 New WhatsApp Live Chat Message';
    const notifMessage = hasImage
      ? `Equipment Photo (${userMsg.imageName || 'Inspection image'}) attached: "${textToSend}"`
      : `Client Message: "${textToSend}"`;

    const realTimeNotif = {
      id: notifId,
      type: 'whatsapp' as const,
      title: notifTitle,
      message: notifMessage,
      isRead: false,
      createdAt: new Date().toISOString(),
      link: 'contact_info',
      ...(userMsg.imageUrl ? { imageUrl: userMsg.imageUrl, imageName: userMsg.imageName } : {}),
    };

    setDoc(doc(db, 'notifications', notifId), realTimeNotif).catch((err) => {
      console.error('Firestore real-time WhatsApp notification save error:', err);
    });

    // Also persist inquiry log in contacts collection in Firestore
    const contactMsgId = `contact-wa-${Date.now()}`;
    const contactDoc = {
      id: contactMsgId,
      name: 'WhatsApp Live Visitor',
      email: 'whatsapp-chat@kenfoss.co.ke',
      phone: whatsappPhone,
      subject: hasImage ? 'WhatsApp Equipment Image Attachment' : 'WhatsApp Live Chat Inquiry',
      message: textToSend,
      ...(userMsg.imageUrl ? { imageUrl: userMsg.imageUrl, imageName: userMsg.imageName } : {}),
      status: 'Unread',
      createdAt: new Date().toISOString(),
    };
    setDoc(doc(db, 'contacts', contactMsgId), contactDoc).catch((err) => {
      console.error('Firestore real-time WhatsApp contact message save error:', err);
    });

    // Progression of message status ticks:
    // 1. Single Tick ('sent') -> Delivered (Double Tick 'delivered') after 800ms
    const t1 = setTimeout(() => {
      setChatHistory((prev) =>
        prev.map((m) => (m.id === newMsgId ? { ...m, status: 'delivered' } : m))
      );
    }, 800);

    // 2. Double Tick -> Read (Double Blue Tick 'read') after 2000ms
    const t2 = setTimeout(() => {
      setChatHistory((prev) =>
        prev.map((m) => (m.id === newMsgId ? { ...m, status: 'read' } : m))
      );
    }, 2000);

    // 3. Support Acknowledgement & WhatsApp redirection after 3000ms
    const t3 = setTimeout(() => {
      const supportReplyText = hasImage
        ? `📷 Equipment photo received! Our ${companyName} engineering team will inspect the image and provide a technical assessment. Opening live WhatsApp...`
        : '✅ Message read by Kenfoss Support! Opening live WhatsApp chat channel...';

      setChatHistory((prev) => [
        ...prev,
        {
          id: `supp-${Date.now()}`,
          sender: 'support',
          text: supportReplyText,
          timestamp: new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date()),
        },
      ]);
      window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(textToSend)}`, '_blank');
    }, 3000);

    timeoutsRef.current.push(t1, t2, t3);
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

          {/* Chat Messages Feed Display with Status Indicators */}
          <div className="bg-slate-100/80 dark:bg-slate-950/80 rounded-xl p-2.5 border border-slate-200/80 dark:border-slate-800 space-y-2 max-h-44 overflow-y-auto text-xs">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-2xs leading-relaxed text-xs ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700/60 rounded-bl-xs'
                  }`}
                >
                  {msg.imageUrl && (
                    <div className="mb-2 overflow-hidden rounded-xl border border-white/20 dark:border-slate-700 bg-black/10 relative group/img cursor-pointer">
                      <img
                        src={msg.imageUrl}
                        alt={msg.imageName || "Faulty Equipment Photo"}
                        className="w-full max-h-36 object-cover rounded-xl transition-transform duration-200 group-hover/img:scale-105"
                        onClick={() => setSelectedImageModalUrl(msg.imageUrl!)}
                      />
                      <div
                        onClick={() => setSelectedImageModalUrl(msg.imageUrl!)}
                        className="absolute bottom-1 right-1 bg-black/65 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-1 font-medium opacity-90 hover:opacity-100 transition-opacity"
                      >
                        <Camera className="w-2.5 h-2.5 text-emerald-400" />
                        <span>View Photo</span>
                      </div>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`flex items-center justify-between gap-2 mt-1 text-[9px] ${
                      msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {msg.sender === 'support' && typeof window !== 'undefined' && 'speechSynthesis' in window && (
                      <button
                        type="button"
                        onClick={() => speakMessage(msg.id, msg.text)}
                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] transition-all cursor-pointer font-medium ${
                          speakingMsgId === msg.id
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold animate-pulse'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400'
                        }`}
                        title={speakingMsgId === msg.id ? "Stop reading response aloud" : "Read response aloud (Text-to-Speech)"}
                      >
                        {speakingMsgId === msg.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    )}
                    <div className="flex items-center space-x-1 ml-auto">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'user' && msg.status && (
                        <span className="flex items-center ml-0.5" title={`Message Status: ${msg.status.toUpperCase()}`}>
                          {msg.status === 'sent' && (
                            <Check className="w-3 h-3 text-emerald-200" />
                          )}
                          {msg.status === 'delivered' && (
                            <CheckCheck className="w-3 h-3 text-emerald-200" />
                          )}
                          {msg.status === 'read' && (
                            <CheckCheck className="w-3 h-3 text-sky-300 font-bold" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message Status Ticks Legend & Reset Button */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Ticks:</span>
              <span className="flex items-center space-x-0.5" title="Single Tick = Sent">
                <Check className="w-3 h-3 text-slate-400" />
                <span>Sent</span>
              </span>
              <span className="flex items-center space-x-0.5" title="Double Tick = Delivered">
                <CheckCheck className="w-3 h-3 text-slate-400" />
                <span>Delivered</span>
              </span>
              <span className="flex items-center space-x-0.5 font-medium text-sky-600 dark:text-sky-400" title="Double Blue Tick = Read">
                <CheckCheck className="w-3 h-3 text-sky-500" />
                <span>Read</span>
              </span>
            </div>
            {chatHistory.length > 1 && (
              <button
                type="button"
                onClick={handleClearChat}
                className="flex items-center gap-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer ml-1"
                title="Reset saved chat history"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Quick Reply Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(services && services.length > 0
              ? services.slice(0, 4).map((s) => ({
                  label: s.title,
                  msg: `Hi ${companyName}, I need assistance regarding ${s.title}.`,
                }))
              : [
                  { label: 'Cold Room Maintenance', msg: `Hi ${companyName}, I need assistance with Cold Room Maintenance.` },
                  { label: 'Emergency Repair', msg: `Hello, I require urgent Emergency Repair service for our refrigeration system.` },
                  { label: 'Request Quote', msg: `Jambo! I would like to request a custom project quote from ${companyName}.` },
                  { label: 'HVAC Installation', msg: `Hi team, I need inquiries regarding commercial HVAC installation.` },
                ]
            ).map((chip) => (
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
            {/* Hidden File Input for Device Camera / Image Capture */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handleImageCapture}
              className="hidden"
            />

            {/* Attached Faulty Equipment Photo Preview */}
            {attachedImage && (
              <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center space-x-2 min-w-0">
                  <img
                    src={attachedImage.url}
                    alt="Faulty Equipment Preview"
                    className="w-8 h-8 object-cover rounded-lg border border-emerald-300 dark:border-emerald-700 shrink-0 cursor-pointer"
                    onClick={() => setSelectedImageModalUrl(attachedImage.url)}
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-emerald-900 dark:text-emerald-200 truncate flex items-center gap-1">
                      <Camera className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Equipment Photo Attached</span>
                    </p>
                    <p className="text-[9px] text-emerald-700 dark:text-emerald-400 truncate">
                      Click send to attach photo to chat
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="p-1 text-emerald-700 dark:text-emerald-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Remove attached photo"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

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
                  placeholder={isListening ? "Listening... Speak your maintenance request..." : "Type message or snap equipment photo..."}
                  value={msgText}
                  maxLength={MAX_MSG_LENGTH}
                  onChange={(e) => setMsgText(applyAutoCorrection(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className={`w-full bg-slate-100 dark:bg-slate-800 border rounded-xl py-2.5 pl-2.5 pr-22 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${
                    isListening
                      ? 'border-red-500 dark:border-red-400 ring-2 ring-red-500/30'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#0057B8]'
                  }`}
                />
                <div className="absolute right-2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-1 rounded-full transition-colors cursor-pointer ${
                      attachedImage
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 font-bold'
                        : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                    title="Snap/Upload photo of faulty equipment (Camera)"
                    aria-label="Snap photo of faulty equipment"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={toggleVoiceDictation}
                    className={`p-1 rounded-full transition-colors cursor-pointer ${
                      isListening
                        ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/80 animate-pulse'
                        : 'text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400'
                    }`}
                    title={isListening ? "Stop voice dictation" : "Dictate maintenance request (Voice-to-Text)"}
                    aria-label={isListening ? "Stop voice dictation" : "Dictate maintenance request"}
                  >
                    {isListening ? <MicOff className="w-4 h-4 text-red-600 dark:text-red-400" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className={`text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 p-1 rounded-full transition-colors cursor-pointer ${
                      showEmojiPicker ? 'text-amber-500 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40' : ''
                    }`}
                    title="Insert Emoji"
                    aria-label="Insert Emoji"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Listening Indicator Badge */}
              {isListening && (
                <div className="flex items-center space-x-1.5 text-[10px] text-red-600 dark:text-red-400 font-semibold px-2 py-1 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-900/50 animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span>🎙️ Dictating maintenance request... Speak clearly into your mic.</span>
                </div>
              )}

              {/* Speech Error Banner */}
              {speechError && (
                <div className="text-[10px] text-amber-800 dark:text-amber-200 px-2 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 rounded-lg">
                  ⚠️ {speechError}
                </div>
              )}

              <div className="flex items-center justify-between px-1 text-[10px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                  <span>Auto-correction active (cold room → Cold Room)</span>
                </span>
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

                {/* Public Transport (Matatu / Bus) Directions Link */}
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Kenfoss+Refrigeration+limited,+Ivy%E2%80%99s+Park+Business+Park,+Next+to+Mark+Hotel,+Thika+Superhighway+Service+Lane,+Ruiru,+Kiambu+County&travelmode=transit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 dark:bg-indigo-500/15 dark:hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-900 dark:text-indigo-200 text-[11px] transition-all group cursor-pointer"
                  title="Get transit routes, matatu stages & bus schedules to Kenfoss Ruiru office"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <Bus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <span className="font-bold block text-slate-900 dark:text-indigo-100 text-[11px]">Public Transport Directions</span>
                      <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">Matatu, Bus & Commuter routes to Ruiru HQ</span>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
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

                  <button
                    type="button"
                    onClick={handleShareLocation}
                    className="flex-1 flex items-center justify-center gap-1 bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-2 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                    title="Share office location & directions via mobile share sheet or SMS"
                  >
                    <Share2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Share SMS</span>
                  </button>

                  <a
                    href={whatsappShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-2 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                    title="Share office location & directions instantly via WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">WhatsApp</span>
                  </a>

                  <a
                    href={emailUrl}
                    className="flex-1 flex items-center justify-center gap-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-2 rounded-lg text-xs transition-colors shadow-xs"
                    title="Share office location & directions pre-filled via Email"
                  >
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Email</span>
                  </a>

                  <a
                    href={facebookShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                    title="Share office location on Facebook"
                  >
                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="truncate">Facebook</span>
                  </a>

                  <a
                    href={xShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-2 px-2 rounded-lg text-xs transition-colors shadow-xs cursor-pointer border border-slate-700/50"
                    title="Share office location on X (Twitter)"
                  >
                    <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="truncate">Share on X</span>
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

      {/* Equipment Photo Inspection Lightbox Modal */}
      {selectedImageModalUrl && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 pointer-events-auto"
          onClick={() => setSelectedImageModalUrl(null)}
        >
          <div
            className="relative max-w-lg w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl p-3 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-white">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Faulty Equipment Photo</h4>
                  <p className="text-[10px] text-slate-400">Engineering Image Attachment</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageModalUrl(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close photo preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={selectedImageModalUrl}
                alt="Faulty Equipment Inspection Detail"
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

