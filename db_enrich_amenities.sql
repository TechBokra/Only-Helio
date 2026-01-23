
-- ====================================================================================
-- ONLY HELIO - ENRICH AMENITIES & FILTERS
-- Strict separation between Residential, Commercial, and Land
-- ====================================================================================

-- 1. CLEANUP OLD LOOKUPS (To ensure clean state)
DELETE FROM "Amenity";
DELETE FROM "FinishingStatus";

-- 2. SEED FINISHING STATUSES
-- Note: Land does not have finishing.
INSERT INTO "FinishingStatus" (name_en, name_ar, "applicableTo") VALUES 
('Core & Shell', 'بدون تشطيب / على الطوب', ARRAY['Apartment', 'Villa', 'Commercial']),
('Semi-finished', 'نصف تشطيب / محارة', ARRAY['Apartment', 'Villa', 'Commercial']),
('Fully Finished', 'تشطيب كامل', ARRAY['Apartment', 'Villa', 'Commercial']),
('Super Lux', 'سوبر لوكس', ARRAY['Apartment', 'Villa']),
('Ultra Lux', 'الترا لوكس', ARRAY['Apartment', 'Villa']),
('Fully Furnished', 'مفروشة بالكامل', ARRAY['Apartment', 'Villa', 'Commercial']);

-- 3. SEED AMENITIES (Categorized)

-- A. GENERAL / RESIDENTIAL (Apartment/Villa)
INSERT INTO "Amenity" (name_en, name_ar, "applicableTo") VALUES 
('Balcony', 'شرفة', ARRAY['Apartment', 'Villa']),
('Private Garden', 'حديقة خاصة', ARRAY['Apartment', 'Villa']),
('Kitchen Appliances', 'أجهزة مطبخ', ARRAY['Apartment', 'Villa']),
('Central AC', 'تكييف مركزي', ARRAY['Apartment', 'Villa', 'Commercial']),
('Maid''s Room', 'غرفة خادمة', ARRAY['Apartment', 'Villa']),
('Walk-in Closet', 'غرفة ملابس', ARRAY['Apartment', 'Villa']),
('Elevator', 'مصعد', ARRAY['Apartment', 'Commercial']),
('Security', 'أمن وحراسة', ARRAY['Apartment', 'Villa', 'Commercial', 'Land']),
('Parking', 'موقف سيارات', ARRAY['Apartment', 'Villa', 'Commercial']),
('Pool', 'حمام سباحة', ARRAY['Villa', 'Apartment']),
('Jacuzzi', 'جاكوزي', ARRAY['Villa']),
('Natural Gas', 'غاز طبيعي', ARRAY['Apartment', 'Villa', 'Commercial']),
('Electricity Meter', 'عداد كهرباء', ARRAY['Apartment', 'Villa', 'Commercial', 'Land']),
('Water Meter', 'عداد مياه', ARRAY['Apartment', 'Villa', 'Commercial', 'Land']),
('Landline', 'تليفون أرضي', ARRAY['Apartment', 'Villa', 'Commercial']);

-- B. COMMERCIAL SPECIFIC (Offices, Retail)
INSERT INTO "Amenity" (name_en, name_ar, "applicableTo") VALUES 
('CCTV System', 'نظام مراقبة كاميرات', ARRAY['Commercial', 'Villa']),
('Fire Fighting System', 'نظام إطفاء حريق', ARRAY['Commercial']),
('Loading Dock', 'منطقة تحميل وتفريغ', ARRAY['Commercial']),
('Three Phase Electricity', 'كهرباء 3 فاز', ARRAY['Commercial', 'Villa']),
('Main Road Frontage', 'واجهة على شارع رئيسي', ARRAY['Commercial', 'Land']),
('Storage Room', 'غرفة تخزين', ARRAY['Commercial', 'Villa']),
('Meeting Room', 'غرفة اجتماعات', ARRAY['Commercial']),
('Data Center / Server Room', 'غرفة سيرفرات', ARRAY['Commercial']);

-- C. LAND SPECIFIC
INSERT INTO "Amenity" (name_en, name_ar, "applicableTo") VALUES 
('Building Permit', 'رخصة بناء', ARRAY['Land']),
('Paved Road Access', 'طريق ممهد', ARRAY['Land']),
('Corner Plot', 'أرض ناصية', ARRAY['Land', 'Villa']),
('Soil Test Available', 'اختبار تربة متاح', ARRAY['Land']),
('Water Access', 'مصدر مياه', ARRAY['Land']),
('Fenced', 'مسورة', ARRAY['Land']);
