
-- ====================================================================================
-- ONLY HELIO - ENRICH REST OF HOME PAGE
-- Enriching Services, Why Us, Testimonials, and Social Proof
-- ====================================================================================

-- 1. ENRICH "WHY US" (Integrations Section)
UPDATE "SystemSetting"
SET "value" = jsonb_set(
    "value",
    '{whyUs}',
    '{
        "enabled": true,
        "ar": {
            "title": "لماذا تختار ONLY HELIO؟",
            "description": "نحن لا نقدم مجرد عقارات، بل نقدم تجربة استثمار وسكن متكاملة مبنية على الفهم العميق لمدينة هليوبوليس الجديدة.",
            "features": [
                { "title": "سوق متخصص وحصري", "description": "المنصة الوحيدة المخصصة بالكامل لمدينة هليوبوليس الجديدة، مما يضمن لك الوصول لأدق المعلومات وأفضل الفرص." },
                { "title": "شفافية وموثوقية", "description": "يتم التحقق من هوية جميع المطورين وشركات التشطيب على منصتنا لضمان تعاملات آمنة وخالية من المخاطر." },
                { "title": "تقييم ذكي للأسعار", "description": "نستخدم خوارزميات الذكاء الاصطناعي لتقديم تقديرات سعرية دقيقة للعقارات والتشطيبات بناءً على بيانات السوق الحية." },
                { "title": "حلول متكاملة 360°", "description": "رحلتك معنا لا تنتهي بالشراء. نحن معك في التصميم، التشطيب، وحتى الفرش والديكور." }
            ]
        },
        "en": {
            "title": "Why Choose ONLY HELIO?",
            "description": "We don''t just offer properties; we offer a complete living and investment experience built on a deep understanding of New Heliopolis City.",
            "features": [
                { "title": "Exclusive Specialized Market", "description": "The only platform dedicated entirely to New Heliopolis, ensuring you access the most accurate info and best opportunities." },
                { "title": "Transparency & Trust", "description": "All developers and finishing companies on our platform are verified to ensure safe and risk-free transactions." },
                { "title": "AI-Powered Pricing", "description": "We use AI algorithms to provide accurate price estimates for properties and finishing based on live market data." },
                { "title": "360° Integrated Solutions", "description": "Your journey doesn''t end with buying. We are with you through design, finishing, and even furnishing." }
            ]
        }
    }'::jsonb
)
WHERE "key" = 'site_content_v1';


-- 2. ENRICH "SERVICES"
UPDATE "SystemSetting"
SET "value" = jsonb_set(
    "value",
    '{services}',
    '{
        "enabled": true,
        "ar": {
            "title": "منظومة خدمات متكاملة",
            "description": "كل ما تحتاجه لبيت العمر في مكان واحد، بدءاً من اختيار الوحدة المثالية وحتى استلام المفتاح.",
            "features": [
                { "title": "الوساطة العقارية", "description": "بيع وشراء وتأجير الوحدات السكنية والتجارية مع نخبة من الوسطاء المعتمدين.", "link": "/properties", "icon": "BuildingIcon" },
                { "title": "التشطيب والديكور", "description": "باقات تشطيب متنوعة تناسب ميزانيتك، مع إمكانية التقسيط والإشراف الهندسي الكامل.", "link": "/finishing", "icon": "FinishingIcon" },
                { "title": "الاستشارات الهندسية", "description": "خدمات استشارية لتقييم العقارات وحساب التكاليف المتوقعة قبل الشراء.", "link": "/estimator", "icon": "CalculatorIcon" }
            ]
        },
        "en": {
            "title": "Integrated Service Ecosystem",
            "description": "Everything you need for your dream home in one place, from choosing the perfect unit to receiving the keys.",
            "features": [
                { "title": "Real Estate Brokerage", "description": "Buy, sell, and rent residential and commercial units with elite certified brokers.", "link": "/properties", "icon": "BuildingIcon" },
                { "title": "Finishing & Decor", "description": "Diverse finishing packages to suit your budget, with installment options and full engineering supervision.", "link": "/finishing", "icon": "FinishingIcon" },
                { "title": "Engineering Consultancy", "description": "Consulting services to evaluate properties and estimate costs before purchasing.", "link": "/estimator", "icon": "CalculatorIcon" }
            ]
        }
    }'::jsonb
)
WHERE "key" = 'site_content_v1';


-- 3. ENRICH "TESTIMONIALS"
UPDATE "SystemSetting"
SET "value" = jsonb_set(
    "value",
    '{testimonials}',
    '{
        "enabled": true,
        "ar": { "title": "قصص نجاح عملائنا", "subtitle": "نفخر بثقة عملائنا وشركائنا في رحلتهم معنا." },
        "en": { "title": "Client Success Stories", "subtitle": "We take pride in the trust our clients and partners place in us." },
        "items": [
            {
                "quote": { "ar": "كنت أبحث عن فيلا في الحي الثالث وواجهت صعوبة في معرفة الأسعار الحقيقية. المنصة ساعدتني في مقارنة الخيارات والوصول للمالك مباشرة.", "en": "I was looking for a villa in District 3 and struggled with real prices. The platform helped me compare options and reach the owner directly." },
                "author": { "ar": "م. أحمد عبد السلام", "en": "Eng. Ahmed Abdelsalam" },
                "location": { "ar": "مستثمر عقاري", "en": "Real Estate Investor" }
            },
            {
                "quote": { "ar": "خدمة تقدير تكلفة التشطيب بالذكاء الاصطناعي مذهلة! أعطتني رقماً قريباً جداً من الواقع ساعدني في التفاوض مع شركة التشطيب.", "en": "The AI finishing cost estimator is amazing! It gave me a figure very close to reality which helped me negotiate with the finishing company." },
                "author": { "ar": "د. سارة محمود", "en": "Dr. Sara Mahmoud" },
                "location": { "ar": "ساكنة جديدة", "en": "New Resident" }
            },
            {
                "quote": { "ar": "كشركة تشطيبات، الانضمام للمنصة فتح لنا سوقاً جديداً بالكامل في المدينة وساعدنا في الوصول لعملاء جادين.", "en": "As a finishing company, joining the platform opened a whole new market for us in the city and helped us reach serious clients." },
                "author": { "ar": "شركة الأفق للديكور", "en": "Al-Ofuq Decor" },
                "location": { "ar": "شريك أعمال", "en": "Business Partner" }
            }
        ]
    }'::jsonb
)
WHERE "key" = 'site_content_v1';

-- 4. ENRICH "SOCIAL PROOF"
UPDATE "SystemSetting"
SET "value" = jsonb_set(
    "value",
    '{socialProof}',
    '{
        "enabled": true,
        "stats": [
            { "value": "+2,500", "name": { "ar": "وحدة سكنية", "en": "Residential Units" } },
            { "value": "+150", "name": { "ar": "شريك معتمد", "en": "Verified Partners" } },
            { "value": "98%", "name": { "ar": "نسبة رضا العملاء", "en": "Client Satisfaction" } },
            { "value": "+100M", "name": { "ar": "حجم استثمارات", "en": "Investment Volume" } }
        ]
    }'::jsonb
)
WHERE "key" = 'site_content_v1';
