
export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

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
    LISTINGS_MANAGER = 'LISTINGS_MANAGER',
}

export enum Permission {
    VIEW_ADMIN_DASHBOARD = 'VIEW_ADMIN_DASHBOARD',
    VIEW_PARTNER_DASHBOARD = 'VIEW_PARTNER_DASHBOARD',
    MANAGE_USERS = 'MANAGE_USERS',
    MANAGE_ROLES_PERMISSIONS = 'MANAGE_ROLES_PERMISSIONS',
    MANAGE_ALL_PARTNERS = 'MANAGE_ALL_PARTNERS',
    MANAGE_PARTNER_REQUESTS = 'MANAGE_PARTNER_REQUESTS',
    MANAGE_ALL_PROPERTIES = 'MANAGE_ALL_PROPERTIES',
    MANAGE_PLATFORM_PROPERTIES = 'MANAGE_PLATFORM_PROPERTIES',
    MANAGE_MARKET_PROPERTIES = 'MANAGE_MARKET_PROPERTIES',
    MANAGE_PROPERTY_REQUESTS = 'MANAGE_PROPERTY_REQUESTS',
    MANAGE_PROPERTY_INQUIRIES = 'MANAGE_PROPERTY_INQUIRIES',
    MANAGE_CONTACT_REQUESTS = 'MANAGE_CONTACT_REQUESTS',
    MANAGE_ALL_PROJECTS = 'MANAGE_ALL_PROJECTS',
    MANAGE_DECORATIONS_CONTENT = 'MANAGE_DECORATIONS_CONTENT',
    MANAGE_DECORATIONS_LEADS = 'MANAGE_DECORATIONS_LEADS',
    MANAGE_PLATFORM_FINISHING_PACKAGES = 'MANAGE_PLATFORM_FINISHING_PACKAGES',
    MANAGE_PLATFORM_FINISHING_LEADS = 'MANAGE_PLATFORM_FINISHING_LEADS',
    MANAGE_INQUIRY_ROUTING = 'MANAGE_INQUIRY_ROUTING',
    MANAGE_PLANS = 'MANAGE_PLANS',
    MANAGE_AUTOMATION = 'MANAGE_AUTOMATION',
    MANAGE_BANNERS = 'MANAGE_BANNERS',
    MANAGE_SITE_CONTENT = 'MANAGE_SITE_CONTENT',
    MANAGE_FILTERS = 'MANAGE_FILTERS',
    MANAGE_SETTINGS = 'MANAGE_SETTINGS',
    MANAGE_FORMS = 'MANAGE_FORMS',
    VIEW_ANALYTICS = 'VIEW_ANALYTICS',
    MANAGE_OWN_PROFILE = 'MANAGE_OWN_PROFILE',
    MANAGE_OWN_PROJECTS = 'MANAGE_OWN_PROJECTS',
    VIEW_OWN_LEADS = 'VIEW_OWN_LEADS',
    MANAGE_OWN_SUBSCRIPTION = 'MANAGE_OWN_SUBSCRIPTION',
    MANAGE_OWN_PROPERTIES = 'MANAGE_OWN_PROPERTIES',
    MANAGE_OWN_PORTFOLIO = 'MANAGE_OWN_PORTFOLIO',
    MANAGE_FINISHING_PARTNERS = 'MANAGE_FINISHING_PARTNERS',
    MANAGE_PLATFORM_PROPERTY_LEADS = 'MANAGE_PLATFORM_PROPERTY_LEADS'
}

export type PartnerType =
    | 'developer'
    | 'finishing'
    | 'agency'
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

export type PartnerStatus = 'active' | 'pending' | 'disabled';
export type SubscriptionPlan = 'basic' | 'professional' | 'elite' | 'commission' | 'paid_listing';
export type PartnerDisplayType = 'standard' | 'featured' | 'mega_project';
export type PlanCategory = 'developer' | 'agency' | 'finishing' | 'individual';

export interface Partner {
    id: string;
    name: string;
    email: string;
    role: Role;
    type: PartnerType;
    imageUrl: string;
    status: PartnerStatus;
    subscriptionPlan: SubscriptionPlan;
    password?: string;
    displayType?: PartnerDisplayType;
    subscriptionEndDate?: string;
    contactMethods?: {
        whatsapp: { enabled: boolean; number: string };
        phone: { enabled: boolean; number: string };
        form: { enabled: boolean };
    };
}

export interface AdminPartner extends Partner {
    nameAr: string;
    description: string;
    descriptionAr: string;
    imageUrl_small: string;
    imageUrl_medium: string;
    imageUrl_large: string;
    createdAt?: string;
}

export type ListingStatus = 'active' | 'inactive' | 'draft' | 'sold';

