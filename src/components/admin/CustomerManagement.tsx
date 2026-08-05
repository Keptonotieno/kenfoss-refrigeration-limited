import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CustomerRecord, BookingRecord, QuoteRecord, CustomerCommunicationLog } from '../../types';
import { 
  Users, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  DollarSign, 
  History, 
  X, 
  Edit, 
  Save,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Filter,
  ArrowUpDown,
  Copy,
  ExternalLink,
  FileText,
  ShieldCheck,
  RefreshCw,
  Briefcase,
  Layers,
  TrendingUp,
  Loader2,
  UserCheck,
  Building,
  MessageSquare,
  Send,
  Clock,
  Activity,
  PhoneCall,
  MessageCircle,
  Radio
} from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { 
    customers, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    addCustomerCommunication, 
    bookings, 
    quotes, 
    contactMessages, 
    diagnostics, 
    currentUser 
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Individual' | 'Commercial' | 'Corporate'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'spent' | 'jobs'>('newest');

  // Detail Modal State
  const [viewingCustomer, setViewingCustomer] = useState<CustomerRecord | null>(null);

  // Communication Log State
  const [commType, setCommType] = useState<'Call' | 'Email' | 'WhatsApp' | 'Site Visit' | 'Note'>('Call');
  const [commSummary, setCommSummary] = useState('');
  const [isLoggingComm, setIsLoggingComm] = useState(false);
  const [commError, setCommError] = useState<string | null>(null);

  // New / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    email: string;
    location: string;
    address: string;
    customerType: 'Individual' | 'Commercial' | 'Corporate';
    totalSpent: number;
    serviceCount: number;
    notes: string;
  }>({
    name: '',
    phone: '',
    email: '',
    location: 'Nairobi',
    address: '',
    customerType: 'Individual',
    totalSpent: 0,
    serviceCount: 1,
    notes: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [deletingCustomer, setDeletingCustomer] = useState<CustomerRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copy Feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(`${label}: ${text}`);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Log Communication Handler
  const handleAddCommunication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingCustomer) return;
    if (!commSummary.trim()) {
      setCommError('Please enter a communication summary or interaction note.');
      return;
    }

    setIsLoggingComm(true);
    setCommError(null);

    try {
      const res = await addCustomerCommunication(viewingCustomer.id, {
        type: commType,
        summary: commSummary.trim(),
        author: currentUser?.name || 'Staff'
      });

      if (!res.success) throw new Error(res.error || 'Failed to record communication log.');

      showToast(`${commType} interaction logged for ${viewingCustomer.name}!`);
      
      // Update local viewing Customer object for instant reactivity
      setViewingCustomer(prev => prev ? {
        ...prev,
        communications: [
          {
            id: `comm-${Date.now()}`,
            date: new Date().toISOString(),
            type: commType,
            summary: commSummary.trim(),
            author: currentUser?.name || 'Staff'
          },
          ...(prev.communications || [])
        ]
      } : null);

      setCommSummary('');
    } catch (err: any) {
      console.error('Add communication error:', err);
      setCommError(err.message || 'Failed to log communication.');
    } finally {
      setIsLoggingComm(false);
    }
  };

  // Dynamic Calculations per customer
  const getCustomerMetrics = (c: CustomerRecord) => {
    const cleanEmail = (c.email || '').toLowerCase().trim();
    const cleanPhone = (c.phone || '').trim();

    const clientBookings = (bookings || []).filter(b => 
      (cleanPhone && b.phone && b.phone.trim() === cleanPhone) ||
      (cleanEmail && b.email && b.email.toLowerCase().trim() === cleanEmail)
    );

    const clientQuotes = (quotes || []).filter(q => 
      (cleanPhone && q.phone && q.phone.trim() === cleanPhone) ||
      (cleanEmail && q.email && q.email.toLowerCase().trim() === cleanEmail)
    );

    const clientMessages = (contactMessages || []).filter(m => 
      (cleanPhone && m.phone && m.phone.trim() === cleanPhone) ||
      (cleanEmail && m.email && m.email.toLowerCase().trim() === cleanEmail)
    );

    const jobsCount = Math.max(clientBookings.length, c.serviceCount || 0);

    const bookingSpent = clientBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const quoteSpent = clientQuotes
      .filter(q => q.status === 'Approved')
      .reduce((sum, q) => sum + (q.quoteAmount || 0), 0);

    const totalSpent = (c.totalSpent && c.totalSpent > 0) 
      ? Math.max(c.totalSpent, bookingSpent + quoteSpent)
      : (bookingSpent + quoteSpent);

    // Build timeline items combining all touchpoints
    const timelineItems: Array<{
      id: string;
      date: string;
      category: 'Booking' | 'Quote' | 'Message' | 'Communication';
      title: string;
      badge?: string;
      details: string;
      author?: string;
    }> = [];

    clientBookings.forEach(b => {
      timelineItems.push({
        id: `bk-${b.id}`,
        date: b.createdAt || b.date,
        category: 'Booking',
        title: `Service Booking: ${b.serviceType}`,
        badge: b.status,
        details: `Ref: ${b.bookingRef} • Location: ${b.location}${b.totalAmount ? ` • Amount: KSh ${b.totalAmount.toLocaleString()}` : ''}`
      });
    });

    clientQuotes.forEach(q => {
      timelineItems.push({
        id: `rfq-${q.id}`,
        date: q.createdAt,
        category: 'Quote',
        title: `Commercial RFQ: ${q.projectType}`,
        badge: q.status,
        details: `Ref: ${q.rfqRef} • ${q.companyName || q.contactPerson}${q.quoteAmount ? ` • Amount: KSh ${q.quoteAmount.toLocaleString()}` : ''}`
      });
    });

    clientMessages.forEach(m => {
      timelineItems.push({
        id: `msg-${m.id}`,
        date: m.createdAt,
        category: 'Message',
        title: `Contact Form Inquiry: ${m.subject}`,
        badge: m.status,
        details: m.message
      });
    });

    (c.communications || []).forEach(comm => {
      timelineItems.push({
        id: `comm-${comm.id}`,
        date: comm.date,
        category: 'Communication',
        title: `${comm.type} Recorded`,
        badge: comm.type,
        details: comm.summary,
        author: comm.author
      });
    });

    timelineItems.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      clientBookings,
      clientQuotes,
      clientMessages,
      jobsCount,
      totalSpent,
      timelineItems
    };
  };

  // High-Level Aggregate Stats
  const aggregateStats = useMemo(() => {
    const totalClients = customers.length;
    const corporateCount = customers.filter(c => c.customerType === 'Corporate' || c.customerType === 'Commercial').length;
    const individualCount = customers.filter(c => c.customerType === 'Individual').length;
    
    let totalLifetimeValue = 0;
    let totalJobsCompleted = 0;

    customers.forEach(c => {
      const metrics = getCustomerMetrics(c);
      totalLifetimeValue += metrics.totalSpent;
      totalJobsCompleted += metrics.jobsCount;
    });

    return {
      totalClients,
      corporateCount,
      individualCount,
      totalLifetimeValue,
      totalJobsCompleted
    };
  }, [customers, bookings, quotes]);

  // Filtering & Sorting
  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => {
        const matchesCategory = selectedCategory === 'All' || c.customerType === selectedCategory;
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch = !q || (
          (c.name || '').toLowerCase().includes(q) ||
          (c.phone || '').toLowerCase().includes(q) ||
          (c.email || '').toLowerCase().includes(q) ||
          (c.location || '').toLowerCase().includes(q) ||
          (c.address && c.address.toLowerCase().includes(q)) ||
          (c.notes && c.notes.toLowerCase().includes(q))
        );
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'spent') {
          return getCustomerMetrics(b).totalSpent - getCustomerMetrics(a).totalSpent;
        }
        if (sortBy === 'jobs') {
          return getCustomerMetrics(b).jobsCount - getCustomerMetrics(a).jobsCount;
        }
        // default 'newest'
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [customers, searchTerm, selectedCategory, sortBy, bookings, quotes]);

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) {
      errors.name = 'Client name or company title is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Client name must be at least 2 characters.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (formData.phone.trim().length < 7) {
      errors.phone = 'Please enter a valid phone number.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address format.';
    }

    if (!formData.location.trim()) {
      errors.location = 'Location or city is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenNewModal = () => {
    setEditMode(false);
    setEditingCustomerId(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      location: 'Nairobi',
      address: '',
      customerType: 'Individual',
      totalSpent: 0,
      serviceCount: 1,
      notes: ''
    });
    setFormErrors({});
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: CustomerRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditMode(true);
    setEditingCustomerId(c.id);
    setFormData({
      name: c.name,
      phone: c.phone,
      email: c.email,
      location: c.location,
      address: c.address || '',
      customerType: c.customerType || 'Individual',
      totalSpent: c.totalSpent || 0,
      serviceCount: c.serviceCount || 1,
      notes: c.notes || ''
    });
    setFormErrors({});
    setSaveError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      if (editMode && editingCustomerId) {
        const target = customers.find(c => c.id === editingCustomerId);
        if (!target) throw new Error('Customer record not found');
        const res = await updateCustomer({
          ...target,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          location: formData.location,
          address: formData.address,
          customerType: formData.customerType,
          totalSpent: formData.totalSpent,
          serviceCount: formData.serviceCount,
          notes: formData.notes
        });
        if (!res.success) throw new Error(res.error || 'Failed to save changes');
        showToast(`Client profile "${formData.name}" updated successfully!`);
      } else {
        const res = await addCustomer({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          location: formData.location,
          address: formData.address,
          customerType: formData.customerType,
          totalSpent: formData.totalSpent,
          serviceCount: formData.serviceCount,
          notes: formData.notes
        });
        if (!res.success) throw new Error(res.error || 'Failed to create customer');
        showToast(`Client profile "${formData.name}" created in database!`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Save customer error:", err);
      setSaveError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer) return;
    setIsDeleting(true);
    try {
      const res = await deleteCustomer(deletingCustomer.id);
      if (!res.success) throw new Error(res.error || 'Failed to delete customer');
      showToast(`Client profile "${deletingCustomer.name}" permanently deleted.`);
      if (viewingCustomer?.id === deletingCustomer.id) {
        setViewingCustomer(null);
      }
      setDeletingCustomer(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete client record.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Copy Notification */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2">
          <Copy className="w-4 h-4" />
          <span>{copiedText} copied to clipboard!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Customer CRM & Directory
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time client management, corporate SLA records, service order histories, and financial metrics.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="relative z-10 px-5 py-3 bg-[#0057B8] hover:bg-blue-600 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Total Clients</span>
            <span className="text-xl font-black text-white">{aggregateStats.totalClients}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Corporate & SLA</span>
            <span className="text-xl font-black text-purple-300">{aggregateStats.corporateCount}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center gap-3">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Service Jobs</span>
            <span className="text-xl font-black text-indigo-300">{aggregateStats.totalJobsCompleted}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider block">Lifetime Value</span>
            <span className="text-lg font-mono font-black text-emerald-400 truncate">
              KSh {aggregateStats.totalLifetimeValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, phone, email, location, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="name">Client Name (A - Z)</option>
              <option value="spent">Highest Lifetime Value</option>
              <option value="jobs">Most Service Jobs</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <span className="text-xs text-slate-400 font-bold flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {(['All', 'Individual', 'Commercial', 'Corporate'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat === 'All' ? 'All Clients' : `${cat} Clients`}
            </button>
          ))}
        </div>
      </div>

      {/* CUSTOMERS GRID / LIST */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <Users className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold text-white">
              {customers.length === 0 ? 'No Client Profiles in Database' : `No clients match "${searchTerm}"`}
            </h3>
            <p className="text-xs text-slate-400">
              {customers.length === 0
                ? 'Your Customer CRM directory is currently empty. Click "Add New Client" above to create your first client record, or receive profiles automatically when clients book services on the website.'
                : 'Try adjusting your search terms or clearing the category filter.'}
            </p>
          </div>
          {customers.length === 0 ? (
            <button
              onClick={handleOpenNewModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl inline-flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Client</span>
            </button>
          ) : (
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all"
            >
              Clear Search Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCustomers.map((c) => {
            const metrics = getCustomerMetrics(c);

            return (
              <div
                key={c.id}
                onClick={() => setViewingCustomer(c)}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-900/10 transition-all cursor-pointer group"
              >
                <div className="space-y-3">
                  {/* Top Row: Name & Category Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 pr-2">
                      <h3 className="font-extrabold text-white text-base group-hover:text-blue-400 transition-colors line-clamp-1">
                        {c.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider inline-block ${
                        c.customerType === 'Corporate' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        c.customerType === 'Commercial' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {c.customerType} Client
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setViewingCustomer(c)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors"
                        title="View Full History & Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleOpenEditModal(c, e)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit Client Profile"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingCustomer(c);
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/20 transition-colors"
                        title="Delete Client Profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <a 
                          href={`tel:${c.phone}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline hover:text-blue-300 truncate"
                        >
                          {c.phone}
                        </a>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(c.phone, 'Phone'); }}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                        title="Copy Phone"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <a 
                          href={`mailto:${c.email}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="hover:underline hover:text-blue-300 truncate"
                        >
                          {c.email}
                        </a>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(c.email, 'Email'); }}
                        className="text-slate-500 hover:text-slate-300 p-0.5"
                        title="Copy Email"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{c.location} {c.address ? `• ${c.address}` : ''}</span>
                    </div>
                  </div>

                  {/* Account Notes */}
                  {c.notes && (
                    <p className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/60 text-[11px] text-slate-400 italic line-clamp-2">
                      "{c.notes}"
                    </p>
                  )}
                </div>

                {/* Bottom Row: Metrics */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-extrabold block tracking-wider">Services Logged</span>
                    <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                      <History className="w-3.5 h-3.5 text-blue-400" />
                      {metrics.jobsCount} {metrics.jobsCount === 1 ? 'Job' : 'Jobs'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-extrabold block tracking-wider">Lifetime Value</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
                      KSh {metrics.totalSpent.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL & HISTORY MODAL */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative my-8">
            
            {/* Close Button */}
            <button
              onClick={() => setViewingCustomer(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-blue-400 shrink-0">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1 pr-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black text-white">{viewingCustomer.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    viewingCustomer.customerType === 'Corporate' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                    viewingCustomer.customerType === 'Commercial' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {viewingCustomer.customerType} Client
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Registered Profile • Customer ID: <span className="font-mono text-slate-300">{viewingCustomer.id}</span>
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            {(() => {
              const metrics = getCustomerMetrics(viewingCustomer);
              return (
                <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Total Spent</span>
                    <span className="text-base font-mono font-bold text-emerald-400 block mt-0.5">
                      KSh {metrics.totalSpent.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Service Bookings</span>
                    <span className="text-base font-bold text-white block mt-0.5">
                      {metrics.clientBookings.length} Logged
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Commercial RFQs</span>
                    <span className="text-base font-bold text-purple-400 block mt-0.5">
                      {metrics.clientQuotes.length} Submitted
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Contact Details & SLA Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider">Contact & Location</h4>
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{viewingCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{viewingCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{viewingCustomer.location} {viewingCustomer.address ? `(${viewingCustomer.address})` : ''}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider">Account Notes / SLA Requirements</h4>
                <p className="text-slate-400 italic leading-relaxed">
                  {viewingCustomer.notes || 'No custom account notes or SLA specs specified.'}
                </p>
              </div>
            </div>

            {/* Log Communication Form */}
            <form onSubmit={handleAddCommunication} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-xs text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Log Client Communication & Interaction
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Syncs to Firebase</span>
              </div>

              {commError && (
                <p className="text-[11px] text-rose-400 font-semibold bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">
                  {commError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-1">
                  <select
                    value={commType}
                    onChange={(e) => setCommType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Call">📞 Phone Call</option>
                    <option value="Email">✉️ Email</option>
                    <option value="WhatsApp">💬 WhatsApp</option>
                    <option value="Site Visit">🚚 Site Visit</option>
                    <option value="Note">📝 Internal Note</option>
                  </select>
                </div>

                <div className="sm:col-span-3 flex gap-2">
                  <input
                    type="text"
                    value={commSummary}
                    onChange={(e) => setCommSummary(e.target.value)}
                    placeholder="e.g. Discussed cold room maintenance schedule for Q3..."
                    className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoggingComm || !commSummary.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isLoggingComm ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Log</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Unified 360-degree History Timeline */}
            {(() => {
              const { timelineItems } = getCustomerMetrics(viewingCustomer);

              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-400" />
                      Complete Service History & Communication Timeline
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {timelineItems.length} Total Events
                    </span>
                  </div>

                  {timelineItems.length === 0 ? (
                    <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
                      No service bookings, commercial quote requests, or recorded communications linked to this client yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                      {timelineItems.map((item) => (
                        <div key={item.id} className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1.5 hover:border-slate-700 transition-colors">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {item.category === 'Booking' && <Briefcase className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                              {item.category === 'Quote' && <Building2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />}
                              {item.category === 'Message' && <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                              {item.category === 'Communication' && <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              <span className="font-extrabold text-white">{item.title}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              {item.badge && (
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                  item.category === 'Booking' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                  item.category === 'Quote' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                                  item.category === 'Communication' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                                  'bg-slate-800 text-slate-300'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          <p className="text-slate-300 text-[11px] leading-relaxed pl-5">
                            {item.details}
                          </p>

                          {item.author && (
                            <p className="text-[9px] text-slate-500 italic pl-5">
                              Logged by: {item.author}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  const target = viewingCustomer;
                  setViewingCustomer(null);
                  handleOpenEditModal(target);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Client Profile</span>
              </button>

              <button
                onClick={() => setViewingCustomer(null)}
                className="px-5 py-2 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CREATE / EDIT CLIENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form 
            onSubmit={handleSubmitForm} 
            className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-8"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editMode ? 'Edit Customer Profile' : 'Add New Customer Profile'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editMode ? 'Update client details in real-time database.' : 'Enter client contact details and SLA parameters.'}
                </p>
              </div>
            </div>

            {saveError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="space-y-3.5">
              
              {/* Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Client Name / Business Title <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. FreshHarvest Kenya Ltd or Sarah Mutua"
                    className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 ${
                      formErrors.name ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {formErrors.name && <p className="text-[10px] text-rose-400 font-semibold">{formErrors.name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Client Category</label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +254 722 000 000"
                    className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 ${
                      formErrors.phone ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {formErrors.phone && <p className="text-[10px] text-rose-400 font-semibold">{formErrors.phone}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Email Address <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. client@company.co.ke"
                    className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 ${
                      formErrors.email ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {formErrors.email && <p className="text-[10px] text-rose-400 font-semibold">{formErrors.email}</p>}
                </div>
              </div>

              {/* Location & Physical Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Location / City <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Westlands, Nairobi"
                    className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 ${
                      formErrors.location ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {formErrors.location && <p className="text-[10px] text-rose-400 font-semibold">{formErrors.location}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Physical Address / Building</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Enterprise Rd, Unit 4B"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Financial & Jobs Override */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/50 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Lifetime Value (KSh)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.totalSpent}
                    onChange={(e) => setFormData({ ...formData, totalSpent: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Service Jobs Count</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.serviceCount}
                    onChange={(e) => setFormData({ ...formData, serviceCount: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Internal SLA Notes / Account Requirements</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Key agricultural export account. Requires 2-hour response SLA for cold room emergencies."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center space-x-2 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-blue-900/30"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editMode ? 'Save Changes' : 'Create Client'}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">Delete Client Profile?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white">{deletingCustomer.name}</strong> from the CRM database? This will remove their record permanently.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingCustomer(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-md shadow-rose-900/30"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete Record</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
