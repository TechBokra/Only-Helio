
import type { Property, PropertyFiltersType } from '../types';

export const filterProperties = (properties: Property[], filters: PropertyFiltersType): Property[] => {
    return properties.filter(p => {
        const statusMatch = filters.status === 'all' || p.status.en === filters.status;
        const typeMatch = filters.type === 'all' || p.type.en === filters.type;
        const projectMatch = filters.project === 'all' || p.projectId === filters.project;
        
        const queryMatch = !filters.query || 
            p.title.ar.toLowerCase().includes(filters.query.toLowerCase()) ||
            p.title.en.toLowerCase().includes(filters.query.toLowerCase()) ||
            p.address.ar.toLowerCase().includes(filters.query.toLowerCase()) ||
            p.address.en.toLowerCase().includes(filters.query.toLowerCase()) ||
            (p.partnerName && p.partnerName.toLowerCase().includes(filters.query.toLowerCase())) || false;

        const minPrice = parseInt(filters.minPrice, 10);
        const maxPrice = parseInt(filters.maxPrice, 10);
        const priceMatch = (!minPrice || p.priceNumeric >= minPrice) && (!maxPrice || p.priceNumeric <= maxPrice);

        const finishingMatch = filters.finishing === 'all' || p.finishingStatus?.en === filters.finishing;

        const installmentsMatch = filters.installments === 'all' ||
            (filters.installments === 'yes' && p.installmentsAvailable) ||
            (filters.installments === 'no' && !p.installmentsAvailable);
        
        const realEstateFinanceMatch = filters.realEstateFinance === 'all' ||
            (filters.realEstateFinance === 'yes' && p.realEstateFinanceAvailable) ||
            (filters.realEstateFinance === 'no' && !p.realEstateFinanceAvailable);

        const floorMatch = !filters.floor || (p.floor !== undefined && p.floor === parseInt(filters.floor, 10));

        const compoundMatch = filters.compound === 'all' || 
            (filters.compound === 'yes' && p.isInCompound) ||
            (filters.compound === 'no' && !p.isInCompound);

        const deliveryMatch = filters.delivery === 'all' ||
            (filters.delivery === 'immediate' && p.delivery?.isImmediate);
        
        const amenitiesMatch = filters.amenities.length === 0 || filters.amenities.every((amenity: string) => p.amenities.en.includes(amenity));

        const bedsMatch = !filters.beds || p.beds >= parseInt(filters.beds, 10);
        const bathsMatch = !filters.baths || p.baths >= parseInt(filters.baths, 10);

        return statusMatch && typeMatch && queryMatch && priceMatch && finishingMatch && installmentsMatch && realEstateFinanceMatch && floorMatch && compoundMatch && deliveryMatch && amenitiesMatch && projectMatch && bedsMatch && bathsMatch;
    });
};
