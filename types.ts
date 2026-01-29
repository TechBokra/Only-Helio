
export type Language = 'ar' | 'en';

export enum Role {
    SUPER_ADMIN = 'SUPER_ADMIN',
    DEVELOPER_PARTNER = 'DEVELOPER_PARTNER',
    FINISHING_PARTNER = 'FINISHING_PARTNER',
    AGENCY_PARTNER = 'AGENCY_PARTNER',
    DECORATION_MANAGER = 'DECORATION_MANAGER',
    PLATFORM_FINISHING_MANAGER = 'PLATFORM_FINISHING_MANAGER',
    FINISHING_MARKET_MANAGER = 'FINISHING_MARKET_MANAGER',
    PLATFORM_REAL_ESTATE_MANAGER = 'PLATFORM_REAL_ESTATE_MANAGER',
    REAL_ESTATE_MARKET_MANAGER = 'REAL_ESTATE_MARKET_MANAGER',
    PARTNER_RELATIONS_MANAGER = 'PARTNER_RELATIONS_MANAGER',
    CONTENT_MANAGER = 'CONTENT_MANAGER',
    SERVICE_MANAGER = 'SERVICE_MANAGER',
    CUSTOMER_RELATIONS_MANAGER = 'CUSTOMER_RELATIONS_MANAGER',
    LISTINGS_MANAGER = 'LISTINGS_MANAGER'
}

export enum Permission {
    VIEW_ADMIN_DASHBOARD = 'VIEW_ADMIN_DASHBOARD',
    VIEW_PARTNER_DASHBOARD = 'VIEW_PARTNER_DASHBOARD',
    MANAGE_USERS = 'MANAGE_USERS',
    MANAGE_ROLES_PERMISSIONS = 'MANAGE_ROLES_PERMISSIONS',
    MANAGE_ALL_PARTNERS = 'MANAGE_ALL_PARTNERS',
    MANAGE_ALL_PROPERTIES = 'MANAGE_ALL_PROPERTIES',
    MANAGE_ALL_PROJECTS = 'MANAGE_ALL_PROJECTS',
    MANAGE_OWN_PROFILE = 'MANAGE_OWN_PROFILE',
    MANAGE_OWN_PROJECTS = 'MANAGE_OWN_PROJECTS',
    MANAGE_OWN_PROPERTIES = 'MANAGE_OWN_PROPERTIES',
    MANAGE_OWN_PORTFOLIO = 'MANAGE_OWN_PORTFOLIO',
    MANAGE_OWN_SUBSCRIPTION = 'MANAGE_OWN_SUBSCRIPTION',
    VIEW_OWN_LEADS = 'VIEW_OWN_LEADS',
    VIEW_ANALYTICS = 'VIEW_ANALYTICS',
    MANAGE_PLANS = 'MANAGE_PLANS',
    MANAGE_BANNERS = 'MANAGE_BANNERS',
    MANAGE_SITE_CONTENT = 'MANAGE_SITE_CONTENT',
    MANAGE_FILTERS = 'MANAGE_FILTERS',
    MANAGE_SETTINGS = 'MANAGE_SETTINGS',
    MANAGE_FORMS = 'MANAGE_FORMS',
    MANAGE_DECORATIONS_CONTENT = 'MANAGE_DECORATIONS_CONTENT',
    MANAGE_DECORATIONS_LEADS = 'MANAGE_DECORATIONS_LEADS',
    MANAGE_PLATFORM_FINISHING_PACKAGES = 'MANAGE_PLATFORM_FINISHING_PACKAGES',
    MANAGE_PLATFORM_FINISHING_LEADS = 'MANAGE_PLATFORM_FINISHING_LEADS',
    MANAGE_PARTNER_REQUESTS = 'MANAGE_PARTNER_REQUESTS',
    MANAGE_PLATFORM_PROPERTIES = 'MANAGE_PLATFORM_PROPERTIES',
    MANAGE_PLATFORM_PROPERTY_LEADS = 'MANAGE_PLATFORM_PROPERTY_LEADS',
    MANAGE_MARKET_PROPERTIES = 'MANAGE_MARKET_PROPERTIES',
    MANAGE_PROPERTY_REQUESTS = 'MANAGE_PROPERTY_REQUESTS',
    MANAGE_PROPERTY_INQUIRIES = 'MANAGE_PROPERTY_INQUIRIES',
    MANAGE_CONTACT_REQUESTS = 'MANAGE_CONTACT_REQUESTS',
    MANAGE_INQUIRY_ROUTING = 'MANAGE_INQUIRY_ROUTING',
    MANAGE_AUTOMATION = 'MANAGE_AUTOMATION',
    MANAGE_FINISHING_PARTNERS = 'MANAGE_FINISHING_PARTNERS'
}

