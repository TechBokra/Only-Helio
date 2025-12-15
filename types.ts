
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

export type PartnerType = 
    | 'developer' 
    | 'agency' 
    | 'finishing' 
    | 'admin' 
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

export type PartnerStatus = 'active' | 'pending' | 'disabled' | 'pending_setup';
export type SubscriptionPlan = 'basic' | 'professional' | 'elite' | 'commission' | 'paid_listing';
export type PlanCategory = 'developer' | 'agency' | 'finishing' | 'individual';
export type PartnerDisplayType = 'standard' | 'featured' | 'mega_project';

export interface Partner {
    id: string;
    name: string;
    nameAr?: string;
    email: string;
    phone?: string;
    type: PartnerType;
    role: Role;
    status: PartnerStatus;
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    description: string;
    descriptionAr?: string;
    subscriptionPlan: SubscriptionPlan;
    subscriptionEndDate?: string;
    displayType: PartnerDisplayType;
    contactMethods?: {
        whatsapp: { enabled: boolean; number: string };
        phone: { enabled: boolean; number: string };
        form: { enabled: boolean };
    };
    createdAt: string;
}

// AdminPartner is effectively Partner but with potential extra fields or just alias
export type AdminPartner = Partner;

export type Theme = 'light' | 'dark';

export interface OfficialDocument {
    fileName: string;
    fileContent: string;
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
    assignedTo?: string; // User ID
    assignedToName?: string;
    createdAt: string;
    updatedAt?: string;
    requesterInfo: {
        name: string;
        phone: string;
        email?: string;
    };
    payload: unknown; // Specific to type
}

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
    partnerId: string; // The partner owning the lead
    managerId?: string; // Internal manager if applicable
    propertyId?: string;
    serviceType: 'finishing' | 'decorations' | 'property' | 'general';
    customerName: string;
    customerPhone: string;
    serviceTitle: string;
    status: LeadStatus;
    contactTime?: string;
    customerNotes?: string;
    assignedTo?: string; // Internal user ID
    referenceImage?: string;
    messages?: LeadMessage[];
    createdAt: string;
    updatedAt: string;
    partnerName?: string;
}

export interface ContactRequest {
    id: string;
    name: string;
    phone: string;
    message: string;
    inquiryType?: string; // client, partner, etc.
    businessType?: string;
    companyName?: string;
    status: RequestStatus;
    createdAt: string;
    managerId?: string;
}

export interface AddPropertyRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    contactTime?: string;
    status: RequestStatus;
    createdAt: string;
    managerId?: string;
    propertyDetails: any; // Simplified for now
    images?: string[];
    cooperationType?: string;
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
    documents?: OfficialDocument[];
    managementContacts?: any[];
    subscriptionPlan: SubscriptionPlan;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

export interface PropertyInquiryRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    details: string;
    status: RequestStatus;
    createdAt: string;
}

export interface Project {
    id: string;
    partnerId: string;
    partnerName?: string; // joined
    name: { ar: string; en: string };
    description: { ar: string; en: string };
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    createdAt: string;
    features?: { icon: string; text: { ar: string; en: string } }[];
    projectType?: ProjectType;
}

export type ProjectType = 'Compound' | 'Commercial_Mall' | 'Residential_Building' | 'Mixed_Use';

export type ListingStatus = 'active' | 'inactive' | 'draft' | 'sold';

export interface Property {
    id: string;
    partnerId: string;
    partnerName?: string;
    partnerImageUrl?: string;
    projectId?: string;
    projectName?: { ar: string; en: string };
    
    title: { ar: string; en: string };
    description: { ar: string; en: string };
    address: { ar: string; en: string };
    location: { lat: number; lng: number };
    
    status: { ar: string; en: 'For Sale' | 'For Rent' }; // Frontend status display
    listingStatus: ListingStatus; // System status
    listingStartDate?: string;
    listingEndDate?: string;
    
    type: { ar: string; en: string }; // Apartment, Villa, etc.
    
    price: { ar: string; en: string };
    priceNumeric: number;
    pricePerMeter?: { ar: string; en: string };
    
    area: number;
    beds: number;
    baths: number;
    floor?: number;
    
    finishingStatus?: { ar: string; en: string };
    
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    gallery: string[];
    
