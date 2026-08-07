import React, { useState, useEffect } from 'react';
import { useAdmin, ALL_PERMISSIONS } from '../../context/AdminContext';
import { UserRole, AdminUser, RoleDefinition, PermissionKey } from '../../types';
import { AdminInvitationService, AdminInvitation } from '../../services/adminService';
import { UserAvatar } from '../common/UserAvatar';
import { runAuthDiagnostic, DiagnosticResult } from '../../utils/authDiagnostic';
import { 
  ShieldCheck, 
  ShieldAlert,
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
  Check,
  RefreshCw,
  PlusCircle,
  FilterX,
  Edit3,
  Shield,
  Layers,
  Users as UsersIcon,
  CheckSquare,
  Square,
  Info,
  Sparkles,
  Activity,
  Terminal
} from 'lucide-react';

interface UserManagementProps {
  initialTab?: 'users' | 'roles' | 'invitations' | 'audit';
}

/**
 * Safe date formatter that gracefully handles ISO strings, numbers, 
 * Firestore Timestamp objects ({ seconds, nanoseconds }), null, and undefined.
 */
function safeFormatDate(val: any, includeTime = false): string {
  if (!val) return 'Never';
  try {
    let dateObj: Date;
    if (typeof val === 'object' && val !== null && 'seconds' in val) {
      dateObj = new Date(val.seconds * 1000);
    } else if (typeof val === 'number') {
      dateObj = new Date(val);
    } else {
      dateObj = new Date(String(val));
    }

    if (isNaN(dateObj.getTime())) {
      return 'Never';
    }

    return includeTime 
      ? dateObj.toLocaleString('en-KE', { dateStyle: 'medium', timeStyle: 'short' })
      : dateObj.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return 'Never';
  }
}

