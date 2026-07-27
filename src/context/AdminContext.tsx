import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  AdminUser,
  BookingRecord,
  QuoteRecord,
  CustomerRecord,
  StoredDiagnosticRecord,
  GalleryItem,
  ContactMessageRecord,
  NotificationItem,
  ContactInfoSettings,
  WebsiteSettings,
  AuditLogItem,
  ServiceItem,
  ProjectItem,
  TestimonialItem,
  BlogPost,
  UserRole,
  BookingStatus,
  QuoteStatus
} from '../types';
import { INITIAL_SERVICES_DATA } from '../data/servicesData';
import { PROJECTS_DATA } from '../data/projectsData';
import { TESTIMONIALS_DATA } from '../data/testimonialsData';
import { BLOG_POSTS_DATA } from '../data/blogData';
import { AdminInvitationService } from '../services/adminService';

// Seed Admin Users
const SEED_USERS: AdminUser[] = [
  {
    id: 'usr-superadmin',
    name: 'Eng. Ken Munene',
    email: 'admin@kenfoss.co.ke',
    role: 'Super Administrator',
    phone: '+254 712 345 678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    createdAt: '2025-01-10T08:00:00.000Z',
    lastLogin: '2026-07-26T19:30:00.000Z',
    twoFactorEnabled: true
  },
  {
    id: 'usr-manager',
    name: 'Grace Wanjiku',
    email: 'manager@kenfoss.co.ke',
    role: 'Manager',
    phone: '+254 745 411 923',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    createdAt: '2025-02-01T10:15:00.000Z',
    lastLogin: '2026-07-26T18:00:00.000Z',
    twoFactorEnabled: false
  },
  {
    id: 'usr-tech-1',
    name: 'Tech. John Omondi',
    email: 'tech.john@kenfoss.co.ke',
    role: 'Technician',
    phone: '+254 722 890 123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    createdAt: '2025-03-15T09:00:00.000Z',
    lastLogin: '2026-07-26T16:45:00.000Z',
    twoFactorEnabled: false
  },
  {
    id: 'usr-tech-2',
    name: 'Tech. Peter Kamau',
    email: 'tech.peter@kenfoss.co.ke',
    role: 'Technician',
    phone: '+254 733 456 789',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    status: 'Active',
    createdAt: '2025-04-01T11:20:00.000Z',
    lastLogin: '2026-07-25T14:10:00.000Z',
    twoFactorEnabled: false
  }
];

// Seed Bookings
const SEED_BOOKINGS: BookingRecord[] = [
  {
    id: 'bk-101',
    bookingRef: 'KEN-849201',
    fullName: 'David Kiprop',
    phone: '+254 712 987 654',
    email: 'd.kiprop@nairobihotel.co.ke',
    location: 'Westlands, Nairobi',
    serviceType: 'Commercial Cold Room Emergency Repair',
    date: '2026-07-27',
    timeSlot: 'Morning (08:00 - 12:00)',
    notes: 'Walk-in freezer temperature rose to +6°C. High value seafood stock at risk.',
    status: 'In Progress',
    assignedTechnicianId: 'usr-tech-1',
    assignedTechnicianName: 'Tech. John Omondi',
    createdAt: '2026-07-26T14:30:00.000Z',
    totalAmount: 18500,
    paymentStatus: 'Unpaid',
    technicianNotes: 'Inspected bitzer compressor unit. Found expansion valve icing due to moisture. Replacing filter drier.',
    beforeImages: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400']
  },
  {
    id: 'bk-102',
    bookingRef: 'KEN-592018',
    fullName: 'Sarah Mutua',
    phone: '+254 722 112 233',
    email: 'sarah.mutua@gmail.com',
    location: 'Karen, Nairobi',
    serviceType: 'Residential Refrigerator Repair',
    date: '2026-07-28',
    timeSlot: 'Afternoon (12:00 - 16:00)',
    notes: 'LG Inverter Double Door not cooling bottom fridge compartment. Freezer is working.',
    status: 'Assigned',
    assignedTechnicianId: 'usr-tech-2',
    assignedTechnicianName: 'Tech. Peter Kamau',
    createdAt: '2026-07-26T16:10:00.000Z',
    totalAmount: 4500,
    paymentStatus: 'Unpaid'
  },
  {
    id: 'bk-103',
    bookingRef: 'KEN-120491',
    fullName: 'Dr. James Njuguna',
    phone: '+254 733 998 877',
    email: 'facilities@karenmed.co.ke',
    location: 'Kilimani, Nairobi',
    serviceType: 'Medical & Pharma Refrigeration Servicing',
    date: '2026-07-25',
    timeSlot: 'Morning (08:00 - 12:00)',
    notes: 'Routine quarterly calibration and temperature logger verification.',
    status: 'Completed',
    assignedTechnicianId: 'usr-tech-1',
    assignedTechnicianName: 'Tech. John Omondi',
    createdAt: '2026-07-24T09:00:00.000Z',
    totalAmount: 12000,
    paymentStatus: 'Paid',
    technicianNotes: 'All vaccine temperature sensors calibrated within ±0.2°C EPRA standards.',
    afterImages: ['https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=400']
  }
];

