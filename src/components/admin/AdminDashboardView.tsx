import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  Users, 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  FileSpreadsheet, 
  Cpu, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert,
  Wrench,
  UserPlus
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';

interface AdminDashboardViewProps {
  setActiveTab: (tab: AdminTab) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ setActiveTab }) => {
  const { 
    bookings, 
    quotes, 
    customers, 
    diagnostics, 
    auditLogs, 
    currentUser,
    users
  } = useAdmin();

  // Calculate Metrics
  const totalCustomers = customers.length;
  const newBookingsCount = bookings.filter(b => b.status === 'New').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'Assigned' || b.status === 'In Progress').length;
  const completedJobsCount = bookings.filter(b => b.status === 'Completed').length;
  const totalQuoteRequests = quotes.length;
  const totalDiagnosticRequests = diagnostics.length;
  const totalRevenueEst = bookings
    .filter(b => b.status === 'Completed' || b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0) + 580000; // includes previous revenue base

  const recentBookings = bookings.slice(0, 5);
  const recentDiagnostics = diagnostics.slice(0, 4);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#002B5B] via-[#0057B8] to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold text-blue-200 border border-white/20">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Role: {currentUser?.role}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {currentUser?.name || 'Engineer'}!
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
            Kenfoss Refrigeration Limited operations hub. You have <strong className="text-white font-black underline">{newBookingsCount} new service bookings</strong> and <strong className="text-white font-black underline">{quotes.filter(q => q.status === 'Received').length} unreviewed commercial quotes</strong> requiring attention today.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => setActiveTab('bookings')}
            className="px-4 py-2.5 bg-white text-[#0057B8] font-bold text-xs rounded-xl hover:bg-blue-50 shadow-md flex items-center space-x-1.5 cursor-pointer transition-transform hover:scale-105"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Manage Bookings</span>
          </button>

          {currentUser?.role === 'Super Administrator' && (
            <button
              onClick={() => setActiveTab('users')}
              className="px-4 py-2.5 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl hover:bg-amber-400 shadow-md flex items-center space-x-1.5 cursor-pointer transition-transform hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Staff User</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Customers */}
        <div 
          onClick={() => setActiveTab('customers')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Customers</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{totalCustomers}</span>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12% MoM
            </span>
          </div>
        </div>

        {/* New Bookings */}
        <div 
          onClick={() => setActiveTab('bookings')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">New Bookings</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{newBookingsCount}</span>
            <span className="text-[10px] font-bold text-amber-400">Needs Dispatch</span>
          </div>
        </div>

        {/* Pending Jobs */}
        <div 
          onClick={() => setActiveTab('bookings')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Pending Jobs</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:bg-cyan-500 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{pendingBookingsCount}</span>
            <span className="text-[10px] font-bold text-cyan-400">In Progress</span>
          </div>
        </div>

        {/* Completed Jobs */}
        <div 
          onClick={() => setActiveTab('bookings')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Completed Jobs</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{completedJobsCount}</span>
            <span className="text-[10px] font-bold text-emerald-400">100% Verified</span>
          </div>
        </div>

        {/* Quote Requests */}
        <div 
          onClick={() => setActiveTab('quotes')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Quote Requests</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{totalQuoteRequests}</span>
            <span className="text-[10px] font-bold text-purple-400">RFQs Received</span>
          </div>
        </div>

        {/* AI Diagnostics */}
        <div 
          onClick={() => setActiveTab('diagnostics')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">AI Diagnostics</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{totalDiagnosticRequests}</span>
            <span className="text-[10px] font-bold text-blue-400">Fault Submissions</span>
          </div>
        </div>

        {/* Website Visitors */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Website Visitors</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">14,280</span>
            <span className="text-[10px] font-bold text-indigo-400">Monthly Unique</span>
          </div>
        </div>

        {/* Revenue Placeholder */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">YTD Revenue</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-400">
              KSh {totalRevenueEst.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-slate-500">Service + Turnkey</span>
          </div>
        </div>

      </div>

      {/* RECENT BOOKINGS & DIAGNOSTIC SUBMISSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Bookings Table (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#0057B8]" />
                Recent Service Bookings
              </h2>
              <p className="text-xs text-slate-400">Latest service dispatches and diagnostic bookings</p>
            </div>

            <button
              onClick={() => setActiveTab('bookings')}
              className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All Bookings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Ref / Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Service Type</th>
                  <th className="p-3">Technician</th>
                  <th className="p-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <span className="font-mono font-bold text-blue-400 block">{b.bookingRef}</span>
                      <span className="text-[10px] text-slate-500">{b.date}</span>
                    </td>
                    <td className="p-3 font-semibold text-white">
                      <div>{b.fullName}</div>
                      <div className="text-[10px] text-slate-400">{b.phone}</div>
                    </td>
                    <td className="p-3 text-slate-300 max-w-[160px] truncate">{b.serviceType}</td>
                    <td className="p-3 text-slate-400">
                      {b.assignedTechnicianName ? (
                        <span className="text-slate-200 font-medium flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-blue-400" />
                          {b.assignedTechnicianName.split(' ')[1] || b.assignedTechnicianName}
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[10px] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold inline-block ${
                        b.status === 'New' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        b.status === 'Assigned' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                        b.status === 'In Progress' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        b.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: AI Diagnostics & Audit Feed (1 Col) */}
        <div className="space-y-6">
          
          {/* AI Diagnostics Submissions Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                AI Diagnostic Submissions
              </h2>
              <button
                onClick={() => setActiveTab('diagnostics')}
                className="text-[11px] text-blue-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recentDiagnostics.map(d => (
                <div key={d.id} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{d.brand} {d.applianceType}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      d.severity === 'Emergency Critical' ? 'bg-rose-500/20 text-rose-400' :
                      d.severity === 'High' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {d.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{d.problemDescription}</p>
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-900">
                    <span>{d.location}</span>
                    <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Logs Quick Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Recent Staff Audit Logs
            </h2>
            <div className="space-y-2">
              {auditLogs.slice(0, 4).map(log => (
                <div key={log.id} className="text-[11px] border-l-2 border-blue-500 pl-3 py-1 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-bold">{log.userName}</span>
                    <span className="text-[9px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-slate-400">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
