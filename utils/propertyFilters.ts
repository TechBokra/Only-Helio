
import type { Property, PropertyFiltersType } from '../types';

export const filterProperties = (properties: Property[], filters: PropertyFiltersType): Property[] => {
    // FIX: Return empty array if inputs are invalid to prevent crashes
    if (!properties || !Array.isArray(properties)) return [];
    if (!filters) return properties; // Return all properties if no filters provided
    
    return properties.filter(p => {
        // Safety check: Ensure property object exists before accessing fields
        if (!p) return false;

        const statusMatch = filters.status === 'all' || (p.status && p.status.en === filters.status);
        const typeMatch = filters.type === 'all' || (p.type && p.type.en === filters.type);
        const projectMatch = filters.project === 'all' || p.projectId === filters.project;
        
        const queryMatch = !filters.query || 
            (p.title && p.title.ar && p.title.ar.toLowerCase().includes(filters.query.toLowerCase())) ||
            (p.title && p.title.en && p.title.en.toLowerCase().includes(filters.query.toLowerCase())) ||
            (p.address && p.address.ar && p.address.ar.toLowerCase().includes(filters.query.toLowerCase())) ||
            (p.address && p.address.en && p.address.en.toLowerCase().includes(filters.query.toLowerCase())) ||
            (p.partnerName && p.partnerName.toLowerCase().includes(filters.query.toLowerCase())) || false;

        const minPrice = parseInt(filters.minPrice, 10);
        const maxPrice = parseInt(filters.maxPrice, 10);
        const priceMatch = (!minPrice || (p.priceNumeric || 0) >= minPrice) && (!maxPrice || (p.priceNumeric || 0) <= maxPrice);

        const finishingMatch = filters.finishing === 'all' || (p.finishingStatus && p.finishingStatus.en === filters.finishing);

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
        
        const amenitiesMatch = !filters.amenities || filters.amenities.length === 0 || (p.amenities && p.amenities.en && filters.amenities.every((amenity: string) => p.amenities.en.includes(amenity)));

        // Check specifically for beds/baths to prevent "reading 'beds' of undefined"
        // Safe access to ensure p is not undefined in closure (though covered by top check)
        // Also ensuring we are checking against a defined filter value
        const bedsMatch = !filters.beds || (p.beds !== undefined && p.beds >= parseInt(filters.beds, 10));
        const bathsMatch = !filters.baths || (p.baths !== undefined && p.baths >= parseInt(filters.baths, 10));

        return statusMatch && typeMatch && queryMatch && priceMatch && finishingMatch && installmentsMatch && realEstateFinanceMatch && floorMatch && compoundMatch && deliveryMatch && amenitiesMatch && projectMatch && bedsMatch && bathsMatch;
    });
};
