
-- تنظيف الجداول القديمة لضمان إعادة الإنشاء بشكل صحيح
-- (لا نحذف الجداول هنا لضمان عدم فقدان البيانات في بيئة الإنتاج، نستخدم ON CONFLICT في الإدخال)

-- 1. جدول إعدادات الباقات (PlanConfiguration)
CREATE TABLE IF NOT EXISTS "PlanConfiguration" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "category" TEXT NOT NULL, -- developer, agency, finishing, individual
    "tier" TEXT NOT NULL, -- basic, professional, elite, commission, etc.
    "subCategory" TEXT, -- for individual: sale/rent
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "price_en" TEXT NOT NULL,
    "price_ar" TEXT NOT NULL,
    "description_en" TEXT,
    "description_ar" TEXT,
    "features_en" TEXT[],
    "features_ar" TEXT[],
    "commissionRate" NUMERIC,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة فهرس لسرعة البحث
CREATE INDEX IF NOT EXISTS idx_plan_cat_tier ON "PlanConfiguration" ("category", "tier");

-- 2. جدول النماذج الديناميكية (FormDefinition)
CREATE TABLE IF NOT EXISTS "FormDefinition" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description_en" TEXT,
    "description_ar" TEXT,
    "category" TEXT NOT NULL, -- public, lead_gen, partner_app, admin_internal
    "destination" TEXT NOT NULL, -- crm_leads, crm_messages, etc.
    "submitButtonLabel_en" TEXT,
    "submitButtonLabel_ar" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "fields" JSONB NOT NULL DEFAULT '[]'::jsonb, -- Store field definitions as JSON
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 3. إدخال البيانات الأولية للباقات (Seeding Plans)
-- ملاحظة: تم وضع علامات تنصيص حول "subCategory" لأنها معرفة بأحرف كبيرة وصغيرة
INSERT INTO "PlanConfiguration" ("category", "tier", "name_en", "name_ar", "price_en", "price_ar", "description_en", "description_ar", "features_en", "features_ar")
VALUES
-- Developer
('developer', 'basic', 'Basic', 'أساسي', 'Free', 'مجاني', 'For new developers, start with one project.', 'للمطورين الجدد، ابدأ بعرض مشروع واحد.', ARRAY['1 Project', '10 Units', 'Basic Dashboard'], ARRAY['مشروع واحد', '10 وحدات', 'لوحة تحكم أساسية']),
('developer', 'professional', 'Professional', 'احترافي', '5,000 EGP/mo', '5,000 ج.م/شهر', 'For growing developers, showcase more.', 'للمطورين المتنامين، اعرض المزيد من المشاريع.', ARRAY['5 Projects', '50 Units', 'Advanced Analytics', 'Tech Support'], ARRAY['5 مشاريع', '50 وحدة', 'تحليلات متقدمة', 'دعم فني']),
('developer', 'elite', 'Elite', 'نخبة', '15,000 EGP/mo', '15,000 ج.م/شهر', 'For major developers, unlimited access.', 'للمطورين الكبار، بلا حدود.', ARRAY['Unlimited Projects', 'Unlimited Units', 'Priority Display', 'Dedicated Account Manager'], ARRAY['مشاريع غير محدودة', 'وحدات غير محدودة', 'أولوية العرض', 'مدير حساب مخصص']),

-- Agency
('agency', 'basic', 'Basic', 'أساسي', 'Free', 'مجاني', 'For small agencies.', 'للمكاتب الصغيرة.', ARRAY['3 Properties', 'Basic Dashboard'], ARRAY['3 عقارات', 'لوحة تحكم أساسية']),
('agency', 'professional', 'Professional', 'احترافي', '2,000 EGP/mo', '2,000 ج.م/شهر', 'For active agencies.', 'للمكاتب النشطة.', ARRAY['15 Properties', 'Featured Listing', 'Analytics'], ARRAY['15 عقار', 'عرض مميز', 'تحليلات']),
('agency', 'elite', 'Elite', 'نخبة', '5,000 EGP/mo', '5,000 ج.م/شهر', 'For large agencies.', 'للمكاتب الكبرى.', ARRAY['Unlimited Properties', 'Top of List', '24/7 Support'], ARRAY['عقارات غير محدودة', 'أعلى القائمة', 'دعم 24/7']),