    amenities: { ar: string[]; en: string[] };
    
    isInCompound: boolean;
    installmentsAvailable: boolean;
    realEstateFinanceAvailable: boolean;
    
    delivery: {
        isImmediate: boolean;
        date?: string;
    };
    
    installments?: {
        downPayment: number;
        monthlyInstallment: number;
        years: number;
    };
    
    contactMethod?: 'platform' | 'direct';
    ownerPhone?: string;
    
    createdAt?: string;
}

export interface PortfolioItem {
    id: string;
    partnerId: string;
    imageUrl: string;
    alt: string;
    title: { ar: string; en: string };
    category: { ar: string; en: string };
    categoryId?: string;
    price?: number;
    dimensions?: string;
    availability?: 'In Stock' | 'Made to Order';
    createdAt?: string;
    partnerName?: string; // Joined
}

export interface DecorationCategory {
    id: string;
    name: { ar: string; en: string };
    description: { ar: string; en: string };
}

export interface Banner {
    id: string;
    title: string;
    imageUrl: string;
    link: string;
    locations: ('home' | 'properties' | 'details' | 'finishing' | 'decorations')[];
    status: 'active' | 'inactive';
    startDate?: string;
    endDate?: string;
}

export interface Quote {
    quote: { ar: string; en: string };
    author: { ar: string; en: string };
}

export interface Notification {
    id: string;
    userId: string;
    message: { ar: string; en: string };
    link: string;
    isRead: boolean;
    createdAt: string;
}

export interface SiteContent {
    logoUrl?: string;
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
            apiKey: string;
            secretKey: string;
            publicKey: string;
        };
    };
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
    whyUs: any; // Simplify for now or define fully
    services: any;
    partners: any;
    testimonials: any;
    socialProof: any;
    whyNewHeliopolis: any;
    finishingServices?: any[];
    projectsPage?: any;
    finishingPage?: any;
    decorationsPage?: any;
    quotes?: Quote[];
    privacyPolicy?: any;
    termsOfUse?: any;
    footer: any;
}

export interface SubscriptionPlanDetails {
    name: string;
    price: string;
    description: string;
    features: string[];
    commissionRate?: number;
}

export interface FavoriteItem {
    id: string;
    type: 'property' | 'service' | 'portfolio';
}

export interface FilterOption {
    id: string;
    en: string;
    ar: string;
    applicableTo?: string[];
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

export interface AIEstimatorItem {
    id: string;
    name: { ar: string; en: string };
    unit: { ar: string; en: string };
    price: number;
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
    stages: AIEstimatorStage[];
}

export type TransactionStatus = 'paid' | 'pending' | 'reviewing' | 'failed' | 'refunded';
export type TransactionType = 'subscription_fee' | 'listing_fee' | 'service_payment' | 'product_purchase';
export type PaymentMethod = 'instapay' | 'card' | 'wallet' | 'cash';

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
    relatedEntityId?: string; // request ID, partner ID, etc.
    receiptUrl?: string; // For manual payments
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

export type FormFieldType = 'text' | 'textarea' | 'number' | 'email' | 'tel' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
export type FormCategory = 'public' | 'lead_gen' | 'partner_app' | 'admin_internal';
export type SubmissionDestination = 'crm_messages' | 'crm_leads' | 'crm_partners' | 'email';
export type ValidationRuleType = 'none' | 'email' | 'phone_eg' | 'url' | 'number' | 'custom';

export interface FormFieldValidation {
    type: ValidationRuleType;
    pattern?: string; // Regex string
    minLength?: number;
    maxLength?: number;
    errorMessage?: { ar: string; en: string };
}

export interface FormFieldDefinition {
    id: string;
    key: string; // The property name in the JSON payload
    type: FormFieldType;
    label: { ar: string; en: string };
    placeholder?: { ar: string; en: string };
    required: boolean;
    validation?: FormFieldValidation;
    options?: string[] | string; // Array or CSV string
    width?: 'full' | 'half' | 'third';
}

export interface FormDefinition {
    id: string;
    slug: string;
    title: { ar: string; en: string };
    description?: { ar: string; en: string };
    category: FormCategory;
    destination: SubmissionDestination;
    fields: FormFieldDefinition[];
    submitButtonLabel?: { ar: string; en: string };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
