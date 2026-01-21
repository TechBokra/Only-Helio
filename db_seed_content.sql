
-- ====================================================================================
-- ONLY HELIO - MASTER SEED SCRIPT
-- This script populates the database with initial demo data.
-- It handles Users, Projects, Properties, Portfolio, Banners, and CRM Leads.
-- ====================================================================================

-- 1. CLEANUP (Delete in reverse dependency order)
DELETE FROM "LeadMessage";
DELETE FROM "Lead";
DELETE FROM "Notification";
DELETE FROM "Transaction";
DELETE FROM "PortfolioItem";
DELETE FROM "AmenitiesOnProperties";
DELETE FROM "Property";
DELETE FROM "Project";
DELETE FROM "Banner";
DELETE FROM "PartnerRequest";
DELETE FROM "PropertyListingRequest";
DELETE FROM "ContactRequest";
DELETE FROM "PropertyInquiry";
-- Do NOT delete from Lookup tables (PropertyType, etc) as they are static.
-- We keep Users last.
DELETE FROM "User" WHERE "id" IN ('admin-user', 'dev-partner-1', 'finish-partner-1', 'agency-partner-1', 'individual-listings');


-- 2. INSERT USERS (Partners & Admin)
-- Passwords are set to 'password' (in a real app these would be hashed)
INSERT INTO "User" 
("id", "email", "password", "name_en", "name_ar", "type", "role", "status", "subscriptionPlan", "imageUrl", "description_en", "description_ar", "contactMethods")
VALUES 
(
    'admin-user', 
    'admin@onlyhelio.com', 
    'password', 
    'Super Admin', 
    'المدير العام', 
    'admin', 
    'SUPER_ADMIN', 
    'active', 
    'elite', 
    'https://ui-avatars.com/api/?name=Super+Admin&background=f59e0b&color=fff&size=256',
    'Platform Administrator',
    'مدير المنصة',
    '{"whatsapp": {"enabled": false}, "phone": {"enabled": false}, "form": {"enabled": true}}'
),
(
    'dev-partner-1', 
    'dev@heliopolis.com', 
    'password', 
    'Heliopolis Developers Group', 
    'مجموعة مطوري هليوبوليس', 
    'developer', 
    'DEVELOPER_PARTNER', 
    'active', 
    'elite', 
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop',
    'Leading developer in New Heliopolis since 2010.',
    'مطور رائد في هليوبوليس الجديدة منذ عام 2010.',
    '{"whatsapp": {"enabled": true, "number": "01000000001"}, "phone": {"enabled": true, "number": "01000000001"}, "form": {"enabled": true}}'
),
(
    'finish-partner-1', 
    'finish@decor.com', 
    'password', 
    'Elite Finishing Co.', 
    'شركة تشطيبات النخبة', 
    'finishing', 
    'FINISHING_PARTNER', 
    'active', 
    'professional', 
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop',
    'High-end interior design and finishing services.',
    'خدمات تصميم داخلي وتشطيبات راقية.',
    '{"whatsapp": {"enabled": true, "number": "01222222222"}, "phone": {"enabled": true, "number": "01222222222"}, "form": {"enabled": true}}'
),
(
    'agency-partner-1', 
    'sales@broker.com', 
    'password', 
    'Future Real Estate', 
    'المستقبل للتسويق العقاري', 
    'agency', 
    'AGENCY_PARTNER', 
    'active', 
    'basic', 
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    'Your trusted broker for resale and rental properties.',
    'وسيطك الموثوق لعقارات إعادة البيع والإيجار.',
    '{"whatsapp": {"enabled": true, "number": "01111111111"}, "phone": {"enabled": true, "number": "01111111111"}, "form": {"enabled": true}}'
),
(
    'individual-listings', 
    'listings@onlyhelio.com', 
    'password', 
    'Individual Listings', 
    'عقارات الأفراد', 
    'agency', 
    'AGENCY_PARTNER', 
    'active', 
    'basic', 
    'https://via.placeholder.com/150',
    'Platform account for individual owner listings.',
    'حساب المنصة لعقارات الملاك الأفراد.',
    '{"whatsapp": {"enabled": false}, "phone": {"enabled": false}, "form": {"enabled": true}}'
);


-- 3. INSERT PROJECTS
INSERT INTO "Project" 
("id", "partnerId", "name_en", "name_ar", "description_en", "description_ar", "imageUrl", "features", "createdAt")
VALUES 
(
    'project-1', 
    'dev-partner-1', 
    'Helio Gardens Compound', 
    'كمبوند حدائق هليوبوليس', 
    'A luxury residential compound featuring vast green spaces and modern amenities.', 
    'مجمع سكني فاخر يتميز بمساحات خضراء واسعة وخدمات عصرية.', 
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop',
    '[{"icon": "ParkIcon", "text": {"en": "Large Parks", "ar": "حدائق واسعة"}}, {"icon": "SwimmingPoolIcon", "text": {"en": "Swimming Pools", "ar": "حمامات سباحة"}}]',
    NOW()
);


