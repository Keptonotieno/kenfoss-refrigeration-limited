import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { CustomerRecord } from '../../types';
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
  Save 
} from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { customers, addCustomer, updateCustomer, bookings } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);

  // New / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Omit<CustomerRecord, 'id' | 'createdAt'>>({
    name: '',
    phone: '',
    email: '',
    location: '',
    address: '',
    customerType: 'Individual',
    totalSpent: 0,
    serviceCount: 1,
    notes: ''
  });

  const filteredCustomers = customers.filter(c => {
    return (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenNewModal = () => {
    setEditMode(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      location: '',
      address: '',
      customerType: 'Individual',
      totalSpent: 0,
      serviceCount: 1,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: CustomerRecord) => {
    setEditMode(true);
    setSelectedCustomer(c);
    setFormData({
      name: c.name,
      phone: c.phone,
      email: c.email,
      location: c.location,
      address: c.address || '',
      customerType: c.customerType,
      totalSpent: c.totalSpent,
      serviceCount: c.serviceCount,
      notes: c.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editMode && selectedCustomer) {
      updateCustomer({
        ...selectedCustomer,
        ...formData
      });
    } else {
      addCustomer(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Customer Directory & CRM
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centralized database storing client profiles, SLA tiers, service histories, and account notes.
          </p>
        </div>

        <button
          onClick={handleOpenNewModal}
          className="px-4 py-2.5 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by client name, phone, email, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* CUSTOMERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((c) => {
          const clientBookings = bookings.filter(b => b.phone === c.phone || b.email === c.email);

          return (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 hover:border-blue-500/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-base">{c.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase mt-1 inline-block ${
                      c.customerType === 'Corporate' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                      c.customerType === 'Commercial' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {c.customerType} Client
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenEditModal(c)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{c.location}</span>
                  </div>
                </div>

                {c.notes && (
                  <p className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 italic">
                    "{c.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Jobs Completed</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    <History className="w-3.5 h-3.5 text-blue-400" />
                    {clientBookings.length || c.serviceCount} Jobs
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Lifetime Value</span>
                  <span className="font-mono font-bold text-emerald-400">
                    KSh {c.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white">
              {editMode ? 'Edit Customer Profile' : 'Add New Customer Profile'}
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Client Name / Corporate Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Location / City</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Client Category</label>
                  <select
                    value={formData.customerType}
                    onChange={(e) => setFormData({ ...formData, customerType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Internal Account Notes / SLA Requirements</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Requires 2-hour emergency response SLA for walk-in freezer."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0057B8] hover:bg-blue-600 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                {editMode ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
