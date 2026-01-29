
import type { Property } from '../types';

export let propertiesData: Property[] = [
    {
        id: 'prop-1',
        partnerId: 'dev-partner-1',
        projectId: 'project-1',
        title: {
            en: 'Luxury Apartment with Garden View',
            ar: 'شقة فاخرة تطل على الحديقة'
        },
        description: {
            en: 'Beautiful apartment in the heart of Helio Gardens. Features spacious rooms and a large balcony overlooking the central park.',
            ar: 'شقة جميلة في قلب حدائق هليوبوليس. تتميز بغرف واسعة وشرفة كبيرة تطل على الحديقة المركزية.'
        },
        address: {
            en: 'Helio Gardens, District 5',
            ar: 'حدائق هليوبوليس، الحي الخامس'
        },
        price: {
            en: '3,500,000 EGP',
            ar: '3,500,000 ج.م'
        },
        priceNumeric: 3500000,
        area: 180,
        type: { en: 'Apartment', ar: 'شقة' },
        status: { en: 'For Sale', ar: 'للبيع' },
        listingStatus: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
        ],
        beds: 3,
        baths: 2,
        floor: 2,
        finishingStatus: { en: 'Semi-finished', ar: 'نصف تشطيب' },
        isInCompound: true,
        installmentsAvailable: true,
        realEstateFinanceAvailable: true,
        delivery: { isImmediate: false, date: '2025-06' },
        location: { lat: 30.115, lng: 31.630 },
        amenities: {
            en: ['Balcony', 'Security', 'Shared Health Club', 'Elevator'],
            ar: []
        },
        installments: {
            downPayment: 350000,
            monthlyInstallment: 25000,
            years: 5
        },
        contactMethod: 'platform',
        createdAt: new Date().toISOString()
    },
    {
        id: 'prop-2',
        partnerId: 'agency-partner-1',
        title: {
            en: 'Standalone Villa for Resale',
            ar: 'فيلا مستقلة إعادة بيع'
        },
        description: {
            en: 'Spacious villa with private pool and garden in a quiet neighborhood. Immediate delivery.',
            ar: 'فيلا واسعة مع حمام سباحة خاص وحديقة في حي هادئ. استلام فوري.'
        },
        address: {
            en: 'District 3, New Heliopolis',
            ar: 'الحي الثالث، هليوبوليس الجديدة'
        },
        price: {
            en: '8,200,000 EGP',
            ar: '8,200,000 ج.م'
        },
        priceNumeric: 8200000,
        area: 450,
        type: { en: 'Villa', ar: 'فيلا' },
        status: { en: 'For Sale', ar: 'للبيع' },
        listingStatus: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&h=800&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop'
        ],
        beds: 5,
        baths: 4,
        finishingStatus: { en: 'Core & Shell', ar: 'بدون تشطيب' },
        isInCompound: false,
        installmentsAvailable: false,
        realEstateFinanceAvailable: false,
        delivery: { isImmediate: true },
        location: { lat: 30.120, lng: 31.640 },
        amenities: {
            en: ['Private Garden', 'Swimming Pool', 'Private Garage', 'Maid\'s Room'],
            ar: []
        },
        contactMethod: 'platform',
        createdAt: new Date().toISOString()
    },
    {
        id: 'prop-3',
        partnerId: 'individual-listings',
        title: {
            en: 'Prime Commercial Space',
            ar: 'مساحة تجارية مميزة'
        },
        description: {
            en: 'Ideally located shop on the main street, perfect for retail or cafe.',
            ar: 'محل بموقع مثالي على الشارع الرئيسي، مثالي لنشاط تجاري أو كافيه.'
        },
        address: {
            en: 'Central Axis',
            ar: 'المحور المركزي'
        },
        price: {
            en: '5,000,000 EGP',
            ar: '5,000,000 ج.م'
        },
        priceNumeric: 5000000,
        area: 90,
        type: { en: 'Commercial', ar: 'تجاري' },
        status: { en: 'For Sale', ar: 'للبيع' },
        listingStatus: 'active',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800&fit=crop',
        gallery: [],
        beds: 0,
        baths: 1,
        finishingStatus: { en: 'Core & Shell', ar: 'بدون تشطيب' },
        isInCompound: false,
        installmentsAvailable: false,
        realEstateFinanceAvailable: false,
        delivery: { isImmediate: true },
        location: { lat: 30.105, lng: 31.610 },
        amenities: {
            en: ['Frontage on a Main Street', 'Parking'],
            ar: []
        },
        contactMethod: 'platform',
        createdAt: new Date().toISOString()
    }
];