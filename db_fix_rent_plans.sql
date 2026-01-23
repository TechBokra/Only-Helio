
-- ====================================================================================
-- ONLY HELIO - FIX MISSING RENT PLANS FOR INDIVIDUALS
-- ====================================================================================

-- Ensure Individual Rent plans exist. 
-- We use ON CONFLICT to update if they exist or insert if they don't.
-- Note: 'individual' plans usually don't have a unique constraint on (category, tier) alone in some schemas if subCategory isn't part of the key.
-- We will delete existing individual rent plans first to avoid duplicates if constraints aren't perfect, then re-insert.

DELETE FROM "PlanConfiguration" WHERE "category" = 'individual' AND "subCategory" = 'rent';

INSERT INTO "PlanConfiguration" 
("category", "tier", "subCategory", "name_en", "name_ar", "price_en", "price_ar", "description_en", "description_ar", "features_en", "features_ar")
VALUES
(
    'individual', 
    'paid_listing', 
    'rent', 
    'Paid Listing', 
    'إعلان مدفوع', 
    '300 EGP', 
    '300 ج.م', 
    'List your unit for rent with priority visibility.', 
    'اعرض وحدتك للإيجار مع أولوية في الظهور.', 
    ARRAY['Listed for 60 days', 'Direct contact with tenants', 'Featured Badge'], 
    ARRAY['عرض لمدة 60 يوم', 'تواصل مباشر مع المستأجرين', 'شارة مميزة']
),
(
    'individual', 
    'commission', 
    'rent', 
    'Commission Based', 
    'نظام العمولة', 
    'Free', 
    'مجاني', 
    'We manage the rental process for you.', 
    'نحن ندير عملية التأجير بالكامل نيابة عنك.', 
    ARRAY['No upfront fees', 'Professional photography', '1 Month Rent Commission'], 
    ARRAY['بدون رسوم مقدمة', 'تصوير احترافي', 'عمولة شهر إيجار عند التنفيذ']
);
