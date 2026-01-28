
-- Create Lookup Table for Project Types
CREATE TABLE IF NOT EXISTS "ProjectTypeDefinition" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "name_en" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL
);

-- Seed Initial Data (Previously Hardcoded)
INSERT INTO "ProjectTypeDefinition" (name_en, name_ar)
VALUES 
('Compound', 'كمبوند'),
('Commercial Mall', 'مول تجاري'),
('Residential Building', 'مبنى سكني'),
('Mixed Use', 'متعدد الاستخدامات')
ON CONFLICT DO NOTHING;