export interface Property {
    id: string;
    partnerId: string;
    projectId?: string;
    projectName?: { ar: string; en: string };
    partnerName?: string;
    partnerImageUrl?: string;
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    gallery: string[];
    status: { en: 'For Sale' | 'For Rent'; ar: 'للبيع' | 'إيجار' };
    price: { en: string; ar: string };
    priceNumeric: number;
    pricePerMeter?: { en: string; ar: string };
    type: { en: string; ar: string };
    title: { ar: string; en: string };
    description: { ar: string; en: string };
    address: { ar: string; en: string };
    beds: number;
    baths: number;
    area: number;
    floor?: number;
    amenities: { ar: string[]; en: string[] };
    finishingStatus?: { en: string; ar: string };
    installmentsAvailable: boolean;
    isInCompound: boolean;
    realEstateFinanceAvailable: boolean;
    delivery: { isImmediate: boolean; date?: string };
    installments?: { downPayment: number; monthlyInstallment: number; years: number };
    location: { lat: number; lng: number };
    listingStatus: ListingStatus;
    listingStartDate?: string;
    listingEndDate?: string;
    contactMethod?: 'platform' | 'direct';
    ownerPhone?: string;
}

export interface FavoriteItem {
    id: string;
    type: 'property' | 'service' | 'portfolio';
}

export interface Project {
    id: string;
    partnerId: string;
    name: { ar: string; en: string };
    description: { ar: string; en: string };
    imageUrl: string;
    imageUrl_small?: string;
    imageUrl_medium?: string;
    imageUrl_large?: string;
    createdAt: string;
    features?: { icon: string; text: { ar: string; en: string } }[];
    partnerName?: string;
}

export interface PortfolioItem {
    id: string;
    partnerId: string;
    imageUrl: string;
    alt: string;
    title: { ar: string; en: string };
    category: { ar: string; en: string };
    price?: number;
    dimensions?: string;
    availability?: 'In Stock' | 'Made to Order';
    partnerName?: string;
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
    serviceType: 'finishing' | 'decorations' | 'property' | 'general';
    customerName: string;
    customerPhone: string;
    contactTime?: string;
    serviceTitle: string;
    customerNotes?: string;
    status: LeadStatus;
    createdAt: string;
    updatedAt: string;
    managerId?: string;
    propertyId?: string;
    messages: LeadMessage[];
    assignedTo?: string;
    partnerName?: string;
    referenceImage?: string; // Added for custom requests
}

// Changed from type union to enum for value usage
export enum RequestType {
    LEAD = 'LEAD',
    PARTNER_APPLICATION = 'PARTNER_APPLICATION',
    PROPERTY_LISTING_REQUEST = 'PROPERTY_LISTING_REQUEST',
    CONTACT_MESSAGE = 'CONTACT_MESSAGE',
    PROPERTY_INQUIRY = 'PROPERTY_INQUIRY'
}

export type RequestStatus = 'new' | 'pending' | 'reviewed' | 'approved' | 'rejected' | 'assigned' | 'in-progress' | 'closed';

export interface RequesterInfo {
    name: string;
    phone: string;
    email?: string;
}

export interface Request {
    id: string;
    type: RequestType;
    requesterInfo: RequesterInfo;
    payload: unknown;
    status: RequestStatus;
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
    assignedToName?: string;
}

export interface ContactRequest {
    id: string;
    name: string;
    phone: string;
    message: string;
    inquiryType: string;
    companyName?: string;
    businessType?: string;
    status: RequestStatus;
    createdAt: string;
    managerId?: string;
}

export interface AddPropertyRequest {
    id: string;
    customerName: string;
    customerPhone: string;
    propertyDetails: {
        title?: { en: string; ar: string };
        description?: { en: string; ar: string };
        price?: number;
        area?: number;
        propertyType?: { en: string; ar: string };
        address?: string;
        location?: { lat: number; lng: number };
        purpose?: { en: string; ar: string };
        finishingStatus?: { en: string; ar: string };
        bedrooms?: number;
        bathrooms?: number;
        floor?: number;
        isInCompound?: boolean;
        deliveryType?: string;
        deliveryMonth?: string;
        deliveryYear?: string;
        hasInstallments?: boolean;
        realEstateFinanceAvailable?: boolean;
        downPayment?: number;
        monthlyInstallment?: number;
        years?: number;
        listingStartDate?: string;
        listingEndDate?: string;
        contactMethod?: 'platform' | 'direct';
        ownerPhone?: string;
        amenities?: { en: string[]; ar: string[] };
    };
    images?: string[];
    cooperationType: string;
    status: RequestStatus;
    createdAt: string;
    managerId?: string;
    contactTime?: string; // Added
}

