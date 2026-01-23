
-- ====================================================================================
-- ONLY HELIO - ENRICH FINISHING PAGE (Content & Partners)
-- ====================================================================================

-- 1. Create/Update Finishing Partners with Realistic Profiles
INSERT INTO "User" 
("id", "email", "password", "name_en", "name_ar", "type", "role", "status", "subscriptionPlan", "imageUrl", "description_en", "description_ar", "contactMethods")
VALUES 
(
    'finish-expert-co', 
    'expert@decor.com', 
    'password', 
    'Expert Finishers', 
    'خبراء التشطيب', 
    'finishing', 
    'FINISHING_PARTNER', 
    'active', 
    'elite', 
    'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=400&h=400&fit=crop',
    'Specializing in high-end villa finishing with over 15 years of experience in New Heliopolis. We offer turnkey solutions.',
    'متخصصون في تشطيب الفيلات الراقية بخبرة تزيد عن 15 عاماً في هليوبوليس الجديدة. نقدم حلول تسليم مفتاح.',
    '{"whatsapp": {"enabled": true, "number": "01000000002"}, "phone": {"enabled": true, "number": "01000000002"}, "form": {"enabled": true}}'
),
(
    'art-decor-studio', 
    'art@decor.com', 
    'password', 
    'Art & Decor Studio', 
    'ستوديو الفن والديكور', 
    'finishing', 
    'FINISHING_PARTNER', 
    'active', 
    'professional', 
    'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&h=400&fit=crop',
    'Creative interior design studio focusing on modern and minimalist styles for apartments.',
    'ستوديو تصميم داخلي إبداعي يركز على الطرز الحديثة والبسيطة للشقق السكنية.',
    '{"whatsapp": {"enabled": true, "number": "01100000003"}, "phone": {"enabled": true, "number": "01100000003"}, "form": {"enabled": true}}'
),
(
    'modern-touch-contracting', 
    'touch@contracting.com', 
    'password', 
    'Modern Touch', 
    'لمسة عصرية للمقاولات', 
    'finishing', 
    'FINISHING_PARTNER', 
    'active', 
    'commission', 
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=400&fit=crop',
    'Reliable contracting for all finishing works: plumbing, electrical, and painting. Affordable rates.',
    'مقاولات موثوقة لجميع أعمال التشطيب: سباكة، كهرباء، ونقاشة. أسعار تنافسية.',
    '{"whatsapp": {"enabled": true, "number": "01200000004"}, "phone": {"enabled": true, "number": "01200000004"}, "form": {"enabled": true}}'
)
ON CONFLICT ("id") DO NOTHING;

-- 2. Update Site Content with Rich Finishing Page Data (Packages, Text, etc.)
-- This updates the 'site_content_v1' JSON with a new structure for 'finishingPage' and 'finishingServices'
UPDATE "SystemSetting"
SET "value" = jsonb_set(
    "value",
    '{finishingServices}',
    '[
        {
            "id": "srv-design",
            "title": {"ar": "باقات التصميم الداخلي", "en": "Interior Design Packages"},
            "description": {"ar": "احصل على تصور كامل لمنزلك قبل البدء في التنفيذ. نقدم رسومات ثنائية وثلاثية الأبعاد.", "en": "Visualize your home before execution. We provide 2D layouts and 3D realistic renders."},
            "pricingTiers": [
                {"unitType": {"ar": "تصميم 2D", "en": "2D Layout"}, "areaRange": {"ar": "للمتر المربع", "en": "Per SQM"}, "price": 150},
                {"unitType": {"ar": "تصميم 3D", "en": "3D Design"}, "areaRange": {"ar": "للمتر المربع", "en": "Per SQM"}, "price": 350},
                {"unitType": {"ar": "تصميم VR", "en": "VR Walkthrough"}, "areaRange": {"ar": "للوحدة", "en": "Per Unit"}, "price": 5000}
            ]
        },
        {
            "id": "srv-finishing",
            "title": {"ar": "باقات التشطيب المتكاملة", "en": "Turnkey Finishing Packages"},
            "description": {"ar": "حلول تنفيذية شاملة تناسب جميع الميزانيات، من التأسيس وحتى التسليم النهائي.", "en": "Comprehensive execution solutions for all budgets, from foundation to final handover."},
            "pricingTiers": [
                {"unitType": {"ar": "باقة اقتصادية", "en": "Economy"}, "areaRange": {"ar": "متوسط سعر المتر", "en": "Avg Price / m²"}, "price": 4500},
                {"unitType": {"ar": "باقة سوبر لوكس", "en": "Super Lux"}, "areaRange": {"ar": "متوسط سعر المتر", "en": "Avg Price / m²"}, "price": 6500},
                {"unitType": {"ar": "باقة فندقية VIP", "en": "VIP Hotel Class"}, "areaRange": {"ar": "متوسط سعر المتر", "en": "Avg Price / m²"}, "price": 9000}
            ]
        },
        {
            "id": "srv-furniture",
            "title": {"ar": "الأثاث والفرش", "en": "Furniture & Furnishing"},
            "description": {"ar": "تأثيث كامل للوحدة بأثاث عمولة أو جاهز بخصومات خاصة لعملاء المنصة.", "en": "Complete furnishing with custom-made or ready-made furniture with exclusive discounts."},
            "pricingTiers": [
                {"unitType": {"ar": "فرش شقة غرفتين", "en": "2BR Apartment"}, "areaRange": {"ar": "باقة كاملة", "en": "Full Package"}, "price": 250000},
                {"unitType": {"ar": "فرش شقة 3 غرف", "en": "3BR Apartment"}, "areaRange": {"ar": "باقة كاملة", "en": "Full Package"}, "price": 350000},
                {"unitType": {"ar": "مطبخ ودريسنج", "en": "Kitchen & Dressing"}, "areaRange": {"ar": "يبدأ من", "en": "Starts From"}, "price": 80000}
            ]
        }
    ]'::jsonb
)
WHERE "key" = 'site_content_v1';