-- Finishing
('finishing', 'commission', 'Commission', 'عمولة', 'Free', 'مجاني', 'Pay only when you get a job.', 'ادفع فقط عند الحصول على عمل.', ARRAY['Profile', 'Receive Requests', '10% Commission'], ARRAY['ملف شخصي', 'استقبال طلبات', 'عمولة 10%']),
('finishing', 'professional', 'Professional', 'احترافي', '3,000 EGP/mo', '3,000 ج.م/شهر', 'For professional companies.', 'للشركات المحترفة.', ARRAY['Portfolio', 'No Commission', 'Priority Visibility'], ARRAY['معرض أعمال', 'بدون عمولة', 'أولوية الظهور']),
('finishing', 'elite', 'Elite', 'نخبة', '8,000 EGP/mo', '8,000 ج.م/شهر', 'For major companies.', 'للشركات الكبرى.', ARRAY['Unlimited Portfolio', 'Trusted Partner Badge', 'Exclusive Promotion'], ARRAY['معرض غير محدود', 'شارة شريك موثوق', 'ترويج حصري']);

-- Individual (With SubCategory)
INSERT INTO "PlanConfiguration" ("category", "subCategory", "tier", "name_en", "name_ar", "price_en", "price_ar", "description_en", "description_ar", "features_en", "features_ar")
VALUES
('individual', 'sale', 'paid_listing', 'Paid Listing', 'إعلان مدفوع', '500 EGP', '500 ج.م', 'One-time fee to list your property.', 'ادفع مرة واحدة لعرض عقارك.', ARRAY['Listed for 3 months', 'Direct contact with buyers'], ARRAY['عرض لمدة 3 شهور', 'تواصل مباشر مع المشترين']),
('individual', 'sale', 'commission', 'Commission', 'عمولة', 'Free', 'مجاني', 'We sell for you for a commission.', 'نحن نبيع لك مقابل عمولة.', ARRAY['We manage the process', 'Professional photography', '2.5% Commission on sale'], ARRAY['نحن ندير العملية', 'تصوير احترافي', 'عمولة 2.5% عند البيع']),
('individual', 'rent', 'paid_listing', 'Paid Listing', 'إعلان مدفوع', '300 EGP', '300 ج.م', 'List your unit for rent.', 'اعرض وحدتك للإيجار.', ARRAY['Listed for 2 months', 'Direct contact'], ARRAY['عرض لمدة شهرين', 'تواصل مباشر']),
('individual', 'rent', 'commission', 'Commission', 'عمولة', 'Free', 'مجاني', 'We rent it for you.', 'نحن نؤجر لك.', ARRAY['We manage the process', '1 Month Rent Commission'], ARRAY['نحن ندير العملية', 'عمولة شهر إيجار']);


-- 4. إدخال البيانات الأولية للنماذج (Seeding Forms)
-- Contact Us
INSERT INTO "FormDefinition" ("slug", "title_en", "title_ar", "description_en", "description_ar", "category", "destination", "submitButtonLabel_en", "submitButtonLabel_ar", "fields")
VALUES (
    'contact-us', 'Contact Us', 'اتصل بنا', 'General Contact Form', 'نموذج التواصل العام', 'public', 'crm_messages', 'Send Message', 'إرسال',
    '[
        {"id":"f1","key":"name","type":"text","label":{"ar":"الاسم بالكامل","en":"Full Name"},"required":true,"width":"half","placeholder":{"ar":"أدخل اسمك","en":"Enter your name"}},
        {"id":"f2","key":"phone","type":"tel","label":{"ar":"رقم الهاتف","en":"Phone Number"},"required":true,"width":"half","placeholder":{"ar":"01xxxxxxxxx","en":"01xxxxxxxxx"},"validation":{"type":"phone_eg"}},
        {"id":"f3","key":"email","type":"email","label":{"ar":"البريد الإلكتروني","en":"Email Address"},"required":false,"width":"full"},
        {"id":"f4","key":"message","type":"textarea","label":{"ar":"الرسالة","en":"Message"},"required":true,"width":"full","placeholder":{"ar":"اكتب رسالتك هنا...","en":"Type your message here..."}}
    ]'::jsonb
) ON CONFLICT ("slug") DO UPDATE SET "fields" = EXCLUDED.fields;

