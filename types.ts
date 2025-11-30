



// ... (Keep existing types)

export type Language = 'ar' | 'en';

export type Theme = 'light' | 'dark';

export enum Role {
    SUPER_ADMIN = 'super_admin',
    DEVELOPER_PARTNER = 'developer_partner',
    FINISHING_PARTNER = 'finishing_partner',
    AGENCY_PARTNER = 'agency_partner',
    DECORATION_MANAGER = 'decoration_manager',
    PLATFORM_FINISHING_MANAGER = 'platform_finishing_manager',
    FINISHING_MARKET_MANAGER = 'finishing_market_manager',
    PLATFORM_REAL_ESTATE_MANAGER = 'platform_real_estate_manager',
    REAL_ESTATE_MARKET_MANAGER = 'real_estate_market_manager',
    PARTNER_RELATIONS_MANAGER = 'partner_relations_manager',
    CONTENT_MANAGER = 'content_manager',
    SERVICE_MANAGER = 'service_manager',
    CUSTOMER_RELATIONS_MANAGER = 'customer_relations_manager',
    LISTINGS_MANAGER = 'listings_manager'
}

export enum Permission {
    VIEW_ADMIN_DASHBOARD = 'view_admin_dashboard',
    VIEW_PARTNER_DASHBOARD = 'view_partner_dashboard',
    VIEW_ANALYTICS = 'view_analytics',
    MANAGE_USERS = 'manage_users',
    MANAGE_ROLES_PERMISSIONS = 'manage_roles_permissions',
    MANAGE_ALL_PARTNERS = 'manage_all_partners',
    MANAGE_FINISHING_PARTNERS = 'manage_finishing_partners',
    MANAGE_PARTNER_REQUESTS = 'manage_partner_requests',
    MANAGE_ALL_PROPERTIES = 'manage_all_properties',
    MANAGE_PLATFORM_PROPERTIES = 'manage_platform_properties',
    MANAGE_MARKET_PROPERTIES = 'manage_market_properties',
    MANAGE_PROPERTY_REQUESTS = 'manage_property_requests',
    MANAGE_PROPERTY_INQUIRIES = 'manage_property_inquiries',
    MANAGE_ALL_PROJECTS = 'manage_all_projects',
    MANAGE_DECORATIONS_CONTENT = 'manage_decorations_content',
    MANAGE_DECORATIONS_LEADS = 'manage_decorations_leads',
    MANAGE_PLATFORM_FINISHING_PACKAGES = 'manage_platform_finishing_packages',
    MANAGE_PLATFORM_FINISHING_LEADS = 'manage_platform_finishing_leads',
    MANAGE_CONTACT_REQUESTS = 'manage_contact_requests',
    MANAGE_BANNERS = 'manage_banners',
    MANAGE_SITE_CONTENT = 'manage_site_content',
    MANAGE_FILTERS = 'manage_filters',
    MANAGE_SETTINGS = 'manage_settings',
    MANAGE_INQUIRIES_ROUTING = 'manage_inquiry_routing',
    MANAGE_INQUIRY_ROUTING = 'manage_inquiry_routing',
    MANAGE_PLANS = 'manage_plans',
    MANAGE_AUTOMATION = 'manage_automation',
    MANAGE_FORMS = 'manage_forms',
    MANAGE_OWN_PROFILE = 'manage_own_profile',
    MANAGE_OWN_PROPERTIES = 'manage_own_properties',
    MANAGE_OWN_PROJECTS = 'manage_own_projects',
    MANAGE_OWN_PORTFOLIO = 'manage_own_portfolio',
    VIEW_OWN_LEADS = 'view_own_leads',
    MANAGE_OWN_SUBSCRIPTION = 'manage_own_subscription',
    MANAGE_PLATFORM_PROPERTY_LEADS = 'manage_platform_property_leads' 
}

export type PartnerType = 
    | 'admin' 
    | 'developer' 
    | 'finishing' 
    | 'agency' 
    | 'decoration_manager' 
    | 'platform_finishing_manager' 
    | 'finishing_market_manager' 
    | 'platform_real_estate_manager' 
    | 'real_estate_market_manager' 
    | 'partner_relations_manager' 
    | 'content_manager' 
    | 'service_manager' 
    | 'customer_relations_manager' 
    | 'listings_manager';

export type PartnerStatus = 'active' | 'pending' | 'disabled';
export type PartnerDisplayType = 'standard' | 'featured' | 'mega_project';
export type SubscriptionPlan = 'basic' | 'professional' | 'elite' | 'commission' | 'paid_listing';

export interface Partner {
    id: string;
    name: string;
    email: string;
    password?: string;
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    type: PartnerType;
    role: Role;
    status: PartnerStatus;
    subscriptionPlan: SubscriptionPlan;
    subscriptionEndDate?: string;
    displayType: PartnerDisplayType;
    description?: string;
    contactMethods?: {
        whatsapp: { enabled: boolean; number: string; };
        phone: { enabled: boolean; number: string; };
        form: { enabled: boolean; };
    };
    createdAt?: string;
}

export interface AdminPartner extends Partner {
    nameAr?: string;
    descriptionAr?: string;
}

