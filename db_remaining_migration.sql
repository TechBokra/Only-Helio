
-- تنظيف الجداول القديمة لضمان تطابق الهيكل
DROP TABLE IF EXISTS "Banner";
DROP TABLE IF EXISTS "Notification";
DROP TABLE IF EXISTS "ContactRequest";
DROP TABLE IF EXISTS "PropertyInquiry";
-- لا نحذف SystemSetting لأنه قد يحتوي على بيانات أخرى، لكننا سنستخدم CREATE IF NOT EXISTS للأمان

-- 1. جدول الإعلانات (Banner)
CREATE TABLE "Banner" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "link" TEXT,
    "locations" TEXT[], -- Array of strings: home, properties, details, etc.
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP WITH TIME ZONE,
    "endDate" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. جدول الإشعارات (Notification)
CREATE TABLE "Notification" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "userId" TEXT NOT NULL, -- FK to User.id
    "message" JSONB NOT NULL, -- {ar: string, en: string}
    "link" TEXT,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_userid ON "Notification" ("userId");

-- 3. جدول طلبات التواصل (ContactRequest)
CREATE TABLE "ContactRequest" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "message" TEXT,
    "inquiryType" TEXT, -- client, partner
    "businessType" TEXT,
    "companyName" TEXT,
    "status" TEXT DEFAULT 'pending',
    "managerId" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. جدول استفسارات العقارات (PropertyInquiry)
CREATE TABLE "PropertyInquiry" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. جدول إعدادات النظام (لـ AI Config و Site Content)
CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "key" TEXT PRIMARY KEY,
    "value" JSONB NOT NULL,
    "group" TEXT,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- بيانات أولية للإعلانات (Seeding Banners)
INSERT INTO "Banner" ("title", "imageUrl", "link", "locations", "status")
VALUES 
('Home Page Banner', 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=2070', '/contact', ARRAY['home'], 'active'),
('Properties Banner', 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070', '/register', ARRAY['properties'], 'active'),
('Finishing Ad', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000', '/finishing', ARRAY['details', 'finishing'], 'active');

-- بيانات أولية لإعدادات AI (Seeding AI Config)
INSERT INTO "SystemSetting" ("key", "value", "group")
VALUES (
    'ai_estimator_config',
    '{
        "model": "gemini-2.5-flash",
        "prompt": "Estimate finishing costs in Egypt...",
        "stages": [
            {
                "id": "stage-1",
                "name": { "ar": "أعمال التأسيس", "en": "Foundation Works" },
                "basicItems": [
                    { "id": "item-1-1", "name": { "ar": "المحارة", "en": "Plastering" }, "unit": { "ar": "م²", "en": "m²" }, "price": 120 },
                    { "id": "item-1-2", "name": { "ar": "السباكة", "en": "Plumbing" }, "unit": { "ar": "نقطة", "en": "Point" }, "price": 800 }
                ],
                "optionalItems": []
            }
        ]
    }'::jsonb,
    'ai'
) ON CONFLICT ("key") DO NOTHING;
