import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [msgText, setMsgText] = useState('');

  const handleSend = () => {
    const text = msgText || 'Hello Kenfoss Refrigeration, I need urgent engineering service assistance.';
    window.open(`https://wa.me/254745411923?text=${encodeURIComponent(text)}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40">
      
      {/* Expanded Quick Chat Box */}
      {isOpen && (
        <div className="mb-3 bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 p-4 space-y-3 animate-in slide-in-from-bottom-3 duration-200 text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  KF
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Kenfoss Engineering</p>
                <p className="text-[10px] text-emerald-600 font-medium">Online • Typical response 3 mins</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
            👋 Jambo! How can our EPRA certified refrigeration team help you today?
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
                className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-full transition-colors cursor-pointer font-medium"
              >
                + {chip.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-1">
            <input
              type="text"
              placeholder="Type message (e.g. Cold room quote, Fridge repair)..."
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            />

            <button
              onClick={handleSend}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow flex items-center justify-center space-x-1 cursor-pointer"
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