export type PartnerType = 'developer' | 'finishing' | 'agency' | 'admin' | 'decoration_manager' | 'platform_finishing_manager' | 'finishing_market_manager' | 'platform_real_estate_manager' | 'real_estate_market_manager' | 'partner_relations_manager' | 'content_manager' | 'service_manager' | 'customer_relations_manager' | 'listings_manager';

export type PartnerStatus = 'active' | 'pending' | 'disabled' | 'pending_setup';

export type SubscriptionPlan = 'basic' | 'professional' | 'elite' | 'commission' | 'paid_listing';

export type PlanCategory = 'developer' | 'agency' | 'finishing' | 'individual';

export type PartnerDisplayType = 'standard' | 'featured' | 'mega_project';

export interface ContactMethod {
    enabled: boolean;
    number?: string;
}

export interface PartnerContactMethods {
    whatsapp: ContactMethod;
    phone: ContactMethod;
    form: ContactMethod;
}

export interface Partner {
    id: string;
    name: string;
    nameAr?: string;
    email: string;
    description: string;
    descriptionAr?: string;
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    type: PartnerType;
    role: Role;
    status: PartnerStatus;
    subscriptionPlan: SubscriptionPlan;
    subscriptionEndDate?: string;
    contactMethods?: PartnerContactMethods;
    displayType: PartnerDisplayType;
    createdAt: string;
}

export interface AdminPartner extends Partner {
    // Admin specific fields if any, otherwise alias
}

export type ListingStatus = 'active' | 'inactive' | 'draft' | 'sold';

export interface Property {
    id: string;
    partnerId: string;
    partnerName?: string;
    partnerImageUrl?: string;
    projectId?: string;
    projectName?: { en: string; ar: string };
    title: { en: string; ar: string };
    description: { en: string; ar: string };
    address: { en: string; ar: string };
    location: { lat: number; lng: number };
    status: { en: 'For Sale' | 'For Rent'; ar: 'للبيع' | 'إيجار' };
    type: { en: string; ar: string }; // e.g. Apartment, Villa
    finishingStatus?: { en: string; ar: string };
    area: number;
    price: { en: string; ar: string };
    priceNumeric: number;
    pricePerMeter?: { en: string; ar: string };
    beds: number;
    baths: number;
    floor?: number;
    amenities: { en: string[]; ar: string[] };
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    gallery: string[];
    listingStatus: ListingStatus;
    listingStartDate?: string;
    listingEndDate?: string;
    isInCompound: boolean;
    installmentsAvailable: boolean;
    realEstateFinanceAvailable: boolean;
    installments?: { downPayment: number; monthlyInstallment: number; years: number };
    delivery: { isImmediate: boolean; date?: string };
    contactMethod: 'platform' | 'direct';
    ownerPhone?: string;
    createdAt: string;
}

export interface Project {
    id: string;
    partnerId: string;
    partnerName?: string;
    name: { en: string; ar: string };
    description: { en: string; ar: string };
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    features: { icon: string; text: { en: string; ar: string } }[];
    createdAt: string;
    projectType?: string; // Type like 'Residential', 'Commercial'
    unitCount?: number;
}

