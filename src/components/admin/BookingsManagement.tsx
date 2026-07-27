import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { BookingRecord, BookingStatus } from '../../types';
import { 
  CalendarCheck, 
  Search, 
  Filter, 
  UserCheck, 
  Wrench, 
  Download, 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  DollarSign
} from 'lucide-react';

export const BookingsManagement: React.FC = () => {
  const { bookings, users, updateBookingStatus, assignTechnician, cancelBooking } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  // Assign modal state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [targetBooking, setTargetBooking] = useState<BookingRecord | null>(null);
  const [selectedTechId, setSelectedTechId] = useState('');

  const technicians = users.filter(u => u.role === 'Technician' || u.role === 'Super Administrator');

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      b.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
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
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-[#0057B8]" />
            Service Booking & Dispatch Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track customer requests, assign EPRA-certified technicians, and manage job progress.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Bookings CSV</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search ref #, client, phone, service..."
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
                <th className="p-4">Service & Date</th>
                <th className="p-4">Assigned Technician</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs">
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
                            className="text-[10px] text-blue-400 hover:underline block"
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

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Details
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-[#00AEEF]">
                {selectedBooking.bookingRef}
              </span>
              <h2 className="text-2xl font-black text-white">{selectedBooking.serviceType}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
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

            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase text-slate-400">Customer Issue Notes</h4>
              <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                {selectedBooking.notes || 'No specific notes provided.'}
              </p>
            </div>

            {selectedBooking.technicianNotes && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase text-blue-400 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5" /> Technician Repair Report
                </h4>
                <p className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl text-xs text-blue-200 leading-relaxed">
                  {selectedBooking.technicianNotes}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  cancelBooking(selectedBooking.id);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel Booking
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>

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

    </div>
  );
};
