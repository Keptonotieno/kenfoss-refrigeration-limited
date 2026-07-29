import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { UserRole, AdminUser } from '../../types';
import { AdminInvitationService, AdminInvitation } from '../../services/adminService';
import { 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Lock, 
  Trash2, 
  KeyRound, 
  CheckCircle2, 
  X, 
  FileText, 
  AlertCircle,
  AlertTriangle,
  Clock,
  Send,
  Mail,
  Check,
  RefreshCw,
  PlusCircle,
  FilterX
} from 'lucide-react';

interface UserManagementProps {
  initialTab?: 'users' | 'invitations' | 'audit';
}

export const UserManagement: React.FC<UserManagementProps> = ({ initialTab = 'users' }) => {
  const { 
    users, 
    auditLogs, 
    currentUser, 
    inviteUser, 
    createStaffAccount,
    updateUserRole, 
    toggleUserStatus, 
    deleteUser 
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'users' | 'invitations' | 'audit'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  // Sync activeTab if initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Invite/Create modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'createAccount' | 'inviteCode'>('createAccount');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Technician');
  const [tempPassword, setTempPassword] = useState('Kenfoss2026!');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastCreatedAccount, setLastCreatedAccount] = useState<{ name: string; email: string; role: UserRole; tempPass: string } | null>(null);
  const [lastInvitation, setLastInvitation] = useState<AdminInvitation | null>(null);
  const [invitationsList, setInvitationsList] = useState<AdminInvitation[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const filteredUsers = users.filter(u => {
    return u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           u.role.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const loadInvitations = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const list = await AdminInvitationService.getAllInvitations();
      setInvitationsList(list);
    } catch (err: any) {
      console.error("Error loading invitations:", err);
      setFetchError("Failed to load records from database. Please check connection and retry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'invitations') {
      loadInvitations();
    }
  }, [activeTab]);

  const handleCreateStaffAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setFormError(null);
    setCopiedCode(false);

    try {
      if (modalMode === 'createAccount') {
        const res = await createStaffAccount(
          inviteName,
          inviteEmail,
          inviteRole,
          invitePhone,
          tempPassword
        );

        if (!res.success) {
          setFormError(res.message);
        } else {
          setLastCreatedAccount({
            name: inviteName,
            email: inviteEmail,
            role: inviteRole,
            tempPass: res.tempPassword || tempPassword
          });
        }
      } else {
        // Create invitation stored in Firestore
        const invitation = await AdminInvitationService.createInvitation({
          email: inviteEmail,
          role: inviteRole,
          createdBy: currentUser?.name || currentUser?.email || 'Super Administrator',
          notes: `Staff invitation for ${inviteName || inviteEmail} (Phone: ${invitePhone || 'N/A'})`
        });

        await AdminInvitationService.dispatchInvitationEmail(invitation);
        setLastInvitation(invitation);
        inviteUser(inviteName || 'Staff Member', inviteEmail, inviteRole, invitePhone);
        loadInvitations();
      }
    } catch (err: any) {
      console.error("Error processing staff request:", err);
      setFormError(err.message || "Failed to process staff account creation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleStatus = (u: AdminUser) => {
    if (u.id === currentUser?.id) {
      alert('You cannot suspend your own logged-in administrator account!');
      return;
    }
    toggleUserStatus(u.id);
  };

  const handleDeleteUser = (u: AdminUser) => {
    if (u.id === currentUser?.id) {
      alert('You cannot delete your own logged-in administrator account!');
      return;
    }
    if (confirm(`Permanently remove staff account "${u.name}" (${u.email})?`)) {
      deleteUser(u.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-rose-500" />
            Super Administrator User & Audit Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Invite staff, assign RBAC security roles (Super Admin, Manager, Technician), and inspect security audit logs.
          </p>
        </div>

        <button
          onClick={() => {
            setLastInvitation(null);
            setIsInviteModalOpen(true);
          }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite New Staff Member</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Staff User Accounts ({users.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('invitations');
            loadInvitations();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'invitations'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Invitations & Codes ({invitationsList.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          System Audit Logs ({auditLogs.length})
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="space-y-4">
          
          {/* Search */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search staff by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* USERS TABLE */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Staff Member</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">2FA Status</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <div className="max-w-sm mx-auto space-y-3">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                          {searchTerm ? <FilterX className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6 text-rose-400" />}
                        </div>
                        <h4 className="text-sm font-bold text-white">
                          {searchTerm ? `No staff users matching "${searchTerm}"` : 'No Staff User Accounts Found'}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {searchTerm ? 'Try adjusting your search keyword or clearing the search field.' : 'No administrative or technician user accounts registered in the database yet.'}
                        </p>
                        <div className="pt-2 flex justify-center gap-2">
                          {searchTerm ? (
                            <button
                              onClick={() => setSearchTerm('')}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                            >
                              Clear Filter
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setLastInvitation(null);
                                setIsInviteModalOpen(true);
                              }}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer mx-auto"
                            >
                              <PlusCircle className="w-4 h-4" />
                              <span>Add New Staff User</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                          <div>
                            <span className="font-bold text-white text-sm block">{u.name}</span>
                            <span className="text-[11px] text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                          className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                        >
                          <option value="Super Administrator">Super Administrator</option>
                          <option value="Manager">Manager</option>
                          <option value="Technician">Technician</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          u.twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          {u.twoFactorEnabled ? '2FA Enabled' : 'Disabled'}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          u.status === 'Suspended' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {u.status}
                        </span>
                      </td>

                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                      </td>

                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          {u.status === 'Active' ? 'Suspend Access' : 'Activate Access'}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl cursor-pointer inline-block align-middle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>

                    </tr>
                  )))
                }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      ) : activeTab === 'invitations' ? (
        /* INVITATIONS & CODES VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-rose-400" /> Stored Single-Use Invitation Codes
            </h3>
            <button
              onClick={loadInvitations}
              disabled={isLoading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {fetchError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-between text-xs text-rose-300">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{fetchError}</span>
              </div>
              <button
                onClick={loadInvitations}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg cursor-pointer shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-rose-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Fetching stored invitation records from Firestore database...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Invitation Code</th>
                    <th className="p-3">Target Email</th>
                    <th className="p-3">Linked Role</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created By</th>
                    <th className="p-3">Expires At</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                  {invitationsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-12 text-center font-sans">
                        <div className="max-w-sm mx-auto space-y-3">
                          <KeyRound className="w-8 h-8 text-rose-400 mx-auto" />
                          <h4 className="text-sm font-bold text-white">No Stored Invitations Found</h4>
                          <p className="text-xs text-slate-400">There are no single-use invitation codes currently stored in Firestore.</p>
                          <button
                            onClick={() => {
                              setLastInvitation(null);
                              setIsInviteModalOpen(true);
                            }}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 cursor-pointer mx-auto"
                          >
                            <PlusCircle className="w-4 h-4" />
                            <span>Generate Invitation Code</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    invitationsList.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-blue-400">{inv.code}</td>
                        <td className="p-3 text-white font-sans">{inv.email}</td>
                        <td className="p-3 font-sans">
                          <span className="px-2 py-0.5 bg-slate-800 rounded font-bold text-[10px] text-slate-300">
                            {inv.role}
                          </span>
                        </td>
                        <td className="p-3 font-sans">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            inv.status === 'Pending' ? 'bg-amber-500/20 text-amber-400' :
                            inv.status === 'Used' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-rose-500/20 text-rose-400'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-sans">{inv.createdBy}</td>
                        <td className="p-3 text-slate-400">{new Date(inv.expiresAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right font-sans">
                          {inv.status === 'Pending' && (
                            <button
                              onClick={async () => {
                                if (confirm(`Revoke invitation code ${inv.code}?`)) {
                                  await AdminInvitationService.revokeInvitation(inv.id);
                                  loadInvitations();
                                }
                              }}
                              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-[10px] font-bold cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* AUDIT LOGS VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-400" /> Security Audit Log Stream
          </h3>

          {auditLogs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Audit Logs Recorded</h4>
              <p className="text-xs text-slate-400">System actions, logins, and settings updates will automatically record security logs here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.actorName}</span>
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 font-mono">{log.ipAddress}</span>
                    </div>
                    <p className="text-slate-300 font-mono text-[11px]">{log.action}</p>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 self-start sm:self-auto">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INVITE / CREATE STAFF ACCOUNT MODAL */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => {
                setIsInviteModalOpen(false);
                setLastCreatedAccount(null);
                setLastInvitation(null);
                setFormError(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-rose-500" /> Create Staff Account
            </h3>

            {/* Mode Selector */}
            {!lastCreatedAccount && !lastInvitation && (
              <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setModalMode('createAccount')}
                  className={`py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-all ${
                    modalMode === 'createAccount'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Direct Account
                </button>
                <button
                  type="button"
                  onClick={() => setModalMode('inviteCode')}
                  className={`py-1.5 px-3 rounded-lg font-bold cursor-pointer transition-all ${
                    modalMode === 'inviteCode'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Invitation Code
                </button>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {lastCreatedAccount ? (
              <div className="space-y-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Firebase Staff Account Created!</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Account is active in Firebase Authentication and Firestore. Staff user can log in immediately.
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-medium">Full Name:</span>
                    <span className="text-white font-bold">{lastCreatedAccount.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-medium">Sign-In Email:</span>
                    <span className="text-blue-400 font-mono font-bold">{lastCreatedAccount.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-medium">Assigned Role:</span>
                    <span className="px-2 py-0.5 bg-slate-800 rounded font-bold text-slate-200">{lastCreatedAccount.role}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400 font-medium">Temporary Password:</span>
                    <span className="font-mono text-amber-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{lastCreatedAccount.tempPass}</span>
                  </div>
                  <div className="text-[10px] text-amber-400/90 pt-1 border-t border-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Must change password on first login before dashboard access.</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      const text = `Kenfoss Staff Credentials:\nEmail: ${lastCreatedAccount.email}\nTemp Password: ${lastCreatedAccount.tempPass}\nRole: ${lastCreatedAccount.role}`;
                      navigator.clipboard.writeText(text);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                    <span>{copiedCode ? 'Credentials Copied!' : 'Copy Staff Credentials'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setLastCreatedAccount(null);
                      setInviteEmail('');
                      setInviteName('');
                      setInvitePhone('');
                      setTempPassword('Kenfoss2026!');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Create Another Staff Account
                  </button>
                </div>
              </div>
            ) : lastInvitation ? (
              <div className="space-y-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Invitation Stored & Dispatched!</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Single-Use Code:</span>
                    <span className="font-mono text-sm font-bold text-blue-400">{lastInvitation.code}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Recipient Email:</span>
                    <span className="text-white font-medium">{lastInvitation.email}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Linked Role:</span>
                    <span className="px-2 py-0.5 bg-slate-800 rounded font-bold text-slate-200">{lastInvitation.role}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold">{lastInvitation.status}</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(lastInvitation.code);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4" /> : <KeyRound className="w-4 h-4" />}
                    <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setLastInvitation(null);
                      setInviteEmail('');
                      setInviteName('');
                      setInvitePhone('');
                    }}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Generate Another Invitation
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateStaffAccount} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Staff Full Name</label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Eng. Paul Mwangi"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Staff Email Address</label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="paul@kenfoss.co.ke"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={invitePhone}
                    onChange={(e) => setInvitePhone(e.target.value)}
                    placeholder="0745 411 923"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Assigned Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="Technician">Technician (Assigned Job View)</option>
                    <option value="Manager">Manager (Operations & RFQs)</option>
                    <option value="Super Administrator">Super Administrator (Owner / Full Access)</option>
                  </select>
                </div>

                {modalMode === 'createAccount' && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-300">Temporary Password</label>
                      <button
                        type="button"
                        onClick={() => setTempPassword(`Kenfoss${Math.floor(1000 + Math.random() * 9000)}!`)}
                        className="text-[10px] text-blue-400 hover:underline cursor-pointer"
                      >
                        Generate Random
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={tempPassword}
                      onChange={(e) => setTempPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-400 focus:outline-none focus:border-rose-500"
                    />
                    <p className="text-[10px] text-slate-400">
                      Staff member will be forced to change this password on first login.
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center space-x-1.5"
                  >
                    {isGenerating ? (
                      <span>Creating Account...</span>
                    ) : modalMode === 'createAccount' ? (
                      <><UserPlus className="w-3.5 h-3.5" /><span>Create Firebase Account</span></>
                    ) : (
                      <><Send className="w-3.5 h-3.5" /><span>Generate Code & Dispatch</span></>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
