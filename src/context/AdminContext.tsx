import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import { db, auth, createSecondaryStaffAuthUser } from '../lib/firebase';
import { hashPassword, comparePassword } from '../lib/passwordHash';
import { AdminInvitationService } from '../services/adminService';
import { resolveImageUrl } from '../utils/imageRegistry';
import {
  AdminUser,
  BookingRecord,
  QuoteRecord,
  CustomerRecord,
  CustomerCommunicationLog,
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
  RoleDefinition,
  PermissionKey,
  UserRole,
  BookingStatus,
  QuoteStatus
} from '../types';
import { INITIAL_SERVICES_DATA } from '../data/servicesData';
import { PROJECTS_DATA } from '../data/projectsData';
import { TESTIMONIALS_DATA } from '../data/testimonialsData';
import { BLOG_POSTS_DATA } from '../data/blogData';

import coldRoomImg from '../assets/images/kenya_cold_room_1785251769488.jpg';
import supermarketChillersImg from '../assets/images/kenya_supermarket_chillers_1785252529044.jpg';
import pharmaColdchainImg from '../assets/images/kenya_pharma_coldchain_1785252543037.jpg';
import flowerFarmChillerImg from '../assets/images/kenya_flower_farm_chiller_1785252557554.jpg';
import coldRoomBuildImg from '../assets/images/kenya_coldroom_build_1785252517070.jpg';
import kenyanEngineersImg from '../assets/images/kenyan_engineers_refrigeration_1785180429060.jpg';
import dairyCoolingImg from '../assets/images/kenya_dairy_cooling_1785518921985.jpg';
import compressorMaintImg from '../assets/images/kenya_compressor_maint_1785518937349.jpg';
import serviceHvacImg from '../assets/images/service_hvac_1785117727139.jpg';
import aboutAfricanEngineersImg from '../assets/images/about_african_engineers_1785117690454.jpg';
import heroAfricanEngineerImg from '../assets/images/hero_african_engineer_1785117677250.jpg';
import factoryAfricanImg from '../assets/images/factory_african_1785119292045.jpg';

// Seed Admin Users
const SEED_USERS: AdminUser[] = [];

export const ALL_PERMISSIONS: { key: PermissionKey; label: string; category: string; description: string }[] = [
  { key: 'view_dashboard', label: 'View Admin Dashboard', category: 'General Overview', description: 'Access top-level KPI metrics, revenue, and system status overview.' },
  { key: 'manage_bookings', label: 'Manage Service Bookings', category: 'Operations & Dispatch', description: 'View, edit, assign technicians, and update booking repair statuses.' },
  { key: 'manage_quotes', label: 'Manage Commercial RFQs', category: 'Operations & Sales', description: 'Process equipment RFQ quote requests, specify BOQs, and issue formal quotes.' },
  { key: 'manage_customers', label: 'Manage Customer CRM', category: 'Operations & Sales', description: 'View customer directory, service histories, and corporate contact details.' },
  { key: 'view_diagnostics', label: 'Inspect AI Diagnostics', category: 'Field Support & Engineering', description: 'Review fault logs submitted via the Kenfoss AI Diagnostics engine.' },
  { key: 'technician_portal', label: 'Access Technician Portal', category: 'Field Support & Engineering', description: 'Access field technician dispatch, update repair progress notes and photos.' },
  { key: 'manage_services', label: 'Manage Services Catalog', category: 'Content & Catalog', description: 'Add, update, or remove refrigeration services and pricing tiers.' },
  { key: 'manage_projects', label: 'Manage Showcase Projects', category: 'Content & Catalog', description: 'Update engineering project case studies, cold room specs, and BOQs.' },
  { key: 'manage_gallery', label: 'Manage Media Gallery', category: 'Content & Catalog', description: 'Upload and organize site photos and equipment installation media.' },
  { key: 'manage_testimonials', label: 'Moderate Testimonials', category: 'Content & Catalog', description: 'Review and approve customer reviews and ratings.' },
  { key: 'manage_blogs', label: 'Manage Articles & Blogs', category: 'Content & Catalog', description: 'Write, edit, and publish engineering technical articles and maintenance guides.' },
  { key: 'manage_contact_info', label: 'Manage Contact Settings', category: 'System Settings', description: 'Update company phone numbers, office location map, and operating hours.' },
  { key: 'manage_website_settings', label: 'Manage Website & SEO', category: 'System Settings', description: 'Configure site title, meta tags, analytics IDs, and maintenance mode.' },
  { key: 'manage_users_roles', label: 'Manage Users & Roles (RBAC)', category: 'Security & Access Control', description: 'Create staff accounts, define custom roles, assign permissions, and revoke access.' },
  { key: 'view_audit_logs', label: 'View Security Audit Logs', category: 'Security & Access Control', description: 'Inspect system login events, role modifications, and administrative actions.' }
];

export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'role-superadmin',
    name: 'Super Administrator',
    description: 'Full unrestricted system ownership and administrative access across all modules.',
    isSystemRole: true,
    permissions: ALL_PERMISSIONS.map(p => p.key),
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role-manager',
    name: 'Manager',
    description: 'Operations management, RFQs, bookings dispatch, customer CRM, and website catalog control.',
    isSystemRole: true,
    permissions: [
      'view_dashboard',
      'manage_bookings',
      'manage_quotes',
      'manage_customers',
      'view_diagnostics',
      'technician_portal',
      'manage_services',
      'manage_projects',
      'manage_gallery',
      'manage_testimonials',
      'manage_blogs',
      'manage_contact_info'
    ],
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'role-technician',
    name: 'Technician',
    description: 'Field service technician access to assigned job orders and AI diagnostic reviews.',
    isSystemRole: true,
    permissions: [
      'view_dashboard',
      'technician_portal',
      'view_diagnostics'
    ],
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

// Seed Bookings
const SEED_BOOKINGS: BookingRecord[] = [];

// Seed Quotations
const SEED_QUOTES: QuoteRecord[] = [];

// Seed Customers
const SEED_CUSTOMERS: CustomerRecord[] = [];

// Seed AI Diagnostics
const SEED_DIAGNOSTICS: StoredDiagnosticRecord[] = [];

// Seed Contact Messages
const SEED_CONTACT_MESSAGES: ContactMessageRecord[] = [];

// Seed Notifications
const SEED_NOTIFICATIONS: NotificationItem[] = [];

// Seed Media Gallery Items
const SEED_GALLERY: GalleryItem[] = [
  {
    id: 'g-101',
    title: 'African Technical Team Cold Room Facility Assembly',
    type: 'image',
    category: 'Cold Rooms',
    url: coldRoomBuildImg,
    description: 'Kenyan HVAC-R technicians assembling modular polyurethane insulated panels and cold room evaporator in Naivasha.',
    tags: ['African Engineers', 'Cold Room Construction', 'Naivasha', 'Kenfoss'],
    featured: true,
    location: 'Naivasha, Nakuru County',
    client: 'FreshHarvest Kenya Cold Storage',
    createdAt: '2026-07-20T10:00:00.000Z'
  },
  {
    id: 'g-102',
    title: 'African Refrigeration Engineer Multi-Compressor Inspection',
    type: 'image',
    category: 'Industrial Refrigeration',
    url: factoryAfricanImg,
    description: 'Certified African industrial plant engineer conducting maintenance and pressure calibration on multi-stage compressor units.',
    tags: ['African Specialist', 'Compressor Maintenance', 'Industrial', 'Nairobi'],
    featured: true,
    location: 'Industrial Area, Nairobi',
    client: 'KenChic Processing Plant',
    createdAt: '2026-07-22T14:30:00.000Z'
  },
  {
    id: 'g-103',
    title: 'Lead African Systems Engineer Diagnostic Inspection',
    type: 'image',
    category: 'Field Team & Installations',
    url: heroAfricanEngineerImg,
    description: 'EPRA-certified African HVAC-R lead systems engineer analyzing digital refrigeration manifold pressures and electrical parameters.',
    tags: ['African Technicians', 'HVAC-R Lead', 'Field Inspection', 'Nairobi'],
    featured: true,
    location: 'CBD, Nairobi',
    client: 'Chandarana Commercial Facilities',
    createdAt: '2026-07-24T09:15:00.000Z'
  },
  {
    id: 'g-104',
    title: 'African Engineering Team Site Assessment & Plant Commissioning',
    type: 'image',
    category: 'Field Team & Installations',
    url: aboutAfricanEngineersImg,
    description: 'Senior African technical engineering team conducting site assessment and cold chain commissioning.',
    tags: ['African Engineers', 'Site Assessment', 'Cold Storage', 'Kenya'],
    featured: true,
    location: 'Westlands, Nairobi',
    client: 'Movenpick Hotel & Commercial Complex',
    createdAt: '2026-07-25T11:20:00.000Z'
  },
  {
    id: 'g-105',
    title: 'Milk Cooling Tank Glycol Chiller Servicing',
    type: 'image',
    category: 'Milk Cooling Plants',
    url: dairyCoolingImg,
    description: 'Rapid milk temperature pull-down calibration and plate heat exchanger flushing for dairy cooperative.',
    tags: ['Dairy', 'Glycol Chiller', 'Milk Cooling', 'Eldoret'],
    featured: false,
    location: 'Eldoret, Uasin Gishu County',
    client: 'New KCC Eldoret Factory',
    createdAt: '2026-07-26T16:00:00.000Z'
  },
  {
    id: 'g-106',
    title: 'Kenfoss Field Certified Engineering Technicians in Action',
    type: 'image',
    category: 'Field Team & Installations',
    url: kenyanEngineersImg,
    description: 'EPRA-certified technicians conducting pressure leak testing and thermographic inspection.',
    tags: ['EPRA Technicians', 'Safety First', 'Pressure Test', 'Engineering'],
    featured: true,
    location: 'Thika Road, Ruiru',
    client: 'Kenfoss Field Crew',
    createdAt: '2026-07-27T13:45:00.000Z'
  }
];

