import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { NotificationItem } from '../../types';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  Mail, 
  UserCheck, 
  MapPin, 
  Flame, 
  Zap, 
  ShieldAlert, 
  RefreshCw, 
  PlusCircle, 
  Check, 
  ChevronDown, 
  ChevronUp,
  MessageSquare,
  FileText
} from 'lucide-react';

export const EmergencySlaTracker: React.FC = () => {
  const { notifications, currentUser } = useAdmin();
  const [now, setNow] = useState<number>(Date.now());
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreatingTest, setIsCreatingTest] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'active' | 'history' | 'all'>('active');
  const [responseNotes, setResponseNotes] = useState<{ [key: string]: string }>({});

  // Form for custom test handoff trigger
  const [testCounty, setTestCounty] = useState<string>('Nairobi');
  const [testReason, setTestReason] = useState<string>('Emergency Cold Room Temperature Spike (> 12°C)');
  const [testPhone, setTestPhone] = useState<string>('+254 798 123 456');
  const [testEmail, setTestEmail] = useState<string>('manager@coldchain.co.ke');
  const [testNotes, setTestNotes] = useState<string>('Main meat freezer compressor tripped during peak hours. Urgent technician required.');

  // High-precision 1-second interval ticker for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter for Emergency / Human Agent Handoff tickets from Firestore notifications
  const handoffTickets = notifications.filter(n => 
    n.type === 'human_agent_handoff' || 
    n.title?.toLowerCase().includes('human agent handoff') ||
    n.title?.toLowerCase().includes('handoff') ||
    n.message?.toLowerCase().includes('handoff') ||
    n.reason?.toLowerCase().includes('emergency')
  );

  const activePendingTickets = handoffTickets.filter(n => n.status !== 'responded' && n.status !== 'resolved');
  const respondedHistoryTickets = handoffTickets.filter(n => n.status === 'responded' || n.status === 'resolved');

  // Calculate metrics
  const totalHandoffs = handoffTickets.length;
  const activeCount = activePendingTickets.length;
  
  // Breached count (active tickets where remaining time < 0)
  const breachedCount = activePendingTickets.filter(n => {
    const created = new Date(n.createdAt).getTime();
    const slaTarget = (n.slaMinutes || 15) * 60 * 1000;
    return (created + slaTarget) < now;
  }).length;

  const onTimeResponseCount = respondedHistoryTickets.filter(n => {
    if (!n.respondedAt) return true;
    const created = new Date(n.createdAt).getTime();
    const responded = new Date(n.respondedAt).getTime();
    const slaTarget = (n.slaMinutes || 15) * 60 * 1000;
    return (responded - created) <= slaTarget;
  }).length;

  const slaCompliancePercentage = totalHandoffs > 0 
    ? Math.round(((totalHandoffs - breachedCount) / totalHandoffs) * 100) 
    : 100;

  // Helper to mark ticket responded in Firestore
  const handleAcknowledgeSla = async (ticket: NotificationItem) => {
    const notifRef = doc(db, 'notifications', ticket.id);
    const noteText = responseNotes[ticket.id] || 'Responded via direct phone/whatsapp dispatch';
    const respondedIso = new Date().toISOString();

    try {
      await setDoc(notifRef, {
        status: 'responded',
        respondedAt: respondedIso,
        respondedBy: currentUser?.name || 'Administrator',
        responseNotes: noteText,
        isRead: true,
      }, { merge: true });
    } catch (err) {
      console.error('Error acknowledging SLA ticket:', err);
    }
  };

  // Helper to trigger a real-time Emergency Handoff in Firestore
  const handleTriggerTestHandoff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingTest(true);
    const notifId = `notif-handoff-${Date.now()}`;
    const newHandoffNotif: NotificationItem = {
      id: notifId,
      title: `👤 Human Agent Handoff (${testCounty} County)`,
      message: `Emergency callback queued for ${testPhone}. Reason: ${testReason}`,
      type: 'human_agent_handoff',
      county: testCounty,
      phone: testPhone,
      email: testEmail,
      reason: testReason,
      callbackTime: 'Immediately (15-min SLA)',
      assignedTechnician: 'Eng. David Ochieng',
      assignedTechnicianPhone: '+254 722 000 111',
      notes: testNotes,
      isRead: false,
      createdAt: new Date().toISOString(),
      link: 'contact_info',
      slaMinutes: 15,
      status: 'pending',
    };

    try {
      await setDoc(doc(db, 'notifications', notifId), newHandoffNotif);
    } catch (err) {
      console.error('Error logging test handoff:', err);
    } finally {
      setIsCreatingTest(false);
    }
  };

  // Render individual ticket timer card
  const renderTicketCard = (ticket: NotificationItem) => {
    const createdMs = new Date(ticket.createdAt).getTime();
    const slaMinutes = ticket.slaMinutes || 15;
    const slaTotalSec = slaMinutes * 60;
    const targetMs = createdMs + slaTotalSec * 1000;
    
    // For responded tickets, calculate response duration
    const isResponded = ticket.status === 'responded' || ticket.status === 'resolved';
    const endTimeMs = isResponded && ticket.respondedAt ? new Date(ticket.respondedAt).getTime() : now;
    
    const remainingSec = Math.floor((targetMs - endTimeMs) / 1000);
    const elapsedSec = Math.floor((endTimeMs - createdMs) / 1000);
    
    const isBreached = remainingSec < 0;
    const isWarning = remainingSec > 0 && remainingSec <= 300; // <= 5 minutes
    
    // Time formatting helpers
    const formatTime = (totalSeconds: number) => {
      const absSec = Math.abs(totalSeconds);
      const mins = Math.floor(absSec / 60);
      const secs = absSec % 60;
      const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      return totalSeconds < 0 ? `-${formatted}` : formatted;
    };

    const progressPct = isResponded 
      ? 100 
      : Math.max(0, Math.min(100, (remainingSec / slaTotalSec) * 100));

    const isExpanded = selectedTicketId === ticket.id;

    return (
      <div 
        key={ticket.id} 
        className={`rounded-2xl border p-5 transition-all shadow-lg relative overflow-hidden ${
          isResponded
            ? 'bg-slate-900/90 border-slate-800'
            : isBreached
            ? 'bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border-rose-500/80 shadow-rose-950/30 ring-1 ring-rose-500/50'
            : isWarning
            ? 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900 border-amber-500/80 shadow-amber-950/30 ring-1 ring-amber-500/50'
            : 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border-emerald-500/60 shadow-emerald-950/20'
        }`}
      >
        {/* Top Header Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center space-x-2.5">
            <span className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
              isResponded
                ? 'bg-slate-800 text-slate-400'
                : isBreached
                ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                : isWarning
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {isResponded ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isBreached ? (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              ) : (
                <Flame className="w-5 h-5 text-amber-400" />
              )}
            </span>

            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-extrabold text-white">
                  {ticket.reason || ticket.title}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                  isResponded
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : isBreached
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : isWarning
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  {isResponded ? 'SLA Met / Responded' : isBreached ? '15-MIN SLA BREACHED' : 'Active 15-MIN SLA'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                County: <strong className="text-slate-200">{ticket.county || 'Nairobi'}</strong> • Triggered: {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>
          </div>

          {/* TIMER COUNTDOWN BADGE */}
          <div className="flex items-center space-x-3">
            {!isResponded ? (
              <div className={`px-4 py-2 rounded-2xl border flex items-center space-x-2 shadow-inner ${
                isBreached
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-rose-900/50 animate-pulse'
                  : isWarning
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-slate-950 border-emerald-500/60 text-emerald-300'
              }`}>
                <Clock className={`w-4 h-4 ${isBreached ? 'text-rose-400 animate-spin' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`} />
                <div className="text-right">
                  <div className="text-[9px] uppercase font-bold tracking-wider opacity-80">
                    {isBreached ? 'Overdue SLA' : 'SLA Remaining'}
                  </div>
                  <div className="text-lg font-black font-mono tracking-wider leading-none">
                    {formatTime(remainingSec)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-right">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Response Time</span>
                <span className="text-xs font-bold font-mono text-emerald-400">
                  {Math.floor(elapsedSec / 60)}m {elapsedSec % 60}s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar for Active SLA */}
        {!isResponded && (
          <div className="mt-3 w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 relative">
            <div 
              className={`h-full transition-all duration-1000 ${
                isBreached 
                  ? 'bg-rose-500' 
                  : isWarning 
                  ? 'bg-amber-400' 
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        )}

        {/* Middle Details Grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Client Contact</span>
            <div className="font-bold text-white flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>{ticket.phone || 'Phone Not Provided'}</span>
            </div>
            {ticket.email && (
              <div className="text-[11px] text-slate-400 flex items-center space-x-1 truncate">
                <Mail className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="truncate">{ticket.email}</span>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Assigned Tech Lead</span>
            <div className="font-bold text-cyan-300 flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{ticket.assignedTechnician || 'Senior Duty Engineer'}</span>
            </div>
            {ticket.assignedTechnicianPhone && (
              <span className="text-[10px] text-slate-400 block font-mono">
                {ticket.assignedTechnicianPhone}
              </span>
            )}
          </div>

          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Requested SLA Slot</span>
            <div className="font-bold text-amber-300 flex items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{ticket.callbackTime || '15-min Immediate'}</span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              Logged {Math.floor((now - createdMs) / 60000)} mins ago
            </span>
          </div>
        </div>

        {/* Customer Notes */}
        {ticket.notes && (
          <div className="mt-3 p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <span className="text-[10px] font-black uppercase text-amber-400/90 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Customer Issue Details:
            </span>
            <p className="leading-relaxed italic">{ticket.notes}</p>
          </div>
        )}

        {/* Responded Info Banner */}
        {isResponded && (
          <div className="mt-3 p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>
                Responded by <strong>{ticket.respondedBy || 'Staff'}</strong> on {new Date(ticket.respondedAt || ticket.createdAt).toLocaleTimeString()}
              </span>
            </div>
            {ticket.responseNotes && (
              <span className="text-[11px] text-emerald-200 italic truncate max-w-xs">
                "{ticket.responseNotes}"
              </span>
            )}
          </div>
        )}

        {/* Action Controls for Pending SLA Tickets */}
        {!isResponded && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              {ticket.phone && (
                <a
                  href={`tel:${ticket.phone}`}
                  className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Direct Call ({ticket.phone})</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setSelectedTicketId(isExpanded ? null : ticket.id)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center space-x-1 cursor-pointer"
              >
                <span>{isExpanded ? 'Hide Note Form' : 'Add Response Note'}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleAcknowledgeSla(ticket)}
              className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-950/50 flex items-center space-x-2 cursor-pointer transition-transform hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Acknowledge & Mark SLA Met</span>
            </button>
          </div>
        )}

        {/* Expandable Response Note Form */}
        {isExpanded && !isResponded && (
          <div className="mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 animate-in fade-in">
            <label className="text-[11px] font-bold text-slate-300 block">
              Response Note / Action Taken (Logged in Audit History):
            </label>
            <input
              type="text"
              placeholder="e.g. Called customer, dispatched Senior Tech David on site."
              value={responseNotes[ticket.id] || ''}
              onChange={(e) => setResponseNotes({ ...responseNotes, [ticket.id]: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
      
      {/* Decorative Top Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500" />

      {/* Header & KPI Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full text-xs font-black mb-2">
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span>Emergency Rapid Response Desk</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            15-Minute Response SLA Countdown
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Real-time Firestore listener for customer Human Agent Handoff requests and emergency technician callbacks across Kenya.
          </p>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center space-x-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-slate-500 block">Active SLA</span>
              <span className="text-base font-black text-white">{activeCount}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center space-x-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-slate-500 block">SLA Breached</span>
              <span className={`text-base font-black ${breachedCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-300'}`}>
                {breachedCount}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-black text-slate-500 block">SLA Compliance</span>
              <span className="text-base font-black text-emerald-400">{slaCompliancePercentage}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setFilterMode('active')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              filterMode === 'active' 
                ? 'bg-rose-500 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Pending ({activeCount})
          </button>
          <button
            onClick={() => setFilterMode('history')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              filterMode === 'history' 
                ? 'bg-emerald-500 text-slate-950 shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Responded SLA History ({respondedHistoryTickets.length})
          </button>
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
              filterMode === 'all' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Logs ({totalHandoffs})
          </button>
        </div>

        {/* Trigger Custom Test Button */}
        <button
          onClick={() => setIsCreatingTest(!isCreatingTest)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer transition-transform hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isCreatingTest ? 'Cancel Test Trigger' : 'Trigger Test Emergency Handoff'}</span>
        </button>
      </div>

      {/* CUSTOM TEST TRIGGER FORM */}
      {isCreatingTest && (
        <form 
          onSubmit={handleTriggerTestHandoff}
          className="p-5 bg-slate-950 border-2 border-dashed border-amber-500/60 rounded-2xl space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" /> Log Emergency Human Agent Handoff to Firestore
            </h3>
            <span className="text-[10px] text-slate-400 italic">
              Simulates a live website customer requesting immediate agent dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">County / Base Station</label>
              <select
                value={testCounty}
                onChange={(e) => setTestCounty(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Nairobi">Nairobi County</option>
                <option value="Mombasa">Mombasa County</option>
                <option value="Kisumu">Kisumu County</option>
                <option value="Nakuru">Nakuru County</option>
                <option value="Eldoret">Eldoret / Uasin Gishu</option>
                <option value="Kiambu">Kiambu County</option>
                <option value="Machakos">Machakos County</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Client Phone</label>
              <input
                type="text"
                required
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Client Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Emergency Category</label>
              <select
                value={testReason}
                onChange={(e) => setTestReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Emergency Cold Room Temperature Spike (> 12°C)">Cold Room Temp Spike</option>
                <option value="Supermarket Compressor Trips & R404A Gas Leak">Compressor & Gas Leak</option>
                <option value="HVAC Chiller Shutdown during Operations">HVAC Chiller Shutdown</option>
                <option value="Urgent Commercial Refrigeration Callback">General Rapid Dispatch</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300 block mb-1 text-xs">Technical Problem Notes</label>
            <input
              type="text"
              value={testNotes}
              onChange={(e) => setTestNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCreatingTest(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer flex items-center space-x-1.5"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Broadcast to Firestore & Start 15-Min Timer</span>
            </button>
          </div>
        </form>
      )}

      {/* LIST OF CARDS */}
      <div className="space-y-4">
        {filterMode === 'active' && activePendingTickets.length === 0 && (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-sm">No Pending Emergency SLA Tickets</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All Human Agent Handoffs have been acknowledged within response limits. Use the "Trigger Test Emergency Handoff" button above to test the live 15-minute SLA countdown timer.
            </p>
          </div>
        )}

        {filterMode === 'history' && respondedHistoryTickets.length === 0 && (
          <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
            No completed response logs in history yet.
          </div>
        )}

        {(filterMode === 'active' ? activePendingTickets : filterMode === 'history' ? respondedHistoryTickets : handoffTickets).map(ticket => renderTicketCard(ticket))}
      </div>

    </div>
  );
};
