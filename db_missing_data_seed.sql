
-- ====================================================================================
-- ONLY HELIO - MISSING DATA SEED (Content, Banners, Plans, Forms)
-- ====================================================================================

-- 1. BANNERS (Replaces data/banners.ts)
DELETE FROM "Banner";
INSERT INTO "Banner" ("title", "imageUrl", "link", "locations", "status")
VALUES 
('Main Hero', 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=2070', '/contact', ARRAY['home'], 'active'),
('Properties Header', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070', '/register', ARRAY['properties'], 'active'),
('Finishing Promo', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000', '/finishing', ARRAY['details', 'finishing'], 'active'),
('Decor Promo', 'https://images.unsplash.com/photo-1552573102-2b4f3a61b3c4?q=80&w=2000', '/decorations', ARRAY['decorations'], 'active');

-- 2. SUBSCRIPTION PLANS (Replaces hardcoded billing.ts)
DELETE FROM "PlanConfiguration";
INSERT INTO "PlanConfiguration" ("category", "tier", "subCategory", "name_en", "name_ar", "price_en", "price_ar", "description_en", "description_ar", "features_en", "features_ar")
VALUES
-- Developer
('developer', 'basic', NULL, 'Basic', 'أساسي', 'Free', 'مجاني', 'Start with one project.', 'ابدأ بمشروع واحد.', ARRAY['1 Project', '10 Units'], ARRAY['مشروع واحد', '10 وحدات']),
('developer', 'professional', NULL, 'Professional', 'احترافي', '5,000 EGP/mo', '5,000 ج.م/شهر', 'Showcase more.', 'اعرض المزيد.', ARRAY['5 Projects', '50 Units', 'Analytics'], ARRAY['5 مشاريع', '50 وحدة', 'تحليلات']),
('developer', 'elite', NULL, 'Elite', 'نخبة', '15,000 EGP/mo', '15,000 ج.م/شهر', 'Unlimited access.', 'بلا حدود.', ARRAY['Unlimited Projects', 'Unlimited Units', 'Priority'], ARRAY['مشاريع غير محدودة', 'وحدات غير محدودة', 'أولوية']),

-- Agency
('agency', 'basic', NULL, 'Basic', 'أساسي', 'Free', 'مجاني', 'Small agencies.', 'للمكاتب الصغيرة.', ARRAY['3 Properties'], ARRAY['3 عقارات']),
('agency', 'professional', NULL, 'Professional', 'احترافي', '2,000 EGP/mo', '2,000 ج.م/شهر', 'Active agencies.', 'للمكاتب النشطة.', ARRAY['15 Properties', 'Featured'], ARRAY['15 عقار', 'مميز']),
('agency', 'elite', NULL, 'Elite', 'نخبة', '5,000 EGP/mo', '5,000 ج.م/شهر', 'Large agencies.', 'للمكاتب الكبرى.', ARRAY['Unlimited Properties', '24/7 Support'], ARRAY['عقارات غير محدودة', 'دعم 24/7']),

-- Finishing
('finishing', 'commission', NULL, 'Commission', 'عمولة', 'Free', 'مجاني', 'Pay per job.', 'ادفع عند العمل.', ARRAY['Profile', '10% Commission'], ARRAY['ملف شخصي', '10% عمولة']),
('finishing', 'professional', NULL, 'Professional', 'احترافي', '3,000 EGP/mo', '3,000 ج.م/شهر', 'No commission.', 'بدون عمولة.', ARRAY['Portfolio', 'Priority'], ARRAY['معرض أعمال', 'أولوية']),

-- Individual
('individual', 'paid_listing', 'sale', 'Paid Listing', 'إعلان مدفوع', '500 EGP', '500 ج.م', 'One-time fee.', 'مرة واحدة.', ARRAY['3 Months Listing'], ARRAY['عرض 3 شهور']),
('individual', 'commission', 'sale', 'Commission', 'عمولة', 'Free', 'مجاني', 'We sell for you.', 'نبيع لك.', ARRAY['2.5% Commission'], ARRAY['2.5% عمولة']);

-- 3. FORMS (Replaces data/forms.ts)
DELETE FROM "FormDefinition";
INSERT INTO "FormDefinition" ("slug", "title_en", "title_ar", "category", "destination", "submitButtonLabel_en", "submitButtonLabel_ar", "fields")
VALUES 
(
    'contact-us', 'Contact Us', 'اتصل بنا', 'public', 'crm_messages', 'Send', 'إرسال',
    '[{"id":"f1","key":"name","type":"text","label":{"ar":"الاسم","en":"Name"},"required":true,"width":"half"},{"id":"f2","key":"phone","type":"tel","label":{"ar":"الهاتف","en":"Phone"},"required":true,"width":"half"},{"id":"f4","key":"message","type":"textarea","label":{"ar":"الرسالة","en":"Message"},"required":true,"width":"full"}]'::jsonb
),
(
    'service-request', 'Service Request', 'طلب خدمة', 'lead_gen', 'crm_leads', 'Confirm', 'تأكيد',
    '[{"id":"s1","key":"customerName","type":"text","label":{"ar":"الاسم","en":"Name"},"required":true,"width":"half"},{"id":"s2","key":"customerPhone","type":"tel","label":{"ar":"الهاتف","en":"Phone"},"required":true,"width":"half"},{"id":"s3","key":"contactTime","type":"select","label":{"ar":"وقت التواصل","en":"Contact Time"},"required":true,"width":"full","options":["morning","evening"]}]'::jsonb
);

-- 4. SITE CONTENT (Replaces data/content.ts)
-- This puts a complete JSON object into SystemSetting
INSERT INTO "SystemSetting" ("key", "value", "group")
VALUES (
    'site_content_v1',
    '{
        "logoUrl": "",
        "hero": {
            "ar": { "title": "بوابتك الحصرية لهليوبوليس الجديدة", "subtitle": "اكتشف أرقى العقارات والخدمات" },
            "en": { "title": "Your Gateway to New Heliopolis", "subtitle": "Discover finest properties and services" },
            "images": [
                { "src": "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=75&w=1600", "alt": {"ar": "فيلا", "en": "Villa"} },
                { "src": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=75&w=1600", "alt": {"ar": "حديث", "en": "Modern"} }
            ]
        },
        "footer": {
            "ar": { "description": "وجهتكم الأولى للعقارات.", "address": "هليوبوليس الجديدة، القاهرة", "hours": "9 ص - 6 م" },
            "en": { "description": "Your premier destination.", "address": "New Heliopolis, Cairo", "hours": "9 AM - 6 PM" },
            "email": "info@onlyhelio.com",
            "phone": "+201000000000",
            "social": { "facebook": "#", "instagram": "#", "linkedin": "#", "twitter": "#" },
            "copyright": { "ar": "جميع الحقوق محفوظة", "en": "All rights reserved" },
            "feedbackText": { "ar": "أرسل ملاحظات", "en": "Send Feedback" }
        },
        "homeCTA": { "enabled": true, "ar": {"title": "ابدأ الآن", "subtitle": "انضم إلينا", "button": "تواصل", "link": "/contact"}, "en": {"title": "Start Now", "subtitle": "Join us", "button": "Contact", "link": "/contact"} },
        "homeListings": { "enabled": true, "count": 4, "ar": {"title": "أحدث العقارات"}, "en": {"title": "Latest Properties"} },
        "services": { 
            "enabled": true, 
            "ar": {"title": "خدماتنا", "description": "حلول متكاملة", "features": [{"title": "عقارات", "description": "بيع وشراء", "link": "/properties", "icon": "BuildingIcon"}]}, 
            "en": {"title": "Our Services", "description": "Integrated solutions", "features": [{"title": "Real Estate", "description": "Buy & Sell", "link": "/properties", "icon": "BuildingIcon"}]}
        },
        "partners": { 
            "enabled": true, 
            "ar": {"title": "شركاؤنا", "description": "نخبة من المطورين", "mega_projects_title": "كبار المطورين", "developers_title": "المطورون", "finishing_companies_title": "شركات التشطيب", "agencies_title": "المكاتب"}, 
            "en": {"title": "Our Partners", "description": "Elite developers", "mega_projects_title": "Mega Projects", "developers_title": "Developers", "finishing_companies_title": "Finishing", "agencies_title": "Agencies"}
        },
        "testimonials": { "enabled": true, "ar": {"title": "أراء العملاء", "subtitle": ""}, "en": {"title": "Testimonials", "subtitle": ""}, "items": [] },
        "socialProof": { "enabled": true, "stats": [{"value": "100+", "name": {"ar": "عقار", "en": "Properties"}}] },
        "whyNewHeliopolis": { "enabled": true, "ar": {"title": "لماذا هليوبوليس؟", "location": {"title": "موقع مميز", "description": "قريبة من العاصمة", "stats": []}}, "en": {"title": "Why Heliopolis?", "location": {"title": "Prime Location", "description": "Near Capital", "stats": []}}, "images": [] },
        "paymentConfiguration": {
            "instapay": { "enabled": true, "number": "01000000000", "instructions": {"ar": "حول المبلغ وارفع الإيصال", "en": "Transfer and upload receipt"} },
            "paymob": { "enabled": false, "apiKey": "", "secretKey": "", "publicKey": "" }
        },
        "contactConfiguration": { "routing": "internal", "targetEmail": "admin@onlyhelio.com" },
        "finishingServices": []
    }'::jsonb,
    'cms'
) ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED.value;