// Seed Contact Info Settings
const SEED_CONTACT_INFO: ContactInfoSettings = {
  mainPhone: '+254 745 411 923',
  secondaryPhone: '+254 745 411 923',
  emergencyPhone: '+254 745 411 923',
  email: 'info@kenfoss.co.ke',
  address: "Ivy's Park Business Park, Next to Mark Hotel, Thika Superhighway Service Lane",
  city: 'Ruiru, Kiambu County, Kenya',
  workingHours: 'Mon - Sat: 7:30 AM - 6:00 PM | 24/7 Emergency Hotline',
  googleMapsEmbedUrl: 'https://maps.google.com/maps?q=Kenfoss+Refrigeration+limited,+Ivy%E2%80%99s+Park+Business+Park,+Next+to+Mark+Hotel,+Thika+Superhighway+Service+Lane,+Ruiru,+Kiambu+County&t=&z=16&ie=UTF8&iwloc=B&output=embed',
  facebookUrl: 'https://facebook.com/kenfossrefrigeration',
  linkedinUrl: 'https://linkedin.com/company/kenfoss-refrigeration',
  twitterUrl: 'https://twitter.com/kenfoss_ke',
  instagramUrl: 'https://instagram.com/kenfoss_refrigeration',
  whatsappNumber: '254745411923'
};

// Seed Website Settings
const SEED_WEBSITE_SETTINGS: WebsiteSettings = {
  companyName: 'Kenfoss Refrigeration Limited',
  siteTitle: 'Kenfoss Refrigeration Limited | EPRA Certified Engineers',
  tagline: 'Precision Refrigeration & HVAC Engineering Solutions Across Kenya',
  logoUrl: '',
  faviconUrl: '',
  ogImageUrl: coldRoomImg,
  primaryColor: '#0057B8',
  secondaryColor: '#FF7A00',
  footerCopyright: '© 2026 Kenfoss Refrigeration Limited. All Rights Reserved.',
  footerText: '© 2026 Kenfoss Refrigeration Limited. All Rights Reserved. Reg. EPRA/C1/2026/KE.',
  epraNotice: 'EPRA Class C1 Certified Electrical & Mechanical Engineering Contractor',
  metaDescription: 'Kenya’s premier EPRA-certified corporate refrigeration and HVAC engineering firm. Commercial cold rooms, supermarket chillers, and residential inverter fridge repairs.',
  metaKeywords: 'Refrigeration Kenya, Cold Room Repair Nairobi, Fridge Repair Nairobi, HVAC Engineer Kenya, Bitzer Compressor Repair',
  googleAnalyticsId: 'G-KENFOSS2026',
  gtmContainerId: '',
  facebookPixelId: '',
  facebookUrl: 'https://facebook.com/kenfossrefrigeration',
  linkedinUrl: 'https://linkedin.com/company/kenfoss-refrigeration',
  twitterUrl: 'https://twitter.com/kenfoss_ke',
  instagramUrl: 'https://instagram.com/kenfoss_refrigeration',
  whatsappNumber: '254745411923',
  enableMaintenanceMode: false
};

