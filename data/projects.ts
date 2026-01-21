
import type { Project } from '../types';

export let projectsData: Project[] = [
    {
        id: 'project-1',
        partnerId: 'dev-partner-1',
        name: {
            en: 'Helio Gardens Compound',
            ar: 'كمبوند حدائق هليوبوليس'
        },
        description: {
            en: 'A luxury residential compound featuring vast green spaces, modern amenities, and a prime location in the heart of New Heliopolis. The project offers a variety of unit types including apartments, duplexes, and penthouses.',
            ar: 'مجمع سكني فاخر يتميز بمساحات خضراء واسعة، خدمات عصرية، وموقع متميز في قلب هليوبوليس الجديدة. يقدم المشروع مجموعة متنوعة من الوحدات السكنية بما في ذلك الشقق والدوبلكس والبنتهاوس.'
        },
        imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=800&fit=crop',
        features: [
            { icon: 'ParkIcon', text: { en: 'Large Parks', ar: 'حدائق واسعة' } },
            { icon: 'SwimmingPoolIcon', text: { en: 'Swimming Pools', ar: 'حمامات سباحة' } },
            { icon: 'SecurityIcon', text: { en: '24/7 Security', ar: 'أمن وحراسة' } },
            { icon: 'ShoppingIcon', text: { en: 'Commercial Area', ar: 'منطقة تجارية' } }
        ],
        createdAt: new Date().toISOString(),
    }
];
