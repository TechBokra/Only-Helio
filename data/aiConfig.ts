
import type { AIEstimatorConfig } from '../types';

export let aiEstimatorConfigData: AIEstimatorConfig = {
    model: 'gemini-2.5-flash',
    prompt: `Act as an expert Egyptian quantity surveyor.`,
    options: {},
    supervisionRate: 15,
    globalNotes: {
        ar: "هذا التقدير تقريبي ويشمل متوسط أسعار السوق للمواد والمصنعية. الأسعار النهائية قد تختلف بناءً على جودة الخامات المختارة وظروف الموقع.",
        en: "This is an approximate estimate including average market rates for materials and labor. Final prices may vary based on material quality and site conditions."
    },
    stages: [
        {
            id: 'stage-1',
            name: { ar: 'أعمال التأسيس', en: 'Foundation Works' },
            basicItems: [
                { id: 'item-1-1', name: { ar: 'المحارة', en: 'Plastering' }, unit: { ar: 'م²', en: 'm²' }, minPrice: 100, maxPrice: 140, minLabor: 40, maxLabor: 60 },
                { id: 'item-1-2', name: { ar: 'السباكة (تأسيس)', en: 'Plumbing (Piping)' }, unit: { ar: 'نقطة', en: 'Point' }, minPrice: 700, maxPrice: 900, minLabor: 200, maxLabor: 300 },
                { id: 'item-1-3', name: { ar: 'الكهرباء (تأسيس)', en: 'Electrical (Wiring)' }, unit: { ar: 'نقطة', en: 'Point' }, minPrice: 500, maxPrice: 650, minLabor: 150, maxLabor: 200 },
                { id: 'item-1-4', name: { ar: 'العزل (حمامات ومطبخ)', en: 'Insulation (Bath/Kitchen)' }, unit: { ar: 'م²', en: 'm²' }, minPrice: 130, maxPrice: 180, minLabor: 40, maxLabor: 60 },
            ],
            optionalItems: [
                { id: 'item-1-5', name: { ar: 'عزل صوتي/حراري', en: 'Acoustic/Thermal Insulation' }, unit: { ar: 'م²', en: 'm²' }, minPrice: 200, maxPrice: 300, minLabor: 50, maxLabor: 80 },
            ]
        },
        {
            id: 'stage-2',
            name: { ar: 'الأرضيات والحوائط', en: 'Flooring and Walls' },
            basicItems: [
                { id: 'item-2-1', name: { ar: 'تركيب سيراميك/بورسلين', en: 'Ceramic/Porcelain Installation' }, unit: { ar: 'م²', en: 'm²' }, minPrice: 70, maxPrice: 110, minLabor: 50, maxLabor: 80 },
                { id: 'item-2-2', name: { ar: 'دهانات', en: 'Paints' }, unit: { ar: 'م²', en: 'm²' }, minPrice: 80, maxPrice: 120, minLabor: 40, maxLabor: 60 },
            ],
            optionalItems: [
                { id: 'item-2-3', name: { ar: 'باركيه HDF', en: 'HDF Parquet' }, unit: { ar: 'م²', en: 'm²' }, minPrice: 400, maxPrice: 550, minLabor: 30, maxLabor: 50 },
                { id: 'item-2-5', name: { ar: 'بانوهات حوائط', en: 'Wall Panels (Panou)' }, unit: { ar: 'م.ط', en: 'm' }, minPrice: 150, maxPrice: 220, minLabor: 60, maxLabor: 90 },
            ]
        },
        {
            id: 'stage-3',
            name: { ar: 'الأسقف', en: 'Ceilings' },
            basicItems: [
                { id: 'item-3-1', name: { ar: 'جبس بورد فلات', en: 'Flat Gypsum Board' }, unit: { ar: 'م²', en: 'm²' }, minPrice: 250, maxPrice: 320, minLabor: 80, maxLabor: 110 },
            ],
            optionalItems: [
                { id: 'item-3-2', name: { ar: 'بيت نور', en: 'Cove Lighting' }, unit: { ar: 'م.ط', en: 'm' }, minPrice: 120, maxPrice: 180, minLabor: 50, maxLabor: 70 },
            ]
        },
    ]
};