export type ProjectType = string;

export interface PortfolioItem {
    id: string;
    partnerId: string;
    partnerName?: string;
    title: { en: string; ar: string };
    category: { en: string; ar: string };
    categoryId?: string;
    imageUrl: string;
    alt: string;
    price?: number;
    dimensions?: string;
    availability?: 'In Stock' | 'Made to Order';
    createdAt: string;
}

export interface DecorationCategory {
    id: string;
    name: { en: string; ar: string };
    description: { en: string; ar: string };
}

export interface FilterOption {
    id: string;
    en: string;
    ar: string;
    applicableTo?: string[]; // e.g. ['Apartment', 'Villa']
}

export interface FavoriteItem {
    id: string;
    type: 'property' | 'service' | 'portfolio';
}

// Requests & Leads

export type LeadStatus = 'new' | 'contacted' | 'site-visit' | 'quoted' | 'in-progress' | 'completed' | 'cancelled';

export interface LeadMessage {
    id: string;
    sender: 'system' | 'admin' | 'partner' | 'client';
    senderId?: string;
    type: 'message' | 'note';
    content: string;
    timestamp: string;
}

export interface Lead {
    id: string;
    partnerId: string;
    partnerName?: string;
    managerId?: string;
    propertyId?: string;
    serviceType: 'finishing' | 'decorations' | 'property' | 'general';
    serviceTitle: string;
    customerName: string;
    customerPhone: string;
    contactTime?: string;
    customerNotes?: string;
    status: LeadStatus;
    assignedTo?: string; // userId
    referenceImage?: string;
    messages?: LeadMessage[];
    createdAt: string;
    updatedAt: string;
}

export enum RequestType {
    LEAD = 'LEAD',
    PARTNER_APPLICATION = 'PARTNER_APPLICATION',
    PROPERTY_LISTING_REQUEST = 'PROPERTY_LISTING_REQUEST',
    CONTACT_MESSAGE = 'CONTACT_MESSAGE',
    PROPERTY_INQUIRY = 'PROPERTY_INQUIRY'
}

export type RequestStatus = 'new' | 'pending' | 'reviewed' | 'approved' | 'rejected' | 'assigned' | 'in-progress' | 'closed';

export interface Request {
    id: string;
    type: RequestType;
    status: RequestStatus;
    createdAt: string;
    updatedAt?: string;
    assignedTo?: string;
    assignedToName?: string;
    requesterInfo: {
        name: string;
        phone: string;
        email?: string;
    };
    payload: PartnerRequest | AddPropertyRequest | ContactRequest | PropertyInquiryRequest | Lead;
}

export interface OfficialDocument {
    fileName: string;
    fileContent: string; // Base64 or URL
}

export interface PartnerRequest {
    id: string;
    companyName: string;
    companyType: PartnerType;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    description: string;
    website?: string;
    companyAddress: string;
    logo?: string;
    documents: OfficialDocument[];
    managementContacts: { name: string; position: string; email: string; phone: string }[];
    subscriptionPlan: SubscriptionPlan;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export interface AddPropertyRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    contactTime: string;
    propertyDetails: any; // JSON with detailed specs
    images: string[];
    cooperationType: 'paid_listing' | 'commission';
    status: RequestStatus;
    createdAt: string;
    managerId?: string;
}

export interface ContactRequest {
    id: string;
    name: string;
    phone: string;
    message: string;
    inquiryType?: 'client' | 'partner';
    status: RequestStatus;
    createdAt: string;
    managerId?: string;
    businessType?: string;
    companyName?: string;
}

export interface PropertyInquiryRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    details: string;
    status: RequestStatus;
    createdAt: string;
}

// Configuration & Plans

export interface PlanLimits {
    projects?: number;
    units?: number;
    propertiesTotal?: number;
    propertiesSale?: number;
    propertiesRent?: number;
    portfolio?: number;
}

