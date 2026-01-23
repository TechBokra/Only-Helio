
-- ====================================================================================
-- ONLY HELIO - ENRICH HOME PAGE CONTENT
-- ====================================================================================

UPDATE "SystemSetting"
SET "value" = jsonb_set(
    "value",
    '{hero}',
    '{
        "ar": { 
            "title": "استثمر في مستقبلك في هليوبوليس الجديدة", 
            "subtitle": "المنصة العقارية الأولى المتخصصة في مدينة هليوبوليس الجديدة. نجمع لك أرقى العقارات، أفضل المطورين، وخدمات التشطيب المتكاملة في مكان واحد." 
        },
        "en": { 
            "title": "Invest in Your Future in New Heliopolis", 
            "subtitle": "The premier real estate platform dedicated to New Heliopolis City. Bringing you the finest properties, top developers, and integrated finishing services in one place." 
        },
        "images": [
            { "src": "https://images.unsplash.com/photo-1600596542815-2a429ad22b72?q=80&w=2000&auto=format&fit=crop", "alt": {"ar": "فيلا فاخرة", "en": "Luxury Villa"} },
            { "src": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop", "alt": {"ar": "تصميم داخلي مودرن", "en": "Modern Interior"} },
            { "src": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000&auto=format&fit=crop", "alt": {"ar": "حدائق ومساحات خضراء", "en": "Green Spaces"} }
        ]
    }'::jsonb
)
WHERE "key" = 'site_content_v1';

UPDATE "SystemSetting"
SET "value" = jsonb_set(
    "value",
    '{whyNewHeliopolis}',
    '{
        "enabled": true,
        "ar": {
            "title": "لماذا هليوبوليس الجديدة؟",
            "location": {
                "title": "موقع استراتيجي وحياة عصرية",
                "description": "تتميز هليوبوليس الجديدة بموقعها الفريد كهمزة وصل بين العاصمة الإدارية والقاهرة الجديدة. مدينة ذكية تتمتع بالتخطيط العمراني الراقي، المساحات الخضراء الشاسعة، والهدوء والخصوصية، مما يجعلها الوجهة الأمثل للسكن والاستثمار.",
                "stats": [
                    { "value": "15 دقيقة", "desc": "للعاصمة الإدارية" },
                    { "value": "25 دقيقة", "desc": "للتجمع الخامس" },
                    { "value": "40%", "desc": "مساحات خضراء" },
                    { "value": "24/7", "desc": "أمن وخدمات ذكية" }
                ]
            }
        },
        "en": {
            "title": "Why New Heliopolis?",
            "location": {
                "title": "Strategic Location & Modern Lifestyle",
                "description": "New Heliopolis stands out as a vital link between the New Capital and New Cairo. A smart city featuring sophisticated urban planning, vast green spaces, tranquility, and privacy, making it the ideal destination for living and investment.",
                "stats": [
                    { "value": "15 Mins", "desc": "To New Capital" },
                    { "value": "25 Mins", "desc": "To Fifth Settlement" },
                    { "value": "40%", "desc": "Green Areas" },
                    { "value": "24/7", "desc": "Security & Smart Services" }
                ]
            }
        },
        "images": [
            { "src": "https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1200", "alt": {"ar": "تخطيط عمراني", "en": "Urban Planning"} },
            { "src": "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1200", "alt": {"ar": "مدينة خضراء", "en": "Green City"} }
        ]
    }'::jsonb
)
WHERE "key" = 'site_content_v1';
