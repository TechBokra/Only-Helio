
-- ====================================================================================
-- ONLY HELIO - ENRICH WISDOM QUOTES
-- Safely appends new quotes to the existing 'quotes' array in 'site_content_v1'.
-- Checks if 'value' is a valid JSON object before attempting update to prevent errors.
-- ====================================================================================

UPDATE "SystemSetting"
SET "value" = jsonb_set(
    "value",
    '{quotes}',
    (
        COALESCE("value"->'quotes', '[]'::jsonb) || 
        '[
            {
                "quote": { "ar": "يجب أن تكون الفخامة مريحة، وإلا فهي ليست فخامة.", "en": "Luxury must be comfortable, otherwise it is not luxury." },
                "author": { "ar": "كوكو شانيل", "en": "Coco Chanel" }
            },
            {
                "quote": { "ar": "العقار لا يمكن فقدانه أو سرقته، ولا يمكن نقله. إنه أكثر الاستثمارات أمانًا في العالم.", "en": "Real estate cannot be lost or stolen, nor can it be carried away. It is about the safest investment in the world." },
                "author": { "ar": "فرانكلين روزفلت", "en": "Franklin D. Roosevelt" }
            },
            {
                "quote": { "ar": "التصميم ليس مجرد شكل، التصميم هو كيف يعمل الشيء.", "en": "Design is not just what it looks like and feels like. Design is how it works." },
                "author": { "ar": "ستيف جوبز", "en": "Steve Jobs" }
            },
            {
                "quote": { "ar": "المنزل هو المكان الذي تبدأ منه قصتك.", "en": "Home is where your story begins." },
                "author": { "ar": "آني دانييلسون", "en": "Annie Danielson" }
            },
            {
                "quote": { "ar": "نحن نشكل مبانينا، وبعد ذلك هي التي تشكلنا.", "en": "We shape our buildings; thereafter they shape us." },
                "author": { "ar": "ونستون تشرشل", "en": "Winston Churchill" }
            },
            {
                "quote": { "ar": "البساطة هي قمة الأناقة.", "en": "Simplicity is the ultimate sophistication." },
                "author": { "ar": "ليوناردو دافنشي", "en": "Leonardo da Vinci" }
            },
            {
                "quote": { "ar": "التصميم الداخلي هو الانعكاس الطبيعي للروح.", "en": "An interior is the natural projection of the soul." },
                "author": { "ar": "كوكو شانيل", "en": "Coco Chanel" }
            },
            {
                "quote": { "ar": "أفضل استثمار على الأرض هو الأرض نفسها.", "en": "The best investment on earth is earth." },
                "author": { "ar": "لويس غليكمان", "en": "Louis Glickman" }
            },
            {
                "quote": { "ar": "الضوء هو العنصر الأول في التصميم. بدونه لا يوجد لون أو شكل أو ملمس.", "en": "Light is the first element of design; without it there is no color, form, or texture." },
                "author": { "ar": "مجهول", "en": "Unknown" }
            },
            {
                "quote": { "ar": "كل غرفة تحتاج لمسة سوداء، تماماً كما تحتاج كل قصة لشخصية غامضة.", "en": "Every room needs a touch of black, just as it needs at least one antique piece." },
                "author": { "ar": "جان شو", "en": "Jan Showers" }
            },
            {
                "quote": { "ar": "التفاصيل ليست مجرد تفاصيل، إنها التصميم.", "en": "The details are not the details. They make the design." },
                "author": { "ar": "تشارلز ايمز", "en": "Charles Eames" }
            },
            {
                "quote": { "ar": "منزلك يجب أن يروي قصة من أنت، ويجمع كل ما تحب.", "en": "Your home should tell the story of who you are, and be a collection of what you love." },
                "author": { "ar": "نيت بيركوس", "en": "Nate Berkus" }
            }
        ]'::jsonb
    )
)
WHERE "key" = 'site_content_v1' 
  AND jsonb_typeof("value") = 'object';
