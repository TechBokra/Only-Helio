
-- ====================================================================================
-- ONLY HELIO - FIX FINISHING PARTNERS VISIBILITY
-- ====================================================================================

-- 1. FIX PERMISSIONS (RLS)
-- Enable Row Level Security on User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Remove existing conflicting policies if any (to avoid errors)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON "User";
DROP POLICY IF EXISTS "Enable read access for all users" ON "User";

-- Create a policy that allows EVERYONE (anon and authenticated) to read 'active' users
CREATE POLICY "Public profiles are viewable by everyone"
ON "User" FOR SELECT
USING ( status = 'active' );


-- 2. RE-SEED FINISHING DATA (Ensure data exists)
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
    'Specializing in high-end villa finishing with over 15 years of experience.',
    'متخصصون في تشطيب الفيلات الراقية بخبرة تزيد عن 15 عاماً.',
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
    'Creative interior design studio focusing on modern styles.',
    'ستوديو تصميم داخلي إبداعي يركز على الطرز الحديثة.',
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
    'Reliable contracting for all finishing works.',
    'مقاولات موثوقة لجميع أعمال التشطيب.',
    '{"whatsapp": {"enabled": true, "number": "01200000004"}, "phone": {"enabled": true, "number": "01200000004"}, "form": {"enabled": true}}'
)
ON CONFLICT ("id") DO UPDATE SET
    "status" = 'active',
    "role" = 'FINISHING_PARTNER',
    "type" = 'finishing';
