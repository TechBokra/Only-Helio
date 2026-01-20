-- استعلام محسن لعرض هيكل قاعدة البيانات (جداول، أعمدة، مفاتيح أساسية وأجنبية)
-- يتجنب التكرار في حالة المفاتيح المركبة ويعرض المعلومات بشكل منظم في صف واحد لكل عمود

SELECT
    c.table_name AS "اسم_الجدول",
    c.column_name AS "اسم_العمود",
    c.data_type AS "نوع_البيانات",
    c.is_nullable AS "يقبل_فراغ",
    
    -- هل هو مفتاح أساسي؟
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'نعم' 
        ELSE '' 
    END AS "مفتاح_أساسي",

    -- تفاصيل المفتاح الأجنبي (إن وجد)
    CASE 
        WHEN fk.column_name IS NOT NULL THEN fk.target_table || '.' || fk.target_column
        ELSE '' 
    END AS "مفتاح_أجنبي"

FROM information_schema.columns c

-- ربط فرعي للحصول على المفاتيح الأساسية (Primary Keys)
LEFT JOIN (
    SELECT kcu.table_schema, kcu.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name 
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_schema = pk.table_schema 
    AND c.table_name = pk.table_name 
    AND c.column_name = pk.column_name

-- ربط فرعي للحصول على المفاتيح الأجنبية (Foreign Keys)
LEFT JOIN (
    SELECT 
        kcu.table_schema, 
        kcu.table_name, 
        kcu.column_name, 
        ccu.table_name AS target_table, 
        ccu.column_name AS target_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name 
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu 
      ON tc.constraint_name = ccu.constraint_name 
      AND tc.table_schema = ccu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_schema = fk.table_schema 
    AND c.table_name = fk.table_name 
    AND c.column_name = fk.column_name

WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;
