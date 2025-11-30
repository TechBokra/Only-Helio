

import type { AIEstimatorConfig } from '../types';

export let aiEstimatorConfigData: AIEstimatorConfig = {
    model: 'gemini-2.5-flash',
    prompt: `Act as an expert Egyptian quantity surveyor and pricing engineer using 2024 local Egyptian market prices for materials and labor.
Based on the following requirements for a finishing project in Egypt, provide a detailed cost estimation in Egyptian Pounds (EGP).
Your response must be a JSON object.`,
    options: {
        flooring: [
            { key: 'porcelain', en: 'Porcelain', ar: 'بورسلين' },
            { key: 'ceramic', en: 'Ceramic', ar: 'سيراميك' },
            { key: 'hdf', en: 'HDF', ar: 'HDF' },
            { key: 'marble', en: 'Marble', ar: 'رخام' },
        ],
        walls: [
            { key: 'paint', en: 'Paint', ar: 'دهانات' },
            { key: 'wallpaper', en: 'Wallpaper', ar: 'ورق حائط' },
            { key: 'wood_alternative', en: 'Wood/Marble Alternative', ar: 'بديل خشب/رخام' },
        ],
        ceiling: [
            { key: 'paint_only', en: 'Paint Only', ar: 'دهان فقط' },
            { key: 'gypsum_simple', en: 'Simple Gypsum Board', ar: 'جبسون بورد تصميم بسيط' },
            { key: 'gypsum_complex', en: 'Complex Gypsum Board', ar: 'جبسون بورد تصميم معقد' },
        ],
        electrical: [
            { key: 'standard', en: 'Standard Wiring', ar: 'تأسيس عادي' },
            { key: 'smart_home', en: 'Smart Home Wiring', ar: 'تأسيس سمارت هوم' },
        ],
        plumbing: [
            { key: 'standard', en: 'Standard Plumbing', ar: 'تأسيس عادي' },
            { key: 'suspended', en: 'Suspended Plumbing', ar: 'تأسيس معلق' },
        ],
    },
    stages: [
        {
            id: 'stage-1',
            name: { ar: 'أعمال التأسيس', en: 'Foundation Works' },
            basicItems: [
                { id: 'item-1-1', name: { ar: 'المحارة', en: 'Plastering' }, unit: { ar: 'م²', en: 'm²' }, price: 120 },
                { id: 'item-1-2', name: { ar: 'السباكة (تأسيس)', en: 'Plumbing (Piping)' }, unit: { ar: 'نقطة', en: 'Point' }, price: 800 },
                { id: 'item-1-3', name: { ar: 'الكهرباء (تأسيس)', en: 'Electrical (Wiring)' }, unit: { ar: 'نقطة', en: 'Point' }, price: 550 },
                { id: 'item-1-4', name: { ar: 'العزل (حمامات ومطبخ)', en: 'Insulation (Bath/Kitchen)' }, unit: { ar: 'م²', en: 'm²' }, price: 150 },
            ],
            optionalItems: [
                { id: 'item-1-5', name: { ar: 'عزل صوتي/حراري', en: 'Acoustic/Thermal Insulation' }, unit: { ar: 'م²', en: 'm²' }, price: 250 },
                { id: 'item-1-6', name: { ar: 'تمديدات سمارت هوم', en: 'Smart Home Wiring' }, unit: { ar: 'نقطة', en: 'Point' }, price: 900 },
            ]
        },
        {
            id: 'stage-2',
            name: { ar: 'الأرضيات والحوائط', en: 'Flooring and Walls' },
            basicItems: [
                { id: 'item-2-1', name: { ar: 'تركيب سيراميك/بورسلين', en: 'Ceramic/Porcelain Installation' }, unit: { ar: 'م²', en: 'm²' }, price: 80 },
                { id: 'item-2-2', name: { ar: 'دهانات', en: 'Paints' }, unit: { ar: 'م²', en: 'm²' }, price: 90 },
            ],
            optionalItems: [
                { id: 'item-2-3', name: { ar: 'باركيه HDF', en: 'HDF Parquet' }, unit: { ar: 'م²', en: 'm²' }, price: 450 },
                { id: 'item-2-4', name: { ar: 'ميكروسيمنت', en: 'Microcement' }, unit: { ar: 'م²', en: 'm²' }, price: 600 },
                { id: 'item-2-5', name: { ar: 'بانوهات حوائط', en: 'Wall Panels (Panou)' }, unit: { ar: 'م.ط', en: 'm' }, price: 180 },
                { id: 'item-2-6', name: { ar: 'ورق حائط', en: 'Wallpaper' }, unit: { ar: 'م²', en: 'm²' }, price: 150 },
            ]
        },
        {
            id: 'stage-3',
            name: { ar: 'الأسقف', en: 'Ceilings' },
            basicItems: [
                { id: 'item-3-1', name: { ar: 'جبس بورد فلات', en: 'Flat Gypsum Board' }, unit: { ar: 'م²', en: 'm²' }, price: 280 },
            ],
            optionalItems: [
                { id: 'item-3-2', name: { ar: 'بيت نور', en: 'Cove Lighting' }, unit: { ar: 'م.ط', en: 'm' }, price: 150 },
                { id: 'item-3-3', name: { ar: 'زخارف جبسية', en: 'Gypsum Ornaments' }, unit: { ar: 'قطعة', en: 'Piece' }, price: 300 },
                { id: 'item-3-4', name: { ar: 'إضاءة مخفية LED', en: 'Hidden LED Lighting' }, unit: { ar: 'م.ط', en: 'm' }, price: 120 },
            ]
        },
        {
            id: 'stage-4',
            name: { ar: 'النجارة الداخلية', en: 'Internal Carpentry' },
            basicItems: [
                { id: 'item-4-1', name: { ar: 'أبواب داخلية', en: 'Internal Doors' }, unit: { ar: 'باب', en: 'Door' }, price: 4500 },
                { id: 'item-4-2', name: { ar: 'خزائن مطبخ (خشب)', en: 'Kitchen Cabinets (Wood)' }, unit: { ar: 'م.ط', en: 'm' }, price: 3000 },
            ],
            optionalItems: [
                { id: 'item-4-3', name: { ar: 'دواليب غرف نوم', en: 'Bedroom Wardrobes' }, unit: { ar: 'م²', en: 'm²' }, price: 2500 },
                { id: 'item-4-4', name: { ar: 'غرفة ملابس Walk-in', en: 'Walk-in Closet' }, unit: { ar: 'م²', en: 'm²' }, price: 3500 },
            ]
        },
        {
            id: 'stage-5',
            name: { ar: 'الكهرباء والتقنية', en: 'Electrical and Technical' },
            basicItems: [
                { id: 'item-5-1', name: { ar: 'مفاتيح وبرايز', en: 'Switches and Sockets' }, unit: { ar: 'نقطة', en: 'Point' }, price: 250 },
                { id: 'item-5-2', name: { ar: 'لوحة توزيع', en: 'Distribution Panel' }, unit: { ar: 'لوحة', en: 'Panel' }, price: 2000 },
            ],
            optionalItems: [
                { id: 'item-5-3', name: { ar: 'سماعات سقفية', en: 'Ceiling Speakers' }, unit: { ar: 'سماعة', en: 'Speaker' }, price: 1200 },
                { id: 'item-5-4', name: { ar: 'نظام كاميرات مراقبة', en: 'CCTV System' }, unit: { ar: 'كاميرا', en: 'Camera' }, price: 1500 },
            ]
        },
        {
            id: 'stage-6',
            name: { ar: 'السباكة والتشطيب الصحي', en: 'Plumbing and Sanitary' },
            basicItems: [
                { id: 'item-6-1', name: { ar: 'طقم حمام (قاعدة وحوض)', en: 'Bathroom Set (Toilet & Sink)' }, unit: { ar: 'طقم', en: 'Set' }, price: 5000 },
                { id: 'item-6-2', name: { ar: 'خلاطات', en: 'Mixers' }, unit: { ar: 'خلاط', en: 'Mixer' }, price: 1500 },
            ],
            optionalItems: [
                { id: 'item-6-3', name: { ar: 'جاكوزي', en: 'Jacuzzi' }, unit: { ar: 'وحدة', en: 'Unit' }, price: 25000 },
                { id: 'item-6-4', name: { ar: 'دش سما', en: 'Rain Shower' }, unit: { ar: 'وحدة', en: 'Unit' }, price: 7000 },
                { id: 'item-6-5', name: { ar: 'تسخين أرضي', en: 'Underfloor Heating' }, unit: { ar: 'م²', en: 'm²' }, price: 800 },
            ]
        },
    ]
};