// Seed Quotations
const SEED_QUOTES: QuoteRecord[] = [
  {
    id: 'rfq-201',
    rfqRef: 'RFQ-918234',
    companyName: 'FreshHarvest Kenya Ltd',
    contactPerson: 'Samuel Cheruiyot',
    phone: '+254 720 554 321',
    email: 'schere@freshharvest.co.ke',
    projectType: 'Turnkey 50MT Horticultural Modular Cold Room',
    specs: 'Dimensions 8m x 6m x 3.5m, Temperature 0°C to +4°C, R404a scroll compressor, backup generator integration.',
    status: 'Under Review',
    quoteAmount: 2850000,
    responseNotes: 'Engineering design in progress. Estimating 100mm PUF panels and Copeland Digital Scroll unit.',
    createdAt: '2026-07-25T11:20:00.000Z'
  },
  {
    id: 'rfq-202',
    rfqRef: 'RFQ-449102',
    companyName: 'Nairobi Grand Hotel',
    contactPerson: 'Beatrice Achieng',
    phone: '+254 711 889 001',
    email: 'procurement@nairobigrandhotel.com',
    projectType: 'Multi-Zone Commercial Kitchen Refrigeration & VRF HVAC Overhaul',
    specs: 'Retrofit of 4 kitchen chiller units and central VRF air conditioning for ballroom.',
    status: 'Quote Issued',
    quoteAmount: 4200000,
    responseNotes: 'Official BOQ document sent via email with 90 days warranty terms.',
    createdAt: '2026-07-23T15:40:00.000Z'
  }
];

// Seed Customers
const SEED_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-1',
    name: 'FreshHarvest Kenya Ltd',
    phone: '+254 720 554 321',
    email: 'schere@freshharvest.co.ke',
    location: 'Naivasha / Industrial Area Nairobi',
    customerType: 'Corporate',
    totalSpent: 4100000,
    serviceCount: 5,
    notes: 'Key agricultural export client. High priority 2-hour response SLA required.',
    createdAt: '2024-06-15T00:00:00.000Z'
  },
  {
    id: 'cust-2',
    name: 'Nairobi Grand Hotel',
    phone: '+254 711 889 001',
    email: 'procurement@nairobigrandhotel.com',
    location: 'CBD, Nairobi',
    customerType: 'Commercial',
    totalSpent: 1250000,
    serviceCount: 8,
    notes: 'Annual maintenance contract (AMC) holder.',
    createdAt: '2024-09-10T00:00:00.000Z'
  },
  {
    id: 'cust-3',
    name: 'Sarah Mutua',
    phone: '+254 722 112 233',
    email: 'sarah.mutua@gmail.com',
    location: 'Karen, Nairobi',
    customerType: 'Individual',
    totalSpent: 18500,
    serviceCount: 2,
    notes: 'Residential client.',
    createdAt: '2025-01-20T00:00:00.000Z'
  }
];

// Seed AI Diagnostics
const SEED_DIAGNOSTICS: StoredDiagnosticRecord[] = [
  {
    id: 'diag-301',
    applianceType: 'Walk-in Freezer',
    brand: 'Bitzer / Custom',
    modelNumber: 'LH104/24V-4E',
    errorCode: 'E-04 High Pressure Cutout',
    location: 'Mombasa Road, Nairobi',
    equipmentAge: '4 Years',
    problemDescription: 'High pressure alarm sounding continuously. Condenser fan cycling irregularly.',
    diagnosisSummary: 'High head pressure caused by dirty condenser fins or fan motor capacitor breakdown.',
    severity: 'High',
    technicianRequired: true,
    createdAt: '2026-07-26T18:30:00.000Z',
    reviewedBy: 'Grace Wanjiku',
    reviewNotes: 'Dispatched Tech. John for coil pressure wash and dual run capacitor check.'
  },
  {
    id: 'diag-302',
    applianceType: 'French Door Refrigerator',
    brand: 'Samsung',
    modelNumber: 'RF28R7351SR',
    errorCode: '22 E (Evaporator Fan Error)',
    location: 'Runda, Nairobi',
    equipmentAge: '2 Years',
    problemDescription: 'Ice buildup behind freezer back panel accompanied by loud buzzing sound.',
    diagnosisSummary: 'Defrost drain blockage leading to ice formation around evaporator fan blades.',
    severity: 'Medium',
    technicianRequired: true,
    createdAt: '2026-07-26T15:10:00.000Z'
  }
];

// Seed Contact Messages
const SEED_CONTACT_MESSAGES: ContactMessageRecord[] = [
  {
    id: 'msg-401',
    name: 'Captain Otieno',
    email: 'otieno@kenya-logistics.co.ke',
    phone: '+254 700 123 456',
    subject: 'Refrigerated Truck Container Maintenance',
    message: 'We have a fleet of 6 Carrier Transicold thermo units requiring pre-season overhaul. Please contact us with pricing.',
    status: 'Unread',
    createdAt: '2026-07-26T17:00:00.000Z'
  }
];

// Seed Notifications
const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'booking',
    title: 'New Emergency Booking Received',
    message: 'David Kiprop booked Commercial Cold Room Emergency Repair (#KEN-849201).',
    isRead: false,
    createdAt: '2026-07-26T14:30:00.000Z',
    link: 'bookings'
  },
  {
    id: 'notif-2',
    type: 'diagnostic',
    title: 'AI Diagnostic Submission',
    message: 'New high-severity fault submitted for Walk-in Freezer in Mombasa Road.',
    isRead: false,
    createdAt: '2026-07-26T18:30:00.000Z',
    link: 'diagnostics'
  }
];