-- Update Finishing Page Texts in CMS
UPDATE "SystemSetting"
SET "value" = jsonb_set(
    "value",
    '{finishingPage}',
    '{
        "ar": {
            "heroTitle": "حول منزلك إلى تحفة فنية",
            "heroSubtitle": "نجمع لك أفضل شركات التشطيب والتصميم في هليوبوليس الجديدة في مكان واحد. جودة مضمونة، أسعار تنافسية، وإشراف هندسي.",
            "servicesTitle": "اختر الباقة المناسبة لك",
            "servicesSubtitle": "سواء كنت تحتاج لتصميم فقط، أو تشطيب كامل، لدينا الباقة التي تناسب ميزانيتك.",
            "servicesIntro": "تصفح الباقات أدناه، أو استخدم حاسبة التكلفة الذكية للحصول على تقدير فوري.",
            "partnerCompaniesTitle": "شركات التشطيب المعتمدة",
            "partnerCompaniesSubtitle": "تعامل بثقة مع نخبة من الشركات التي تم التحقق من سابقة أعمالها.",
            "serviceProvidersTitle": "مقدمو الخدمات المستقلون",
            "serviceProvidersSubtitle": "فنيون ومهندسون مستقلون للمهام السريعة والمحددة.",
            "ctaTitle": "ابدأ رحلة منزلك الجديد اليوم",
            "ctaSubtitle": "لا تضيع الوقت في البحث عن صنايعية. اطلب معاينة مجانية الآن.",
            "ctaButton": "اطلب معاينة مجانية",
            "requestButton": "طلب عرض سعر"
        },
        "en": {
            "heroTitle": "Turn Your Home Into a Masterpiece",
            "heroSubtitle": "We bring together the best finishing and design companies in New Heliopolis. Guaranteed quality, competitive prices, and engineering supervision.",
            "servicesTitle": "Choose the Right Package",
            "servicesSubtitle": "Whether you need just design or full turnkey finishing, we have a package that fits your budget.",
            "servicesIntro": "Browse packages below, or use our Smart Cost Estimator for an instant quote.",
            "partnerCompaniesTitle": "Verified Finishing Partners",
            "partnerCompaniesSubtitle": "Work confidently with elite companies whose portfolios have been verified.",
            "serviceProvidersTitle": "Independent Service Providers",
            "serviceProvidersSubtitle": "Freelance engineers and technicians for quick, specific tasks.",
            "ctaTitle": "Start Your Home Journey Today",
            "ctaSubtitle": "Don''t waste time searching for workers. Request a free site visit now.",
            "ctaButton": "Request Free Site Visit",
            "requestButton": "Request Quote"
        }
    }'::jsonb
)
WHERE "key" = 'site_content_v1';