-- 4. INSERT PROPERTIES
-- Prop 1: In Project
INSERT INTO "Property" 
("id", "partnerId", "projectId", "title_en", "title_ar", "description_en", "description_ar", "address_en", "address_ar", "price", "price_en", "price_ar", "area", "type_en", "type_ar", "status", "listingStatus", "imageUrl", "beds", "baths", "finishingStatus_en", "finishingStatus_ar", "isInCompound", "location", "createdAt")
VALUES 
(
    'prop-1', 
    'dev-partner-1', 
    'project-1', 
    'Luxury Apartment with Garden View', 
    'شقة فاخرة تطل على الحديقة', 
    'Beautiful apartment in the heart of Helio Gardens.', 
    'شقة جميلة في قلب حدائق هليوبوليس.', 
    'Helio Gardens, District 5', 
    'حدائق هليوبوليس، الحي الخامس', 
    3500000, '3,500,000 EGP', '3,500,000 ج.م', 
    180, 'Apartment', 'شقة', 'For Sale', 'active', 
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
    3, 2, 'Semi-finished', 'نصف تشطيب', true,
    '{"lat": 30.115, "lng": 31.630}',
    NOW()
);

-- Prop 2: Standalone (Agency)
INSERT INTO "Property" 
("id", "partnerId", "title_en", "title_ar", "description_en", "description_ar", "address_en", "address_ar", "price", "price_en", "price_ar", "area", "type_en", "type_ar", "status", "listingStatus", "imageUrl", "beds", "baths", "finishingStatus_en", "finishingStatus_ar", "isInCompound", "location", "createdAt")
VALUES 
(
    'prop-2', 
    'agency-partner-1', 
    'Standalone Villa for Resale', 
    'فيلا مستقلة إعادة بيع', 
    'Spacious villa with private pool.', 
    'فيلا واسعة مع حمام سباحة خاص.', 
    'District 3, New Heliopolis', 
    'الحي الثالث، هليوبوليس الجديدة', 
    8200000, '8,200,000 EGP', '8,200,000 ج.م', 
    450, 'Villa', 'فيلا', 'For Sale', 'active', 
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
    5, 4, 'Core & Shell', 'بدون تشطيب', false,
    '{"lat": 30.120, "lng": 31.640}',
    NOW()
);

-- Prop 3: Commercial (Individual)
INSERT INTO "Property" 
("id", "partnerId", "title_en", "title_ar", "description_en", "description_ar", "address_en", "address_ar", "price", "price_en", "price_ar", "area", "type_en", "type_ar", "status", "listingStatus", "imageUrl", "finishingStatus_en", "finishingStatus_ar", "isInCompound", "location", "createdAt")
VALUES 
(
    'prop-3', 
    'individual-listings', 
    'Prime Commercial Space', 
    'مساحة تجارية مميزة', 
    'Ideally located shop on the main street.', 
    'محل بموقع مثالي على الشارع الرئيسي.', 
    'Central Axis', 
    'المحور المركزي', 
    5000000, '5,000,000 EGP', '5,000,000 ج.م', 
    90, 'Commercial', 'تجاري', 'For Sale', 'active', 
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop',
    'Core & Shell', 'بدون تشطيب', false,
    '{"lat": 30.105, "lng": 31.610}',
    NOW()
);


-- 5. INSERT PORTFOLIO
INSERT INTO "PortfolioItem" 
("id", "partnerId", "title_en", "title_ar", "category_en", "category_ar", "imageUrl", "availability", "price", "createdAt")
VALUES 
(
    'port-1', 
    'finish-partner-1', 
    'Modern Living Room Design', 
    'تصميم غرفة معيشة مودرن', 
    'Interior Design', 
    'تصميم داخلي', 
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=800&fit=crop',
    'Made to Order',
    15000,
    NOW()
);


-- 6. INSERT BANNERS
INSERT INTO "Banner" 
("title", "imageUrl", "link", "locations", "status", "createdAt")
VALUES 
(
    'Launch Offer', 
    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=2070', 
    '/projects', 
    ARRAY['home'], 
    'active',
    NOW()
),
(
    'Finishing Discount', 
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070', 
    '/finishing', 
    ARRAY['properties', 'details'], 
    'active',
    NOW()
);


-- 7. INSERT LEADS (CRM Data)
INSERT INTO "Lead" 
("id", "partnerId", "propertyId", "serviceType", "customerName", "customerPhone", "serviceTitle", "status", "contactTime", "createdAt", "updatedAt")
VALUES 
(
    'lead-1', 
    'dev-partner-1', 
    'prop-1', 
    'property', 
    'Ahmed Mohamed', 
    '01012345678', 
    'Inquiry about Luxury Apartment', 
    'new', 
    'Evening',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
),
(
    'lead-2', 
    'finish-partner-1', 
    NULL, 
    'finishing', 
    'Sara Ahmed', 
    '01123456789', 
    'Finishing Request for Villa', 
    'contacted', 
    'Morning',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '1 day'
);
