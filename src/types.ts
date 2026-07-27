export type ServiceCategory = 'all' | 'residential' | 'commercial' | 'industrial';

export interface ServiceItem {
  id: string;
  title: string;
  category: ServiceCategory;
  shortDesc: string;
  fullDesc: string;
  iconName: string;
  image: string;
  startingPrice: string;
  pricingNote?: string;
  ctaLabel?: string;
  estimatedTime: string;
  features: string[];
  commonIssues?: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  client: string;
  category: 'Cold Room' | 'HVAC' | 'Supermarket' | 'Appliance Repair' | 'Industrial';
  location: string;
  completedDate: string;
  imageBefore?: string;
  imageAfter: string;
  summary: string;
  specs: { label: string; value: string }[];
  challenge: string;
  solution: string;
  testimonial?: {
    quote: string;
    author: string;
    title: string;
  };
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
  verifiedService: string;
  date: string;
  status?: 'Approved' | 'Pending';
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: 'Maintenance' | 'Refrigeration' | 'HVAC' | 'Cold Rooms' | 'Energy Saving';
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  status?: 'Published' | 'Draft';
}

export interface DiagnosticResult {
  appliance: string;
  diagnosisSummary: string;
  probableCause: string;
  confidenceLevel: string;
  missingInfoQuestions?: string[];
  safeTroubleshootingSteps: string[];
  whenToStopTroubleshooting: string;
  technicianRequired: boolean;
  technicianRequiredReason: string;
  repairComplexity: string;
  recommendedNextAction: string;
  severity: 'Low' | 'Medium' | 'High' | 'Emergency Critical';
  recommendedAction: string;
  estimatedRepairScope: string;
  safetyWarning?: string;
  canSelfFix: boolean;
  suggestedParts?: string[];
  closingStatement: string;
}

export interface ColdRoomEstimate {
  capacityTR: number;
  capacityKW: number;
  panelThickness: string;
  compressorHP: number;
  estPowerMonthlyKsh: number;
  estTurnkeyCostRange: string;
  recommendedUnits: string[];
}

export type UserRole = 'Super Administrator' | 'Manager' | 'Technician';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  status: 'Active' | 'Suspended' | 'Pending Invitation';
  createdAt: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
  invitedBy?: string;
}

export type BookingStatus = 'New' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface BookingRecord {
  id: string;
  bookingRef: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  serviceType: string;
  date: string;
  timeSlot?: string;
  notes?: string;
  status: BookingStatus;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  createdAt: string;
  totalAmount?: number;
  paymentStatus?: 'Unpaid' | 'Paid' | 'Invoiced';
  technicianNotes?: string;
  beforeImages?: string[];
  afterImages?: string[];
}

export type QuoteStatus = 'Received' | 'Under Review' | 'Quote Issued' | 'Approved' | 'Rejected';

export interface QuoteRecord {
  id: string;
  rfqRef: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  projectType: string;
  specs?: string;
  status: QuoteStatus;
  quoteAmount?: number;
  responseNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  address?: string;
  customerType: 'Individual' | 'Commercial' | 'Corporate';
  totalSpent: number;
  serviceCount: number;
  notes?: string;
  createdAt: string;
}

export interface StoredDiagnosticRecord {
  id: string;
  applianceType: string;
  brand: string;
  modelNumber?: string;
  errorCode?: string;
  location: string;
  equipmentAge?: string;
  problemDescription: string;
  diagnosisSummary: string;
  severity: 'Low' | 'Medium' | 'High' | 'Emergency Critical';
  technicianRequired: boolean;
  createdAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  type: 'image' | 'video';
  category: string;
  url: string;
  description?: string;
  createdAt: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'Unread' | 'Read' | 'Replied';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'booking' | 'quote' | 'diagnostic' | 'contact' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface ContactInfoSettings {
  mainPhone: string;
  secondaryPhone: string;
  emergencyPhone: string;
  email: string;
  address: string;
  city: string;
  workingHours: string;
  googleMapsEmbedUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  whatsappNumber: string;
}

export interface WebsiteSettings {
  companyName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  footerCopyright: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