-- Service Request
INSERT INTO "FormDefinition" ("slug", "title_en", "title_ar", "description_en", "description_ar", "category", "destination", "submitButtonLabel_en", "submitButtonLabel_ar", "fields")
VALUES (
    'service-request', 'Quick Service Request', 'طلب خدمة سريع', 'Short form for service requests', 'نموذج مختصر لطلبات الخدمة', 'lead_gen', 'crm_leads', 'Confirm Request', 'تأكيد الطلب',
    '[
        {"id":"sf0","key":"customerName","type":"text","label":{"ar":"الاسم بالكامل","en":"Full Name"},"required":true,"width":"half"},
        {"id":"sf00","key":"customerPhone","type":"tel","label":{"ar":"رقم الهاتف","en":"Phone Number"},"required":true,"width":"half","validation":{"type":"phone_eg"}},
        {"id":"sf1","key":"contactTime","type":"select","label":{"ar":"وقت التواصل المفضل","en":"Preferred Contact Time"},"required":true,"width":"full","options":["morning","afternoon","evening"]},
        {"id":"sf4","key":"customerNotes","type":"textarea","label":{"ar":"ملاحظات إضافية","en":"Additional Notes"},"required":false,"width":"full"}
    ]'::jsonb
) ON CONFLICT ("slug") DO UPDATE SET "fields" = EXCLUDED.fields;

-- Partner Application
INSERT INTO "FormDefinition" ("slug", "title_en", "title_ar", "description_en", "description_ar", "category", "destination", "submitButtonLabel_en", "submitButtonLabel_ar", "fields")
VALUES (
    'partner-application', 'Partner Application', 'طلب انضمام شريك', 'Company Basic Information', 'البيانات الأساسية للشركة', 'partner_app', 'crm_partners', 'Next', 'التالي',
    '[
        {"id":"pa1","key":"companyName","type":"text","label":{"ar":"اسم الشركة","en":"Company Name"},"required":true,"width":"half"},
        {"id":"pa2","key":"companyAddress","type":"text","label":{"ar":"عنوان الشركة","en":"Company Address"},"required":true,"width":"half"},
        {"id":"pa3","key":"website","type":"text","label":{"ar":"الموقع الإلكتروني","en":"Website"},"required":false,"width":"full"},
        {"id":"pa4","key":"description","type":"textarea","label":{"ar":"وصف الشركة","en":"Company Description"},"required":true,"width":"full"},
        {"id":"pa5","key":"contactName","type":"text","label":{"ar":"اسم مسؤول التواصل","en":"Contact Person Name"},"required":true,"width":"third"},
        {"id":"pa6","key":"contactEmail","type":"email","label":{"ar":"البريد الإلكتروني","en":"Contact Email"},"required":true,"width":"third"},
        {"id":"pa7","key":"contactPhone","type":"tel","label":{"ar":"رقم الهاتف","en":"Contact Phone"},"required":true,"width":"third"}
    ]'::jsonb
) ON CONFLICT ("slug") DO UPDATE SET "fields" = EXCLUDED.fields;

-- Add Property
INSERT INTO "FormDefinition" ("slug", "title_en", "title_ar", "description_en", "description_ar", "category", "destination", "submitButtonLabel_en", "submitButtonLabel_ar", "fields")
VALUES (
    'add-property', 'Add Property', 'إضافة عقار', 'Detailed Property Information', 'بيانات العقار التفصيلية', 'public', 'crm_leads', 'Next', 'التالي',
    '[
        {"id":"ap1","key":"customerName","type":"text","label":{"ar":"الاسم بالكامل","en":"Full Name"},"required":true,"width":"half"},
        {"id":"ap2","key":"customerPhone","type":"tel","label":{"ar":"رقم الهاتف","en":"Phone Number"},"required":true,"width":"half","validation":{"type":"phone_eg"}},
        {"id":"ap3","key":"contactTime","type":"select","label":{"ar":"الوقت المناسب للتواصل","en":"Best time to contact"},"required":true,"width":"full","options":["morning","afternoon","evening"]},
        {"id":"ap6","key":"address","type":"text","label":{"ar":"العنوان التفصيلي","en":"Detailed Address"},"required":true,"width":"full"},
        {"id":"ap7","key":"propertyType","type":"select","label":{"ar":"نوع العقار","en":"Property Type"},"required":true,"width":"third","options":["apartment","villa","commercial","land"]},
        {"id":"ap8","key":"area","type":"number","label":{"ar":"المساحة (م٢)","en":"Area (m2)"},"required":true,"width":"third"},
        {"id":"ap9","key":"price","type":"number","label":{"ar":"السعر المطلوب (ج.م)","en":"Price (EGP)"},"required":true,"width":"third"},
        {"id":"ap_beds","key":"bedrooms","type":"number","label":{"ar":"غرف النوم","en":"Bedrooms"},"required":true,"width":"third"},
        {"id":"ap_baths","key":"bathrooms","type":"number","label":{"ar":"الحمامات","en":"Bathrooms"},"required":true,"width":"third"},
        {"id":"ap_floor","key":"floor","type":"number","label":{"ar":"الدور","en":"Floor"},"required":false,"width":"third"},
        {"id":"ap_compound","key":"isInCompound","type":"select","label":{"ar":"داخل كومبوند؟","en":"In Compound?"},"required":true,"width":"half","options":["yes","no"]},
        {"id":"ap_installments","key":"hasInstallments","type":"select","label":{"ar":"يوجد تقسيط؟","en":"Installments?"},"required":true,"width":"half","options":["yes","no"]},
        {"id":"ap_finance","key":"realEstateFinanceAvailable","type":"select","label":{"ar":"تمويل عقاري؟","en":"Mortgage?"},"required":true,"width":"full","options":["yes","no"]},
        {"id":"ap10","key":"finishingStatus","type":"select","label":{"ar":"حالة التشطيب","en":"Finishing Status"},"required":true,"width":"full","options":["core_shell","semi_finished","fully_finished","super_lux","luxury"]},
        {"id":"ap11","key":"description.ar","type":"textarea","label":{"ar":"وصف العقار (عربي)","en":"Description (AR)"},"required":true,"width":"full"},
        {"id":"ap12","key":"description.en","type":"textarea","label":{"ar":"وصف العقار (إنجليزي)","en":"Description (EN)"},"required":false,"width":"full"}
    ]'::jsonb
) ON CONFLICT ("slug") DO UPDATE SET "fields" = EXCLUDED.fields;