export type ListingStatus = 'active' | 'inactive' | 'draft' | 'sold';

export interface Property {
    id: string;
    partnerId: string;
    partnerName?: string;
    partnerImageUrl?: string;
    projectId?: string;
    projectName?: { en: string; ar: string };
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    gallery: string[];
    status: { en: string; ar: string };
    price: { en: string; ar: string };
    priceNumeric: number;
    pricePerMeter?: { en: string; ar: string };
    type: { en: string; ar: string };
    title: { en: string; ar: string };
    address: { en: string; ar: string };
    description: { en: string; ar: string };
    beds: number;
    baths: number;
    area: number;
    floor?: number;
    amenities: { en: string[]; ar: string[] };
    finishingStatus?: { en: string; ar: string };
    installmentsAvailable: boolean;
    isInCompound: boolean;
    realEstateFinanceAvailable: boolean;
    delivery: { isImmediate: boolean; date?: string };
    installments?: { downPayment: number; monthlyInstallment: number; years: number };
    location: { lat: number; lng: number };
    listingStartDate?: string;
    listingEndDate?: string;
    listingStatus: ListingStatus;
    contactMethod?: 'platform' | 'direct';
    ownerPhone?: string;
    createdAt?: string;
}

export interface Project {
    id: string;
    partnerId: string;
    partnerName?: string;
    name: { ar: string; en: string };
    description: { ar: string; en: string };
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    createdAt: string;
    features?: { icon: string; text: { ar: string; en: string } }[];
}

export interface PortfolioItem {
    id: string;
    partnerId: string;
    partnerName?: string;
    imageUrl: string;
    alt: string;
    title: { ar: string; en: string };
    category: { ar: string; en: string };
    price?: number;
    dimensions?: string;
    availability?: 'In Stock' | 'Made to Order';
    createdAt?: string;
}

export interface DecorationCategory {
    id: string;
    name: { ar: string; en: string };
    description: { ar: string; en: string };
}

export interface FavoriteItem {
    id: string;
    type: 'property' | 'service' | 'portfolio';
}

export type LeadStatus = 'new' | 'contacted' | 'site-visit' | 'quoted' | 'in-progress' | 'completed' | 'cancelled';

export interface LeadMessage {
    id: string;
    sender: 'client' | 'partner' | 'admin' | 'system';
    senderId?: string;
    type: 'message' | 'note';
    content: string;
    timestamp: string;
}

export interface Lead {
    id: string;
    partnerId: string;
    managerId?: string;
    serviceType: 'finishing' | 'decorations' | 'property';
    customerName: string;
    customerPhone: string;
    contactTime?: string;
    serviceTitle: string;
    customerNotes?: string;
    status: LeadStatus;
    createdAt: string;
    updatedAt: string;
    messages: LeadMessage[];
    assignedTo?: string;
    propertyId?: string;
    partnerName?: string;
    referenceImage?: string;
}

export enum RequestType {
    LEAD = 'LEAD',
    PARTNER_APPLICATION = 'PARTNER_APPLICATION',
    PROPERTY_LISTING_REQUEST = 'PROPERTY_LISTING_REQUEST',
    CONTACT_MESSAGE = 'CONTACT_MESSAGE',
    PROPERTY_INQUIRY = 'PROPERTY_INQUIRY'
}

export type RequestStatus = 'new' | 'pending' | 'reviewed' | 'assigned' | 'in-progress' | 'approved' | 'rejected' | 'closed';

export interface Request {
    id: string;
    type: RequestType;
    requesterInfo: { name: string; phone: string; email?: string };
    payload: any;
    status: RequestStatus;
    assignedTo?: string;
    assignedToName?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ManagementContact {
    name: string;
    position: string;
    email: string;
    phone: string;
}

export interface OfficialDocument {
    fileName: string;
    fileContent: string; // Base64
}

export interface PartnerRequest {
    id: string;
    companyName: string;
    companyType: PartnerType;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    description?: string;
    website?: string;
    companyAddress?: string; // Added missing property
    managementContacts?: ManagementContact[];
    logo?: string;
    documents?: OfficialDocument[];
    subscriptionPlan: SubscriptionPlan;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export interface AddPropertyRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    propertyDetails: any;
    status: RequestStatus;
    createdAt: string;
    managerId?: string;
    images: string[];
    cooperationType: string;
    contactTime: string;
}

export interface PropertyInquiryRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    details: string;
    status: RequestStatus;
    createdAt: string;
}

export interface ContactRequest {
    id: string;
    name: string;
    phone: string;
    message: string;
    inquiryType: 'client' | 'partner';
    companyName?: string;
    businessType?: PartnerType;
    status: RequestStatus;
    managerId?: string;
    createdAt: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: { ar: string; en: string };
    link: string;
    isRead: boolean;
    createdAt: string;
}

export interface Banner {
    id: string;
    title: string;
    imageUrl: string;
    link?: string;
    locations: ('home' | 'properties' | 'details' | 'finishing' | 'decorations')[];
    status: 'active' | 'inactive';
    startDate?: string;
    endDate?: string;
}

