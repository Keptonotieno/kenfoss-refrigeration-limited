import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminLogin } from './AdminLogin';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { ShieldAlert } from 'lucide-react';

import { AdminDashboardView } from './AdminDashboardView';
import { BookingsManagement } from './BookingsManagement';
import { QuotesManagement } from './QuotesManagement';
import { CustomerManagement } from './CustomerManagement';
import { AiDiagnosticsManagement } from './AiDiagnosticsManagement';
import { TechnicianPortalView } from './TechnicianPortalView';
import { ServicesManagement } from './ServicesManagement';
import { ProjectsManagement } from './ProjectsManagement';
import { GalleryManagement } from './GalleryManagement';
import { TestimonialsManagement } from './TestimonialsManagement';
import { BlogsManagement } from './BlogsManagement';
import { ContactInfoEditor } from './ContactInfoEditor';
import { WebsiteSettingsEditor } from './WebsiteSettingsEditor';
import { UserManagement } from './UserManagement';

interface AdminPortalProps {
  onCloseAdmin?: () => void;
}

const AccessDeniedCard: React.FC<{ role?: string; moduleName: string }> = ({ role, moduleName }) => (
  <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl max-w-lg mx-auto space-y-4 my-8">
    <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/30 flex items-center justify-center mx-auto">
      <ShieldAlert className="w-8 h-8" />
    </div>
    <div className="space-y-1">
      <h3 className="text-lg font-black text-white">Access Denied: Restricted Module</h3>
      <p className="text-xs text-slate-400 leading-relaxed">
        Your assigned staff role (<strong className="text-amber-400">{role}</strong>) does not have permission to access <span className="text-white font-bold">{moduleName}</span>.
      </p>
    </div>
    <p className="text-[11px] text-slate-500 font-mono">
      Contact your Super Administrator if you require elevated permission.
    </p>
  </div>
);

export const AdminPortal: React.FC<AdminPortalProps> = ({ onCloseAdmin }) => {
  const { isAuthenticated, currentUser } = useAdmin();

  // Active module tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Allow only authorized staff (Super Administrator, Manager, Technician)
  const isStaff = currentUser && ['Super Administrator', 'Manager', 'Technician'].includes(currentUser.role);

  // If not logged in or not staff, render secure login view
  if (!isAuthenticated || !currentUser || !isStaff) {
    return <AdminLogin onCancel={onCloseAdmin} />;
  }

  const role = currentUser.role;
  const isSuperAdmin = role === 'Super Administrator';
  const isManager = role === 'Manager' || isSuperAdmin;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation Header */}
      <AdminHeader 
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        onCloseAdmin={onCloseAdmin}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <AdminSidebar 
          activeTab={activeTab as AdminTab} 
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }} 
          isOpenMobile={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
        />

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-950">
          
          {/* Breadcrumb / Section indicator */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
              <span className="text-[#0057B8] font-bold">Kenfoss Admin</span>
              <span>/</span>
              <span className="capitalize text-slate-200 font-bold">{activeTab.replace('-', ' ')}</span>
            </div>

            {onCloseAdmin && (
              <button
                onClick={onCloseAdmin}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 px-3 py-1 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 cursor-pointer transition-colors"
              >
                <span>Return to Public Website</span>
              </button>
            )}
          </div>

          {/* Module Router with Strict Role RBAC Protection */}
          {activeTab === 'dashboard' && <AdminDashboardView setActiveTab={(tab) => setActiveTab(tab as any)} />}
          
          {activeTab === 'bookings' && (
            isManager ? <BookingsManagement /> : <AccessDeniedCard role={role} moduleName="Bookings Management" />
          )}

          {activeTab === 'quotes' && (
            isManager ? <QuotesManagement /> : <AccessDeniedCard role={role} moduleName="Quotations & RFQs" />
          )}

          {activeTab === 'customers' && (
            isManager ? <CustomerManagement /> : <AccessDeniedCard role={role} moduleName="Customer CRM" />
          )}

          {activeTab === 'diagnostics' && (
            isManager ? <AiDiagnosticsManagement /> : <AccessDeniedCard role={role} moduleName="AI Diagnostics" />
          )}

          {(activeTab === 'technician_jobs' || activeTab === 'technician-portal' || activeTab === 'technician_portal') && (
            <TechnicianPortalView />
          )}

          {activeTab === 'services' && (
            isManager ? <ServicesManagement /> : <AccessDeniedCard role={role} moduleName="Services Management" />
          )}

          {activeTab === 'projects' && (
            isManager ? <ProjectsManagement /> : <AccessDeniedCard role={role} moduleName="Projects Showcase" />
          )}

          {activeTab === 'gallery' && (
            isManager ? <GalleryManagement /> : <AccessDeniedCard role={role} moduleName="Media Gallery" />
          )}

          {activeTab === 'testimonials' && (
            isManager ? <TestimonialsManagement /> : <AccessDeniedCard role={role} moduleName="Testimonials" />
          )}

          {activeTab === 'blogs' && (
            isManager ? <BlogsManagement /> : <AccessDeniedCard role={role} moduleName="Blogs & Articles" />
          )}

          {(activeTab === 'contact_info' || activeTab === 'contact-info') && (
            isManager ? <ContactInfoEditor /> : <AccessDeniedCard role={role} moduleName="Company Contact Settings" />
          )}

          {(activeTab === 'website_settings' || activeTab === 'website-settings') && (
            isSuperAdmin ? <WebsiteSettingsEditor /> : <AccessDeniedCard role={role} moduleName="Website & SEO Settings" />
          )}

          {(activeTab === 'users' || activeTab === 'user-management' || activeTab === 'user_management') && (
            isSuperAdmin ? <UserManagement initialTab="users" /> : <AccessDeniedCard role={role} moduleName="Users & Roles (RBAC)" />
          )}

          {(activeTab === 'audit_logs' || activeTab === 'audit-logs') && (
            isSuperAdmin ? <UserManagement initialTab="audit" /> : <AccessDeniedCard role={role} moduleName="Security Audit Logs" />
          )}

          {/* Fallback to Dashboard if an unknown tab is selected */}
          {!['dashboard', 'bookings', 'quotes', 'customers', 'diagnostics', 'technician_jobs', 'technician-portal', 'technician_portal', 'services', 'projects', 'gallery', 'testimonials', 'blogs', 'contact_info', 'contact-info', 'website_settings', 'website-settings', 'users', 'user-management', 'user_management', 'audit_logs', 'audit-logs'].includes(activeTab) && (
            <AdminDashboardView setActiveTab={(tab) => setActiveTab(tab as any)} />
          )}

        </main>
      </div>

    </div>
  );
};
