import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  FileSpreadsheet, 
  Users, 
  Cpu, 
  Wrench, 
  Briefcase, 
  FolderGit2, 
  Image, 
  Star, 
  FileText, 
  PhoneCall, 
  Settings, 
  ShieldAlert, 
  History,
  X,
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export type AdminTab = 
  | 'dashboard' 
  | 'bookings' 
  | 'quotes' 
  | 'customers' 
  | 'diagnostics' 
  | 'messages'
  | 'technician_jobs' 
  | 'services' 
  | 'projects' 
  | 'gallery' 
  | 'testimonials' 
  | 'blogs' 
  | 'contact_info' 
  | 'website_settings' 
  | 'users' 
  | 'audit_logs';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onCloseAdmin?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  onCloseMobile,
  onCloseAdmin
}) => {
  const { currentUser, bookings, quotes, contactMessages, setIsAdminOpen } = useAdmin();

  const newBookingsCount = bookings.filter(b => b.status === 'New').length;
  const newQuotesCount = quotes.filter(q => q.status === 'Received' || q.status === 'Under Review').length;
  const unreadMessagesCount = contactMessages.filter(m => m.status === 'Unread').length;

  const isSuperAdmin = currentUser?.role === 'Super Administrator';
  const isManager = currentUser?.role === 'Manager' || isSuperAdmin;
  const isTechnician = currentUser?.role === 'Technician';

  const handleTabClick = (tab: AdminTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Super Administrator', 'Manager', 'Technician'] },
    { id: 'bookings', label: 'Bookings', icon: CalendarCheck, badge: newBookingsCount, roles: ['Super Administrator', 'Manager'] },
    { id: 'quotes', label: 'Quotations / RFQs', icon: FileSpreadsheet, badge: newQuotesCount, roles: ['Super Administrator', 'Manager'] },
    { id: 'messages', label: 'Support & Chat Desk', icon: MessageSquare, badge: unreadMessagesCount, roles: ['Super Administrator', 'Manager'] },
    { id: 'customers', label: 'Customer CRM', icon: Users, roles: ['Super Administrator', 'Manager'] },
    { id: 'diagnostics', label: 'AI Diagnostics', icon: Cpu, roles: ['Super Administrator', 'Manager'] },
    { id: 'technician_jobs', label: 'Technician Portal', icon: Wrench, roles: ['Super Administrator', 'Manager', 'Technician'] },
    { id: 'services', label: 'Service Management', icon: Briefcase, roles: ['Super Administrator', 'Manager'] },
    { id: 'projects', label: 'Projects Showcase', icon: FolderGit2, roles: ['Super Administrator', 'Manager'] },
    { id: 'gallery', label: 'Media Gallery', icon: Image, roles: ['Super Administrator', 'Manager'] },
    { id: 'testimonials', label: 'Testimonials', icon: Star, roles: ['Super Administrator', 'Manager'] },
    { id: 'blogs', label: 'Blog & Articles', icon: FileText, roles: ['Super Administrator', 'Manager'] },
    { id: 'contact_info', label: 'Contact & Office Info', icon: PhoneCall, roles: ['Super Administrator', 'Manager'] },
    { id: 'website_settings', label: 'Website & SEO Settings', icon: Settings, roles: ['Super Administrator'] },
    { id: 'users', label: 'Users & Roles (RBAC)', icon: ShieldAlert, roles: ['Super Administrator'] },
    { id: 'audit_logs', label: 'Audit Logs', icon: History, roles: ['Super Administrator'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(currentUser?.role || ''));

  return (
    <>
      {/* Backdrop for Mobile */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:static top-0 left-0 bottom-0 z-50
        w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between
        transition-transform duration-300 ease-in-out
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Header Close */}
        <div className="p-4 lg:hidden flex items-center justify-between border-b border-slate-800">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Navigation Menu</span>
          <button onClick={onCloseMobile} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          <p className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
            {currentUser?.role} Menu
          </p>

          {filteredNav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id as AdminTab)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                  ${isActive 
                    ? 'bg-[#0057B8] text-white shadow-md shadow-blue-900/40' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'}
                `}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-[#0057B8]' : 'bg-blue-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Link to Public Site */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/50 space-y-2">
          <button
            onClick={() => {
              setIsAdminOpen(false);
              if (onCloseAdmin) {
                onCloseAdmin();
              }
            }}
            className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>Return to Live Website</span>
          </button>

          <div className="text-[10px] text-slate-500 text-center">
            Role: <strong className="text-slate-300">{currentUser?.role}</strong>
          </div>
        </div>
      </aside>
    </>
  );
};