-- Decoration Request
INSERT INTO "FormDefinition" ("slug", "title_en", "title_ar", "description_en", "description_ar", "category", "destination", "submitButtonLabel_en", "submitButtonLabel_ar", "fields")
VALUES (
    'decoration-request', 'Decoration Request', 'طلب ديكور / عمل فني', 'Form for custom art and decoration requests', 'نموذج طلب أعمال فنية خاصة', 'lead_gen', 'crm_leads', 'Submit Request', 'إرسال الطلب',
    '[
        {"id":"dr1","key":"customerName","type":"text","label":{"ar":"الاسم بالكامل","en":"Full Name"},"required":true,"width":"half"},
        {"id":"dr2","key":"customerPhone","type":"tel","label":{"ar":"رقم الهاتف","en":"Phone Number"},"required":true,"width":"half","validation":{"type":"phone_eg"}},
        {"id":"dr3","key":"itemCategory","type":"select","label":{"ar":"نوع العمل المطلوب","en":"Item Category"},"required":true,"width":"half","options":["wall_sculpture","canvas_painting","custom_furniture","antique_decor"]},
        {"id":"dr4","key":"dimensions","type":"text","label":{"ar":"الأبعاد المطلوبة (سم)","en":"Dimensions (cm)"},"required":false,"width":"half","placeholder":{"ar":"مثال: 100x80","en":"e.g. 100x80"}},
        {"id":"dr5","key":"contactTime","type":"select","label":{"ar":"وقت التواصل","en":"Preferred Time"},"required":true,"width":"full","options":["any_time","morning","evening"]},
        {"id":"dr6","key":"customerNotes","type":"textarea","label":{"ar":"وصف الفكرة / ملاحظات","en":"Description / Notes"},"required":true,"width":"full"},
        {"id":"dr7","key":"referenceImage","type":"file","label":{"ar":"صورة مرجعية (اختياري)","en":"Reference Image (Optional)"},"required":false,"width":"full"}
    ]'::jsonb
) ON CONFLICT ("slug") DO UPDATE SET "fields" = EXCLUDED.fields;

-- Custom Design Request (NEW)
INSERT INTO "FormDefinition" ("slug", "title_en", "title_ar", "description_en", "description_ar", "category", "destination", "submitButtonLabel_en", "submitButtonLabel_ar", "fields")
VALUES (
    'custom-design-request', 'Custom Design Request', 'طلب تصميم خاص', 'Form for unique design requests and custom execution', 'نموذج مخصص لطلبات التصميم الفريدة وتنفيذ الأفكار الخاصة', 'lead_gen', 'crm_leads', 'Submit Design Request', 'إرسال طلب التصميم',
    '[
        {"id":"cdr1","key":"customerName","type":"text","label":{"ar":"الاسم بالكامل","en":"Full Name"},"required":true,"width":"half"},
        {"id":"cdr2","key":"customerPhone","type":"tel","label":{"ar":"رقم الهاتف","en":"Phone Number"},"required":true,"width":"half","validation":{"type":"phone_eg"}},
        {"id":"cdr3","key":"itemCategory","type":"select","label":{"ar":"نوع العمل المطلوب","en":"Item Category"},"required":true,"width":"half","options":["wall_sculpture","canvas_painting","custom_furniture","antique_decor"]},
        {"id":"cdr4","key":"dimensions","type":"text","label":{"ar":"الأبعاد التقريبية (سم)","en":"Approx Dimensions (cm)"},"required":false,"width":"half","placeholder":{"ar":"مثال: 150x90","en":"e.g. 150x90"}},
        {"id":"cdr6","key":"customerNotes","type":"textarea","label":{"ar":"وصف الفكرة / التصميم","en":"Idea Description"},"required":true,"width":"full","placeholder":{"ar":"صف التصميم الذي تتخيله، الألوان، الطراز، والمكان المخصص له...","en":"Describe the design, colors, style, and placement..."}},
        {"id":"cdr7","key":"referenceImage","type":"file","label":{"ar":"صورة مرجعية (اختياري)","en":"Reference Image (Optional)"},"required":false,"width":"full"}
    ]'::jsonb
) ON CONFLICT ("slug") DO UPDATE SET "fields" = EXCLUDED.fields;

