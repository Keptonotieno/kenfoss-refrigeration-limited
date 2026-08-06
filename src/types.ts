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
  equipmentServiced?: string[];
  commonIssues?: string[];
  benefits?: string[];
  industriesServed?: string[];
  realWorldApplications?: { title: string; scenario: string }[];
  enabled?: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  client: string;
  category: 'Cold Room' | 'HVAC' | 'Supermarket' | 'Appliance Repair' | 'Industrial' | string;
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
  status?: 'Approved' | 'Pending' | 'Rejected';
  featured?: boolean;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: 'Maintenance' | 'Refrigeration' | 'HVAC' | 'Cold Rooms' | 'Energy Saving' | 'Industry News' | 'Case Studies' | string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    email?: string;
  };
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  status?: 'Published' | 'Draft' | 'Archived';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  featured?: boolean;
  viewsCount?: number;
  createdAt?: string;
  updatedAt?: string;
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
  searchGrounded?: boolean;
  sources?: { title: string; uri: string }[];
  searchQueries?: string[];
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

export type PermissionKey =
  | 'view_dashboard'
  | 'manage_bookings'
  | 'manage_quotes'
  | 'manage_customers'
  | 'view_diagnostics'
  | 'technician_portal'
  | 'manage_services'
  | 'manage_projects'
  | 'manage_gallery'
  | 'manage_testimonials'
  | 'manage_blogs'
  | 'manage_contact_info'
  | 'manage_website_settings'
  | 'manage_users_roles'
  | 'view_audit_logs';

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystemRole?: boolean;
  permissions: PermissionKey[];
  createdAt: string;
  updatedAt?: string;
}

export type UserRole = 'Super Administrator' | 'Manager' | 'Technician' | string;

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  status: 'Active' | 'Suspended' | 'Pending Invitation' | 'Disabled' | 'Inactive';
  createdAt: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
  invitedBy?: string;
  mustChangePassword?: boolean;
  passwordHash?: string;
}

export type BookingStatus = 'New' | 'Assigned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface BookingRecord {
  id: string;
  bookingRef: string;
  fullName: string;
  phone: string;
  email: string;
  location: string;
  address?: string;
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

export interface CustomerCommunicationLog {
  id: string;
  date: string;
  type: 'Call' | 'Email' | 'WhatsApp' | 'Site Visit' | 'Note' | 'Quote' | 'Booking';
  summary: string;
  author?: string;
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
  communications?: CustomerCommunicationLog[];
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
  thumbnailUrl?: string;
  description?: string;
  tags?: string[];
  featured?: boolean;
  location?: string;
  client?: string;
  fileSizeKb?: number;
  dimensions?: string;
  createdAt: string;
  updatedAt?: string;
}

export type MessageSentiment = 'urgent' | 'frustrated' | 'inquiring' | 'general';

export interface ContactMessageRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'Unread' | 'Read' | 'Replied';
  sentiment?: MessageSentiment;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  type: 'booking' | 'quote' | 'diagnostic' | 'contact' | 'system' | 'whatsapp';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
  imageUrl?: string;
  imageName?: string;
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
  siteTitle: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  footerCopyright: string;
  footerText: string;
  epraNotice?: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  gtmContainerId?: string;
  facebookPixelId?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
  enableMaintenanceMode: boolean;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  actorName?: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

