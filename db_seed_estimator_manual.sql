
-- ====================================================================================
-- ONLY HELIO - MANUAL ESTIMATOR CONFIG SEED (2025 Market Prices + Tiers)
-- ====================================================================================

INSERT INTO "SystemSetting" ("key", "group", "value")
VALUES (
    'ai_estimator_config',
    'ai',
    '{
        "model": "gemini-2.5-flash",
        "prompt": "Act as an expert Egyptian quantity surveyor.",
        "options": {},
        "supervisionRate": 15,
        "globalNotes": {
            "ar": "الأسعار الموضحة هي متوسطات سوقية تقديرية لعام 2025 (القاهرة الجديدة). تشمل التكلفة المواد والمصنعية والنقل. قد تختلف الأسعار الفعلية بنسبة 10-15% بناءً على نوع التشطيب المختار وظروف الموقع.",
            "en": "Prices shown are estimated 2025 market averages (New Cairo). Costs include materials, labor, and transport. Actual prices may vary by 10-15% depending on finishing tier and site conditions."
        },
        "tiers": [
            { "id": "economy", "name": { "ar": "اقتصادي", "en": "Economy" }, "description": { "ar": "خامات محلية جيدة - أساسيات", "en": "Good local materials - Essentials" }, "multiplier": 0.85 },
            { "id": "standard", "name": { "ar": "سوبر لوكس (قياسي)", "en": "Standard (Super Lux)" }, "description": { "ar": "المستوى الشائع، توازن بين الجودة والسعر", "en": "Common standard, balance between quality and price" }, "multiplier": 1.0 },
            { "id": "ultra", "name": { "ar": "الترا لوكس", "en": "Ultra Lux" }, "description": { "ar": "خامات عالية الجودة، بورسلين، جبس بورد كامل", "en": "High quality materials, porcelain, full gypsum board" }, "multiplier": 1.35 },
            { "id": "vip", "name": { "ar": "فندقي / VIP", "en": "VIP / Hotel Class" }, "description": { "ar": "أعلى مستوى، رخام، مستورد، سمارت هوم", "en": "Top tier, marble, imported, smart home" }, "multiplier": 1.8 }
        ],
        "lastUpdated": "2025-01-01T12:00:00.000Z",
        "stages": [
            {
                "id": "stage-foundation",
                "name": { "ar": "أعمال التأسيس والبنية التحتية", "en": "Foundation & Infrastructure" },
                "basicItems": [
                    { "id": "item-plumbing", "name": { "ar": "تأسيس سباكة (مواسير وعزل)", "en": "Plumbing Foundation" }, "unit": { "ar": "نقطة", "en": "Point" }, "minPrice": 1200, "maxPrice": 1800, "minLabor": 300, "maxLabor": 500 },
                    { "id": "item-electric", "name": { "ar": "تأسيس كهرباء (خراطيم وأسلاك)", "en": "Electrical Foundation" }, "unit": { "ar": "نقطة", "en": "Point" }, "minPrice": 800, "maxPrice": 1200, "minLabor": 200, "maxLabor": 350 },
                    { "id": "item-ac", "name": { "ar": "تجهيز مواسير التكييف (فريون)", "en": "AC Piping Prep" }, "unit": { "ar": "م.ط", "en": "m" }, "minPrice": 900, "maxPrice": 1400, "minLabor": 200, "maxLabor": 300 },
                    { "id": "item-plaster", "name": { "ar": "أعمال المحارة (بياض)", "en": "Plastering" }, "unit": { "ar": "م²", "en": "m²" }, "minPrice": 160, "maxPrice": 220, "minLabor": 60, "maxLabor": 90 }
                ],
                "optionalItems": [
                    { "id": "item-smart", "name": { "ar": "تأسيس سمارت هوم", "en": "Smart Home Wiring" }, "unit": { "ar": "نقطة", "en": "Point" }, "minPrice": 1500, "maxPrice": 2500, "minLabor": 400, "maxLabor": 600 }
                ]
            },
            {
                "id": "stage-flooring",
                "name": { "ar": "الأرضيات والحوائط", "en": "Flooring & Walls" },
                "basicItems": [
                    { "id": "item-ceramic", "name": { "ar": "سيراميك (توريد وتركيب)", "en": "Ceramic Tiles" }, "unit": { "ar": "م²", "en": "m²" }, "minPrice": 350, "maxPrice": 600, "minLabor": 90, "maxLabor": 120 },
                    { "id": "item-porcelain", "name": { "ar": "بورسلين (توريد وتركيب)", "en": "Porcelain Tiles" }, "unit": { "ar": "م²", "en": "m²" }, "minPrice": 650, "maxPrice": 1200, "minLabor": 120, "maxLabor": 180 },
                    { "id": "item-paint", "name": { "ar": "دهانات (تأسيس وتشطيب)", "en": "Painting (Full)" }, "unit": { "ar": "م²", "en": "m²" }, "minPrice": 180, "maxPrice": 350, "minLabor": 80, "maxLabor": 150 }
                ],
                "optionalItems": [
                    { "id": "item-hfd", "name": { "ar": "أرضيات HDF", "en": "HDF Flooring" }, "unit": { "ar": "م²", "en": "m²" }, "minPrice": 500, "maxPrice": 900, "minLabor": 50, "maxLabor": 80 },
                    { "id": "item-marble", "name": { "ar": "رخام (توريد وتركيب)", "en": "Marble Flooring" }, "unit": { "ar": "م²", "en": "m²" }, "minPrice": 1500, "maxPrice": 3500, "minLabor": 200, "maxLabor": 400 }
                ]
            },
            {
                "id": "stage-ceiling",
                "name": { "ar": "الأسقف والجبس", "en": "Ceilings & Gypsum" },
                "basicItems": [
                    { "id": "item-cornice", "name": { "ar": "كرانيش فيوتك", "en": "Cornices" }, "unit": { "ar": "م.ط", "en": "m" }, "minPrice": 80, "maxPrice": 150, "minLabor": 30, "maxLabor": 50 }
                ],
                "optionalItems": [
                    { "id": "item-flat-slab", "name": { "ar": "جبس بورد (فلات)", "en": "Flat Gypsum Board" }, "unit": { "ar": "م²", "en": "m²" }, "minPrice": 350, "maxPrice": 550, "minLabor": 100, "maxLabor": 150 },
                    { "id": "item-cove", "name": { "ar": "بيت نور (جبس)", "en": "Cove Lighting Box" }, "unit": { "ar": "م.ط", "en": "m" }, "minPrice": 250, "maxPrice": 400, "minLabor": 80, "maxLabor": 120 }
                ]
            },
            {
                "id": "stage-finishing",
                "name": { "ar": "التشطيبات النهائية والتركيبات", "en": "Final Fixtures" },
                "basicItems": [
                    { "id": "item-doors", "name": { "ar": "أبواب داخلية (جاهزة)", "en": "Interior Doors" }, "unit": { "ar": "باب", "en": "Door" }, "minPrice": 4000, "maxPrice": 8000, "minLabor": 300, "maxLabor": 500 },
                    { "id": "item-alum", "name": { "ar": "شبابيك ألوميتال", "en": "Aluminum Windows" }, "unit": { "ar": "م²", "en": "m²" }, "minPrice": 3500, "maxPrice": 6000, "minLabor": 0, "maxLabor": 0 }
                ],
                "optionalItems": [
                    { "id": "item-spotlights", "name": { "ar": "سبوت لايت (شامل)", "en": "Spotlights (Full)" }, "unit": { "ar": "قطعة", "en": "Piece" }, "minPrice": 250, "maxPrice": 600, "minLabor": 50, "maxLabor": 100 }
                ]
            }
        ]
    }'::jsonb
)
ON CONFLICT ("key") 
DO UPDATE SET "value" = EXCLUDED.value;