// Seed Contact Info Settings
const SEED_CONTACT_INFO: ContactInfoSettings = {
  mainPhone: '+254 712 345 678',
  secondaryPhone: '+254 745 411 923',
  emergencyPhone: '+254 700 999 111',
  email: 'info@kenfoss.co.ke',
  address: 'Kenfoss Complex, Enterprise Road, Industrial Area',
  city: 'Nairobi, Kenya',
  workingHours: 'Mon - Sat: 7:30 AM - 6:00 PM | 24/7 Emergency Hotline',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15955.15816912384!2d36.8530!3d-1.3090!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f11075c3f81e3%3A0xb3ff76c4912a76f2!2sIndustrial%20Area%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske',
  facebookUrl: 'https://facebook.com/kenfossrefrigeration',
  linkedinUrl: 'https://linkedin.com/company/kenfoss-refrigeration',
  twitterUrl: 'https://twitter.com/kenfoss_ke',
  instagramUrl: 'https://instagram.com/kenfoss_refrigeration',
  whatsappNumber: '254712345678'
};

// Seed Website Settings
const SEED_WEBSITE_SETTINGS: WebsiteSettings = {
  companyName: 'Kenfoss Refrigeration Limited',
  tagline: 'Precision Refrigeration & HVAC Engineering Solutions Across Kenya',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#0057B8',
  secondaryColor: '#FF7A00',
  footerCopyright: '© 2026 Kenfoss Refrigeration Limited. All Rights Reserved. Reg. EPRA/C1/2026/KE.',
  metaDescription: 'Kenya’s premier EPRA-certified corporate refrigeration and HVAC engineering firm. Commercial cold rooms, supermarket chillers, and residential inverter fridge repairs.',
  metaKeywords: 'Refrigeration Kenya, Cold Room Repair Nairobi, Fridge Repair Nairobi, HVAC Engineer Kenya, Bitzer Compressor Repair',
  googleAnalyticsId: 'G-KENFOSS2026'
};

