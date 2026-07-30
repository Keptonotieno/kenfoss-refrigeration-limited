import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  Menu, 
  X, 
  ChevronRight, 
  Wrench, 
  ShieldCheck,
  Calculator,
  Bot,
  Sun,
  Moon,
  User as UserIcon,
  LogIn
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBooking: (type?: string) => void;
  onOpenAiDiagnostic: () => void;
  onOpenCalculator: () => void;
  onOpenAdmin?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBooking,
  onOpenAiDiagnostic,
  onOpenCalculator,
  onOpenAdmin
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, openAuthModal } = useAuth();
  const { contactInfo, websiteSettings } = useAdmin();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'industries', label: 'Industries' },
    { id: 'projects', label: 'Projects' },
    { id: 'about', label: 'About Us' },
    { id: 'calculator', label: 'Cold Room Sizing' },
    { id: 'blog', label: 'Engineering Hub' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);

    if (id === 'calculator') {
      onOpenCalculator();
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300">
      {/* Top Corporate Bar */}
      <div className="bg-[#002B5B] dark:bg-slate-950 text-slate-200 text-[11px] font-medium py-2 px-4 sm:px-6 lg:px-8 border-b border-blue-900/60 dark:border-slate-800 hidden md:block select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-6">
          {/* Left Side: Phone, Email, Location */}
          <div className="flex items-center gap-4 lg:gap-5 min-w-0">
            {/* Phone */}
            <a 
              href={`tel:${contactInfo.mainPhone}`} 
              className="flex items-center gap-1.5 text-white hover:text-[#00AEEF] transition-colors shrink-0"
            >
              <Phone className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
              <span className="font-semibold text-white tracking-wide">{contactInfo.mainPhone}</span>
              <span className="text-slate-300 text-[10px] bg-blue-950/80 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-blue-800/80 dark:border-slate-700 font-medium">
                {contactInfo.city.split(',')[0]}
              </span>
            </a>

            <div className="h-3.5 w-px bg-blue-800/60 dark:bg-slate-800 shrink-0" />

            {/* Email */}
            <a 
              href={`mailto:${contactInfo.email}`} 
              className="flex items-center gap-1.5 text-slate-200 hover:text-[#00AEEF] transition-colors shrink-0"
            >
              <Mail className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
              <span className="font-medium">{contactInfo.email}</span>
            </a>

            <div className="hidden xl:block h-3.5 w-px bg-blue-800/60 dark:bg-slate-800 shrink-0" />

            {/* Location (with responsive truncation) */}
            <a 
              href="https://www.google.com/maps/dir//Kenfoss+Refrigeration+limited,+Ivy%E2%80%99s+Park+Business+Park,+Next+to+Mark+Hotel,+Thika+Superhighway+Service+Lane,+Ruiru,+Kiambu+County/@-1.1620371,36.9537816,17z/data=!4m16!1m7!3m6!1s0x182f1510aee81ec1:0xc2b97e14e1f71921!2sKenfoss+Refrigeration+limited!8m2!3d-1.1620371!4d36.9586472!16s%2Fg%2F11xp9xzg41!4m7!1m0!1m5!1m1!1s0x182f1510aee81ec1:0xc2b97e14e1f71921!2m2!1d36.9586472!2d-1.1620371?entry=ttu"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:flex items-center gap-1.5 text-slate-300 hover:text-[#00AEEF] transition-colors min-w-0 cursor-pointer"
              title="Ivy's Park Business Park, Thika Superhighway, Ruiru, Kiambu County, Kenya (Click for Google Maps)"
            >
              <MapPin className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
              <span className="truncate max-w-[260px] 2xl:max-w-[380px]">
                Ivy's Park Business Park, Thika Superhighway, Ruiru, Kiambu County
              </span>
            </a>
          </div>

          {/* Right Side: Working Hours, Certification, Admin Button */}
          <div className="flex items-center gap-3.5 lg:gap-4 shrink-0">
            {/* Working Hours */}
            <div className="flex items-center gap-1.5 text-slate-200">
              <Clock className="w-3.5 h-3.5 text-[#00AEEF] shrink-0" />
              <span className="text-[#00AEEF] font-semibold">{contactInfo.workingHours}</span>
            </div>

            <div className="h-3.5 w-px bg-blue-800/60 dark:bg-slate-800 shrink-0" />

            {/* Certification */}
            <div className="hidden lg:flex items-center gap-1.5 text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FF7A00] shrink-0" />
              <span className="font-medium">EPRA & NEMA Certified</span>
            </div>

            {onOpenAdmin && (
              <>
                <div className="hidden lg:block h-3.5 w-px bg-blue-800/60 dark:bg-slate-800 shrink-0" />
                <button
                  onClick={onOpenAdmin}
                  className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-0.5 rounded-lg border border-amber-500/30 transition-all cursor-pointer shadow-sm"
                  title="Access Staff Admin Portal (Authorized Staff Only)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Admin</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <nav className={`transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,43,91,0.06)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] border-b border-slate-200/80 dark:border-slate-800 py-2.5' 
          : 'bg-white dark:bg-slate-900/90 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border-b border-slate-100 dark:border-slate-800/80 py-3.5'
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between min-h-[52px]">
          
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 text-left group cursor-pointer shrink-0"
          >
            {websiteSettings?.logoUrl ? (
              <img 
                src={websiteSettings.logoUrl} 
                alt={websiteSettings.companyName || 'Kenfoss Logo'} 
                className="h-10 max-w-[160px] object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0057B8] to-[#00AEEF] flex items-center justify-center text-white shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform font-black text-xl">
                {websiteSettings?.companyName ? websiteSettings.companyName.charAt(0) : 'K'}
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#0057B8] dark:text-[#00AEEF] leading-none">
                  {websiteSettings?.companyName ? websiteSettings.companyName.split(' ')[0].toUpperCase() : 'KENFOSS'}
                </span>
                <span className="text-[10px] bg-[#FF7A00] text-white font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">KE</span>
              </div>
              <p className="text-[9px] sm:text-[10px] font-semibold text-[#64748B] dark:text-slate-400 tracking-[0.08em] uppercase mt-0.5">
                {websiteSettings?.tagline ? websiteSettings.tagline.slice(0, 32) : 'Refrigeration Engineering'}
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-3 2xl:space-x-5 text-[12px] xl:text-[13.5px] 2xl:text-[14.5px] font-semibold text-[#1E293B] dark:text-slate-200 mx-1 xl:mx-3 shrink-0">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-2 xl:px-2.5 py-1.5 rounded-lg font-semibold tracking-[0.01em] transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === link.id
                    ? 'text-[#0057B8] dark:text-[#00AEEF] bg-blue-50/90 dark:bg-blue-950/80 font-bold border border-blue-200/60 dark:border-blue-800/80 shadow-xs'
                    : 'text-[#1E293B] dark:text-slate-200 hover:text-[#0057B8] dark:hover:text-[#00AEEF] hover:bg-slate-50/80 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Quick Action Buttons & Theme Toggle Desktop/Laptop */}
          <div className="hidden lg:flex items-center space-x-1.5 xl:space-x-2.5 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center shadow-2xs shrink-0"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Member Account / Sign Up Button */}
            <button
              onClick={() => openAuthModal('signin')}
              className="flex items-center space-x-1.5 px-2.5 py-2 text-xs font-bold text-[#0057B8] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900/80 rounded-lg border border-blue-200/80 dark:border-blue-800/80 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
              title="Member Sign In & Loyalty Registration"
            >
              <UserIcon className="w-3.5 h-3.5 text-[#0057B8] dark:text-blue-400 shrink-0" />
              <span className="hidden xl:inline">{user ? (user.displayName || 'Member Portal') : 'Member Portal'}</span>
              <span className="inline xl:hidden">{user ? 'Account' : 'Members'}</span>
            </button>

            {/* AI Diagnostics Button */}
            <button
              onClick={onOpenAiDiagnostic}
              className="hidden xl:flex items-center space-x-1.5 px-2.5 xl:px-3 py-2 text-xs font-bold text-[#0057B8] dark:text-[#00AEEF] bg-blue-50/80 dark:bg-blue-950/60 hover:bg-blue-100/80 dark:hover:bg-blue-900/80 rounded-lg border border-blue-200/60 dark:border-blue-800/60 transition-all cursor-pointer whitespace-nowrap shadow-2xs shrink-0"
              title="AI Fault Code & Cooling Diagnostic Assistant"
            >
              <Bot className="w-4 h-4 text-[#00AEEF] shrink-0" />
              <span>AI Diagnostics</span>
            </button>
          </div>

          {/* Mobile & Tablet Action Buttons */}
          <div className="flex lg:hidden items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 border border-slate-200 dark:border-slate-700"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <button
              onClick={onOpenAiDiagnostic}
              className="p-2 text-[#0057B8] dark:text-[#00AEEF] bg-blue-50 dark:bg-blue-950/80 rounded-lg border border-blue-200 dark:border-blue-800"
              aria-label="AI Diagnostics"
            >
              <Bot className="w-5 h-5 text-[#00AEEF]" />
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:text-[#0057B8] dark:hover:text-[#00AEEF] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xl px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking('quote');
              }}
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-[#0057B8] dark:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm"
            >
              <Calculator className="w-4 h-4" />
              <span>Request Project Quote</span>
            </button>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                  activeTab === link.id
                    ? 'text-[#0057B8] dark:text-[#00AEEF] bg-blue-50 dark:bg-blue-950/80 font-bold border border-blue-200/60 dark:border-blue-800/60'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('signin');
              }}
              className="w-full flex items-center justify-between text-[#0057B8] dark:text-blue-300 font-bold p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 rounded-lg cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <UserIcon className="w-4 h-4 text-[#0057B8] dark:text-blue-400" />
                <span>{user ? (user.displayName || 'Member Account') : 'Member Portal (Sign In / Register)'}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0057B8] dark:text-blue-400" />
            </button>

            {onOpenAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  <span>Staff Admin Portal</span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-500" />
              </button>
            )}
            <a href="tel:0745411923" className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-bold p-2 bg-slate-50 dark:bg-slate-800/80 rounded-lg">
              <Phone className="w-4 h-4 text-[#FF7A00]" />
              <span>Direct Phone: 0745 411 923</span>
            </a>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 px-2 pt-1">
              <span>Ruiru, Kiambu County</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Open 24 Hours</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

