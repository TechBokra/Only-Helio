
-- 1. Clean up old generic finishing plans
DELETE FROM "PlanConfiguration" WHERE "category" = 'finishing';

-- 2. Insert Granular Plans

-- A. Engineers (Freelancers)
INSERT INTO "PlanConfiguration" ("category", "subCategory", "tier", "name_en", "name_ar", "price_en", "price_ar", "description_en", "description_ar", "features_en", "features_ar")
VALUES
(
    'finishing', 'engineer', 'freelancer_basic', 
    'Freelancer Start', 'بداية المهندس', 
    'Free', 'مجاني', 
    'For individual engineers starting out.', 'للمهندسين المستقلين في بداية الطريق.', 
    ARRAY['Personal Profile', 'Limit 3 Portfolio Items'], 
    ARRAY['ملف شخصي', '3 أعمال في المعرض كحد أقصى']
),
(
    'finishing', 'engineer', 'freelancer_pro', 
    'Freelancer Pro', 'مهندس محترف', 
    '500 EGP/mo', '500 ج.م/شهر', 
    'More visibility for active engineers.', 'ظهور أكبر للمهندسين النشطين.', 
    ARRAY['Verified Badge', 'Unlimited Portfolio', 'Direct Calls'], 
    ARRAY['شارة توثيق', 'معرض أعمال غير محدود', 'اتصال مباشر']
);

-- B. Offices (Small/Medium Studios)
INSERT INTO "PlanConfiguration" ("category", "subCategory", "tier", "name_en", "name_ar", "price_en", "price_ar", "description_en", "description_ar", "features_en", "features_ar")
VALUES
(
    'finishing', 'office', 'studio_growth', 
    'Design Studio', 'مكتب تصميم', 
    '2,000 EGP/mo', '2,000 ج.م/شهر', 
    'For decoration offices and small studios.', 'لمكاتب الديكور والاستوديوهات الصغيرة.', 
    ARRAY['Team Members', 'Featured in Search', '10 Active Projects'], 
    ARRAY['إضافة فريق عمل', 'متميز في البحث', '10 مشاريع نشطة']
);

-- C. Companies (Contracting & Large Scale)
INSERT INTO "PlanConfiguration" ("category", "subCategory", "tier", "name_en", "name_ar", "price_en", "price_ar", "description_en", "description_ar", "features_en", "features_ar")
VALUES
(
    'finishing', 'company', 'corporate_elite', 
    'Corporate Elite', 'شركات النخبة', 
    '8,000 EGP/mo', '8,000 ج.م/شهر', 
    'Full branding and turnkey contracting.', 'علامة تجارية كاملة ومقاولات تسليم مفتاح.', 
    ARRAY['Top Placement', 'Dedicated Account Manager', 'Unlimited Projects', 'Official Partner Status'], 
    ARRAY['أعلى نتائج البحث', 'مدير حساب خاص', 'مشاريع غير محدودة', 'حالة شريك رسمي']
);
