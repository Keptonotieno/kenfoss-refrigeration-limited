import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BookingRecord, BookingStatus } from '../../types';
import { 
  CalendarCheck, 
  Search, 
  UserCheck, 
  Wrench, 
  Download, 
  X, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MapPin, 
  DollarSign,
  Trash2,
  Plus,
  Edit3,
  FileText,
  Printer,
  Image,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const BookingsManagement: React.FC = () => {
  const { 
    bookings, 
    users, 
    addBooking, 
    updateBooking, 
    updateBookingStatus, 
    assignTechnician, 
    cancelBooking, 
    deleteBooking,
    services
  } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Detail / Edit modal state
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<BookingRecord>>({});

  // Create Booking modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    location: '',
    serviceType: services[0]?.title || 'Cold Room Repair & Overhaul',
    date: new Date().toISOString().slice(0, 10),
    timeSlot: 'Morning (8:00 AM - 12:00 PM)',
    notes: '',
    totalAmount: 15000,
    paymentStatus: 'Unpaid' as 'Unpaid' | 'Paid' | 'Invoiced'
  });

  // Assign modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState<BookingRecord | null>(null);
  const [selectedTechId, setSelectedTechId] = useState('');

  // Invoice Modal state
  const [invoiceBooking, setInvoiceBooking] = useState<BookingRecord | null>(null);

  // New photo URL state for repair images
  const [newBeforeImage, setNewBeforeImage] = useState('');
  const [newAfterImage, setNewAfterImage] = useState('');

  const technicians = users.filter(u => u.role === 'Technician' || u.role === 'Super Administrator');

  // Metrics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter(b => b.status === 'New').length;
  const inProgressCount = bookings.filter(b => b.status === 'In Progress' || b.status === 'Assigned').length;
  const completedCount = bookings.filter(b => b.status === 'Completed').length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      b.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenAssignModal = (b: BookingRecord) => {
    setTargetBooking(b);
    setSelectedTechId(b.assignedTechnicianId || '');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = () => {
    if (targetBooking && selectedTechId) {
      const tech = users.find(u => u.id === selectedTechId);
      if (tech) {
        assignTechnician(targetBooking.id, tech.id, tech.name);
      }
    }
    setIsAssignModalOpen(false);
    setTargetBooking(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.fullName || !createForm.phone) return;
    
    const newBk = addBooking({
      fullName: createForm.fullName,
      phone: createForm.phone,
      email: createForm.email || 'client@kenfoss.co.ke',
      location: createForm.location || 'Nairobi',
      serviceType: createForm.serviceType,
      date: createForm.date,
      timeSlot: createForm.timeSlot,
      notes: createForm.notes,
      totalAmount: Number(createForm.totalAmount) || 0,
      paymentStatus: createForm.paymentStatus
    });

    setIsCreateModalOpen(false);
    setCreateForm({
      fullName: '',
      phone: '',
      email: '',
      location: '',
      serviceType: services[0]?.title || 'Cold Room Repair & Overhaul',
      date: new Date().toISOString().slice(0, 10),
      timeSlot: 'Morning (8:00 AM - 12:00 PM)',
      notes: '',
      totalAmount: 15000,
      paymentStatus: 'Unpaid'
    });
    setSelectedBooking(newBk);
  };

  const handleOpenDetail = (b: BookingRecord) => {
    setSelectedBooking(b);
    setEditForm(b);
    setIsEditing(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBooking && editForm) {
      const updated = { ...selectedBooking, ...editForm } as BookingRecord;
      updateBooking(updated);
      setSelectedBooking(updated);
      setIsEditing(false);
    }
  };

  const handleAddBeforePhoto = () => {
    if (newBeforeImage.trim() && selectedBooking) {
      const updatedImages = [...(editForm.beforeImages || selectedBooking.beforeImages || []), newBeforeImage.trim()];
      setEditForm({ ...editForm, beforeImages: updatedImages });
      setNewBeforeImage('');
    }
  };

  const handleAddAfterPhoto = () => {
    if (newAfterImage.trim() && selectedBooking) {
      const updatedImages = [...(editForm.afterImages || selectedBooking.afterImages || []), newAfterImage.trim()];
      setEditForm({ ...editForm, afterImages: updatedImages });
      setNewAfterImage('');
    }
  };

  const handleMarkCompleted = (b: BookingRecord) => {
    updateBookingStatus(b.id, 'Completed');
    if (selectedBooking && selectedBooking.id === b.id) {
      setSelectedBooking({ ...selectedBooking, status: 'Completed' });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Booking Ref', 'Customer Name', 'Phone', 'Email', 'Location', 'Service Type', 'Date', 'Status', 'Technician', 'Total Amount KSh'];
    const rows = filteredBookings.map(b => [
      b.bookingRef,
      `"${b.fullName}"`,
      b.phone,
      b.email,
      `"${b.location}"`,
      `"${b.serviceType}"`,
      b.date,
      b.status,
      `"${b.assignedTechnicianName || 'Unassigned'}"`,
      b.totalAmount || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kenfoss_bookings_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#0057B8]" />
            Live Service Bookings & Dispatch Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time synchronization with Customer Portal, Technician Apps, and Admin Dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-1.5 transition-transform hover:scale-105 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Booking</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Bookings</span>
          <p className="text-2xl font-black text-white mt-1">{totalCount}</p>
        </div>
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-4">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">Pending / New</span>
          <p className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4">
          <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider block">In Progress</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">Completed Jobs</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{completedCount}</p>
        </div>
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-4 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider block">Invoiced Total</span>
          <p className="text-xl font-black text-blue-300 mt-1">KSh {totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search ref #, client, phone, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {['all', 'New', 'Assigned', 'In Progress', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#0057B8] text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st === 'all' ? 'All Bookings' : st}
            </button>
          ))}
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4">Ref #</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Service & Scheduled Date</th>
                <th className="p-4">Assigned Technician</th>
                <th className="p-4">Status</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                    No bookings found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    
                    {/* Ref # */}
                    <td className="p-4">
                      <span className="font-mono font-black text-blue-400 text-sm block">{b.bookingRef}</span>
                      <span className="text-[10px] text-slate-500">Rec: {new Date(b.createdAt).toLocaleDateString()}</span>
                    </td>

                    {/* Customer */}
                    <td className="p-4 space-y-0.5">
                      <div className="font-bold text-white text-sm">{b.fullName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" /> {b.phone}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {b.location}
                      </div>
                    </td>

                    {/* Service & Date */}
                    <td className="p-4 space-y-1 max-w-[200px]">
                      <span className="font-bold text-slate-200 block truncate">{b.serviceType}</span>
                      <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{b.date} ({b.timeSlot || 'Anytime'})</span>
                      </div>
                    </td>

                    {/* Assigned Technician */}
                    <td className="p-4">
                      {b.assignedTechnicianName ? (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white flex items-center gap-1">
                            <Wrench className="w-3.5 h-3.5 text-blue-400" />
                            {b.assignedTechnicianName}
                          </span>
                          <button
                            onClick={() => handleOpenAssignModal(b)}
                            className="text-[10px] text-blue-400 hover:underline block cursor-pointer"
                          >
                            Reassign Staff
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenAssignModal(b)}
                          className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assign Technician</span>
                        </button>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <select
                        value={b.status}
                        onChange={(e) => updateBookingStatus(b.id, e.target.value as BookingStatus)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold focus:outline-none cursor-pointer ${
                          b.status === 'New' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          b.status === 'Assigned' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                          b.status === 'In Progress' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                          b.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Amount */}
                    <td className="p-4 font-bold text-white">
                      KSh {(b.totalAmount || 0).toLocaleString()}
                      <span className={`block text-[10px] font-normal ${b.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {b.paymentStatus || 'Unpaid'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-1.5">
                      {b.status !== 'Completed' && (
                        <button
                          onClick={() => handleMarkCompleted(b)}
                          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs cursor-pointer inline-flex items-center"
                          title="Mark Completed"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenDetail(b)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-cyan-400" />
                        <span>Manage</span>
                      </button>
                      <button
                        onClick={() => setInvoiceBooking(b)}
                        className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs cursor-pointer inline-flex items-center"
                        title="Generate Invoice"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete booking ${b.bookingRef}?`)) {
                            deleteBooking(b.id);
                          }
                        }}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs cursor-pointer inline-flex items-center"
                        title="Delete Booking"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW BOOKING MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleCreateSubmit} className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#0057B8]" />
              Create Live Booking Record
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    placeholder="e.g. David Mutua"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+254 700 000 000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="client@gmail.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Location / Town *</label>
                  <input
                    type="text"
                    required
                    value={createForm.location}
                    onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })}
                    placeholder="e.g. Westlands, Nairobi"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Service Required</label>
                <select
                  value={createForm.serviceType}
                  onChange={(e) => setCreateForm({ ...createForm, serviceType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                >
                  <option value="Commercial Cold Room Overhaul">Commercial Cold Room Overhaul</option>
                  <option value="Refrigerator & Freezer Maintenance">Refrigerator & Freezer Maintenance</option>
                  <option value="HVAC Air Conditioning Service">HVAC Air Conditioning Service</option>
                  <option value="Supermarket Display Refrigerator Servicing">Supermarket Display Refrigerator Servicing</option>
                  <option value="Industrial Compressor & Chiller Repair">Industrial Compressor & Chiller Repair</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Scheduled Visit Date</label>
                  <input
                    type="date"
                    required
                    value={createForm.date}
                    onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Time Slot</label>
                  <select
                    value={createForm.timeSlot}
                    onChange={(e) => setCreateForm({ ...createForm, timeSlot: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                  >
                    <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
                    <option value="Afternoon (1:00 PM - 5:00 PM)">Afternoon (1:00 PM - 5:00 PM)</option>
                    <option value="Emergency Priority Slot">Emergency Priority Slot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Estimated Amount (KSh)</label>
                  <input
                    type="number"
                    value={createForm.totalAmount}
                    onChange={(e) => setCreateForm({ ...createForm, totalAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Payment Status</label>
                  <select
                    value={createForm.paymentStatus}
                    onChange={(e) => setCreateForm({ ...createForm, paymentStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Paid">Paid</option>
                    <option value="Invoiced">Invoiced</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Customer Request Notes</label>
                <textarea
                  rows={2}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Additional details regarding equipment fault..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0057B8] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Submit Booking to Firestore
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DETAIL / FULL EDIT MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative my-8">
            <button
              onClick={() => {
                setSelectedBooking(null);
                setIsEditing(false);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-black text-blue-400">{selectedBooking.bookingRef}</span>
                <h2 className="text-lg font-black text-white">{selectedBooking.serviceType}</h2>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Booking Fields'}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300">Customer Full Name</label>
                    <input
                      type="text"
                      value={editForm.fullName || ''}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300">Phone</label>
                    <input
                      type="text"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300">Scheduled Date</label>
                    <input
                      type="date"
                      value={editForm.date || ''}
                      onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300">Job Status</label>
                    <select
                      value={editForm.status || 'New'}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"
                    >
                      <option value="New">New</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300">Total Amount KSh</label>
                    <input
                      type="number"
                      value={editForm.totalAmount || 0}
                      onChange={(e) => setEditForm({ ...editForm, totalAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300">Payment Status</label>
                    <select
                      value={editForm.paymentStatus || 'Unpaid'}
                      onChange={(e) => setEditForm({ ...editForm, paymentStatus: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Invoiced">Invoiced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300">Technician Repair Report & Notes</label>
                  <textarea
                    rows={2}
                    value={editForm.technicianNotes || ''}
                    onChange={(e) => setEditForm({ ...editForm, technicianNotes: e.target.value })}
                    placeholder="Enter technical findings, replacement parts used, pressure readings..."
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white mt-1"
                  />
                </div>

                {/* Repair Photo Attachments */}
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-cyan-400" />
                    Upload Repair Work Photos
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400">Before Photo URL</span>
                      <div className="flex gap-1">
                        <input
                          type="url"
                          value={newBeforeImage}
                          onChange={(e) => setNewBeforeImage(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddBeforePhoto}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400">After Photo URL</span>
                      <div className="flex gap-1">
                        <input
                          type="url"
                          value={newAfterImage}
                          onChange={(e) => setNewAfterImage(e.target.value)}
                          placeholder="https://..."
                          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] text-white"
                        />
                        <button
                          type="button"
                          onClick={handleAddAfterPhoto}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 text-slate-950 font-extrabold rounded-xl"
                  >
                    Save All Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase font-extrabold text-[10px]">Client Name</span>
                    <p className="font-bold text-white text-sm mt-0.5">{selectedBooking.fullName}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-extrabold text-[10px]">Phone Number</span>
                    <p className="font-bold text-white text-sm mt-0.5">{selectedBooking.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-extrabold text-[10px]">Email</span>
                    <p className="text-slate-300 mt-0.5">{selectedBooking.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-extrabold text-[10px]">Location</span>
                    <p className="text-slate-300 mt-0.5">{selectedBooking.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 uppercase font-extrabold text-[10px]">Assigned Technician</span>
                    <p className="font-bold text-cyan-400 mt-0.5">{selectedBooking.assignedTechnicianName || 'Unassigned'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-extrabold text-[10px]">Estimated Total</span>
                    <p className="font-bold text-emerald-400 mt-0.5">KSh {(selectedBooking.totalAmount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase font-extrabold text-[10px]">Payment Status</span>
                    <p className="font-bold text-amber-400 mt-0.5">{selectedBooking.paymentStatus || 'Unpaid'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400">Customer Notes</h4>
                  <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                    {selectedBooking.notes || 'No specific notes provided.'}
                  </p>
                </div>

                {selectedBooking.technicianNotes && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold uppercase text-blue-400 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5" /> Technician Repair Report
                    </h4>
                    <p className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl text-xs text-blue-200">
                      {selectedBooking.technicianNotes}
                    </p>
                  </div>
                )}

                {/* Repair Photos */}
                {((selectedBooking.beforeImages && selectedBooking.beforeImages.length > 0) || (selectedBooking.afterImages && selectedBooking.afterImages.length > 0)) && (
                  <div className="space-y-2 border-t border-slate-800 pt-3">
                    <h4 className="text-xs font-bold text-slate-300">Attached Repair Photos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedBooking.beforeImages?.map((url, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-800 h-24">
                          <img src={url} alt="Before repair" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-slate-950/90 text-rose-400 px-1.5 py-0.5 text-[9px] font-bold rounded">Before</span>
                        </div>
                      ))}
                      {selectedBooking.afterImages?.map((url, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-800 h-24">
                          <img src={url} alt="After repair" className="w-full h-full object-cover" />
                          <span className="absolute bottom-1 left-1 bg-slate-950/90 text-emerald-400 px-1.5 py-0.5 text-[9px] font-bold rounded">After</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
                  <div className="flex gap-2">
                    {selectedBooking.status !== 'Completed' && (
                      <button
                        onClick={() => handleMarkCompleted(selectedBooking)}
                        className="px-3 py-2 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Mark Job Completed</span>
                      </button>
                    )}
                    <button
                      onClick={() => setInvoiceBooking(selectedBooking)}
                      className="px-3 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Generate Invoice</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        cancelBooking(selectedBooking.id);
                        setSelectedBooking(null);
                      }}
                      className="px-3 py-2 bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                    <button
                      onClick={() => setSelectedBooking(null)}
                      className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ASSIGN TECHNICIAN MODAL */}
      {isAssignModalOpen && targetBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">
              Assign EPRA Certified Technician
            </h3>
            <p className="text-xs text-slate-400">
              Select an available technician for dispatch to <strong className="text-white">{targetBooking.fullName}</strong> in {targetBooking.location}.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-300">Select Technician</label>
              <select
                value={selectedTechId}
                onChange={(e) => setSelectedTechId(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#0057B8]"
              >
                <option value="">-- Choose Staff Member --</option>
                {technicians.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.role}) - {t.phone}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAssign}
                disabled={!selectedTechId}
                className="px-4 py-2 bg-[#0057B8] hover:bg-blue-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE PREVIEW MODAL */}
      {invoiceBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-3xl max-w-xl w-full p-8 space-y-6 shadow-2xl relative my-8 font-sans">
            <button
              onClick={() => setInvoiceBooking(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b pb-4 border-slate-200">
              <div>
                <h2 className="text-2xl font-black text-[#002B5B]">KENFOSS REFRIGERATION</h2>
                <p className="text-xs text-slate-500 font-semibold">Industrial Area, Off Enterprise Road, Nairobi</p>
                <p className="text-xs text-slate-500">Tel: +254 720 000 000 | EPRA License: EPRA/REF/2026</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">INVOICE</span>
                <span className="text-base font-black font-mono text-blue-600">#INV-{invoiceBooking.bookingRef}</span>
                <p className="text-xs text-slate-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Client & Service Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Billed To</span>
                <p className="font-bold text-slate-900 text-sm">{invoiceBooking.fullName}</p>
                <p className="text-slate-600">{invoiceBooking.phone}</p>
                <p className="text-slate-600">{invoiceBooking.location}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Service Reference</span>
                <p className="font-bold text-slate-900">{invoiceBooking.serviceType}</p>
                <p className="text-slate-600">Assigned Tech: {invoiceBooking.assignedTechnicianName || 'KenFoss Engineer'}</p>
                <p className="text-slate-600">Visit Date: {invoiceBooking.date}</p>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 uppercase text-[10px] font-bold text-slate-600">
                <tr>
                  <th className="p-3 rounded-l-xl">Description</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right rounded-r-xl">Amount (KSh)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-3">
                    <span className="font-bold text-slate-900">{invoiceBooking.serviceType}</span>
                    <p className="text-[11px] text-slate-500">{invoiceBooking.notes || 'Standard labor & diagnostic inspection'}</p>
                  </td>
                  <td className="p-3 text-right">1</td>
                  <td className="p-3 text-right font-bold text-slate-900">
                    {(invoiceBooking.totalAmount || 15000).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t pt-4 space-y-1.5 text-xs text-right">
              <div className="flex justify-between font-bold text-slate-600">
                <span>Subtotal:</span>
                <span>KSh {(invoiceBooking.totalAmount || 15000).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>VAT (16% Included):</span>
                <span>KSh {Math.round((invoiceBooking.totalAmount || 15000) * 0.16).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due:</span>
                <span className="text-blue-600">KSh {(invoiceBooking.totalAmount || 15000).toLocaleString()}</span>
              </div>
            </div>

            {/* Footer / Print */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="text-[11px] text-slate-500">
                <span>MPESA Paybill: <strong>522522</strong> | Acc: <strong>{invoiceBooking.bookingRef}</strong></span>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
