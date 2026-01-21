
import type { PortfolioItem } from '../types';

export let portfolioData: PortfolioItem[] = [
    {
        id: 'port-1',
        partnerId: 'finish-partner-1',
        title: {
            en: 'Modern Living Room Design',
            ar: 'تصميم غرفة معيشة مودرن'
        },
        category: {
            en: 'Interior Design',
            ar: 'تصميم داخلي'
        },
        imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=800&fit=crop',
        alt: 'Modern living room with grey sofa and warm lighting',
        price: 15000,
        availability: 'Made to Order',
        createdAt: new Date().toISOString()
    }
];