export interface SubscriptionPlanDetails {
    name: string;
    price: string;
    description: string;
    features: string[];
    commissionRateSale?: number;
    commissionRateRent?: number;
    limits: PlanLimits;
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

export interface Quote {
    quote: { ar: string; en: string };
    author: { ar: string; en: string };
}

export interface FinishingServicePricingTier {
    unitType: { ar: string; en: string };
    areaRange: { ar: string; en: string };
    price: number;
}

export interface FinishingService {
    id: string;
    title: { ar: string; en: string };
    description: { ar: string; en: string };
    pricingTiers: FinishingServicePricingTier[];
}

// Site Content (CMS)

export interface SiteContent {
    logoUrl?: string;
    enableMaps?: boolean;
    locationPickerMapUrl?: string;
    topBanner?: {
        enabled: boolean;
        content: { ar: string; en: string };
    };
    contactConfiguration: {
        routing: 'internal' | 'email' | 'both';
        targetEmail?: string;
    };
    paymentConfiguration?: {
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
    };
    hero: {
        ar: { title: string; subtitle: string };
        en: { title: string; subtitle: string };
        images: HeroImage[];
    };
    footer: {
        ar: { description: string; address: string; hours: string };
        en: { description: string; address: string; hours: string };
        phone: string;
        email: string;
        isWhatsAppOnly?: boolean;
        social: { facebook: string; twitter: string; instagram: string; linkedin: string };
        copyright: { ar: string; en: string };
        feedbackText: { ar: string; en: string };
    };
    services: {
        enabled: boolean;
        ar: { title: string; description: string; features: { icon: string; title: string; description: string; link: string }[] };
        en: { title: string; description: string; features: { icon: string; title: string; description: string; link: string }[] };
    };
    partners: {
        enabled: boolean;
        ar: { title: string; description: string; mega_projects_title: string; developers_title: string; finishing_companies_title: string; agencies_title: string; investor_partners_title: string };
        en: { title: string; description: string; mega_projects_title: string; developers_title: string; finishing_companies_title: string; agencies_title: string; investor_partners_title: string };
    };
    whyNewHeliopolis: {
        enabled: boolean;
        ar: { title: string; location: { title: string; description: string; stats: { value: string; desc: string }[] } };
        en: { title: string; location: { title: string; description: string; stats: { value: string; desc: string }[] } };
        images: { src: string; alt: { ar: string; en: string } }[];
    };
    whyUs: {
        enabled: boolean;
        ar: { title: string; description: string; features: { title: string; description: string }[] };
        en: { title: string; description: string; features: { title: string; description: string }[] };
    };
    testimonials: {
        enabled: boolean;
        ar: { title: string; subtitle: string };
        en: { title: string; subtitle: string };
        items: { quote: { ar: string; en: string }; author: { ar: string; en: string }; location: { ar: string; en: string } }[];
    };
    socialProof: {
        enabled: boolean;
        stats: { value: string; name: { ar: string; en: string } }[];
    };
    homeCTA: {
        enabled: boolean;
        ar: { title: string; subtitle: string; button: string; link: string };
        en: { title: string; subtitle: string; button: string; link: string };
    };
    homeListings: {
        enabled: boolean;
        count: number;
        ar: { title: string };
        en: { title: string };
    };
    privacyPolicy?: {
        ar: { title: string; lastUpdated: string; sections: { title: string; content: string }[] };
        en: { title: string; lastUpdated: string; sections: { title: string; content: string }[] };
    };
    termsOfUse?: {
        ar: { title: string; lastUpdated: string; sections: { title: string; content: string }[] };
        en: { title: string; lastUpdated: string; sections: { title: string; content: string }[] };
    };
    finishingServices: FinishingService[];
    projectsPage?: {
        ar: { title: string; subtitle: string };
        en: { title: string; subtitle: string };
    };
    finishingPage?: {
        ar: any;
        en: any;
    };
    decorationsPage?: {
        ar: any;
        en: any;
    };
    quotes: Quote[];
}

export interface HeroImage {
    src: string;
    alt: { ar: string; en: string };
}

// AI Estimator

export interface AIEstimatorItem {
    id: string;
    name: { ar: string; en: string };
    unit: { ar: string; en: string };
    minPrice: number;
    maxPrice: number;
    minLabor: number;
    maxLabor: number;
}

export interface FinishingTier {
    id: string;
    name: { ar: string; en: string };
    description: { ar: string; en: string };
    multiplier: number;
}

export interface AIEstimatorStage {
    id: string;
    name: { ar: string; en: string };
    basicItems: AIEstimatorItem[];
    optionalItems: AIEstimatorItem[];
}

export interface AIEstimatorConfig {
    model: string;
    prompt: string;
    options: any;
    supervisionRate: number;
    globalNotes: { ar: string; en: string };
    tiers: FinishingTier[];
    stages: AIEstimatorStage[];
    lastUpdated?: string;
}

// Finance

export type TransactionStatus = 'pending' | 'reviewing' | 'paid' | 'failed' | 'refunded';
export type TransactionType = 'subscription_fee' | 'listing_fee' | 'service_payment' | 'product_purchase';
export type PaymentMethod = 'instapay' | 'card' | 'wallet';

export interface Transaction {
    id: string;
    userId: string;
    userName: string;
    amount: number;
    currency: string;
    type: TransactionType;
    status: TransactionStatus;
    method: PaymentMethod;
    description: string;
    relatedEntityId?: string; // ID of the related item (Lead ID, Property ID, etc.)
    receiptUrl?: string; // For manual methods
    referenceNumber?: string;
    createdAt: string;
    updatedAt: string;
}

export interface FinanceStats {
    totalRevenue: number;
    pendingAmount: number;
    successfulTransactions: number;
    pendingReviews: number;
}

// Forms

export type FormFieldType = 'text' | 'textarea' | 'number' | 'email' | 'tel' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
export type ValidationRuleType = 'email' | 'phone_eg' | 'url' | 'number' | 'custom' | 'none';
export type SubmissionDestination = 'crm_leads' | 'crm_messages' | 'crm_partners' | 'email';
export type FormCategory = 'public' | 'lead_gen' | 'partner_app' | 'admin_internal';

export interface FormFieldDefinition {
    id: string;
    key: string; // The property name in data object
    type: FormFieldType;
    label: { ar: string; en: string };
    placeholder?: { ar: string; en: string };
    required: boolean;
    options?: string[] | string; // For select/radio (comma separated or array)
    width: 'full' | 'half' | 'third';
    validation?: {
        type: ValidationRuleType;
        pattern?: string; // Regex string
        minLength?: number;
        maxLength?: number;
        errorMessage?: { ar: string; en: string };
    };
    defaultValue?: any;
}

export interface FormDefinition {
    id: string;
    slug: string; // Unique identifier for fetching
    title: { ar: string; en: string };
    description?: { ar: string; en: string };
    category: FormCategory;
    destination: SubmissionDestination;
    isActive: boolean;
    fields: FormFieldDefinition[];
    submitButtonLabel?: { ar: string; en: string };
    createdAt: string;
    updatedAt: string;
}

// Notifications
export interface Notification {
    id: string;
    userId: string;
    message: { ar: string; en: string };
    link: string;
    isRead: boolean;
    createdAt: string;
}

// Partner Services (Managed by Partner)
export interface PartnerService {
    id: string;
    partnerId: string;
    title: { ar: string; en: string };
    description: { ar: string; en: string };
    priceRange?: { ar: string; en: string };
    estimatedTime?: { ar: string; en: string };
    imageUrl?: string;
    isActive: boolean;
    createdAt: string;
}

// UI
export type Theme = 'light' | 'dark';

export interface PropertyFiltersType {
    view: 'grid' | 'list' | 'admin';
    status: string;
    type: string;
    query: string;
    minPrice: string;
    maxPrice: string;
    minArea: string;
    maxArea: string;
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
