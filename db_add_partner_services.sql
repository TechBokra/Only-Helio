
-- 1. إنشاء جدول خدمات الشريك
CREATE TABLE IF NOT EXISTS "PartnerService" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "partnerId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
    "title_en" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description_en" TEXT,
    "description_ar" TEXT,
    "priceRange_en" TEXT,
    "priceRange_ar" TEXT,
    "estimatedTime_en" TEXT,
    "estimatedTime_ar" TEXT,
    "imageUrl" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إدخال بيانات تجريبية (Seed Data)
INSERT INTO "PartnerService" (
    "partnerId", 
    "title_en", "title_ar", 
    "description_en", "description_ar", 
    "priceRange_en", "priceRange_ar",
    "estimatedTime_en", "estimatedTime_ar",
    "isActive"
)
VALUES 
(
    'finish-partner-1',
    'Turnkey Finishing (Ultra Lux)', 'تشطيب كامل (الترا لوكس)',
    'Complete finishing from core & shell to keys handover including smart home setup.', 'تشطيب متكامل من الطوب الأحمر حتى المفتاح يشمل تأسيس سمارت هوم.',
    '6,000 - 8,000 EGP/m²', '6,000 - 8,000 ج.م/م²',
    '3 Months', '3 شهور',
    true
),
(
    'finish-partner-1',
    '3D Interior Design', 'تصميم داخلي 3D',
    'High quality 3D renders and layout planning.', 'تصميمات ثلاثية الأبعاد عالية الجودة وتخطيط للمساحات.',
    '250 EGP/m²', '250 ج.م/م²',
    '2 Weeks', 'أسبوعين',
    true
),
(
    'finish-expert-co',
    'Villa Landscape Design', 'تصميم حدائق الفيلات',
    'Full landscape design and execution including irrigation systems.', 'تصميم وتنفيذ اللاندسكيب والحدائق شامل شبكات الري.',
    'Starts from 50,000 EGP', 'يبدأ من 50,000 ج.م',
    '1 Month', 'شهر واحد',
    true
);