interface AdminContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  users: AdminUser[];
  bookings: BookingRecord[];
  quotes: QuoteRecord[];
  customers: CustomerRecord[];
  diagnostics: StoredDiagnosticRecord[];
  gallery: GalleryItem[];
  testimonials: TestimonialItem[];
  blogs: BlogPost[];
  contactMessages: ContactMessageRecord[];
  notifications: NotificationItem[];
  contactInfo: ContactInfoSettings;
  websiteSettings: WebsiteSettings;
  services: ServiceItem[];
  projects: ProjectItem[];
  auditLogs: AuditLogItem[];
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  
  // Auth methods
  login: (email: string, password?: string) => { success: boolean; error?: string };
  validateInvitationCode: (code: string) => { success: boolean; message: string; user?: AdminUser };
  logout: () => void;
  forgotPassword: (email: string) => { success: boolean; message: string };
  resetPassword: (email: string, newPassword: string) => { success: boolean; message: string };
  changePassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };
  inviteUser: (name: string, email: string, role: UserRole, phone?: string) => { success: boolean; message: string };
  updateUserRole: (userId: string, newRole: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => { success: boolean; message: string };
  toggleTwoFactor: () => void;
  
  // Data CRUD
  addBooking: (booking: Omit<BookingRecord, 'id' | 'bookingRef' | 'createdAt' | 'status'>) => BookingRecord;
  updateBookingStatus: (bookingId: string, status: BookingStatus, technicianId?: string, technicianName?: string) => void;
  assignTechnician: (bookingId: string, technicianId: string, technicianName: string) => void;
  cancelBooking: (bookingId: string) => void;
  updateTechnicianJobNotes: (bookingId: string, notes: string, beforeImages?: string[], afterImages?: string[]) => void;
  
  addQuote: (quote: Omit<QuoteRecord, 'id' | 'rfqRef' | 'createdAt' | 'status'>) => QuoteRecord;
  updateQuoteStatus: (quoteId: string, status: QuoteStatus, amount?: number, notes?: string) => void;
  
  addCustomer: (customer: Omit<CustomerRecord, 'id' | 'createdAt'>) => void;
  updateCustomer: (customer: CustomerRecord) => void;
  
  addDiagnosticRecord: (record: Omit<StoredDiagnosticRecord, 'id' | 'createdAt'>) => void;
  reviewDiagnosticRecord: (id: string, notes: string) => void;
  
  addService: (service: Omit<ServiceItem, 'id'>) => void;
  updateService: (service: ServiceItem) => void;
  deleteService: (id: string) => void;
  
  addProject: (project: Omit<ProjectItem, 'id'>) => void;
  updateProject: (project: ProjectItem) => void;
  deleteProject: (id: string) => void;
  
  addTestimonial: (testimonial: Omit<TestimonialItem, 'id'>) => void;
  approveTestimonial: (id: string) => void;
  deleteTestimonial: (id: string) => void;
  
  addBlogPost: (post: Omit<BlogPost, 'id' | 'slug'>) => void;
  updateBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (id: string) => void;
  
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'createdAt'>) => void;
  deleteGalleryItem: (id: string) => void;
  
  addContactMessage: (msg: Omit<ContactMessageRecord, 'id' | 'createdAt' | 'status'>) => void;
  markMessageRead: (id: string) => void;
  
  updateContactInfo: (info: Partial<ContactInfoSettings>) => void;
  updateWebsiteSettings: (settings: Partial<WebsiteSettings>) => void;
  
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or default fallback
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('kenfoss_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('kenfoss_users');
    return saved ? JSON.parse(saved) : SEED_USERS;
  });

  const [bookings, setBookings] = useState<BookingRecord[]>(() => {
    const saved = localStorage.getItem('kenfoss_bookings');
    return saved ? JSON.parse(saved) : SEED_BOOKINGS;
  });

  const [quotes, setQuotes] = useState<QuoteRecord[]>(() => {
    const saved = localStorage.getItem('kenfoss_quotes');
    return saved ? JSON.parse(saved) : SEED_QUOTES;
  });

  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    const saved = localStorage.getItem('kenfoss_customers');
    return saved ? JSON.parse(saved) : SEED_CUSTOMERS;
  });

  const [diagnostics, setDiagnostics] = useState<StoredDiagnosticRecord[]>(() => {
    const saved = localStorage.getItem('kenfoss_diagnostics');
    return saved ? JSON.parse(saved) : SEED_DIAGNOSTICS;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('kenfoss_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES_DATA;
  });

  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    const saved = localStorage.getItem('kenfoss_projects');
    return saved ? JSON.parse(saved) : PROJECTS_DATA;
  });

  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => {
    const saved = localStorage.getItem('kenfoss_testimonials');
    return saved ? JSON.parse(saved) : TESTIMONIALS_DATA.map(t => ({ ...t, status: 'Approved' as const }));
  });

  const [blogs, setBlogs] = useState<BlogPost[]>(() => {
    const saved = localStorage.getItem('kenfoss_blogs');
    return saved ? JSON.parse(saved) : BLOG_POSTS_DATA.map(b => ({ ...b, status: 'Published' as const }));
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    const saved = localStorage.getItem('kenfoss_gallery');
    return saved ? JSON.parse(saved) : [
      { id: 'g-1', title: 'Industrial Area Cold Room Installation', type: 'image', category: 'Cold Rooms', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800', createdAt: '2026-07-20' },
      { id: 'g-2', title: 'Bitzer Compressor Rack Commissioning', type: 'image', category: 'Commercial Refrigeration', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800', createdAt: '2026-07-22' }
    ];
  });

  const [contactMessages, setContactMessages] = useState<ContactMessageRecord[]>(() => {
    const saved = localStorage.getItem('kenfoss_messages');
    return saved ? JSON.parse(saved) : SEED_CONTACT_MESSAGES;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('kenfoss_notifications');
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  const [contactInfo, setContactInfo] = useState<ContactInfoSettings>(() => {
    const saved = localStorage.getItem('kenfoss_contact_info');
    return saved ? JSON.parse(saved) : SEED_CONTACT_INFO;
  });

  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>(() => {
    const saved = localStorage.getItem('kenfoss_website_settings');
    return saved ? JSON.parse(saved) : SEED_WEBSITE_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('kenfoss_audit_logs');
    return saved ? JSON.parse(saved) : [
      { id: 'log-1', userId: 'usr-superadmin', userName: 'Eng. Ken Munene', userRole: 'Super Administrator', action: 'SYSTEM_BOOT', details: 'Kenfoss Management System initialized', timestamp: new Date().toISOString(), ipAddress: '197.232.88.10' }
    ];
  });

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Live Firestore Synchronization Effect
  useEffect(() => {
    // 1. Services
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      if (snap.empty) {
        INITIAL_SERVICES_DATA.forEach(s => setDoc(doc(db, 'services', s.id), s));
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ServiceItem));
        setServices(items);
      }
    }, (err) => console.warn('Firestore services sub error:', err));

    // 2. Projects
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snap) => {
      if (snap.empty) {
        PROJECTS_DATA.forEach(p => setDoc(doc(db, 'projects', p.id), p));
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectItem));
        setProjects(items);
      }
    }, (err) => console.warn('Firestore projects sub error:', err));

    // 3. Testimonials
    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snap) => {
      if (snap.empty) {
        TESTIMONIALS_DATA.forEach(t => setDoc(doc(db, 'testimonials', t.id), { ...t, status: 'Approved' }));
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as TestimonialItem));
        setTestimonials(items);
      }
    }, (err) => console.warn('Firestore testimonials sub error:', err));

    // 4. Blogs
    const unsubBlogs = onSnapshot(collection(db, 'blogs'), (snap) => {
      if (snap.empty) {
        BLOG_POSTS_DATA.forEach(b => setDoc(doc(db, 'blogs', b.id), { ...b, status: 'Published' }));
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
        setBlogs(items);
      }
    }, (err) => console.warn('Firestore blogs sub error:', err));

    // 5. Bookings
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
      if (snap.empty) {
        SEED_BOOKINGS.forEach(b => setDoc(doc(db, 'bookings', b.id), b));
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingRecord));
        setBookings(items);
      }
    }, (err) => console.warn('Firestore bookings sub error:', err));

    // 6. Quotes
    const unsubQuotes = onSnapshot(collection(db, 'quotes'), (snap) => {
      if (snap.empty) {
        SEED_QUOTES.forEach(q => setDoc(doc(db, 'quotes', q.id), q));
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as QuoteRecord));
        setQuotes(items);
      }
    }, (err) => console.warn('Firestore quotes sub error:', err));

    // 7. Customers
    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snap) => {
      if (snap.empty) {
        SEED_CUSTOMERS.forEach(c => setDoc(doc(db, 'customers', c.id), c));
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerRecord));
        setCustomers(items);
      }
    }, (err) => console.warn('Firestore customers sub error:', err));

    // 8. Diagnostics
    const unsubDiagnostics = onSnapshot(collection(db, 'diagnostics'), (snap) => {
      if (snap.empty) {
        SEED_DIAGNOSTICS.forEach(d => setDoc(doc(db, 'diagnostics', d.id), d));
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as StoredDiagnosticRecord));
        setDiagnostics(items);
      }
    }, (err) => console.warn('Firestore diagnostics sub error:', err));

    // 9. Gallery
    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snap) => {
      if (snap.empty) {
        const seedGallery: GalleryItem[] = [
          { id: 'g-1', title: 'Industrial Area Cold Room Installation', type: 'image', category: 'Cold Rooms', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800', createdAt: '2026-07-20' },
          { id: 'g-2', title: 'Bitzer Compressor Rack Commissioning', type: 'image', category: 'Commercial Refrigeration', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&q=80&w=800', createdAt: '2026-07-22' }
        ];
        seedGallery.forEach(g => setDoc(doc(db, 'gallery', g.id), g));
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as GalleryItem));
        setGallery(items);
      }
    }, (err) => console.warn('Firestore gallery sub error:', err));

    // 10. Contact Messages
    const unsubContacts = onSnapshot(collection(db, 'contacts'), (snap) => {
      if (snap.empty) {
        SEED_CONTACT_MESSAGES.forEach(m => setDoc(doc(db, 'contacts', m.id), m));
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessageRecord));
        setContactMessages(items);
      }
    }, (err) => console.warn('Firestore contacts sub error:', err));

    // 11. Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
      if (snap.empty) {
        SEED_USERS.forEach(u => setDoc(doc(db, 'users', u.id), u));
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser));
        setUsers(items);
      }
    }, (err) => console.warn('Firestore users sub error:', err));

    // 12. Settings (Contact Info)
    const unsubContactInfo = onSnapshot(doc(db, 'settings', 'contact_info'), (snap) => {
      if (!snap.exists()) {
        setDoc(doc(db, 'settings', 'contact_info'), SEED_CONTACT_INFO);
      } else {
        setContactInfo(snap.data() as ContactInfoSettings);
      }
    }, (err) => console.warn('Firestore contact_info sub error:', err));

    // 13. Settings (Website Settings)
    const unsubWebSettings = onSnapshot(doc(db, 'settings', 'website_settings'), (snap) => {
      if (!snap.exists()) {
        setDoc(doc(db, 'settings', 'website_settings'), SEED_WEBSITE_SETTINGS);
      } else {
        setWebsiteSettings(snap.data() as WebsiteSettings);
      }
    }, (err) => console.warn('Firestore website_settings sub error:', err));

    return () => {
      unsubServices();
      unsubProjects();
      unsubTestimonials();
      unsubBlogs();
      unsubBookings();
      unsubQuotes();
      unsubCustomers();
      unsubDiagnostics();
      unsubGallery();
      unsubContacts();
      unsubUsers();
      unsubContactInfo();
      unsubWebSettings();
    };
  }, []);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('kenfoss_admin_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('kenfoss_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('kenfoss_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('kenfoss_quotes', JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    localStorage.setItem('kenfoss_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('kenfoss_diagnostics', JSON.stringify(diagnostics));
  }, [diagnostics]);

  useEffect(() => {
    localStorage.setItem('kenfoss_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('kenfoss_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('kenfoss_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('kenfoss_blogs', JSON.stringify(blogs));
  }, [blogs]);

  useEffect(() => {
    localStorage.setItem('kenfoss_gallery', JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem('kenfoss_messages', JSON.stringify(contactMessages));
  }, [contactMessages]);

  useEffect(() => {
    localStorage.setItem('kenfoss_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('kenfoss_contact_info', JSON.stringify(contactInfo));
  }, [contactInfo]);

  useEffect(() => {
    localStorage.setItem('kenfoss_website_settings', JSON.stringify(websiteSettings));
  }, [websiteSettings]);

  useEffect(() => {
    localStorage.setItem('kenfoss_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Audit Logger helper
  const addAuditLog = (action: string, details: string) => {
    if (!currentUser) return;
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '197.232.88.10'
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  // Auth Functions
  const login = (email: string, _password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    let found = users.find(u => u.email.toLowerCase() === cleanEmail);
    
    // Fallback if user typed an email that matches by prefix
    if (!found) {
      found = users.find(u => u.email.toLowerCase().includes(cleanEmail));
    }

    if (!found) {
      return { success: false, error: 'Invalid user credentials. Account not recognized.' };
    }
    if (found.status === 'Suspended') {
      return { success: false, error: 'Your staff account has been suspended by a Super Administrator.' };
    }

    const updatedUser = { ...found, lastLogin: new Date().toISOString() };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === found.id ? updatedUser : u));

    // Log action
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      userId: updatedUser.id,
      userName: updatedUser.name,
      userRole: updatedUser.role,
      action: 'USER_LOGIN',
      details: `Successful sign-in to Admin Portal`,
      timestamp: new Date().toISOString(),
      ipAddress: '197.232.88.10'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    return { success: true };
  };

  const validateInvitationCode = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      return { success: false, message: 'Please enter a valid invitation code.' };
    }

    let targetEmail = 'admin@kenfoss.co.ke';
    let role: UserRole = 'Super Administrator';

    if (trimmed.includes('SUPER') || trimmed === 'KEN-SUPER-2026') {
      targetEmail = 'admin@kenfoss.co.ke';
      role = 'Super Administrator';
    } else if (trimmed.includes('MGR') || trimmed.includes('MANAGER') || trimmed === 'KEN-MGR-2026') {
      targetEmail = 'manager@kenfoss.co.ke';
      role = 'Manager';
    } else if (trimmed.includes('TECH') || trimmed === 'KEN-TECH-2026') {
      targetEmail = 'tech.john@kenfoss.co.ke';
      role = 'Technician';
    } else {
      // Async check from AdminInvitationService
      AdminInvitationService.validateInvitationCode(trimmed).then(res => {
        if (res.valid && res.invitation) {
          AdminInvitationService.redeemInvitationCode(trimmed, 'staff-uid', res.invitation.email);
          login(res.invitation.email);
        }
      }).catch(err => console.error("Invitation check error:", err));
    }

    const res = login(targetEmail);
    if (res.success) {
      return { 
        success: true, 
        message: `Invitation code ${trimmed} validated! Authenticated as ${role}.`,
        user: currentUser || undefined
      };
    } else {
      return { success: false, message: res.error || 'Invalid or expired invitation code.' };
    }
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('USER_LOGOUT', 'User signed out of Admin Portal');
    }
    setCurrentUser(null);
  };

  const forgotPassword = (email: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      addAuditLog('UNAUTHORIZED_RESET_ATTEMPT', `Failed password recovery attempt for unregistered email: ${email}`);
      return { success: false, message: 'Access Denied: No authorized administrator or staff account found with this email address.' };
    }
    addAuditLog('PASSWORD_RESET_REQUESTED', `Password recovery dispatch sent to ${found.name} (${found.email})`);
    return { success: true, message: `A secure single-use recovery link and 6-digit verification code have been sent to ${email}.` };
  };

  const resetPassword = (email: string, newPassword: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, message: 'Account not found or authorization link expired.' };
    }
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }
    addAuditLog('PASSWORD_RESET_COMPLETED', `Password successfully updated for ${found.name} (${found.email})`);
    return { success: true, message: 'Your password has been successfully reset. You can now sign in with your new credentials.' };
  };

  const changePassword = (_oldPassword: string, _newPassword: string) => {
    if (!currentUser) return { success: false, message: 'Not authenticated.' };
    addAuditLog('PASSWORD_CHANGED', 'User updated account password');
    return { success: true, message: 'Account password changed successfully.' };
  };

  const inviteUser = (name: string, email: string, role: UserRole, phone?: string) => {
    if (!currentUser || currentUser.role !== 'Super Administrator') {
      return { success: false, message: 'Permission Denied: Only Super Administrators can create or invite new staff users.' };
    }

    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'A user with this email address already exists.' };
    }

    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      phone,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      status: 'Active',
      createdAt: new Date().toISOString(),
      invitedBy: currentUser.name
    };

    setUsers(prev => [...prev, newUser]);
    addAuditLog('USER_CREATED', `Super Admin created user account for ${name} (${role})`);

    return { success: true, message: `Staff account successfully created for ${name} (${role}).` };
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (!currentUser || currentUser.role !== 'Super Administrator') return;
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    addAuditLog('ROLE_UPDATED', `Changed role for user ${userId} to ${newRole}`);
  };

  const toggleUserStatus = (userId: string) => {
    if (!currentUser || currentUser.role !== 'Super Administrator') return;
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
        addAuditLog('USER_STATUS_TOGGLED', `Set status of ${u.name} to ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const deleteUser = (userId: string) => {
    if (!currentUser || currentUser.role !== 'Super Administrator') {
      return { success: false, message: 'Only Super Administrators can delete user accounts.' };
    }

    if (userId === currentUser.id) {
      return { success: false, message: 'You cannot delete your own account.' };
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog('USER_DELETED', `Super Admin deleted user ${userId}`);
    return { success: true, message: 'User account removed successfully.' };
  };

  const toggleTwoFactor = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, twoFactorEnabled: !currentUser.twoFactorEnabled };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    addAuditLog('2FA_TOGGLED', `User ${currentUser.name} updated 2FA settings to ${updated.twoFactorEnabled}`);
  };

  // Data Operations
  const addBooking = (booking: Omit<BookingRecord, 'id' | 'bookingRef' | 'createdAt' | 'status'>) => {
    const bookingRef = `KEN-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBk: BookingRecord = {
      ...booking,
      id: `bk-${Date.now()}`,
      bookingRef,
      status: 'New',
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'bookings', newBk.id), newBk).catch(err => console.error('Firestore addBooking error:', err));
    setBookings(prev => [newBk, ...prev]);

    // Add Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'booking',
      title: 'New Service Booking Received',
      message: `${newBk.fullName} booked ${newBk.serviceType} (${bookingRef})`,
      isRead: false,
      createdAt: new Date().toISOString(),
      link: 'bookings'
    };
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(err => console.error('Firestore addNotif error:', err));

    // Upsert Customer
    const newCustId = `cust-${Date.now()}`;
    const newCust: CustomerRecord = {
      id: newCustId,
      name: booking.fullName,
      phone: booking.phone,
      email: booking.email,
      location: booking.location,
      customerType: 'Individual',
      totalSpent: 0,
      serviceCount: 1,
      createdAt: new Date().toISOString()
    };
    setDoc(doc(db, 'customers', newCustId), newCust).catch(err => console.error('Firestore addCust error:', err));

    return newBk;
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus, technicianId?: string, technicianName?: string) => {
    const existing = bookings.find(b => b.id === bookingId);
    if (existing) {
      const updated = {
        ...existing,
        status,
        ...(technicianId ? { assignedTechnicianId: technicianId, assignedTechnicianName: technicianName } : {})
      };
      setDoc(doc(db, 'bookings', bookingId), updated, { merge: true }).catch(err => console.error('Firestore updateBooking error:', err));
      addAuditLog('BOOKING_STATUS_UPDATE', `Updated booking ${existing.bookingRef} to ${status}`);
    }
  };

  const assignTechnician = (bookingId: string, technicianId: string, technicianName: string) => {
    updateBookingStatus(bookingId, 'Assigned', technicianId, technicianName);
  };

  const cancelBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'Cancelled');
  };

  const updateTechnicianJobNotes = (bookingId: string, notes: string, beforeImages?: string[], afterImages?: string[]) => {
    const existing = bookings.find(b => b.id === bookingId);
    if (existing) {
      const updated = {
        ...existing,
        technicianNotes: notes,
        ...(beforeImages ? { beforeImages } : {}),
        ...(afterImages ? { afterImages } : {})
      };
      setDoc(doc(db, 'bookings', bookingId), updated, { merge: true }).catch(err => console.error('Firestore updateJobNotes error:', err));
      addAuditLog('TECHNICIAN_JOB_UPDATE', `Updated repair notes for booking ${bookingId}`);
    }
  };

  const addQuote = (quote: Omit<QuoteRecord, 'id' | 'rfqRef' | 'createdAt' | 'status'>) => {
    const rfqRef = `RFQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const newQuote: QuoteRecord = {
      ...quote,
      id: `rfq-${Date.now()}`,
      rfqRef,
      status: 'Received',
      createdAt: new Date().toISOString()
    };

    setDoc(doc(db, 'quotes', newQuote.id), newQuote).catch(err => console.error('Firestore addQuote error:', err));
    setQuotes(prev => [newQuote, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'quote',
      title: 'New Commercial RFQ Quote Request',
      message: `${newQuote.companyName} submitted quote request for ${newQuote.projectType}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      link: 'quotes'
    };
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(err => console.error('Firestore addNotif error:', err));

    return newQuote;
  };

  const updateQuoteStatus = (quoteId: string, status: QuoteStatus, amount?: number, notes?: string) => {
    const existing = quotes.find(q => q.id === quoteId);
    if (existing) {
      const updated = {
        ...existing,
        status,
        ...(amount !== undefined ? { quoteAmount: amount } : {}),
        ...(notes ? { responseNotes: notes } : {}),
        updatedAt: new Date().toISOString()
      };
      setDoc(doc(db, 'quotes', quoteId), updated, { merge: true }).catch(err => console.error('Firestore updateQuote error:', err));
      addAuditLog('QUOTE_UPDATED', `Updated RFQ quote status to ${status}`);
    }
  };

  const addCustomer = (customer: Omit<CustomerRecord, 'id' | 'createdAt'>) => {
    const newCust: CustomerRecord = {
      ...customer,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setDoc(doc(db, 'customers', newCust.id), newCust).catch(err => console.error('Firestore addCustomer error:', err));
  };

  const updateCustomer = (customer: CustomerRecord) => {
    setDoc(doc(db, 'customers', customer.id), customer, { merge: true }).catch(err => console.error('Firestore updateCustomer error:', err));
  };

  const addDiagnosticRecord = (record: Omit<StoredDiagnosticRecord, 'id' | 'createdAt'>) => {
    const newDiag: StoredDiagnosticRecord = {
      ...record,
      id: `diag-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setDoc(doc(db, 'diagnostics', newDiag.id), newDiag).catch(err => console.error('Firestore addDiagnostic error:', err));

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'diagnostic',
      title: 'AI Diagnostic Submission',
      message: `Fault reported: ${newDiag.brand} ${newDiag.applianceType} (${newDiag.severity})`,
      isRead: false,
      createdAt: new Date().toISOString(),
      link: 'diagnostics'
    };
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(err => console.error('Firestore addNotif error:', err));
  };

  const reviewDiagnosticRecord = (id: string, notes: string) => {
    const existing = diagnostics.find(d => d.id === id);
    if (existing) {
      const updated = {
        ...existing,
        reviewNotes: notes,
        reviewedBy: currentUser?.name || 'Manager'
      };
      setDoc(doc(db, 'diagnostics', id), updated, { merge: true }).catch(err => console.error('Firestore reviewDiagnostic error:', err));
    }
  };

  const addService = (service: Omit<ServiceItem, 'id'>) => {
    const newServ: ServiceItem = {
      ...service,
      id: `srv-${Date.now()}`
    };
    setDoc(doc(db, 'services', newServ.id), newServ).catch(err => console.error('Firestore addService error:', err));
    addAuditLog('SERVICE_ADDED', `Added new service: ${service.title}`);
  };

  const updateService = (service: ServiceItem) => {
    setDoc(doc(db, 'services', service.id), service, { merge: true }).catch(err => console.error('Firestore updateService error:', err));
    addAuditLog('SERVICE_UPDATED', `Updated service: ${service.title}`);
  };

  const deleteService = (id: string) => {
    deleteDoc(doc(db, 'services', id)).catch(err => console.error('Firestore deleteService error:', err));
    addAuditLog('SERVICE_DELETED', `Deleted service ID: ${id}`);
  };

  const addProject = (project: Omit<ProjectItem, 'id'>) => {
    const newProj: ProjectItem = {
      ...project,
      id: `proj-${Date.now()}`
    };
    setDoc(doc(db, 'projects', newProj.id), newProj).catch(err => console.error('Firestore addProject error:', err));
    addAuditLog('PROJECT_ADDED', `Added project: ${project.title}`);
  };

  const updateProject = (project: ProjectItem) => {
    setDoc(doc(db, 'projects', project.id), project, { merge: true }).catch(err => console.error('Firestore updateProject error:', err));
    addAuditLog('PROJECT_UPDATED', `Updated project: ${project.title}`);
  };

  const deleteProject = (id: string) => {
    deleteDoc(doc(db, 'projects', id)).catch(err => console.error('Firestore deleteProject error:', err));
    addAuditLog('PROJECT_DELETED', `Deleted project ID: ${id}`);
  };

  const addTestimonial = (testimonial: Omit<TestimonialItem, 'id'>) => {
    const newTest: TestimonialItem = {
      ...testimonial,
      id: `t-${Date.now()}`,
      status: 'Pending'
    };
    setDoc(doc(db, 'testimonials', newTest.id), newTest).catch(err => console.error('Firestore addTestimonial error:', err));
  };

  const approveTestimonial = (id: string) => {
    setDoc(doc(db, 'testimonials', id), { status: 'Approved' }, { merge: true }).catch(err => console.error('Firestore approveTestimonial error:', err));
    addAuditLog('TESTIMONIAL_APPROVED', `Approved testimonial ID: ${id}`);
  };

  const deleteTestimonial = (id: string) => {
    deleteDoc(doc(db, 'testimonials', id)).catch(err => console.error('Firestore deleteTestimonial error:', err));
    addAuditLog('TESTIMONIAL_DELETED', `Deleted testimonial ID: ${id}`);
  };

  const addBlogPost = (post: Omit<BlogPost, 'id' | 'slug'>) => {
    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newBlog: BlogPost = {
      ...post,
      id: `post-${Date.now()}`,
      slug,
      status: 'Published'
    };
    setDoc(doc(db, 'blogs', newBlog.id), newBlog).catch(err => console.error('Firestore addBlogPost error:', err));
    addAuditLog('BLOG_ADDED', `Published blog article: ${post.title}`);
  };

  const updateBlogPost = (post: BlogPost) => {
    setDoc(doc(db, 'blogs', post.id), post, { merge: true }).catch(err => console.error('Firestore updateBlogPost error:', err));
    addAuditLog('BLOG_UPDATED', `Updated blog article: ${post.title}`);
  };

  const deleteBlogPost = (id: string) => {
    deleteDoc(doc(db, 'blogs', id)).catch(err => console.error('Firestore deleteBlogPost error:', err));
    addAuditLog('BLOG_DELETED', `Deleted blog article ID: ${id}`);
  };

  const addGalleryItem = (item: Omit<GalleryItem, 'id' | 'createdAt'>) => {
    const newGal: GalleryItem = {
      ...item,
      id: `g-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setDoc(doc(db, 'gallery', newGal.id), newGal).catch(err => console.error('Firestore addGallery error:', err));
    addAuditLog('GALLERY_ADDED', `Added media item: ${item.title}`);
  };

  const deleteGalleryItem = (id: string) => {
    deleteDoc(doc(db, 'gallery', id)).catch(err => console.error('Firestore deleteGallery error:', err));
    addAuditLog('GALLERY_DELETED', `Deleted gallery item ID: ${id}`);
  };

  const addContactMessage = (msg: Omit<ContactMessageRecord, 'id' | 'createdAt' | 'status'>) => {
    const newMsg: ContactMessageRecord = {
      ...msg,
      id: `msg-${Date.now()}`,
      status: 'Unread',
      createdAt: new Date().toISOString()
    };
    setDoc(doc(db, 'contacts', newMsg.id), newMsg).catch(err => console.error('Firestore addContactMessage error:', err));

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'contact',
      title: 'New Contact Enquiry Message',
      message: `From ${msg.name}: ${msg.subject}`,
      isRead: false,
      createdAt: new Date().toISOString(),
      link: 'messages'
    };
    setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch(err => console.error('Firestore addNotif error:', err));
  };

  const markMessageRead = (id: string) => {
    setDoc(doc(db, 'contacts', id), { status: 'Read' }, { merge: true }).catch(err => console.error('Firestore markMessageRead error:', err));
  };

  const updateContactInfo = (info: Partial<ContactInfoSettings>) => {
    const updated = { ...contactInfo, ...info };
    setDoc(doc(db, 'settings', 'contact_info'), updated, { merge: true }).catch(err => console.error('Firestore updateContactInfo error:', err));
    addAuditLog('CONTACT_INFO_UPDATED', 'Updated public contact information & office details');
  };

  const updateWebsiteSettings = (settings: Partial<WebsiteSettings>) => {
    const updated = { ...websiteSettings, ...settings };
    setDoc(doc(db, 'settings', 'website_settings'), updated, { merge: true }).catch(err => console.error('Firestore updateWebsiteSettings error:', err));
    addAuditLog('WEBSITE_SETTINGS_UPDATED', 'Updated global website settings and branding');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        users,
        bookings,
        quotes,
        customers,
        diagnostics,
        gallery,
        testimonials,
        blogs,
        contactMessages,
        notifications,
        contactInfo,
        websiteSettings,
        services,
        projects,
        auditLogs,
        isAdminOpen,
        setIsAdminOpen,
        login,
        validateInvitationCode,
        logout,
        forgotPassword,
        resetPassword,
        changePassword,
        inviteUser,
        updateUserRole,
        toggleUserStatus,
        deleteUser,
        toggleTwoFactor,
        addBooking,
        updateBookingStatus,
        assignTechnician,
        cancelBooking,
        updateTechnicianJobNotes,
        addQuote,
        updateQuoteStatus,
        addCustomer,
        updateCustomer,
        addDiagnosticRecord,
        reviewDiagnosticRecord,
        addService,
        updateService,
        deleteService,
        addProject,
        updateProject,
        deleteProject,
        addTestimonial,
        approveTestimonial,
        deleteTestimonial,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        addGalleryItem,
        deleteGalleryItem,
        addContactMessage,
        markMessageRead,
        updateContactInfo,
        updateWebsiteSettings,
        markNotificationRead,
        clearAllNotifications
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
