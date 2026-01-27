
-- Ensure the generic partner for individual listings exists
INSERT INTO "User" (
    "id", 
    "email", 
    "name_en", 
    "name_ar", 
    "type", 
    "role", 
    "status", 
    "subscriptionPlan", 
    "contactMethods"
)
VALUES (
    'individual-listings', 
    'listings@onlyhelio.com', 
    'Individual Listings', 
    'عقارات الأفراد', 
    'agency', 
    'AGENCY_PARTNER', 
    'active', 
    'basic', 
    '{"whatsapp": {"enabled": false}, "phone": {"enabled": false}, "form": {"enabled": true}}'::jsonb
)
ON CONFLICT ("id") DO NOTHING;
