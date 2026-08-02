import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'en' | 'sw';

export interface Translations {
  // Navigation
  home: string;
  services: string;
  industries: string;
  projects: string;
  aboutUs: string;
  coldRoomSizing: string;
  engineeringHub: string;
  contact: string;
  
  // Actions
  memberPortal: string;
  account: string;
  aiAssistant: string;
  aiStudio: string;
  bookTechnician: string;
  requestQuote: string;
  emergencyService: string;
  callUs: string;
  
  // Common UI
  languageName: string;
  switchTo: string;
  searchPlaceholder: string;
  workingHours: string;
  locationKenya: string;
  close: string;
}

const translations: Record<Language, Translations> = {
  en: {
    home: 'Home',
    services: 'Services',
    industries: 'Industries',
    projects: 'Projects',
    aboutUs: 'About Us',
    coldRoomSizing: 'Cold Room Sizing',
    engineeringHub: 'Engineering Hub',
    contact: 'Contact',
    
    memberPortal: 'Member Portal',
    account: 'Account',
    aiAssistant: 'AI Chat',
    aiStudio: 'AI Image Studio',
    bookTechnician: 'Book Technician',
    requestQuote: 'Request Quote',
    emergencyService: '24/7 Emergency Service',
    callUs: 'Call Desk',
    
    languageName: 'English',
    switchTo: 'Badili kwenda Kiswahili',
    searchPlaceholder: 'Search refrigeration, cold room parts...',
    workingHours: 'Mon - Sat: 8:00 AM - 6:00 PM',
    locationKenya: 'Ruiru Bypass, Nairobi - Kenya',
    close: 'Close',
  },
  sw: {
    home: 'Nyumbani',
    services: 'Huduma Zetu',
    industries: 'Sekta Zetu',
    projects: 'Miradi',
    aboutUs: 'Kuhusu Sisi',
    coldRoomSizing: 'Vipimo vya Vyumba Baridi',
    engineeringHub: 'Kituo cha Uhandisi',
    contact: 'Wasiliana Nasi',
    
    memberPortal: 'Tovuti ya Wanachama',
    account: 'Akaunti',
    aiAssistant: 'Msaidizi wa AI',
    aiStudio: 'Studio ya Picha ya AI',
    bookTechnician: 'Mwekee Fundi',
    requestQuote: 'Omba Nukuu',
    emergencyService: 'Huduma ya Dharura 24/7',
    callUs: 'Piga Simu',
    
    languageName: 'Kiswahili',
    switchTo: 'Switch to English',
    searchPlaceholder: 'Tafuta vifaa vya friji na cold room...',
    workingHours: 'Jumatatu - Jumamosi: Saa 2 Asubuhi - Saa 12 Jioni',
    locationKenya: 'Barabara ya Ruiru Bypass, Nairobi - Kenya',
    close: 'Funga',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('kenfoss-lang');
    if (saved === 'sw' || saved === 'en') return saved;
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('kenfoss-lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'sw' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
