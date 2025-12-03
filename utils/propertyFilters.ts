import type { Property, PropertyFiltersType } from '../types';

export const filterProperties = (properties: Property[], filters: PropertyFiltersType): Property[] => {
    if (!properties || !Array.isArray(properties)) return [];
    if (!filters) return properties; 
    
    return properties.filter(p => {
        if (!p) return false;

        // Safe checks for each filter
        const statusMatch = filters.status === 'all' || (p.status && p.status.en === filters.status);
        const typeMatch = filters.type === 'all' || (p.type && p.type.en === filters.type);
        const projectMatch = filters.project === 'all' || p.projectId === filters.project;
        const finishingMatch = filters.finishing === 'all' || (p.finishingStatus && p.finishingStatus.en === filters.finishing);

        // Number checks (Ensure valid numbers)
        const minPrice = Number(filters.minPrice) || 0;
        const maxPrice = Number(filters.maxPrice) || 0;
        const propPrice = p.priceNumeric || 0;
        
        const priceMatch = (minPrice === 0 || propPrice >= minPrice) && 
                           (maxPrice === 0 || propPrice <= maxPrice);

        const minBeds = Number(filters.beds) || 0;
        const bedsMatch = minBeds === 0 || (p.beds !== undefined && p.beds >= minBeds);

        const minBaths = Number(filters.baths) || 0;
        const bathsMatch = minBaths === 0 || (p.baths !== undefined && p.baths >= minBaths);
        
        // Amenities Check (AND logic: property must have ALL selected amenities)
        let amenitiesMatch = true;
        if (filters.amenities && filters.amenities.length > 0) {
            const propertyAmenitiesEn = p.amenities?.en || [];
            // We check against the English keys of amenities
            amenitiesMatch = filters.amenities.every(selectedAmenity => 
                propertyAmenitiesEn.includes(selectedAmenity)
            );
        }

        // Search Query
        let queryMatch = true;
        if (filters.query) {
            const q = filters.query.toLowerCase();
            queryMatch = 
                (p.title?.ar?.toLowerCase().includes(q) || false) ||
                (p.title?.en?.toLowerCase().includes(q) || false) ||
                (p.address?.ar?.toLowerCase().includes(q) || false) ||
                (p.address?.en?.toLowerCase().includes(q) || false) ||
                (p.partnerName?.toLowerCase().includes(q) || false);
        }

        return statusMatch && typeMatch && queryMatch && priceMatch && finishingMatch && projectMatch && bedsMatch && bathsMatch && amenitiesMatch;
    });
};