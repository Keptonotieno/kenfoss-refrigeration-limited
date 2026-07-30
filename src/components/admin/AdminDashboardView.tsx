import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ProjectItem, ServiceItem, TestimonialItem, ServiceCategory } from '../../types';
import { 
  Users, 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  FileSpreadsheet, 
  Cpu, 
  TrendingUp, 
  DollarSign, 
  ShieldAlert,
  Wrench,
  UserPlus,
  Edit3,
  ToggleLeft,
  ToggleRight,
  FolderGit2,
  Building2,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
  Star,
  Globe
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
    projects,
    updateProject,
    services,
    updateService,
    testimonials,
    approveTestimonial,
    contactInfo,
    updateContactInfo,
    websiteSettings,
    updateWebsiteSettings
  } = useAdmin();

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Inline modal states
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [editingBranding, setEditingBranding] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);

  // Form states
  const [brandingForm, setBrandingForm] = useState(contactInfo);
  const [projectForm, setProjectForm] = useState<Partial<ProjectItem>>({});
  const [serviceForm, setServiceForm] = useState<Partial<ServiceItem>>({});
  const [testimonialForm, setTestimonialForm] = useState<Partial<TestimonialItem>>({});

  // Calculate Metrics
  const totalCustomers = customers.length;
  const newBookingsCount = bookings.filter(b => b.status === 'New').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'Assigned' || b.status === 'In Progress').length;
  const completedJobsCount = bookings.filter(b => b.status === 'Completed').length;
  const totalQuoteRequests = quotes.length;
  const totalDiagnosticRequests = diagnostics.length;
  const totalRevenueEst = bookings
    .filter(b => b.status === 'Completed' || b.paymentStatus === 'Paid')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const recentBookings = bookings.slice(0, 5);
  const recentDiagnostics = diagnostics.slice(0, 4);

  // Open Project Edit
  const handleOpenProjectEdit = (p: ProjectItem) => {
    setEditingProject(p);
    setProjectForm(p);
  };

  // Save Project
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject && projectForm.title) {
      updateProject({ ...editingProject, ...projectForm } as ProjectItem);
      setEditingProject(null);
    }
  };

  // Open Branding Edit
  const handleOpenBrandingEdit = () => {
    setBrandingForm(contactInfo);
    setEditingBranding(true);
  };

  // Save Branding
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    updateContactInfo(brandingForm);
    setEditingBranding(false);
  };

  // Open Service Edit
  const handleOpenServiceEdit = (s: ServiceItem) => {
    setEditingService(s);
    setServiceForm(s);
  };

  // Save Service
  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService && serviceForm.title) {
      updateService({ ...editingService, ...serviceForm } as ServiceItem);
      setEditingService(null);
    }
  };

  // Open Testimonial Edit
  const handleOpenTestimonialEdit = (t: TestimonialItem) => {
    setEditingTestimonial(t);
    setTestimonialForm(t);
  };

  // Save Testimonial
  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTestimonial) {
      approveTestimonial(editingTestimonial.id);
      setEditingTestimonial(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner with Edit Mode Toggle Switch */}
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

        {/* Action Controls & Edit Mode Toggle */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          
          {/* EDIT MODE TOGGLE SWITCH */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs shadow-lg flex items-center space-x-2 transition-all cursor-pointer border ${
              isEditMode 
                ? 'bg-amber-500 text-slate-950 border-amber-400 ring-2 ring-amber-400/50 scale-105' 
                : 'bg-slate-900/80 hover:bg-slate-800 text-amber-400 border-amber-500/30'
            }`}
          >
            {isEditMode ? (
              <ToggleRight className="w-5 h-5 text-slate-950 animate-pulse" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-amber-400" />
            )}
            <span>Edit Mode: {isEditMode ? 'ON' : 'OFF'}</span>
          </button>

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

      {/* Edit Mode Notification Banner */}
      {isEditMode && (
        <div className="bg-amber-500/10 border-2 border-dashed border-amber-500/50 rounded-2xl p-4 flex items-center justify-between text-amber-300 text-xs font-bold animate-in fade-in">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            <span>
              <strong>Edit Mode Enabled:</strong> Click directly on any element below (Branding Section, Projects Gallery, Services, Testimonials) to open its inline editing form and save changes directly to Firestore.
            </span>
          </div>
          <button
            onClick={() => setIsEditMode(false)}
            className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-lg text-[11px] cursor-pointer"
          >
            Done Editing
          </button>
        </div>
      )}

      {/* EDITABLE BRANDING & CONTACT INFO SECTION */}
      <div 
        onClick={() => isEditMode && handleOpenBrandingEdit()}
        className={`bg-slate-900 border rounded-3xl p-6 transition-all ${
          isEditMode 
            ? 'border-2 border-dashed border-amber-500/80 cursor-pointer hover:bg-slate-800/80 shadow-lg shadow-amber-500/10 relative' 
            : 'border-slate-800'
        }`}
      >
        {isEditMode && (
          <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Edit3 className="w-3 h-3" />
            <span>Click to Edit Branding & Contact</span>
          </div>
        )}

        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00AEEF]" />
            Company Branding & Contact Settings
          </h2>
          {!isEditMode && (
            <button
              onClick={handleOpenBrandingEdit}
              className="text-xs text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Branding</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-black">Company Name</span>
            <p className="font-bold text-white text-sm">{websiteSettings.companyName}</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-black">Main Phone</span>
            <p className="font-bold text-emerald-400 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              {contactInfo.mainPhone}
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-black">Primary Email</span>
            <p className="font-bold text-cyan-400 flex items-center gap-1 truncate">
              <Mail className="w-3.5 h-3.5" />
              {contactInfo.email}
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-black">Headquarters</span>
            <p className="font-bold text-slate-200 flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              {contactInfo.address}
            </p>
          </div>
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
              <TrendingUp className="w-3 h-3 mr-0.5" /> Live Accounts
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

        {/* Live System Inquiries */}
        <div 
          onClick={() => setActiveTab('quotes')}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Inquiries</span>
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">
              {bookings.length + quotes.length + diagnostics.length}
            </span>
            <span className="text-[10px] font-bold text-indigo-400">Live Web Submissions</span>
          </div>
        </div>

        {/* Revenue */}
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

      {/* EDITABLE PROJECT GALLERY ITEMS SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-[#00AEEF]" />
              Projects Showcase Gallery
              {isEditMode && <span className="text-amber-400 text-xs font-bold">(Click item to edit inline)</span>}
            </h2>
            <p className="text-xs text-slate-400">Commercial projects and cold room installations fetched directly from Firestore</p>
          </div>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs font-bold text-[#00AEEF] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.slice(0, 3).map(p => (
            <div
              key={p.id}
              onClick={() => isEditMode && handleOpenProjectEdit(p)}
              className={`bg-slate-950 border rounded-2xl overflow-hidden transition-all flex flex-col justify-between ${
                isEditMode 
                  ? 'border-2 border-dashed border-amber-500/80 cursor-pointer hover:border-amber-400 shadow-lg hover:bg-slate-900 relative' 
                  : 'border-slate-800 hover:border-blue-500/40'
              }`}
            >
              {isEditMode && (
                <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full z-10 flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  <span>Edit Record</span>
                </div>
              )}
              <div className="relative h-36 bg-slate-900">
                <img src={p.imageAfter} alt={p.title} className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-950/90 text-cyan-400">
                  {p.category}
                </span>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs leading-snug line-clamp-1">{p.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{p.summary}</p>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-900 pt-2">
                  <span>Client: {p.client}</span>
                  {!isEditMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenProjectEdit(p);
                      }}
                      className="text-blue-400 hover:underline font-bold"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 italic text-xs">
                      No service bookings recorded in database.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => (
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
                  ))
                )}
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
              {recentDiagnostics.length === 0 ? (
                <div className="p-6 text-center text-slate-500 italic text-xs bg-slate-950 rounded-2xl border border-slate-800">
                  No AI diagnostic submissions found.
                </div>
              ) : (
                recentDiagnostics.map(d => (
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
                ))
              )}
            </div>
          </div>

          {/* Audit Logs Quick Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Recent Staff Audit Logs
            </h2>
            <div className="space-y-2">
              {auditLogs.length === 0 ? (
                <p className="p-4 text-center text-slate-500 italic text-xs">No staff audit logs recorded yet.</p>
              ) : (
                auditLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="text-[11px] border-l-2 border-blue-500 pl-3 py-1 space-y-0.5">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-bold">{log.userName}</span>
                      <span className="text-[9px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-400">{log.details}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* EDITABLE SERVICES & TESTIMONIALS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Services Showcase */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              Active Services
              {isEditMode && <span className="text-amber-400 text-xs font-bold">(Click to edit)</span>}
            </h2>
            <button onClick={() => setActiveTab('services')} className="text-xs text-blue-400 hover:underline">
              Manage Services
            </button>
          </div>
          <div className="space-y-2">
            {services.slice(0, 3).map(s => (
              <div
                key={s.id}
                onClick={() => isEditMode && handleOpenServiceEdit(s)}
                className={`p-3 bg-slate-950 border rounded-2xl flex items-center justify-between gap-3 ${
                  isEditMode 
                    ? 'border-2 border-dashed border-amber-500/80 cursor-pointer hover:border-amber-400' 
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <img src={s.image} alt={s.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                  <div className="truncate">
                    <h4 className="font-bold text-white text-xs truncate">{s.title}</h4>
                    <p className="text-[10px] text-slate-400 truncate">{s.category} • {s.startingPrice}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenServiceEdit(s);
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Client Testimonials
              {isEditMode && <span className="text-amber-400 text-xs font-bold">(Click to edit)</span>}
            </h2>
            <button onClick={() => setActiveTab('testimonials')} className="text-xs text-blue-400 hover:underline">
              Manage Testimonials
            </button>
          </div>
          <div className="space-y-2">
            {testimonials.slice(0, 3).map(t => (
              <div
                key={t.id}
                onClick={() => isEditMode && handleOpenTestimonialEdit(t)}
                className={`p-3 bg-slate-950 border rounded-2xl flex items-center justify-between gap-3 ${
                  isEditMode 
                    ? 'border-2 border-dashed border-amber-500/80 cursor-pointer hover:border-amber-400' 
                    : 'border-slate-800'
                }`}
              >
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-xs truncate">{t.name}</h4>
                    <span className="text-[10px] text-slate-400">({t.company})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic mt-0.5">"{t.comment}"</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenTestimonialEdit(t);
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* MODAL: EDIT BRANDING & CONTACT INFO */}
      {editingBranding && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveBranding} className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setEditingBranding(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Edit Company Branding & Contact Info
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">City / Primary Region</label>
                <input
                  type="text"
                  required
                  value={brandingForm.city || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Main Phone</label>
                  <input
                    type="text"
                    required
                    value={brandingForm.mainPhone || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, mainPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Secondary Phone</label>
                  <input
                    type="text"
                    value={brandingForm.secondaryPhone || ''}
                    onChange={(e) => setBrandingForm({ ...brandingForm, secondaryPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Primary Email</label>
                <input
                  type="email"
                  required
                  value={brandingForm.email || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Physical Address / HQ</label>
                <input
                  type="text"
                  required
                  value={brandingForm.address || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Operating Hours</label>
                <input
                  type="text"
                  required
                  value={brandingForm.workingHours || ''}
                  onChange={(e) => setBrandingForm({ ...brandingForm, workingHours: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingBranding(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer hover:bg-amber-400 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save to Firestore</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDIT PROJECT RECORD */}
      {editingProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveProject} className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setEditingProject(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-amber-400" />
              Edit Project Record Inline
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Project Title</label>
                <input
                  type="text"
                  required
                  value={projectForm.title || ''}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Client</label>
                  <input
                    type="text"
                    required
                    value={projectForm.client || ''}
                    onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category</label>
                  <select
                    value={projectForm.category || 'Cold Room'}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Cold Room">Cold Room</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Supermarket">Supermarket</option>
                    <option value="Appliance Repair">Appliance Repair</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Image URL</label>
                <input
                  type="url"
                  required
                  value={projectForm.imageAfter || ''}
                  onChange={(e) => setProjectForm({ ...projectForm, imageAfter: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Summary</label>
                <textarea
                  rows={2}
                  required
                  value={projectForm.summary || ''}
                  onChange={(e) => setProjectForm({ ...projectForm, summary: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer hover:bg-amber-400 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Project</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDIT SERVICE RECORD */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveService} className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setEditingService(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              Edit Service Record Inline
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300">Service Title</label>
                <input
                  type="text"
                  required
                  value={serviceForm.title || ''}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.category || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value as ServiceCategory })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Estimated Price</label>
                  <input
                    type="text"
                    required
                    value={serviceForm.startingPrice || ''}
                    onChange={(e) => setServiceForm({ ...serviceForm, startingPrice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Image URL</label>
                <input
                  type="url"
                  required
                  value={serviceForm.image || ''}
                  onChange={(e) => setServiceForm({ ...serviceForm, image: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  required
                  value={serviceForm.shortDesc || ''}
                  onChange={(e) => setServiceForm({ ...serviceForm, shortDesc: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer hover:bg-amber-400 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Service</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDIT TESTIMONIAL RECORD */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSaveTestimonial} className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setEditingTestimonial(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Edit Testimonial Record Inline
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Client Name</label>
                  <input
                    type="text"
                    required
                    value={testimonialForm.name || ''}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Company / Location</label>
                  <input
                    type="text"
                    required
                    value={testimonialForm.company || ''}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Testimonial Comment</label>
                <textarea
                  rows={3}
                  required
                  value={testimonialForm.comment || ''}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, comment: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingTestimonial(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl cursor-pointer hover:bg-amber-400 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Testimonial</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