export const UserManagement: React.FC<UserManagementProps> = ({ initialTab = 'users' }) => {
  const { 
    users = [], 
    auditLogs = [], 
    roles = [],
    currentUser, 
    inviteUser, 
    createStaffAccount,
    updateUserRole, 
    toggleUserStatus, 
    deleteUser,
    addRole,
    updateRole,
    deleteRole,
    resetAdminAuthSystem
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'invitations' | 'audit'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);
  const [deletingRoleItem, setDeletingRoleItem] = useState<RoleDefinition | null>(null);
  const [revokingInv, setRevokingInv] = useState<AdminInvitation | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Sync activeTab if initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Loading & Error States for Invitations
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Invite/Create Staff modal
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

  // Role Creation / Edit Modal
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [roleNameInput, setRoleNameInput] = useState('');
  const [roleDescInput, setRoleDescInput] = useState('');
  const [rolePermissions, setRolePermissions] = useState<PermissionKey[]>([]);
  const [isRoleSaving, setIsRoleSaving] = useState(false);
  const [roleModalError, setRoleModalError] = useState<string | null>(null);

  // Diagnostic Audit Modal
  const [isDiagModalOpen, setIsDiagModalOpen] = useState(false);
  const [isDiagRunning, setIsDiagRunning] = useState(false);
  const [diagResult, setDiagResult] = useState<DiagnosticResult | null>(null);

  const handleRunDiagnostic = async () => {
    setIsDiagRunning(true);
    setIsDiagModalOpen(true);
    try {
      const res = await runAuthDiagnostic();
      setDiagResult(res);
    } catch (err) {
      console.error("Failed to run auth diagnostic:", err);
    } finally {
      setIsDiagRunning(false);
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const safeAuditLogs = Array.isArray(auditLogs) ? auditLogs : [];
  const safeRoles = Array.isArray(roles) ? roles : [];

  const filteredUsers = safeUsers.filter(u => {
    const nameStr = (u?.name || '').toLowerCase();
    const emailStr = (u?.email || '').toLowerCase();
    const roleStr = (u?.role || '').toLowerCase();
    const term = (searchTerm || '').toLowerCase();
    return nameStr.includes(term) || emailStr.includes(term) || roleStr.includes(term);
  });

  const loadInvitations = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const list = await AdminInvitationService.getAllInvitations();
      setInvitationsList(Array.isArray(list) ? list : []);
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
    setDeletingUser(u);
  };

  const confirmDeleteUser = () => {
    if (!deletingUser) return;
    const res = deleteUser(deletingUser.id);
    if (res && !res.success) {
      alert(res.message);
    }
    setDeletingUser(null);
  };

  // Open Role Modal for Creation
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleNameInput('');
    setRoleDescInput('');
    setRolePermissions(['view_dashboard']);
    setRoleModalError(null);
    setIsRoleModalOpen(true);
  };

  // Open Role Modal for Editing
  const handleOpenEditRole = (roleItem: RoleDefinition) => {
    setEditingRole(roleItem);
    setRoleNameInput(roleItem.name || '');
    setRoleDescInput(roleItem.description || '');
    setRolePermissions(roleItem.permissions || []);
    setRoleModalError(null);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleModalError(null);
    setIsRoleSaving(true);

    try {
      if (!roleNameInput.trim()) {
        setRoleModalError('Role name is required.');
        setIsRoleSaving(false);
        return;
      }

      if (editingRole) {
        const res = await updateRole({
          ...editingRole,
          name: roleNameInput.trim(),
          description: roleDescInput.trim(),
          permissions: rolePermissions
        });
        if (!res.success) {
          setRoleModalError(res.message);
        } else {
          setIsRoleModalOpen(false);
        }
      } else {
        const res = await addRole({
          name: roleNameInput.trim(),
          description: roleDescInput.trim(),
          permissions: rolePermissions
        });
        if (!res.success) {
          setRoleModalError(res.message);
        } else {
          setIsRoleModalOpen(false);
        }
      }
    } catch (err: any) {
      setRoleModalError(err.message || 'Failed to save role definition.');
    } finally {
      setIsRoleSaving(false);
    }
  };

  const handleDeleteRole = (roleItem: RoleDefinition) => {
    setDeletingRoleItem(roleItem);
  };

  const confirmDeleteRole = async () => {
    if (!deletingRoleItem) return;
    const res = await deleteRole(deletingRoleItem.id);
    if (!res.success) {
      alert(res.message);
    }
    setDeletingRoleItem(null);
  };

  const togglePermission = (key: PermissionKey) => {
    setRolePermissions(prev => 
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  };

  const isSuperAdmin = currentUser?.role === 'Super Administrator';

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl max-w-lg mx-auto space-y-4 my-8">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/30 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white">Access Denied: Super Administrator Only</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Staff Account Management and RBAC control is restricted exclusively to Super Administrators. Your current role is <strong className="text-amber-400">{currentUser?.role || 'User'}</strong>.
          </p>
        </div>
      </div>
    );
  }

  // Group ALL_PERMISSIONS by category for clean matrix display
  const categories = Array.from(new Set(ALL_PERMISSIONS.map(p => p.category)));

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-rose-500" />
            Users & Roles Management (RBAC)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Role-Based Access Control connected to Firebase. Manage staff users, define custom roles, assign permissions, and monitor security logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsResetModalOpen(true)}
            className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer border border-rose-500/30"
            title="Reset Admin Authentication System"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset System Auth</span>
          </button>
          <button
            onClick={handleRunDiagnostic}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer border border-amber-500/30"
            title="Run Auth & Firestore Permission Diagnostic"
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>Permissions Diagnostic</span>
          </button>
          <button
            onClick={handleOpenCreateRole}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-700"
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span>Create Custom Role</span>
          </button>
          <button
            onClick={() => {
              setLastInvitation(null);
              setIsInviteModalOpen(true);
            }}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer shadow-lg shadow-rose-900/30"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Account</span>
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <UsersIcon className="w-4 h-4" />
          <span>Staff Accounts ({safeUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Role & Permission Matrix ({safeRoles.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('invitations');
            loadInvitations();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'invitations'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Invitations & Codes ({invitationsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-rose-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Logs ({safeAuditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
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
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">2FA Security</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Last Active</th>
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
                          {searchTerm ? 'Try adjusting your search keyword or clearing the filter.' : 'No administrative or technician user accounts registered in the database yet.'}
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
                              <span>Add Staff Member</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const uName = u.name || u.email?.split('@')[0] || 'Staff Member';
                    const uEmail = u.email || 'N/A';
                    const uRole = u.role || 'Technician';

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        
                        <td className="p-4">
                          <div className="flex items-center space-x-3">
                            <UserAvatar user={u} size="md" />
                            <div>
                              <span className="font-bold text-white text-sm block">{uName}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{uEmail}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <select
                            value={uRole}
                            onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                            className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                          >
                            {safeRoles.map(r => (
                              <option key={r.id} value={r.name}>{r.name}</option>
                            ))}
                            {!safeRoles.some(r => r.name === uRole) && (
                              <option value={uRole}>{uRole}</option>
                            )}
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
                            {u.status || 'Active'}
                          </span>
                        </td>

                        <td className="p-4 font-mono text-[11px] text-slate-400">
                          {safeFormatDate(u.lastLogin)}
                        </td>

                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
                          >
                            {u.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl cursor-pointer inline-block align-middle"
                            title="Delete User Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeRoles.map((roleItem) => {
              const assignedCount = safeUsers.filter(u => u.role === roleItem.name).length;
              const permCount = (roleItem.permissions || []).length;

              return (
                <div key={roleItem.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className={`w-5 h-5 ${roleItem.isSystemRole ? 'text-amber-400' : 'text-rose-400'}`} />
                        <h3 className="font-extrabold text-white text-base">{roleItem.name}</h3>
                      </div>
                      {roleItem.isSystemRole ? (
                        <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black rounded-full uppercase">
                          System Role
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black rounded-full uppercase">
                          Custom Role
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                      {roleItem.description || 'Custom administrative role.'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                      <span>Permissions: <strong className="text-white">{permCount} / {ALL_PERMISSIONS.length}</strong></span>
                      <span>Assigned Staff: <strong className="text-rose-400">{assignedCount}</strong></span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenEditRole(roleItem)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{roleItem.name === 'Super Administrator' ? 'View Permissions' : 'Edit Matrix'}</span>
                    </button>

                    {!roleItem.isSystemRole && (
                      <button
                        onClick={() => handleDeleteRole(roleItem)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl cursor-pointer"
                        title="Delete Custom Role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Granular Permission Key Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" /> Granular Permission Catalog ({ALL_PERMISSIONS.length} Modules)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_PERMISSIONS.map(p => (
                <div key={p.key} className="p-3 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{p.label}</span>
                    <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] font-mono rounded">{p.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{p.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: INVITATIONS & CODES */}
      {activeTab === 'invitations' && (
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
                        <td className="p-3 text-slate-400">{safeFormatDate(inv.expiresAt)}</td>
                        <td className="p-3 text-right font-sans">
                          {inv.status === 'Pending' && (
                            <button
                              onClick={() => setRevokingInv(inv)}
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
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-extrabold uppercase text-slate-300 tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-400" /> Security Audit Log Stream
          </h3>

          {safeAuditLogs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-500 mx-auto" />
              <h4 className="text-sm font-bold text-white">No Audit Logs Recorded</h4>
              <p className="text-xs text-slate-400">System actions, logins, and settings updates will automatically record security logs here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {safeAuditLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.actorName || log.userName || 'System'}</span>
                      <span className="px-2 py-0.5 bg-slate-800 rounded text-[10px] text-slate-400 font-mono">{log.ipAddress || '127.0.0.1'}</span>
                    </div>
                    <p className="text-slate-300 font-mono text-[11px]">{log.action}: {log.details}</p>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 self-start sm:self-auto shrink-0">
                    <Clock className="w-3 h-3" />
                    {safeFormatDate(log.timestamp, true)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE / EDIT ROLE DEFINITION */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            <button
              onClick={() => setIsRoleModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-500" />
              {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New Custom Role'}
            </h3>

            {roleModalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{roleModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveRole} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Role Display Name</label>
                <input
                  type="text"
                  required
                  disabled={editingRole?.isSystemRole}
                  value={roleNameInput}
                  onChange={(e) => setRoleNameInput(e.target.value)}
                  placeholder="e.g. Lead Operations Inspector"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Description</label>
                <input
                  type="text"
                  value={roleDescInput}
                  onChange={(e) => setRoleDescInput(e.target.value)}
                  placeholder="Responsibilities and access scope..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-rose-400" />
                    <span>Assign Module Permissions ({rolePermissions.length} / {ALL_PERMISSIONS.length})</span>
                  </label>
                  {editingRole?.name === 'Super Administrator' ? (
                    <span className="text-[10px] font-mono text-amber-400">Super Admin retains full system permissions.</span>
                  ) : (
                    <div className="flex gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setRolePermissions(ALL_PERMISSIONS.map(p => p.key))}
                        className="text-blue-400 hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600">|</span>
                      <button
                        type="button"
                        onClick={() => setRolePermissions(['view_dashboard'])}
                        className="text-slate-400 hover:underline cursor-pointer"
                      >
                        Clear Optional
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {categories.map(cat => (
                    <div key={cat} className="space-y-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-800/80 pb-1">
                        {cat}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {ALL_PERMISSIONS.filter(p => p.category === cat).map(p => {
                          const isSelected = rolePermissions.includes(p.key);
                          const isSuperAdminRole = editingRole?.name === 'Super Administrator';

                          return (
                            <button
                              key={p.key}
                              type="button"
                              disabled={isSuperAdminRole}
                              onClick={() => togglePermission(p.key)}
                              className={`p-2.5 rounded-xl border text-left flex items-start space-x-2.5 transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-rose-950/30 border-rose-500/50 text-white' 
                                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <div className="pt-0.5 shrink-0">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-rose-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-600" />
                                )}
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-xs font-bold block leading-tight">{p.label}</span>
                                <span className="text-[10px] text-slate-500 leading-tight block">{p.description}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRoleSaving}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center space-x-1.5"
                >
                  {isRoleSaving ? (
                    <span>Saving Role...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingRole ? 'Update Permissions' : 'Create Role'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: INVITE / CREATE STAFF ACCOUNT */}
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
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    {safeRoles.map(r => (
                      <option key={r.id} value={r.name}>{r.name} ({r.description?.slice(0, 30)}...)</option>
                    ))}
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

      {/* DELETE USER CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete User Account</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to permanently remove staff account <span className="text-white font-semibold">{deletingUser.name || deletingUser.email}</span>?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ROLE CONFIRMATION MODAL */}
      {deletingRoleItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Custom Role</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to delete custom role <span className="text-white font-semibold">"{deletingRoleItem.name}"</span>?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeletingRoleItem(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRole}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVOKE INVITATION CONFIRMATION MODAL */}
      {revokingInv && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Revoke Invitation Code</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Revoke invitation code <span className="text-white font-semibold">{revokingInv.code}</span> ({revokingInv.email})?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRevokingInv(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await AdminInvitationService.revokeInvitation(revokingInv.id);
                  loadInvitations();
                  setRevokingInv(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Revoke Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM AUTHENTICATION RESET MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-center">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-7 h-7 text-rose-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">Reset Admin Authentication System</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                This operation will <strong className="text-rose-400">permanently remove all existing admin, manager, technician, and Super Administrator accounts</strong> from Firestore and unseal the System Initialization Wizard.
              </p>
              <p className="text-[11px] text-slate-400 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                You will be signed out immediately and required to complete First-Time System Initialization to provision new accounts.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                disabled={isResetting}
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isResetting}
                onClick={async () => {
                  setIsResetting(true);
                  const res = await resetAdminAuthSystem();
                  setIsResetting(false);
                  setIsResetModalOpen(false);
                  if (res.success) {
                    alert(res.message);
                  } else {
                    alert(res.message || 'Reset failed.');
                  }
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                {isResetting ? (
                  <span>Resetting...</span>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset System Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMISSIONS & AUTH DIAGNOSTIC MODAL */}
      {isDiagModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Auth & Firestore Security Rules Diagnostic
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live system audit for role-based access control & permission status.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDiagModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDiagRunning ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-300">Auditing Auth state & probing collection permissions...</p>
              </div>
            ) : diagResult ? (
              <div className="space-y-4 text-xs">
                {/* Auth State Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-sky-400" />
                      1. Firebase Authentication State
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      diagResult.auth.isSignedIn ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {diagResult.auth.isSignedIn ? 'Signed In' : 'Unauthenticated'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1 font-mono text-[11px]">
                    <div>UID: <span className="text-slate-200">{diagResult.auth.uid || 'None'}</span></div>
                    <div>Email: <span className="text-slate-200">{diagResult.auth.email || 'None'}</span></div>
                  </div>
                </div>

                {/* Firestore User Doc Box */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      2. Firestore User Profile Document
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      diagResult.userDoc.exists && diagResult.userDoc.isValidRole 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {diagResult.userDoc.exists ? (diagResult.userDoc.isValidRole ? 'Valid Role' : 'Role Restricted') : 'Doc Missing'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1 font-mono text-[11px]">
                    <div>Path: <span className="text-slate-200">{diagResult.userDoc.path}</span></div>
                    <div>Role: <span className="text-amber-300 font-bold">{diagResult.userDoc.role || 'None'}</span></div>
                    <div>Status: <span className="text-slate-200">{diagResult.userDoc.status || 'Active'}</span></div>
                    <div>Valid Staff Role: <span className={diagResult.userDoc.isValidRole ? 'text-emerald-400' : 'text-rose-400'}>{String(diagResult.userDoc.isValidRole)}</span></div>
                  </div>
                </div>

                {/* Permission Probe Matrix */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <span className="font-bold text-slate-300 block mb-2">
                    3. Collection Read Permission Tests
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {Object.entries(diagResult.permissionTests).map(([col, res]) => (
                      <div key={col} className={`p-2 rounded-xl border flex flex-col justify-between ${
                        res.success ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                      }`}>
                        <div className="font-mono font-bold capitalize text-[11px] flex items-center justify-between">
                          <span>{col}</span>
                          {res.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                        </div>
                        <div className="text-[10px] opacity-80 mt-1">
                          {res.success ? `Allowed (${res.count} docs)` : 'PERMISSION DENIED'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary & Recommendations */}
                <div className={`p-4 rounded-2xl border ${
                  diagResult.summary.hasPermissionError 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200' 
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                }`}>
                  <h4 className="font-bold text-sm mb-1.5 flex items-center gap-1.5">
                    {diagResult.summary.hasPermissionError ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    {diagResult.summary.hasPermissionError ? 'Issues Detected' : 'All Permission Checks Passed'}
                  </h4>
                  {diagResult.summary.detectedIssues.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 mb-2 text-xs">
                      {diagResult.summary.detectedIssues.map((iss, idx) => (
                        <li key={idx}>{iss}</li>
                      ))}
                    </ul>
                  )}
                  {diagResult.summary.recommendations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-amber-500/20 text-xs">
                      <strong className="block mb-1 text-white">Recommendations:</strong>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {diagResult.summary.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={handleRunDiagnostic}
                disabled={isDiagRunning}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDiagRunning ? 'animate-spin' : ''}`} />
                <span>Re-run Diagnostic</span>
              </button>
              <button
                onClick={() => setIsDiagModalOpen(false)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-lg shadow-rose-900/30"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
