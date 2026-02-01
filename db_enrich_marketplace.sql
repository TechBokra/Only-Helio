
-- ====================================================================================
-- ONLY HELIO - MARKETPLACE ENRICHMENT (Professionals & Services)
-- ====================================================================================

-- 1. INSERT NEW PARTNERS (Professionals & Specialized Offices)
INSERT INTO "User" 
("id", "email", "password", "name_en", "name_ar", "type", "role", "status", "subscriptionPlan", "imageUrl", "description_en", "description_ar", "contactMethods")
VALUES 
(
    'arch-mahmoud', 
    'mahmoud@arch.com', 
    'password', 
    'Arch. Mahmoud Samy', 
    'م. محمود سامي', 
    'finishing', 
    'FINISHING_PARTNER', 
    'active', 
    'basic', 
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    'Senior Architect specialized in modern Islamic and contemporary designs. 10+ years experience.',
    'مهندس معماري استشاري متخصص في التصميمات الإسلامية الحديثة والمعاصرة. خبرة أكثر من 10 سنوات.',
    '{"whatsapp": {"enabled": true, "number": "01011111111"}, "phone": {"enabled": true, "number": "01011111111"}, "form": {"enabled": true}}'
),
(
    'smart-homes-tech', 
    'info@smarthomes.eg', 
    'password', 
    'Smart Life Tech', 
    'سمارت لايف للتكنولوجيا', 
    'finishing', 
    'FINISHING_PARTNER', 
    'active', 
    'professional', 
    'https://images.unsplash.com/photo-1558002038-10914cba600d?w=400&h=400&fit=crop',
    'Specialized office for home automation, security systems, and sound systems.',
    'مكتب متخصص في أتمتة المنازل (السمارت هوم)، أنظمة المراقبة، والأنظمة الصوتية.',
    '{"whatsapp": {"enabled": true, "number": "01022222222"}, "phone": {"enabled": true, "number": "01022222222"}, "form": {"enabled": true}}'
),
(
    'green-valley-landscape', 
    'green@valley.com', 
    'password', 
    'Green Valley Landscape', 
    'جرين فالي للاندسكيب', 
    'finishing', 
    'FINISHING_PARTNER', 
    'active', 
    'commission', 
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=400&h=400&fit=crop',
    'We transform your garden into a paradise. Softscape, hardscape, and irrigation networks.',
    'نحول حديقتك إلى جنة. تصميم وتنفيذ اللاندسكيب (زراعة، ممرات، شبكات ري).',
    '{"whatsapp": {"enabled": true, "number": "01033333333"}, "phone": {"enabled": true, "number": "01033333333"}, "form": {"enabled": true}}'
),
(
    'eng-sara-interiors', 
    'sara@design.com', 
    'password', 
    'Eng. Sara Ali', 
    'م. سارة علي', 
    'finishing', 
    'FINISHING_PARTNER', 
    'active', 
    'basic', 
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
    'Freelance Interior Designer. Passionate about Boho and Scandinavian styles.',
    'مهندسة تصميم داخلي مستقلة. شغوفة بالطراز البوهيمي والاسكندنافي.',
    '{"whatsapp": {"enabled": true, "number": "01044444444"}, "phone": {"enabled": false}, "form": {"enabled": true}}'
)
ON CONFLICT ("id") DO NOTHING;

-- 2. INSERT RICH SERVICES
INSERT INTO "PartnerService" (
    "partnerId", 
    "title_en", "title_ar", 
    "description_en", "description_ar", 
    "priceRange_en", "priceRange_ar",
    "estimatedTime_en", "estimatedTime_ar",
    "imageUrl",
    "isActive"
)
VALUES 
-- Arch. Mahmoud
(
    'arch-mahmoud',
    'Full Architectural Design Package', 'باقة التصميم المعماري الكاملة',
    'Includes 2D plans, 3D elevations, and municipality approval drawings.', 'تشمل مساقط أفقية 2D، واجهات 3D، ورسومات التراخيص.',
    '15,000 - 25,000 EGP', '15,000 - 25,000 ج.م',
    '3 Weeks', '3 أسابيع',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop',
    true
),
-- Smart Life Tech
(
    'smart-homes-tech',
    'Basic Smart Home Setup', 'تأسيس سمارت هوم (أساسي)',
    'Control lighting and AC via mobile app. Includes wiring and configuration.', 'تحكم في الإضاءة والتكييف عبر الموبايل. يشمل الأسلاك والبرمجة.',
    'Starting 12,000 EGP', 'يبدأ من 12,000 ج.م',
    '1 Week', 'أسبوع واحد',
    'https://images.unsplash.com/photo-1558002038-10914cba600d?w=800&h=600&fit=crop',
    true
),
(
    'smart-homes-tech',
    'CCTV Security System', 'نظام مراقبة كامل (CCTV)',
    '4 Cameras (Hikvision), DVR, and installation.', '4 كاميرات (هيك فيجن)، جهاز تسجيل، والتركيب.',
    '8,500 EGP', '8,500 ج.م',
    '2 Days', 'يومين',
    'https://images.unsplash.com/photo-1587826279930-1c390559d744?w=800&h=600&fit=crop',
    true
),
-- Green Valley
(
    'green-valley-landscape',
    'Small Garden Makeover', 'تنسيق حديقة صغيرة',
    'Natural grass, 2 trees, and basic lighting for townhouses.', 'نجيل طبيعي، شجرتين، وإضاءة أساسية (مناسب للتاون هاوس).',
    '20,000 - 30,000 EGP', '20,000 - 30,000 ج.م',
    '10 Days', '10 أيام',
    'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=600&fit=crop',
    true
),
-- Eng. Sara
(
    'eng-sara-interiors',
    'Moodboard & Furniture Selection', 'تنسيق الألوان واختيار الأثاث',
    'I help you choose color palettes and furniture pieces that match your budget.', 'أساعدك في اختيار باليتة الألوان وقطع الأثاث التي تناسب ميزانيتك.',
    '3,000 EGP / Room', '3,000 ج.م / للغرفة',
    '5 Days', '5 أيام',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=800&h=600&fit=crop',
    true
),
-- Elite Finishing Co (Existing) - Add more specific service
(
    'finish-partner-1',
    'Gypsum Board Installation', 'توريد وتركيب جبس بورد',
    'Flat slab or designs. High quality materials (Knauf).', 'فلات سلاب أو بيت نور. خامات عالية الجودة (كناوف).',
    '250 EGP / m²', '250 ج.م / م²',
    'Varies', 'حسب المساحة',
    'https://images.unsplash.com/photo-1581094794329-cd56b509568e?w=800&h=600&fit=crop',
    true
);