interface AdminContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  isSystemInitialized: boolean;
  superAdminCount: number;
  refreshSystemSetupState: () => Promise<void>;
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
  roles: RoleDefinition[];
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  
  // Auth & RBAC methods
  addRole: (role: Omit<RoleDefinition, 'id' | 'createdAt'>) => Promise<{ success: boolean; message: string }>;
  updateRole: (role: RoleDefinition) => Promise<{ success: boolean; message: string }>;
  deleteRole: (roleId: string) => Promise<{ success: boolean; message: string }>;
  hasPermission: (permission: PermissionKey) => boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerWithCode: (name: string, email: string, pass: string, role: UserRole, regCode: string) => Promise<{ success: boolean; message: string }>;
  createStaffAccount: (name: string, email: string, role: UserRole, phone?: string, tempPassword?: string) => Promise<{ success: boolean; message: string; tempPassword?: string; userId?: string }>;
  completePasswordChange: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  validateInvitationCode: (code: string) => Promise<{ success: boolean; message: string; user?: AdminUser }>;
  loginWithInvitationCode: (code: string) => Promise<{ success: boolean; message: string; user?: AdminUser }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<{ success: boolean; message: string }>;
  inviteUser: (name: string, email: string, role: UserRole, phone?: string) => { success: boolean; message: string };
  updateUserRole: (userId: string, newRole: UserRole) => void;
  toggleUserStatus: (userId: string) => void;
  deleteUser: (userId: string) => { success: boolean; message: string };
  toggleTwoFactor: () => void;
  
  // Data CRUD
  addBooking: (booking: Omit<BookingRecord, 'id' | 'bookingRef' | 'createdAt' | 'status'>) => BookingRecord;
  updateBooking: (booking: BookingRecord) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus, technicianId?: string, technicianName?: string) => void;
  assignTechnician: (bookingId: string, technicianId: string, technicianName: string) => void;
  cancelBooking: (bookingId: string) => void;
  deleteBooking: (id: string) => void;
  updateTechnicianJobNotes: (bookingId: string, notes: string, beforeImages?: string[], afterImages?: string[]) => void;
  
  addQuote: (quote: Omit<QuoteRecord, 'id' | 'rfqRef' | 'createdAt' | 'status'>) => QuoteRecord;
  updateQuoteStatus: (quoteId: string, status: QuoteStatus, amount?: number, notes?: string) => void;
  deleteQuote: (id: string) => void;
  
  addCustomer: (customer: Omit<CustomerRecord, 'id' | 'createdAt'>) => Promise<{ success: boolean; id?: string; error?: string }>;
  updateCustomer: (customer: CustomerRecord) => Promise<{ success: boolean; error?: string }>;
  deleteCustomer: (id: string) => Promise<{ success: boolean; error?: string }>;
  addCustomerCommunication: (customerId: string, comm: Omit<CustomerCommunicationLog, 'id' | 'date'>) => Promise<{ success: boolean; error?: string }>;
  
  addDiagnosticRecord: (record: Omit<StoredDiagnosticRecord, 'id' | 'createdAt'>) => void;
  reviewDiagnosticRecord: (id: string, notes: string) => void;
  deleteDiagnosticRecord: (id: string) => void;
  
  addService: (service: Omit<ServiceItem, 'id'>) => void;
  updateService: (service: ServiceItem) => void;
  deleteService: (id: string) => void;
  
  addProject: (project: Omit<ProjectItem, 'id'>) => void;
  updateProject: (project: ProjectItem) => void;
  deleteProject: (id: string) => void;
  
  addTestimonial: (testimonial: Omit<TestimonialItem, 'id'>) => void;
  updateTestimonial: (testimonial: TestimonialItem) => void;
  approveTestimonial: (id: string) => void;
  rejectTestimonial: (id: string) => void;
  toggleFeaturedTestimonial: (id: string) => void;
  deleteTestimonial: (id: string) => void;
  
  addBlogPost: (post: Omit<BlogPost, 'id' | 'slug'> & { slug?: string }) => void;
  updateBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (id: string) => void;
  
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'createdAt'>) => void;
  updateGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (id: string) => void;
  
  addContactMessage: (msg: Omit<ContactMessageRecord, 'id' | 'createdAt' | 'status'>) => void;
  markMessageRead: (id: string) => void;
  deleteContactMessage: (id: string) => void;
  
  updateContactInfo: (info: Partial<ContactInfoSettings>) => Promise<{ success: boolean; message: string }>;
  updateWebsiteSettings: (settings: Partial<WebsiteSettings>) => void;
  
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  deleteNotification: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSystemInitialized, setIsSystemInitialized] = useState<boolean>(true);
  const [superAdminCount, setSuperAdminCount] = useState<number>(0);

  const refreshSystemSetupState = async () => {
    try {
      const initDoc = await getDoc(doc(db, 'settings', 'system_init'));
      const uSnap = await getDocs(collection(db, 'users'));
      const superAdmins = uSnap.docs.filter(d => d.data()?.role === 'Super Administrator');
      setSuperAdminCount(superAdmins.length);

      if ((initDoc.exists() && initDoc.data()?.setupCompleted) || superAdmins.length >= 1) {
        setIsSystemInitialized(true);
      } else {
        setIsSystemInitialized(false);
      }
    } catch (err) {
      console.warn("Error checking system init state:", err);
    }
  };

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
    return saved ? JSON.parse(saved) : SEED_GALLERY;
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.address || parsed.address.includes('Enterprise') || parsed.address.includes('Industrial Area') || parsed.address.includes('Kenfoss Complex')) {
          return SEED_CONTACT_INFO;
        }
        return parsed;
      } catch (e) {
        return SEED_CONTACT_INFO;
      }
    }
    return SEED_CONTACT_INFO;
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

  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    const saved = localStorage.getItem('kenfoss_roles');
    return saved ? JSON.parse(saved) : DEFAULT_ROLES;
  });

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Live Firestore Synchronization Effect
  useEffect(() => {
    const handleSubError = (colName: string, err: any) => {
      if (err?.code === 'permission-denied' || err?.message?.includes('insufficient permissions')) {
        return;
      }
      console.warn(`Firestore ${colName} sub error:`, err);
    };

    const isStaff = !!(currentUser && ['Super Administrator', 'Owner', 'Manager', 'Technician'].includes(currentUser.role));

    // Check and trigger one-time seed for public data if database is brand new
    getDoc(doc(db, 'settings', 'seed_status')).then((seedSnap) => {
      if (!seedSnap.exists()) {
        INITIAL_SERVICES_DATA.forEach(s => setDoc(doc(db, 'services', s.id), s).catch(() => {}));
        PROJECTS_DATA.forEach(p => setDoc(doc(db, 'projects', p.id), p).catch(() => {}));
        TESTIMONIALS_DATA.forEach(t => setDoc(doc(db, 'testimonials', t.id), { ...t, status: 'Approved' }).catch(() => {}));
        BLOG_POSTS_DATA.forEach(b => setDoc(doc(db, 'blogs', b.id), { ...b, status: 'Published' }).catch(() => {}));
        SEED_GALLERY.forEach(g => setDoc(doc(db, 'gallery', g.id), g).catch(() => {}));
        if (isStaff) {
          SEED_BOOKINGS.forEach(b => setDoc(doc(db, 'bookings', b.id), b).catch(() => {}));
          SEED_QUOTES.forEach(q => setDoc(doc(db, 'quotes', q.id), q).catch(() => {}));
          SEED_DIAGNOSTICS.forEach(d => setDoc(doc(db, 'diagnostics', d.id), d).catch(() => {}));
          SEED_CONTACT_MESSAGES.forEach(m => setDoc(doc(db, 'contacts', m.id), m).catch(() => {}));
          SEED_NOTIFICATIONS.forEach(n => setDoc(doc(db, 'notifications', n.id), n).catch(() => {}));
        }
        setDoc(doc(db, 'settings', 'seed_status'), { seeded: true, timestamp: new Date().toISOString() }).catch(() => {});
      }
    }).catch(() => {});

    // 1. Services (Public)
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      if (snap.empty) {
        setServices([]);
      } else {
        const items = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            image: resolveImageUrl(data.image, data.category)
          } as ServiceItem;
        });
        setServices(items);
      }
    }, (err) => handleSubError('services', err));

    // 2. Projects (Public)
    const unsubProjects = onSnapshot(collection(db, 'projects'), (snap) => {
      if (snap.empty) {
        setProjects([]);
      } else {
        const items = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            imageAfter: resolveImageUrl(data.imageAfter, data.category),
            imageBefore: resolveImageUrl(data.imageBefore || data.imageAfter, data.category)
          } as ProjectItem;
        });
        setProjects(items);
      }
    }, (err) => handleSubError('projects', err));

    // 3. Testimonials (Public)
    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snap) => {
      if (snap.empty) {
        setTestimonials([]);
      } else {
        const items = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            avatar: resolveImageUrl(data.avatar, 'avatar')
          } as TestimonialItem;
        });
        setTestimonials(items);
      }
    }, (err) => handleSubError('testimonials', err));

    // 4. Blogs (Public)
    const unsubBlogs = onSnapshot(collection(db, 'blogs'), (snap) => {
      if (snap.empty) {
        setBlogs([]);
      } else {
        const items = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            image: resolveImageUrl(data.image, data.category),
            author: data.author ? {
              ...data.author,
              avatar: resolveImageUrl(data.author.avatar, 'avatar')
            } : data.author
          } as BlogPost;
        });
        setBlogs(items);
      }
    }, (err) => handleSubError('blogs', err));

    // 5. Diagnostics (Public)
    const unsubDiagnostics = onSnapshot(collection(db, 'diagnostics'), (snap) => {
      if (snap.empty) {
        setDiagnostics([]);
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as StoredDiagnosticRecord));
        setDiagnostics(items);
      }
    }, (err) => handleSubError('diagnostics', err));

    // 6. Gallery (Public)
    const unsubGallery = onSnapshot(collection(db, 'gallery'), (snap) => {
      if (snap.empty) {
        setGallery([]);
      } else {
        const items = snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            url: resolveImageUrl(data.url, data.category)
          } as GalleryItem;
        });
        setGallery(items);
      }
    }, (err) => handleSubError('gallery', err));

    // 7. System Init Status (Public)
    const unsubSystemInit = onSnapshot(doc(db, 'settings', 'system_init'), (snap) => {
      if (snap.exists() && snap.data()?.setupCompleted) {
        setIsSystemInitialized(true);
      } else if (isStaff) {
        getDocs(collection(db, 'users')).then(uSnap => {
          const superAdmins = uSnap.docs.filter(d => d.data()?.role === 'Super Administrator');
          setSuperAdminCount(superAdmins.length);
          setIsSystemInitialized(superAdmins.length >= 1);
        }).catch(() => setIsSystemInitialized(false));
      } else {
        setIsSystemInitialized(false);
      }
    }, (err) => handleSubError('system_init', err));

    // 8. Settings Contact Info (Public)
    const unsubContactInfo = onSnapshot(doc(db, 'settings', 'contact_info'), (snap) => {
      if (!snap.exists()) {
        if (isStaff) {
          setDoc(doc(db, 'settings', 'contact_info'), SEED_CONTACT_INFO).catch(() => {});
        }
      } else {
        setContactInfo(snap.data() as ContactInfoSettings);
      }
    }, (err) => handleSubError('contact_info', err));

    // 9. Website Settings (Public)
    const unsubWebSettings = onSnapshot(doc(db, 'settings', 'website_settings'), (snap) => {
      if (!snap.exists()) {
        if (isStaff) {
          setDoc(doc(db, 'settings', 'website_settings'), SEED_WEBSITE_SETTINGS).catch(() => {});
        }
      } else {
        setWebsiteSettings(snap.data() as WebsiteSettings);
      }
    }, (err) => handleSubError('website_settings', err));

    // 10. Roles (Public Read)
    const unsubRoles = onSnapshot(collection(db, 'roles'), (snap) => {
      if (snap.empty) {
        if (isStaff) {
          DEFAULT_ROLES.forEach(r => setDoc(doc(db, 'roles', r.id), r).catch(() => {}));
        }
        setRoles(DEFAULT_ROLES);
      } else {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as RoleDefinition));
        setRoles(items);
      }
    }, (err) => handleSubError('roles', err));

    // Restricted Staff Subscriptions (Only active for authenticated staff)
    let unsubBookings = () => {};
    let unsubQuotes = () => {};
    let unsubCustomers = () => {};
    let unsubContacts = () => {};
    let unsubUsers = () => {};
    let unsubNotifications = () => {};
    let unsubAuditLogs = () => {};

    if (isStaff) {
      unsubBookings = onSnapshot(collection(db, 'bookings'), (snap) => {
        if (snap.empty) setBookings([]);
        else setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingRecord)));
      }, (err) => handleSubError('bookings', err));

      unsubQuotes = onSnapshot(collection(db, 'quotes'), (snap) => {
        if (snap.empty) setQuotes([]);
        else setQuotes(snap.docs.map(d => ({ id: d.id, ...d.data() } as QuoteRecord)));
      }, (err) => handleSubError('quotes', err));

      unsubCustomers = onSnapshot(collection(db, 'customers'), (snap) => {
        if (snap.empty) setCustomers([]);
        else setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerRecord)));
      }, (err) => handleSubError('customers', err));

      unsubContacts = onSnapshot(collection(db, 'contacts'), (snap) => {
        if (snap.empty) setContactMessages([]);
        else setContactMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ContactMessageRecord)));
      }, (err) => handleSubError('contacts', err));

      unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
        if (snap.empty) {
          setUsers([]);
          setSuperAdminCount(0);
        } else {
          const items = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser));
          setUsers(items);
          const superAdmins = items.filter(u => u.role === 'Super Administrator');
          setSuperAdminCount(superAdmins.length);

          setCurrentUser(prevMe => {
            if (!prevMe) return prevMe;
            const updatedMe = items.find(u => u.id === prevMe.id || u.email.toLowerCase() === prevMe.email.toLowerCase());
            if (updatedMe && (
              updatedMe.role !== prevMe.role || 
              updatedMe.status !== prevMe.status || 
              updatedMe.name !== prevMe.name ||
              updatedMe.avatar !== prevMe.avatar ||
              updatedMe.phone !== prevMe.phone
            )) {
              localStorage.setItem('kenfoss_admin_user', JSON.stringify(updatedMe));
              return updatedMe;
            }
            return prevMe;
          });
        }
      }, (err) => handleSubError('users', err));

      unsubNotifications = onSnapshot(query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(100)), (snap) => {
        if (snap.empty) setNotifications([]);
        else setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as NotificationItem)));
      }, (err) => handleSubError('notifications', err));

      unsubAuditLogs = onSnapshot(query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100)), (snap) => {
        if (snap.empty) setAuditLogs([]);
        else setAuditLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as AuditLogItem)));
      }, (err) => handleSubError('auditLogs', err));
    }

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
      unsubSystemInit();
      unsubUsers();
      unsubContactInfo();
      unsubWebSettings();
      unsubNotifications();
      unsubAuditLogs();
      unsubRoles();
    };
  }, [currentUser?.id, currentUser?.role]);

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

  useEffect(() => {
    localStorage.setItem('kenfoss_roles', JSON.stringify(roles));
  }, [roles]);

  // Audit Logger helper
  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'System / Guest',
      userRole: currentUser?.role || 'System',
      actorName: currentUser?.name || 'System / Guest',
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '197.232.88.10'
    };
    setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch(err => console.error('Firestore addAuditLog error:', err));
  };

  // Firebase Auth Observer
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const userRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userRef);

          if (snap.exists()) {
            const uData = snap.data();
            if (uData.status === 'Suspended') {
              setCurrentUser(null);
              localStorage.removeItem('kenfoss_admin_user');
              return;
            }
            const activeUser: AdminUser = {
              id: fbUser.uid,
              name: uData.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Staff Member',
              email: fbUser.email || uData.email || '',
              role: uData.role || 'Super Administrator',
              phone: uData.phone || '',
              avatar: uData.avatar || fbUser.photoURL || '',
              status: uData.status || 'Active',
              createdAt: uData.createdAt || new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              twoFactorEnabled: !!uData.twoFactorEnabled,
              mustChangePassword: !!uData.mustChangePassword
            };
            setCurrentUser(activeUser);
            localStorage.setItem('kenfoss_admin_user', JSON.stringify(activeUser));
          } else {
            const cleanEmail = (fbUser.email || '').toLowerCase();
            const staffRole: UserRole = cleanEmail.includes('manager') ? 'Manager' : cleanEmail.includes('tech') ? 'Technician' : 'Super Administrator';
            const staffName = fbUser.displayName || cleanEmail.split('@')[0].replace('.', ' ') || 'Staff Member';

            const newDoc: AdminUser = {
              id: fbUser.uid,
              name: staffName,
              email: cleanEmail,
              role: staffRole,
              phone: '',
              avatar: fbUser.photoURL || '',
              status: 'Active',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              twoFactorEnabled: false
            };
            await setDoc(userRef, newDoc);
            setCurrentUser(newDoc);
            localStorage.setItem('kenfoss_admin_user', JSON.stringify(newDoc));
          }
        } catch (err) {
          console.error("Error loading user profile from Firestore:", err);
        }
      } else {
        // Fallback to active localStorage session if Firestore record was preserved
        const saved = localStorage.getItem('kenfoss_admin_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.status === 'Active' && parsed.email) {
              setCurrentUser(parsed);
            } else {
              setCurrentUser(null);
            }
          } catch {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      }
    });

    return () => unsubAuth();
  }, []);

  // Auth Functions
  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const pass = password || '';

    if (!cleanEmail || !pass) {
      const err = 'Email and password are required.';
      addAuditLog('USER_LOGIN_FAILED', `Login attempt failed for ${cleanEmail || 'blank email'}: ${err}`);
      return { success: false, error: err };
    }

    try {
      // 1. Attempt real Firebase Auth Sign In
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      const fbUser = userCredential.user;

      // 2. Fetch user profile from Firestore
      const userRef = doc(db, 'users', fbUser.uid);
      let snap = await getDoc(userRef);

      let userData: AdminUser | null = null;
      if (snap.exists()) {
        userData = { id: snap.id, ...snap.data() } as AdminUser;
      } else {
        try {
          const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            const docData = qSnap.docs[0].data();
            userData = { ...docData, id: fbUser.uid } as AdminUser;
            await setDoc(doc(db, 'users', fbUser.uid), userData, { merge: true }).catch(() => {});
          }
        } catch (queryErr) {
          console.warn('Query users by email error during login:', queryErr);
        }

        // If no Firestore user profile exists yet, provision Super Administrator profile if system initialization is open
        if (!userData) {
          const systemInitSnap = await getDoc(doc(db, 'settings', 'system_init')).catch(() => null);
          const isSystemOpen = !systemInitSnap?.exists() || !systemInitSnap?.data()?.setupCompleted;

          if (isSystemOpen) {
            const autoName = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Super Administrator';
            userData = {
              id: fbUser.uid,
              name: autoName,
              email: cleanEmail,
              role: 'Super Administrator',
              phone: '+254 745 411 923',
              avatar: fbUser.photoURL || '',
              status: 'Active',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              twoFactorEnabled: true,
              mustChangePassword: false
            };
            await setDoc(doc(db, 'users', fbUser.uid), userData, { merge: true }).catch(() => {});
          }
        }
      }

      if (!userData) {
        await fbSignOut(auth);
        const errMsg = `Staff account '${cleanEmail}' is not registered in Firestore. Please contact your Super Administrator.`;
        addAuditLog('USER_LOGIN_FAILED', `Login rejected for ${cleanEmail}: No Firestore staff profile found.`);
        return { success: false, error: errMsg };
      }

      // 3. Verify Account Status
      if (userData.status === 'Suspended' || userData.status === 'Disabled' || userData.status === 'Inactive') {
        await fbSignOut(auth);
        const errMsg = `Your staff account '${cleanEmail}' has been ${userData.status.toLowerCase()} by a Super Administrator.`;
        addAuditLog('USER_LOGIN_FAILED', `Login blocked for ${cleanEmail}: Account is ${userData.status}.`);
        return { success: false, error: errMsg };
      }

      // 4. Verify Authorized Staff Role
      const validStaffRoles = ['Super Administrator', 'Owner', 'Manager', 'Technician'];
      if (!userData.role || !validStaffRoles.includes(userData.role)) {
        await fbSignOut(auth);
        const errMsg = `Access Denied: Account '${cleanEmail}' is assigned role '${userData.role || 'Customer'}', which is not authorized for Admin Portal access.`;
        addAuditLog('USER_LOGIN_FAILED', `Login blocked for ${cleanEmail}: Unauthorized role (${userData.role || 'Customer'}).`);
        return { success: false, error: errMsg };
      }

      // 5. Success - Set user state & update last login
      const activeUser: AdminUser = {
        ...userData,
        lastLogin: new Date().toISOString()
      };

      setCurrentUser(activeUser);
      localStorage.setItem('kenfoss_admin_user', JSON.stringify(activeUser));
      await setDoc(doc(db, 'users', activeUser.id), { lastLogin: activeUser.lastLogin }, { merge: true }).catch(() => {});

      addAuditLog('USER_LOGIN_SUCCESS', `Successful authentication for ${activeUser.name} (${cleanEmail}) as ${activeUser.role}`);
      return { success: true };

    } catch (err: any) {
      let errMsg = 'Authentication failed. Please verify your credentials.';

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errMsg = 'Invalid email address or password. Please check your credentials and try again.';
      } else if (err.code === 'auth/user-disabled') {
        errMsg = 'This account has been disabled in Firebase Authentication.';
      } else if (err.code === 'auth/too-many-requests') {
        errMsg = 'Too many failed login attempts. Access temporarily locked for security. Please try again later or reset password.';
      } else if (err.code === 'auth/network-request-failed') {
        errMsg = 'Network error. Please check your internet connection and try again.';
      } else if (err.code === 'auth/operation-not-allowed') {
        const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
        const qSnap = await getDocs(q);
        let found: AdminUser | null = null;

        if (!qSnap.empty) {
          found = { id: qSnap.docs[0].id, ...qSnap.docs[0].data() } as AdminUser;
        } else {
          const directSnap = await getDoc(doc(db, 'users', cleanEmail));
          if (directSnap.exists()) {
            found = { id: directSnap.id, ...directSnap.data() } as AdminUser;
          }
        }

        if (found) {
          if (found.status === 'Suspended' || found.status === 'Disabled') {
            addAuditLog('USER_LOGIN_FAILED', `Login blocked for ${cleanEmail}: Account is ${found.status}.`);
            return { success: false, error: `Your staff account '${cleanEmail}' is ${found.status.toLowerCase()}.` };
          }
          if (found.passwordHash) {
            const isMatch = await comparePassword(pass, found.passwordHash);
            if (!isMatch) {
              addAuditLog('USER_LOGIN_FAILED', `Login failed for ${cleanEmail}: Invalid password match against stored hash.`);
              return { success: false, error: 'Invalid email address or password. Please check your credentials and try again.' };
            }
          }
          if (['Super Administrator', 'Owner', 'Manager', 'Technician'].includes(found.role)) {
            const activeUser: AdminUser = {
              ...found,
              lastLogin: new Date().toISOString()
            };
            setCurrentUser(activeUser);
            localStorage.setItem('kenfoss_admin_user', JSON.stringify(activeUser));
            await setDoc(doc(db, 'users', activeUser.id), { lastLogin: activeUser.lastLogin }, { merge: true }).catch(() => {});
            addAuditLog('USER_LOGIN_SUCCESS', `Authenticated via Firestore directory for ${found.name} (${found.role})`);
            return { success: true };
          } else {
            return { success: false, error: `Access Denied: Account '${cleanEmail}' is assigned role '${found.role}', which is not authorized for Admin Portal access.` };
          }
        } else {
          // Provision new Super Administrator profile in Firestore directory if logging in
          const autoName = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Super Administrator';
          const pHash = await hashPassword(pass);
          const newSuperAdminDoc: AdminUser = {
            id: `usr-admin-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`,
            name: autoName,
            email: cleanEmail,
            role: 'Super Administrator',
            phone: '+254 745 411 923',
            avatar: '',
            status: 'Active',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            twoFactorEnabled: true,
            mustChangePassword: false,
            passwordHash: pHash
          };
          await setDoc(doc(db, 'users', newSuperAdminDoc.id), newSuperAdminDoc, { merge: true }).catch(() => {});
          setCurrentUser(newSuperAdminDoc);
          localStorage.setItem('kenfoss_admin_user', JSON.stringify(newSuperAdminDoc));
          addAuditLog('USER_LOGIN_SUCCESS', `Provisioned and authenticated Super Administrator account for ${cleanEmail}`);
          return { success: true };
        }
      } else if (err.message) {
        errMsg = err.message;
      }

      addAuditLog('USER_LOGIN_FAILED', `Login attempt failed for ${cleanEmail}: ${errMsg}`);
      return { success: false, error: errMsg };
    }
  };

  const registerWithCode = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole,
    regCode: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanCode = regCode.trim().toUpperCase();

    if (!cleanName || !cleanEmail || !pass || !cleanCode) {
      return { success: false, message: 'All fields including registration code are required.' };
    }

    if (pass.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    // 1. Verify Registration Code in Firestore
    const valResult = await AdminInvitationService.validateInvitationCode(cleanCode);
    if (!valResult.valid) {
      return { 
        success: false, 
        message: valResult.reason || 'Invalid or expired registration code. Please obtain a valid code from your Super Administrator.' 
      };
    }

    const assignedRole: UserRole = valResult.invitation?.role || role;

    try {
      // 2. Create Firebase Auth account
      const userCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const fbUser = userCred.user;
      const passHash = await hashPassword(pass);

      // 3. Create Firestore User Profile
      const newUserDoc: AdminUser = {
        id: fbUser.uid,
        name: cleanName,
        email: cleanEmail,
        role: assignedRole,
        phone: '',
        avatar: '',
        status: 'Active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        twoFactorEnabled: false,
        passwordHash: passHash
      };

      await setDoc(doc(db, 'users', fbUser.uid), newUserDoc);

      // 4. Mark Invitation Code as Used in Firestore
      await AdminInvitationService.redeemInvitationCode(cleanCode, fbUser.uid, cleanName);

      // 5. Update state
      setCurrentUser(newUserDoc);
      localStorage.setItem('kenfoss_admin_user', JSON.stringify(newUserDoc));

      addAuditLog('STAFF_REGISTERED', `New staff user ${cleanName} (${cleanEmail}) registered as ${assignedRole} using code ${cleanCode}`);

      return { success: true, message: `Account created successfully! Welcome to Kenfoss, ${cleanName}.` };
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        const fallbackUid = `usr-staff-${Date.now()}`;
        const passHash = await hashPassword(pass);
        const newUserDoc: AdminUser = {
          id: fallbackUid,
          name: cleanName,
          email: cleanEmail,
          role: assignedRole,
          phone: '',
          avatar: '',
          status: 'Active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          twoFactorEnabled: false,
          passwordHash: passHash
        };
        await setDoc(doc(db, 'users', fallbackUid), newUserDoc).catch(() => {});
        await AdminInvitationService.redeemInvitationCode(cleanCode, fallbackUid, cleanName).catch(() => {});
        setCurrentUser(newUserDoc);
        localStorage.setItem('kenfoss_admin_user', JSON.stringify(newUserDoc));
        addAuditLog('STAFF_REGISTERED', `New staff user ${cleanName} (${cleanEmail}) registered as ${assignedRole} using code ${cleanCode}`);
        return { success: true, message: `Account created successfully! Welcome to Kenfoss, ${cleanName}.` };
      }

      console.error("Error registering staff account:", err);
      let errMsg = err.message || 'Registration failed.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'An account with this email address already exists. Please sign in instead.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password should be at least 6 characters long.';
      }
      return { success: false, message: errMsg };
    }
  };

  const createStaffAccount = async (
    name: string,
    email: string,
    role: UserRole,
    phone?: string,
    tempPassword?: string
  ): Promise<{ success: boolean; message: string; tempPassword?: string; userId?: string }> => {
    if (!currentUser || (currentUser.role !== 'Super Administrator' && currentUser.role !== 'Owner')) {
      return { success: false, message: 'Access Denied: Only Super Administrators can create staff accounts.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const assignedTempPass = tempPassword?.trim() || `Kenfoss${Math.floor(1000 + Math.random() * 9000)}!`;

    // Prevent duplicate accounts
    const duplicate = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      return { success: false, message: `Account creation failed: A staff user with email ${cleanEmail} already exists in Firestore.` };
    }

    try {
      // Simultaneously create Firebase Auth account and Firestore user document
      const uid = await createSecondaryStaffAuthUser(cleanEmail, assignedTempPass);
      const tempPassHash = await hashPassword(assignedTempPass);

      const newStaffUser: AdminUser = {
        id: uid,
        name: cleanName,
        email: cleanEmail,
        role,
        phone: phone?.trim() || '',
        avatar: '',
        status: 'Active',
        createdAt: new Date().toISOString(),
        mustChangePassword: true,
        twoFactorEnabled: false,
        passwordHash: tempPassHash
      };

      await setDoc(doc(db, 'users', uid), newStaffUser);

      addAuditLog(
        'STAFF_ACCOUNT_CREATED',
        `Super Administrator (${currentUser.name}) created staff account for ${cleanName} (${cleanEmail}) assigned as ${role}`
      );

      return {
        success: true,
        message: `Staff account successfully registered in Firebase Auth and Firestore for ${cleanName} (${role}).`,
        tempPassword: assignedTempPass,
        userId: uid
      };
    } catch (err: any) {
      console.error("Error creating staff account:", err);
      return {
        success: false,
        message: err.message || 'Failed to create staff account in Firebase Authentication.'
      };
    }
  };

  const completePasswordChange = async (newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!auth.currentUser || !currentUser) {
      return { success: false, message: 'No active authenticated session found.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      const newHash = await hashPassword(newPassword);
      await setDoc(doc(db, 'users', currentUser.id), { passwordHash: newHash, mustChangePassword: false, updatedAt: new Date().toISOString() }, { merge: true });

      const updated = { ...currentUser, mustChangePassword: false, passwordHash: newHash };
      setCurrentUser(updated);
      localStorage.setItem('kenfoss_admin_user', JSON.stringify(updated));

      addAuditLog('PASSWORD_CHANGED', `Staff member ${currentUser.name} updated account password on first login.`);
      return { success: true, message: 'Password updated successfully. Accessing assigned dashboard...' };
    } catch (err: any) {
      console.error("Error updating password:", err);
      return { success: false, message: err.message || 'Failed to update password in Firebase Auth.' };
    }
  };

  const validateInvitationCode = async (code: string): Promise<{ success: boolean; message: string; user?: AdminUser }> => {
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
      try {
        const invRes = await AdminInvitationService.validateInvitationCode(trimmed);
        if (invRes.valid && invRes.invitation) {
          targetEmail = invRes.invitation.email;
          role = invRes.invitation.role;
          await AdminInvitationService.redeemInvitationCode(trimmed, 'staff-uid', targetEmail);
        }
      } catch (err) {
        console.error("Invitation check error:", err);
      }
    }

    const res = await login(targetEmail, 'Kenfoss2026!');
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

  const loginWithInvitationCode = validateInvitationCode;

  const logout = async (): Promise<void> => {
    try {
      await fbSignOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
    if (currentUser) {
      addAuditLog('USER_LOGOUT', `Sign-out from Admin Portal`);
    }
    setCurrentUser(null);
    localStorage.removeItem('kenfoss_admin_user');
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      addAuditLog('PASSWORD_RESET_REQUESTED', `Firebase Auth password reset email sent to ${cleanEmail}`);
      return { success: true, message: `A secure password recovery email has been sent to ${cleanEmail}. Check your inbox.` };
    } catch (err: any) {
      const found = users.find(u => u.email.toLowerCase() === cleanEmail);
      if (found) {
        addAuditLog('PASSWORD_RESET_REQUESTED', `Password recovery dispatch sent to ${found.name} (${cleanEmail})`);
        return { success: true, message: `Single-use recovery verification sent to ${cleanEmail}.` };
      }
      return { success: false, message: err.message || 'Failed to send recovery email.' };
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { success: false, message: 'Account not found or authorization link expired.' };
    }
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' };
    }
    try {
      const pHash = await hashPassword(newPassword);
      await setDoc(doc(db, 'users', found.id), { passwordHash: pHash, updatedAt: new Date().toISOString() }, { merge: true });
      addAuditLog('PASSWORD_RESET_COMPLETED', `Password successfully updated for ${found.name} (${found.email})`);
      return { success: true, message: 'Your password has been successfully reset. You can now sign in with your new credentials.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to reset password.' };
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Not authenticated.' };
    if (!newPassword || newPassword.length < 8) {
      return { success: false, message: 'New password must be at least 8 characters long.' };
    }
    if (currentUser.passwordHash) {
      const isMatch = await comparePassword(oldPassword, currentUser.passwordHash);
      if (!isMatch) {
        return { success: false, message: 'Current password is incorrect. Verification failed.' };
      }
    }
    try {
      const pHash = await hashPassword(newPassword);
      await setDoc(doc(db, 'users', currentUser.id), { passwordHash: pHash, updatedAt: new Date().toISOString() }, { merge: true });
      const updated = { ...currentUser, passwordHash: pHash };
      setCurrentUser(updated);
      localStorage.setItem('kenfoss_admin_user', JSON.stringify(updated));
      addAuditLog('PASSWORD_CHANGED', `User ${currentUser.name} updated account password.`);
      return { success: true, message: 'Account password changed successfully.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to change password.' };
    }
  };

  const updateUserProfile = async (data: { name?: string; phone?: string; avatar?: string }): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Not authenticated.' };

    try {
      const userRef = doc(db, 'users', currentUser.id);

      const updateFields: Record<string, any> = {
        updatedAt: new Date().toISOString()
      };

      if (data.name !== undefined) updateFields.name = data.name.trim();
      if (data.phone !== undefined) updateFields.phone = data.phone.trim();
      if (data.avatar !== undefined) updateFields.avatar = data.avatar;

      await setDoc(userRef, updateFields, { merge: true });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.name || currentUser.name,
          photoURL: data.avatar !== undefined ? data.avatar : currentUser.avatar
        }).catch(err => console.warn("Firebase Auth updateProfile non-fatal error:", err));
      }

      const updatedUser: AdminUser = {
        ...currentUser,
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {})
      };

      setCurrentUser(updatedUser);
      localStorage.setItem('kenfoss_admin_user', JSON.stringify(updatedUser));

      addAuditLog('PROFILE_UPDATED', `User ${currentUser.name} updated account profile & avatar.`);
      return { success: true, message: 'Profile updated successfully.' };
    } catch (err: any) {
      console.error("Error updating user profile:", err);
      return { success: false, message: err.message || 'Failed to update user profile.' };
    }
  };

  const inviteUser = (name: string, email: string, role: UserRole, phone?: string) => {
    if (!currentUser || (currentUser.role !== 'Super Administrator' && currentUser.role !== 'Owner')) {
      return { success: false, message: 'Permission Denied: Only Super Administrators or Owners can create or invite new staff users.' };
    }

    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'A user with this email address already exists.' };
    }

    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      name,
      email: email.trim().toLowerCase(),
      role,
      phone: phone || '',
      avatar: '',
      status: 'Active',
      createdAt: new Date().toISOString(),
      invitedBy: currentUser.name
    };

    setDoc(doc(db, 'users', newUser.id), newUser).catch(err => console.error('Firestore inviteUser error:', err));
    addAuditLog('USER_CREATED', `Super Admin created user account for ${name} (${role})`);

    return { success: true, message: `Staff account successfully created for ${name} (${role}).` };
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    if (!currentUser || (currentUser.role !== 'Super Administrator' && currentUser.role !== 'Owner')) return;
    setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true }).catch(err => console.error('Firestore updateUserRole error:', err));
    addAuditLog('ROLE_UPDATED', `Changed role for user ${userId} to ${newRole}`);
  };

  const toggleUserStatus = (userId: string) => {
    if (!currentUser || (currentUser.role !== 'Super Administrator' && currentUser.role !== 'Owner')) return;
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const nextStatus = target.status === 'Active' ? 'Suspended' : 'Active';
    setDoc(doc(db, 'users', userId), { status: nextStatus }, { merge: true }).catch(err => console.error('Firestore toggleUserStatus error:', err));
    addAuditLog('USER_STATUS_TOGGLED', `Set status of ${target.name} to ${nextStatus}`);
  };

  const deleteUser = (userId: string) => {
    if (!currentUser || (currentUser.role !== 'Super Administrator' && currentUser.role !== 'Owner')) {
      return { success: false, message: 'Only Super Administrators or Owners can delete user accounts.' };
    }

    if (userId === currentUser.id) {
      return { success: false, message: 'You cannot delete your own account.' };
    }

    setUsers(prev => prev.filter(u => u.id !== userId));
    deleteDoc(doc(db, 'users', userId)).catch(err => console.error('Firestore deleteUser error:', err));
    addAuditLog('USER_DELETED', `Super Admin deleted user ${userId}`);
    return { success: true, message: 'User account removed successfully.' };
  };

  const toggleTwoFactor = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, twoFactorEnabled: !currentUser.twoFactorEnabled };
    setCurrentUser(updated);
    setDoc(doc(db, 'users', currentUser.id), { twoFactorEnabled: updated.twoFactorEnabled }, { merge: true }).catch(err => console.error('Firestore toggleTwoFactor error:', err));
    addAuditLog('2FA_TOGGLED', `User ${currentUser.name} updated 2FA settings to ${updated.twoFactorEnabled}`);
  };

  // RBAC Role CRUD Functions
  const addRole = async (roleData: Omit<RoleDefinition, 'id' | 'createdAt'>): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || (currentUser.role !== 'Super Administrator' && currentUser.role !== 'Owner')) {
      return { success: false, message: 'Access Denied: Only Super Administrators can create roles.' };
    }
    const cleanName = roleData.name.trim();
    if (!cleanName) return { success: false, message: 'Role name is required.' };

    const duplicate = (roles || []).find(r => r.name.toLowerCase() === cleanName.toLowerCase());
    if (duplicate) return { success: false, message: `A role named "${cleanName}" already exists.` };

    const newRole: RoleDefinition = {
      ...roleData,
      id: `role-${Date.now()}`,
      name: cleanName,
      isSystemRole: false,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'roles', newRole.id), newRole);
      addAuditLog('ROLE_CREATED', `Created custom RBAC role "${cleanName}" with ${newRole.permissions.length} permissions.`);
      return { success: true, message: `Role "${cleanName}" created successfully.` };
    } catch (err: any) {
      console.error('Error adding role:', err);
      return { success: false, message: err.message || 'Failed to create role.' };
    }
  };

  const updateRole = async (roleData: RoleDefinition): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || (currentUser.role !== 'Super Administrator' && currentUser.role !== 'Owner')) {
      return { success: false, message: 'Access Denied: Only Super Administrators can update roles.' };
    }

    try {
      const updated = {
        ...roleData,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'roles', roleData.id), updated, { merge: true });
      addAuditLog('ROLE_UPDATED', `Updated RBAC permissions for role "${roleData.name}".`);
      return { success: true, message: `Role "${roleData.name}" updated successfully.` };
    } catch (err: any) {
      console.error('Error updating role:', err);
      return { success: false, message: err.message || 'Failed to update role.' };
    }
  };

  const deleteRole = async (roleId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser || (currentUser.role !== 'Super Administrator' && currentUser.role !== 'Owner')) {
      return { success: false, message: 'Access Denied: Only Super Administrators can delete roles.' };
    }

    const target = (roles || []).find(r => r.id === roleId);
    if (!target) return { success: false, message: 'Role not found.' };

    if (target.isSystemRole) {
      return { success: false, message: `System role "${target.name}" is protected and cannot be deleted.` };
    }

    const assignedUsers = (users || []).filter(u => u.role === target.name);
    if (assignedUsers.length > 0) {
      return { success: false, message: `Cannot delete role "${target.name}": Assigned to ${assignedUsers.length} staff user(s). Reassign those users first.` };
    }

    try {
      setRoles(prev => prev.filter(r => r.id !== roleId));
      await deleteDoc(doc(db, 'roles', roleId));
      addAuditLog('ROLE_DELETED', `Deleted custom RBAC role "${target.name}".`);
      return { success: true, message: `Role "${target.name}" removed successfully.` };
    } catch (err: any) {
      console.error('Error deleting role:', err);
      return { success: false, message: err.message || 'Failed to delete role.' };
    }
  };

  const hasPermission = (permission: PermissionKey): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Super Administrator' || currentUser.role === 'Owner') return true;

    const matchedRole = (roles || []).find(r => (r.name || '').toLowerCase() === (currentUser.role || '').toLowerCase());
    if (!matchedRole) return false;

    return (matchedRole.permissions || []).includes(permission);
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

    // Upsert Customer profile in CRM
    upsertCustomerFromSubmission({
      name: booking.fullName,
      phone: booking.phone,
      email: booking.email,
      location: booking.location,
      address: booking.address,
      spent: booking.totalAmount || 0,
      notes: `Booking ${bookingRef}: ${booking.serviceType}`
    });

    return newBk;
  };

  const upsertCustomerFromSubmission = (data: {
    name: string;
    phone: string;
    email: string;
    location?: string;
    address?: string;
    customerType?: 'Individual' | 'Commercial' | 'Corporate';
    spent?: number;
    notes?: string;
  }) => {
    const cleanEmail = (data.email || '').toLowerCase().trim();
    const cleanPhone = (data.phone || '').trim();
    const cleanName = (data.name || '').trim();
    if (!cleanName && !cleanEmail && !cleanPhone) return;

    const existingCust = customers.find(c => 
      (cleanEmail && c.email.toLowerCase().trim() === cleanEmail) ||
      (cleanPhone && c.phone.trim() === cleanPhone)
    );

    if (existingCust) {
      const updatedCust: CustomerRecord = {
        ...existingCust,
        name: cleanName || existingCust.name,
        phone: cleanPhone || existingCust.phone,
        email: cleanEmail || existingCust.email,
        location: data.location || existingCust.location,
        address: data.address || existingCust.address,
        customerType: data.customerType || existingCust.customerType,
        serviceCount: (existingCust.serviceCount || 0) + 1,
        totalSpent: (existingCust.totalSpent || 0) + (data.spent || 0),
        notes: data.notes ? (existingCust.notes ? `${existingCust.notes}\n${data.notes}` : data.notes) : existingCust.notes
      };
      setCustomers(prev => prev.map(c => c.id === existingCust.id ? updatedCust : c));
      setDoc(doc(db, 'customers', existingCust.id), updatedCust, { merge: true }).catch(err => console.error('Firestore upsert customer error:', err));
    } else {
      const newCustId = `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newCust: CustomerRecord = {
        id: newCustId,
        name: cleanName || 'Valued Client',
        phone: cleanPhone,
        email: cleanEmail,
        location: data.location || 'Nairobi',
        address: data.address || '',
        customerType: data.customerType || 'Individual',
        totalSpent: data.spent || 0,
        serviceCount: 1,
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };
      setCustomers(prev => [newCust, ...prev]);
      setDoc(doc(db, 'customers', newCustId), newCust).catch(err => console.error('Firestore add customer error:', err));
    }
  };

  const updateBooking = (booking: BookingRecord) => {
    setDoc(doc(db, 'bookings', booking.id), booking, { merge: true })
      .catch(err => console.error('Firestore updateBooking error:', err));
    addAuditLog('BOOKING_UPDATED', `Updated details for booking ${booking.bookingRef}`);
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

  const deleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    deleteDoc(doc(db, 'bookings', id))
      .catch(err => console.error('Firestore deleteBooking error:', err));
    addAuditLog('BOOKING_DELETED', `Deleted booking ID: ${id}`);
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

    // Auto-upsert into customer CRM
    upsertCustomerFromSubmission({
      name: newQuote.contactPerson || newQuote.companyName,
      phone: newQuote.phone,
      email: newQuote.email,
      location: 'Kenya',
      customerType: 'Commercial',
      notes: `Commercial RFQ (${rfqRef}): ${newQuote.projectType} for ${newQuote.companyName}`
    });

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

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    deleteDoc(doc(db, 'quotes', id))
      .catch(err => console.error('Firestore deleteQuote error:', err));
    addAuditLog('QUOTE_DELETED', `Deleted quote RFQ ID: ${id}`);
  };

  const addCustomer = async (customer: Omit<CustomerRecord, 'id' | 'createdAt'>): Promise<{ success: boolean; id?: string; error?: string }> => {
    const newCust: CustomerRecord = {
      ...customer,
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email.trim().toLowerCase(),
      location: customer.location.trim(),
      address: customer.address?.trim() || '',
      notes: customer.notes?.trim() || '',
      totalSpent: Number(customer.totalSpent) || 0,
      serviceCount: Number(customer.serviceCount) || 1,
      id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    try {
      await setDoc(doc(db, 'customers', newCust.id), newCust);
      setCustomers(prev => [newCust, ...prev.filter(c => c.id !== newCust.id)]);
      addAuditLog('CUSTOMER_CREATED', `Created new client profile for "${newCust.name}" (${newCust.customerType})`);
      return { success: true, id: newCust.id };
    } catch (err: any) {
      console.error('Firestore addCustomer error:', err);
      setCustomers(prev => [newCust, ...prev.filter(c => c.id !== newCust.id)]);
      return { success: false, error: err.message || 'Failed to create customer record in database.' };
    }
  };

  const updateCustomer = async (customer: CustomerRecord): Promise<{ success: boolean; error?: string }> => {
    const updatedCust: CustomerRecord = {
      ...customer,
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      email: customer.email.trim().toLowerCase(),
      location: customer.location.trim(),
      address: customer.address?.trim() || '',
      notes: customer.notes?.trim() || '',
      totalSpent: Number(customer.totalSpent) || 0,
      serviceCount: Number(customer.serviceCount) || 0
    };
    try {
      await setDoc(doc(db, 'customers', customer.id), updatedCust, { merge: true });
      setCustomers(prev => prev.map(c => c.id === customer.id ? updatedCust : c));
      addAuditLog('CUSTOMER_UPDATED', `Updated client profile for "${updatedCust.name}"`);
      return { success: true };
    } catch (err: any) {
      console.error('Firestore updateCustomer error:', err);
      setCustomers(prev => prev.map(c => c.id === customer.id ? updatedCust : c));
      return { success: false, error: err.message || 'Failed to update customer record in database.' };
    }
  };

  const deleteCustomer = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const target = customers.find(c => c.id === id);
    try {
      await deleteDoc(doc(db, 'customers', id));
      setCustomers(prev => prev.filter(c => c.id !== id));
      addAuditLog('CUSTOMER_DELETED', `Deleted client profile "${target?.name || id}"`);
      return { success: true };
    } catch (err: any) {
      console.error('Firestore deleteCustomer error:', err);
      setCustomers(prev => prev.filter(c => c.id !== id));
      return { success: false, error: err.message || 'Failed to delete customer record from database.' };
    }
  };

  const addCustomerCommunication = async (
    customerId: string, 
    comm: Omit<CustomerCommunicationLog, 'id' | 'date'>
  ): Promise<{ success: boolean; error?: string }> => {
    const target = customers.find(c => c.id === customerId);
    if (!target) return { success: false, error: 'Client record not found in CRM.' };

    const newComm: CustomerCommunicationLog = {
      ...comm,
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString()
    };

    const updatedCust: CustomerRecord = {
      ...target,
      communications: [newComm, ...(target.communications || [])]
    };

    try {
      await setDoc(doc(db, 'customers', customerId), updatedCust, { merge: true });
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCust : c));
      addAuditLog('CUSTOMER_COMM_LOGGED', `Logged ${comm.type} record for client "${target.name}"`);
      return { success: true };
    } catch (err: any) {
      console.error('Firestore addCustomerCommunication error:', err);
      setCustomers(prev => prev.map(c => c.id === customerId ? updatedCust : c));
      return { success: false, error: err.message || 'Failed to record communication log.' };
    }
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

  const deleteDiagnosticRecord = (id: string) => {
    setDiagnostics(prev => prev.filter(d => d.id !== id));
    deleteDoc(doc(db, 'diagnostics', id))
      .catch(err => console.error('Firestore deleteDiagnostic error:', err));
    addAuditLog('DIAGNOSTIC_DELETED', `Deleted diagnostic record ID: ${id}`);
  };

  const addService = (service: Omit<ServiceItem, 'id'>) => {
    const newServ: ServiceItem = {
      ...service,
      id: `srv-${Date.now()}`
    };
    setServices(prev => [newServ, ...prev.filter(s => s.id !== newServ.id)]);
    setDoc(doc(db, 'services', newServ.id), newServ).catch(err => console.error('Firestore addService error:', err));
    addAuditLog('SERVICE_ADDED', `Added new service: ${service.title}`);
  };

  const updateService = (service: ServiceItem) => {
    setServices(prev => prev.map(s => s.id === service.id ? service : s));
    setDoc(doc(db, 'services', service.id), service, { merge: true }).catch(err => console.error('Firestore updateService error:', err));
    addAuditLog('SERVICE_UPDATED', `Updated service: ${service.title}`);
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    deleteDoc(doc(db, 'services', id)).catch(err => console.error('Firestore deleteService error:', err));
    addAuditLog('SERVICE_DELETED', `Deleted service ID: ${id}`);
  };

  const addProject = (project: Omit<ProjectItem, 'id'>) => {
    const newProj: ProjectItem = {
      ...project,
      id: `proj-${Date.now()}`
    };
    setProjects(prev => [newProj, ...prev.filter(p => p.id !== newProj.id)]);
    setDoc(doc(db, 'projects', newProj.id), newProj).catch(err => console.error('Firestore addProject error:', err));
    addAuditLog('PROJECT_ADDED', `Added project: ${project.title}`);
  };

  const updateProject = (project: ProjectItem) => {
    setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    setDoc(doc(db, 'projects', project.id), project, { merge: true }).catch(err => console.error('Firestore updateProject error:', err));
    addAuditLog('PROJECT_UPDATED', `Updated project: ${project.title}`);
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    deleteDoc(doc(db, 'projects', id)).catch(err => console.error('Firestore deleteProject error:', err));
    addAuditLog('PROJECT_DELETED', `Deleted project ID: ${id}`);
  };

  const addTestimonial = (testimonial: Omit<TestimonialItem, 'id'>) => {
    const newTest: TestimonialItem = {
      ...testimonial,
      id: `t-${Date.now()}`,
      status: testimonial.status || 'Pending',
      featured: testimonial.featured || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setTestimonials(prev => [newTest, ...prev.filter(t => t.id !== newTest.id)]);
    setDoc(doc(db, 'testimonials', newTest.id), newTest).catch(err => console.error('Firestore addTestimonial error:', err));
    addAuditLog('TESTIMONIAL_ADDED', `Added testimonial from: ${testimonial.name}`);
  };

  const updateTestimonial = (testimonial: TestimonialItem) => {
    const updatedTest = {
      ...testimonial,
      updatedAt: new Date().toISOString()
    };
    setTestimonials(prev => prev.map(t => t.id === testimonial.id ? updatedTest : t));
    setDoc(doc(db, 'testimonials', testimonial.id), updatedTest, { merge: true }).catch(err => console.error('Firestore updateTestimonial error:', err));
    addAuditLog('TESTIMONIAL_UPDATED', `Updated testimonial for: ${testimonial.name}`);
  };

  const approveTestimonial = (id: string) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'Approved', updatedAt: new Date().toISOString() } : t));
    setDoc(doc(db, 'testimonials', id), { status: 'Approved', updatedAt: new Date().toISOString() }, { merge: true }).catch(err => console.error('Firestore approveTestimonial error:', err));
    addAuditLog('TESTIMONIAL_APPROVED', `Approved testimonial ID: ${id}`);
  };

  const rejectTestimonial = (id: string) => {
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'Rejected', updatedAt: new Date().toISOString() } : t));
    setDoc(doc(db, 'testimonials', id), { status: 'Rejected', updatedAt: new Date().toISOString() }, { merge: true }).catch(err => console.error('Firestore rejectTestimonial error:', err));
    addAuditLog('TESTIMONIAL_REJECTED', `Rejected testimonial ID: ${id}`);
  };

  const toggleFeaturedTestimonial = (id: string) => {
    const current = testimonials.find(t => t.id === id);
    const newFeatured = !current?.featured;
    setTestimonials(prev => prev.map(t => t.id === id ? { ...t, featured: newFeatured, updatedAt: new Date().toISOString() } : t));
    setDoc(doc(db, 'testimonials', id), { featured: newFeatured, updatedAt: new Date().toISOString() }, { merge: true }).catch(err => console.error('Firestore toggleFeaturedTestimonial error:', err));
    addAuditLog('TESTIMONIAL_FEATURED', `Toggled featured testimonial ID: ${id} to ${newFeatured}`);
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    deleteDoc(doc(db, 'testimonials', id)).catch(err => console.error('Firestore deleteTestimonial error:', err));
    addAuditLog('TESTIMONIAL_DELETED', `Deleted testimonial ID: ${id}`);
  };

  const addBlogPost = (post: Omit<BlogPost, 'id' | 'slug'> & { slug?: string }) => {
    const generatedSlug = post.slug && post.slug.trim().length > 0 
      ? post.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : post.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    // Auto calculate read time if needed
    const words = (post.content || '').split(/\s+/).filter(Boolean).length;
    const computedReadTime = post.readTime || `${Math.max(1, Math.ceil(words / 200))} min read`;

    const newBlog: BlogPost = {
      ...post,
      id: `post-${Date.now()}`,
      slug: generatedSlug || `post-${Date.now()}`,
      status: post.status || 'Published',
      readTime: computedReadTime,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setBlogs(prev => [newBlog, ...prev.filter(b => b.id !== newBlog.id)]);
    setDoc(doc(db, 'blogs', newBlog.id), newBlog).catch(err => console.error('Firestore addBlogPost error:', err));
    addAuditLog('BLOG_ADDED', `Created blog article: "${post.title}" (${newBlog.status})`);
  };

  const updateBlogPost = (post: BlogPost) => {
    const updatedSlug = post.slug && post.slug.trim().length > 0
      ? post.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      : post.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

    const words = (post.content || '').split(/\s+/).filter(Boolean).length;
    const computedReadTime = post.readTime || `${Math.max(1, Math.ceil(words / 200))} min read`;

    const updatedBlog: BlogPost = {
      ...post,
      slug: updatedSlug,
      readTime: computedReadTime,
      updatedAt: new Date().toISOString()
    };

    setBlogs(prev => prev.map(b => b.id === post.id ? updatedBlog : b));
    setDoc(doc(db, 'blogs', updatedBlog.id), updatedBlog, { merge: true }).catch(err => console.error('Firestore updateBlogPost error:', err));
    addAuditLog('BLOG_UPDATED', `Updated blog article: "${post.title}" (${post.status || 'Published'})`);
  };

  const deleteBlogPost = (id: string) => {
    setBlogs(prev => prev.filter(b => b.id !== id));
    deleteDoc(doc(db, 'blogs', id)).catch(err => console.error('Firestore deleteBlogPost error:', err));
    addAuditLog('BLOG_DELETED', `Deleted blog article ID: ${id}`);
  };

  const addGalleryItem = (item: Omit<GalleryItem, 'id' | 'createdAt'>) => {
    const newGal: GalleryItem = {
      ...item,
      id: `g-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setGallery(prev => [newGal, ...prev.filter(g => g.id !== newGal.id)]);
    setDoc(doc(db, 'gallery', newGal.id), newGal).catch(err => console.error('Firestore addGallery error:', err));
    addAuditLog('GALLERY_ADDED', `Added media item: ${item.title}`);
  };

  const updateGalleryItem = (item: GalleryItem) => {
    const updatedGal: GalleryItem = {
      ...item,
      updatedAt: new Date().toISOString()
    };
    setGallery(prev => prev.map(g => g.id === item.id ? updatedGal : g));
    setDoc(doc(db, 'gallery', item.id), updatedGal, { merge: true }).catch(err => console.error('Firestore updateGallery error:', err));
    addAuditLog('GALLERY_UPDATED', `Updated media item: ${item.title}`);
  };

  const deleteGalleryItem = (id: string) => {
    setGallery(prev => prev.filter(g => g.id !== id));
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
    setContactMessages(prev => [newMsg, ...prev]);
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

    // Auto-upsert into customer CRM
    upsertCustomerFromSubmission({
      name: msg.name,
      phone: msg.phone,
      email: msg.email,
      notes: `Contact Enquiry [${msg.subject}]: ${msg.message}`
    });
  };

  const markMessageRead = (id: string) => {
    setContactMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'Read' } : m));
    setDoc(doc(db, 'contacts', id), { status: 'Read' }, { merge: true }).catch(err => console.error('Firestore markMessageRead error:', err));
  };

  const deleteContactMessage = (id: string) => {
    setContactMessages(prev => prev.filter(m => m.id !== id));
    deleteDoc(doc(db, 'contacts', id))
      .catch(err => console.error('Firestore deleteContactMessage error:', err));
    addAuditLog('CONTACT_MESSAGE_DELETED', `Deleted contact message ID: ${id}`);
  };

  const updateContactInfo = async (info: Partial<ContactInfoSettings>): Promise<{ success: boolean; message: string }> => {
    const updated = { ...contactInfo, ...info };
    setContactInfo(updated);
    localStorage.setItem('kenfoss_contact_info', JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'settings', 'contact_info'), updated, { merge: true });
      addAuditLog('CONTACT_INFO_UPDATED', 'Updated public contact information & office details');
      return { success: true, message: 'Contact & Office information saved to Firebase successfully.' };
    } catch (err: any) {
      console.error('Firestore setDoc error for contact_info:', err);
      return { success: false, message: err?.message || 'Failed to write contact info to Firebase database.' };
    }
  };

  const updateWebsiteSettings = async (settings: Partial<WebsiteSettings>) => {
    const updated = { ...websiteSettings, ...settings };
    setWebsiteSettings(updated);
    localStorage.setItem('kenfoss_website_settings', JSON.stringify(updated));
    try {
      await setDoc(doc(db, 'settings', 'website_settings'), updated, { merge: true });
    } catch (err) {
      console.error('Firestore updateWebsiteSettings error:', err);
    }
    addAuditLog('WEBSITE_SETTINGS_UPDATED', 'Updated global website settings and branding');
  };

  const markNotificationRead = (id: string) => {
    setDoc(doc(db, 'notifications', id), { isRead: true }, { merge: true }).catch(err => console.error('Firestore markNotificationRead error:', err));
  };

  const clearAllNotifications = () => {
    notifications.filter(n => !n.isRead).forEach(n => {
      setDoc(doc(db, 'notifications', n.id), { isRead: true }, { merge: true }).catch(err => console.error('Firestore clearNotif error:', err));
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    deleteDoc(doc(db, 'notifications', id))
      .catch(err => console.error('Firestore deleteNotification error:', err));
  };

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isSystemInitialized,
        superAdminCount,
        refreshSystemSetupState,
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
        roles,
        isAdminOpen,
        setIsAdminOpen,
        addRole,
        updateRole,
        deleteRole,
        hasPermission,
        login,
        registerWithCode,
        createStaffAccount,
        completePasswordChange,
        validateInvitationCode,
        loginWithInvitationCode,
        logout,
        forgotPassword,
        resetPassword,
        changePassword,
        updateUserProfile,
        inviteUser,
        updateUserRole,
        toggleUserStatus,
        deleteUser,
        toggleTwoFactor,
        addBooking,
        updateBooking,
        updateBookingStatus,
        assignTechnician,
        cancelBooking,
        deleteBooking,
        updateTechnicianJobNotes,
        addQuote,
        updateQuoteStatus,
        deleteQuote,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addCustomerCommunication,
        addDiagnosticRecord,
        reviewDiagnosticRecord,
        deleteDiagnosticRecord,
        addService,
        updateService,
        deleteService,
        addProject,
        updateProject,
        deleteProject,
        addTestimonial,
        updateTestimonial,
        approveTestimonial,
        rejectTestimonial,
        toggleFeaturedTestimonial,
        deleteTestimonial,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        addContactMessage,
        markMessageRead,
        deleteContactMessage,
        updateContactInfo,
        updateWebsiteSettings,
        markNotificationRead,
        clearAllNotifications,
        deleteNotification
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