export interface PartnerRequest {
    id: string;
    companyName: string;
    companyType: string;
    companyAddress: string;
    website?: string;
    description: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    logo?: string;
    documents?: { fileName: string; fileContent: string }[];
    managementContacts?: { name: string; position: string; email: string; phone: string }[];
    status: RequestStatus;
    subscriptionPlan: SubscriptionPlan;
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

export interface OfficialDocument {
    fileName: string;
    fileContent: string;
}

export interface DecorationCategory {
    id: string;
    name: { ar: string; en: string };
    description: { ar: string; en: string };
}

export interface SubscriptionPlanDetails {
    name: string;
    price: string;
    description: string;
    features: string[];
    commissionRate?: number;
}

export interface FilterOption {
    id: string;
    en: string;
    ar: string;
    applicableTo?: string[];
    [key: string]: any; // For dynamic access with language
}

export interface Banner {
    id: string;
    title: string;
    imageUrl: string;
    link: string;
    locations: string[];
    status: 'active' | 'inactive';
    startDate?: string;
    endDate?: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: { ar: string; en: string };
    link: string;
    isRead: boolean;
    createdAt: string;
}

export interface Quote {
    quote: { ar: string; en: string };
    author: { ar: string; en: string };
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

export interface SiteContent {
    logoUrl?: string;
    locationPickerMapUrl?: string;
    topBanner?: { enabled: boolean; content: { ar: string; en: string } };
    contactConfiguration?: { routing: string; targetEmail: string };
    paymentConfiguration?: { 
        instapay: { enabled: boolean; number: string; walletName?: string; paymentLink?: string; qrCodeUrl?: string; instructions: { ar: string; en: string } };
        paymob: { enabled: boolean; apiKey: string; secretKey: string; publicKey: string };
    };
    hero: { ar: { title: string; subtitle: string }; en: { title: string; subtitle: string }; images: { src: string; alt: { ar: string; en: string } }[] };
    homeCTA?: { enabled: boolean; ar: any; en: any };
    homeListings?: { enabled: boolean; count: number; ar?: any; en?: any };
    whyUs: { enabled: boolean; ar: any; en: any };
    services: { enabled: boolean; ar: any; en: any };
    partners: { enabled: boolean; ar: any; en: any };
    testimonials: { enabled: boolean; ar: any; en: any; items: any[] };
    socialProof: { enabled: boolean; stats: any[] };
    whyNewHeliopolis: { enabled: boolean; ar: any; en: any; images: any[] };
    finishingServices?: any[];
    projectsPage?: any;
    finishingPage?: any;
    decorationsPage?: any;
    quotes?: Quote[];
    privacyPolicy?: any;
    termsOfUse?: any;
    footer: any;
    siteName?: { ar: string; en: string };
    externalConfig?: {
        supabase?: { url: string; anonKey: string };
        cloudinary?: { cloudName: string; apiKey: string; apiSecret: string; uploadPreset: string };
        vercel?: { projectUrl: string };
    };
}

export type PropertyFiltersType = {
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
    view?: string;
};

export type TransactionStatus = 'paid' | 'pending' | 'reviewing' | 'failed' | 'refunded';
export type TransactionType = 'subscription_fee' | 'listing_fee' | 'service_payment' | 'product_purchase';
export type PaymentMethod = 'card' | 'instapay' | 'wallet';

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
    referenceNumber?: string;
    receiptUrl?: string;
    relatedEntityId?: string;
}

export interface FinanceStats {
    totalRevenue: number;
    pendingAmount: number;
    successfulTransactions: number;
    pendingReviews: number;
}

export type FormCategory = 'public' | 'lead_gen' | 'partner_app' | 'admin_internal';
export type FormFieldType = 'text' | 'textarea' | 'number' | 'email' | 'tel' | 'select' | 'checkbox' | 'radio' | 'date' | 'file';
export type ValidationRuleType = 'none' | 'email' | 'phone_eg' | 'url' | 'number' | 'custom';
export type SubmissionDestination = 'crm_messages' | 'crm_leads' | 'crm_partners' | 'email';

export interface FormFieldDefinition {
    id: string;
    key: string;
    type: FormFieldType;
    label: { ar: string; en: string };
    required: boolean;
    width: 'full' | 'half' | 'third';
    placeholder?: { ar: string; en: string };
    options?: string[] | string; // string if comma separated
    validation?: {
        type: ValidationRuleType;
        pattern?: string;
        minLength?: number;
        maxLength?: number;
        errorMessage?: { ar: string; en: string };
    };
}

export interface FormDefinition {
    id: string;
    slug: string;
    title: { ar: string; en: string };
    description?: { ar: string; en: string };
    category: FormCategory;
    destination: string;
    isActive: boolean;
    submitButtonLabel?: { ar: string; en: string };
    fields: FormFieldDefinition[];
    createdAt: string;
    updatedAt: string;
}
