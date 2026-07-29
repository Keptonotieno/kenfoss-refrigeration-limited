import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Clock, Moon } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

interface KenyaTimeInfo {
  timeString: string;
  dayName: string;
  isBusinessHours: boolean;
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

  return {
    timeString,
    dayName,
    isBusinessHours,
  };
};

export const FloatingWhatsApp: React.FC = () => {
  const { contactInfo } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [msgText, setMsgText] = useState('');
  const [kenyaTime, setKenyaTime] = useState<KenyaTimeInfo>(getKenyaTimeInfo());

  useEffect(() => {
    // Update live clock every second
    const timer = setInterval(() => {
      setKenyaTime(getKenyaTimeInfo());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const whatsappPhone = contactInfo?.whatsappNumber || '254745411923';

  const handleSend = () => {
    const text = msgText || 'Hello Kenfoss Refrigeration, I need urgent engineering service assistance.';
    window.open(`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(text)}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40">
      
      {/* Expanded Quick Chat Box */}
      {isOpen && (
        <div className="mb-3 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-84 sm:w-90 p-4 space-y-3 animate-in slide-in-from-bottom-3 duration-200 text-slate-800 dark:text-slate-100">
          
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
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-[#0057B8] dark:text-blue-300">
                      Ruiru, KE
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {kenyaTime.isBusinessHours 
                      ? 'Online • Typical response < 3 mins' 
                      : '24/7 Emergency On-Call Duty'}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-full transition-colors cursor-pointer"
                aria-label="Close chat"
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

          <div className="space-y-2 pt-1">
            <input
              type="text"
              placeholder="Type message (e.g. Cold room quote, Emergency repair)..."
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#0057B8]"
            />

            <button
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
        onClick={() => setIsOpen(!isOpen)}
        className="relative group bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
        aria-label="Contact on WhatsApp"
      >
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <MessageSquare className="w-6 h-6 relative z-10" />
      </button>

    </div>
  );
};