export interface FilterOption {
    id: string;
    en: string;
    ar: string;
    applicableTo?: string[];
}

export interface Quote {
    quote: { ar: string; en: string };
    author: { ar: string; en: string };
}

export interface PaymentConfiguration {
    instapay: {
        enabled: boolean;
        number: string;
        walletName?: string;
        paymentLink?: string;
        qrCodeUrl?: string;
        instructions: { ar: string; en: string };
    };
    paymob: {
        enabled: boolean;
        apiKey?: string;
        secretKey?: string;
        publicKey?: string;
    };
}

export interface SiteContent {
    logoUrl?: string;
    locationPickerMapUrl?: string;
    topBanner?: {
        enabled: boolean;
        content: { ar: string; en: string };
    };
    contactConfiguration?: {
        routing: 'internal' | 'email' | 'both';
        targetEmail?: string;
    };
    paymentConfiguration?: PaymentConfiguration;
    hero: {
        ar: { title: string; subtitle: string };
        en: { title: string; subtitle: string };
        images: { src: string; alt: { ar: string; en: string } }[];
    };
    homeCTA?: {
        enabled: boolean;
        ar: { title: string; subtitle: string; button: string; link: string };
        en: { title: string; subtitle: string; button: string; link: string };
    };
    homeListings?: {
        enabled: boolean;
        count: number;
        ar: { title: string };
        en: { title: string };
    };
    whyUs: any;
    services: any;
    partners: any;
    testimonials: any;
    socialProof: any;
    whyNewHeliopolis: any;
    quotes: Quote[];
    footer: any;
    finishingServices?: any[];
    projectsPage?: any;
    finishingPage?: any;
    decorationsPage?: any;
    privacyPolicy?: any;
    termsOfUse?: any;
}

export type PlanCategory = 'developer' | 'agency' | 'finishing' | 'individual';

export interface SubscriptionPlanDetails {
    name: string;
    price: string;
    description: string;
    features: string[];
    commissionRate?: number;
}

export interface PropertyFiltersType {
    view: string;
    status: string;
    type: string;
    query: string;
    minPrice: string;
    maxPrice: string;
    project: string;
    finishing: string;
    installments: string;
    realEstateFinance: string;
    floor: string;
    compound: string;
    delivery: string;
    amenities: string[];
    beds: string;
    baths: string;
}

// AI Estimator & Finance types
export interface AIEstimatorOption {
    key: string;
    en: string;
    ar: string;
}

export interface AIEstimatorItem {
    id: string;
    name: { [key in Language]: string };
    unit: { [key in Language]: string };
    price: number;
}

export interface AIEstimatorStage {
    id: string;
    name: { [key in Language]: string };
    basicItems: AIEstimatorItem[];
    optionalItems: AIEstimatorItem[];
}

export interface AIEstimatorConfig {
    model: string;
    prompt: string;
    options: {
        [key: string]: AIEstimatorOption[];
    };
    stages: AIEstimatorStage[];
}

export type PaymentMethod = 'instapay' | 'card' | 'bank_transfer' | 'cash';
export type TransactionStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'reviewing';
export type TransactionType = 'subscription_fee' | 'listing_fee' | 'service_payment' | 'product_purchase';

export interface Transaction {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    currency: string;
    type: TransactionType;
    description: string;
    method: PaymentMethod;
    status: TransactionStatus;
    createdAt: string;
    updatedAt: string;
    relatedEntityId?: string;
    receiptUrl?: string;
    referenceNumber?: string;
}

export interface FinanceStats {
    totalRevenue: number;
    pendingAmount: number;
    successfulTransactions: number;
    pendingReviews: number;
}

// --- DYNAMIC FORMS TYPES ---
export type FormFieldType = 'text' | 'textarea' | 'number' | 'email' | 'tel' | 'select' | 'checkbox' | 'date' | 'file' | 'radio';
export type FormCategory = 'public' | 'lead_gen' | 'partner_app' | 'admin_internal';
export type SubmissionDestination = 'email' | 'crm_leads' | 'crm_messages' | 'crm_partners';

export type ValidationRuleType = 'none' | 'email' | 'phone_eg' | 'url' | 'number' | 'custom';

export interface FormFieldDefinition {
    id: string;
    type: FormFieldType;
    label: { ar: string; en: string };
    key: string; // The key used in JSON payload
    required: boolean;
    options?: string[] | string; // For select/radio: comma separated or simple array
    placeholder?: { ar: string; en: string };
    width?: 'full' | 'half' | 'third'; // Layout hint
    validation?: {
        type: ValidationRuleType;
        pattern?: string; // Custom Regex string if type is custom
        minLength?: number;
        maxLength?: number;
        errorMessage?: { ar: string; en: string };
    };
}

export interface FormDefinition {
    id: string;
    slug: string; // e.g. 'contact-us', 'service-request'
    title: { ar: string; en: string };
    description?: { ar: string; en: string };
    category: FormCategory; // NEW: To filter in admin
    destination: SubmissionDestination; // NEW: To know where to route data
    fields: FormFieldDefinition[];
    submitButtonLabel?: { ar: string; en: string };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