-- Property Inquiry
INSERT INTO "FormDefinition" ("slug", "title_en", "title_ar", "description_en", "description_ar", "category", "destination", "submitButtonLabel_en", "submitButtonLabel_ar", "fields")
VALUES (
    'property-inquiry', 'Property Search Request', 'طلب بحث عقاري', 'Form to specify desired property details', 'نموذج لتحديد مواصفات العقار المطلوب', 'lead_gen', 'crm_leads', 'Submit Request', 'إرسال الطلب',
    '[
        {"id":"pi1","key":"customerName","type":"text","label":{"ar":"الاسم بالكامل","en":"Full Name"},"required":true,"width":"half"},
        {"id":"pi2","key":"customerPhone","type":"tel","label":{"ar":"رقم الهاتف","en":"Phone Number"},"required":true,"width":"half","validation":{"type":"phone_eg"}},
        {"id":"pi3","key":"contactTime","type":"select","label":{"ar":"وقت التواصل","en":"Preferred Time"},"required":true,"width":"full","options":["morning","afternoon","evening"]},
        {"id":"pi4","key":"details","type":"textarea","label":{"ar":"مواصفات العقار المطلوب","en":"Property Details"},"required":true,"width":"full","placeholder":{"ar":"مثال: شقة ٣ غرف...","en":"e.g., 3 Bedroom apartment..."}}
    ]'::jsonb
) ON CONFLICT ("slug") DO UPDATE SET "fields" = EXCLUDED.fields;

-- Finishing Request
INSERT INTO "FormDefinition" ("slug", "title_en", "title_ar", "description_en", "description_ar", "category", "destination", "submitButtonLabel_en", "submitButtonLabel_ar", "fields")
VALUES (
    'finishing-request', 'Finishing Request', 'طلب تشطيب', 'Detailed form for finishing services', 'نموذج تفصيلي لخدمات التشطيب', 'lead_gen', 'crm_leads', 'Request Site Visit', 'إرسال طلب المعاينة',
    '[
        {"id":"fr1","key":"customerName","type":"text","label":{"ar":"الاسم بالكامل","en":"Full Name"},"required":true,"width":"half"},
        {"id":"fr2","key":"customerPhone","type":"tel","label":{"ar":"رقم الهاتف","en":"Phone Number"},"required":true,"width":"half","validation":{"type":"phone_eg"}},
        {"id":"fr3","key":"unitType","type":"select","label":{"ar":"نوع الوحدة","en":"Unit Type"},"required":true,"width":"half","options":["apartment","villa","duplex","commercial","office"]},
        {"id":"fr4","key":"unitArea","type":"number","label":{"ar":"المساحة التقريبية (م٢)","en":"Approx Area (m2)"},"required":true,"width":"half"},
        {"id":"fr5","key":"currentStatus","type":"select","label":{"ar":"حالة الوحدة الحالية","en":"Current Status"},"required":true,"width":"half","options":["core_shell","semi_finished","old_renovation"]},
        {"id":"fr6","key":"finishingLevel","type":"select","label":{"ar":"مستوى التشطيب المطلوب","en":"Desired Finishing"},"required":true,"width":"half","options":["economic","super_lux","ultra_lux","hotel_standard"]},
        {"id":"fr7","key":"contactTime","type":"select","label":{"ar":"وقت التواصل المفضل","en":"Preferred Contact Time"},"required":true,"width":"full","options":["morning","afternoon","evening"]},
        {"id":"fr8","key":"customerNotes","type":"textarea","label":{"ar":"ملاحظات إضافية","en":"Additional Notes"},"required":false,"width":"full"}
    ]'::jsonb
) ON CONFLICT ("slug") DO UPDATE SET "fields" = EXCLUDED.fields;
