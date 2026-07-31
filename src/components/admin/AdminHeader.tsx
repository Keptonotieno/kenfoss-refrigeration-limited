import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { UserAvatar } from '../common/UserAvatar';
import { UserProfileModal } from './UserProfileModal';
import { 
  Bell, 
  LogOut, 
  ShieldCheck, 
  Search, 
  UserCheck, 
  Sun, 
  Moon, 
  CheckCheck,
  Building2,
  Menu,
  X,
  User as UserIcon,
  Settings
} from 'lucide-react';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
  onCloseAdmin?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar, isMobileSidebarOpen }) => {
  const { currentUser, logout, notifications, markNotificationRead, clearAllNotifications, deleteNotification, toggleTwoFactor } = useAdmin();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between">
        
        {/* Left Branding & Mobile Menu Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0057B8] flex items-center justify-center text-white font-black shadow-md shadow-blue-900/40">
              K
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                Kenfoss Portal
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  v2.6
                </span>
              </h1>
              <p className="text-[10px] text-slate-400">Business Management & Operations</p>
            </div>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="hidden md:flex items-center max-w-md w-full mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search bookings, RFQs, customers, technicians..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#0057B8]"
            />
          </div>
        </div>

        {/* Right User Bar & Tools */}
        <div className="flex items-center space-x-3">
          
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title="Toggle theme"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* 2FA Indicator */}
          <button
            onClick={toggleTwoFactor}
            title={currentUser?.twoFactorEnabled ? "2FA Enabled" : "Click to Enable 2FA"}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center space-x-1 border cursor-pointer ${
              currentUser?.twoFactorEnabled 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentUser?.twoFactorEnabled ? '2FA Active' : '2FA Off'}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Notifications ({notifications.length})</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-xs text-slate-500">No notifications.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`p-3 text-xs space-y-0.5 hover:bg-slate-800/60 transition-colors flex items-start justify-between gap-2 ${
                          !n.isRead ? 'bg-blue-950/20' : ''
                        }`}
                      >
                        <div className="flex-1 cursor-pointer" onClick={() => markNotificationRead(n.id)}>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{n.title}</span>
                            {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          </div>
                          <p className="text-slate-400 text-[11px] leading-snug">{n.message}</p>
                          <span className="text-[9px] text-slate-500 block pt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded cursor-pointer"
                          title="Delete notification"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current User Card & Profile Click */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-800/80 transition-all cursor-pointer group text-left"
              title="Click to view & edit your profile"
            >
              <UserAvatar
                user={currentUser}
                size="sm"
              />
              <div className="hidden lg:block">
                <h4 className="text-xs font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                  {currentUser?.name}
                </h4>
                <span className={`text-[10px] font-extrabold ${
                  currentUser?.role === 'Super Administrator' ? 'text-blue-400' :
                  currentUser?.role === 'Manager' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {currentUser?.role}
                </span>
              </div>
            </button>

            <button
              onClick={() => setIsProfileModalOpen(true)}
              title="Profile Settings"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer hidden sm:block"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Account Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
};
