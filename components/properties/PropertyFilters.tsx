
import React, { useState, useMemo } from 'react';
import type { Project, AdminPartner, FilterOption } from '../../types';
import { SearchIcon, AdjustmentsHorizontalIcon, CloseIcon } from '../ui/Icons';
import type { usePropertyFilters } from '../../hooks/usePropertyFilters';
import { useLanguage } from '../shared/LanguageContext';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Checkbox } from '../ui/Checkbox';
import { Button } from '../ui/Button';

interface PropertyFiltersProps {
  filters: ReturnType<typeof usePropertyFilters>;
  projects: Project[];
  partners: AdminPartner[];
  propertyTypes: FilterOption[];
  finishingStatuses: FilterOption[];
  amenities: FilterOption[];
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  projects,
  partners,
  propertyTypes,
  finishingStatuses,
  amenities,
}) => {
    const { language, t: translations } = useLanguage();
    const t = translations.propertiesPage;
    const t_card = translations.propertyCard;
    
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

    const { 
        setFilter, 
        resetFilters,
        status: statusFilter, type: typeFilter, query: queryFilter, 
        minPrice: minPriceFilter, maxPrice: maxPriceFilter, project: projectFilter, 
        finishing: finishingFilter, installments: installmentsFilter, floor: floorFilter, 
        compound: compoundFilter, delivery: deliveryFilter, amenities: amenitiesFilter,
        beds: bedsFilter, baths: bathsFilter, realEstateFinance: realEstateFinanceFilter,
    } = filters;

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (statusFilter !== 'all') count++;
        if (typeFilter !== 'all') count++;
        if (queryFilter !== '') count++;
        if (minPriceFilter !== '') count++;
        if (maxPriceFilter !== '') count++;
        if (projectFilter !== 'all') count++;
        if (finishingFilter !== 'all') count++;
        if (installmentsFilter !== 'all') count++;
        if (realEstateFinanceFilter !== 'all') count++;
        if (floorFilter !== '') count++;
        if (compoundFilter !== 'all') count++;
        if (deliveryFilter !== 'all') count++;
        if (amenitiesFilter.length > 0) count++;
        if (bedsFilter !== '') count++;
        if (bathsFilter !== '') count++;
        return count;
    }, [filters]);

    const handleAmenitiesChange = (amenityEn: string) => {
        const newAmenities = amenitiesFilter.includes(amenityEn)
            ? amenitiesFilter.filter(a => a !== amenityEn)
            : [...amenitiesFilter, amenityEn];
        setFilter('amenities', newAmenities);
    };

    const isApplicable = (option: FilterOption) => {
        if (typeFilter === 'all' || typeFilter === '') return true;
        if (!option.applicableTo || option.applicableTo.length === 0) return true;
        return option.applicableTo.includes(typeFilter);
    };

    const availableAmenities = useMemo(() => amenities.filter(isApplicable), [amenities, typeFilter]);
    const availableFinishingStatuses = useMemo(() => finishingStatuses.filter(isApplicable), [finishingStatuses, typeFilter]);

    // Logic to hide fields for Land
    const isLand = typeFilter === 'Land';

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">{t.subtitle}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 lg:p-6 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    
                    <div className="relative md:col-span-2 lg:col-span-1">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                            type="text" 
                            value={queryFilter} 
                            onChange={e => setFilter('q', e.target.value)}
                            placeholder={t.searchPlaceholder}
                            className="pl-10 h-12"
                        />
                    </div>

                    <div className="relative">
                         <Select value={statusFilter} onChange={e => setFilter('status', e.target.value)} className="h-12">
                            <option value="all">{t.allStatuses}</option>
                            <option value="For Sale">{t.forSale}</option>
                            <option value="For Rent">{t.forRent}</option>
                        </Select>
                    </div>

                    <div className="relative">
                        <Select value={typeFilter} onChange={e => setFilter('type', e.target.value)} className="h-12">
                            <option value="all">{t.allTypes}</option>
                            {propertyTypes.map(type => (
                                <option key={type.id} value={type.en}>{type[language]}</option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex gap-2">
                        <Button 
                            variant="secondary" 
                            className={`flex-1 h-12 justify-between ${isAdvancedOpen ? 'bg-amber-100 text-amber-700 border-amber-300' : ''}`}
                            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                        >
                            <span className="flex items-center gap-2">
                                <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                {t.advancedFilters}
                            </span>
                            {activeFilterCount > 0 && (
                                <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{activeFilterCount}</span>
                            )}
                        </Button>
                        
                        {activeFilterCount > 0 && (
                            <Button variant="ghost" className="h-12 w-12 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={resetFilters} title="Reset All">
                                <CloseIcon className="w-6 h-6" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className={`grid transition-all duration-500 ease-in-out overflow-hidden ${isAdvancedOpen ? 'grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700' : 'grid-rows-[0fr] opacity-0 p-0 m-0 border-none'}`}>
                    <div className="min-h-0 space-y-6">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t.priceRange}</label>
                                <div className="flex gap-2">
                                    <Input type="number" placeholder={t.minPricePlaceholder} value={minPriceFilter} onChange={e => setFilter('minPrice', e.target.value)} />
                                    <Input type="number" placeholder={t.maxPricePlaceholder} value={maxPriceFilter} onChange={e => setFilter('maxPrice', e.target.value)} />
                                </div>
                            </div>
                            
                            {!isLand && (
                                 <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{t.finishing}</label>
                                    <Select value={finishingFilter} onChange={e => setFilter('finishing', e.target.value)} disabled={availableFinishingStatuses.length === 0}>
                                        <option value="all">{t.allFinishes}</option>
                                        {availableFinishingStatuses.map(status => <option key={status.id} value={status.en}>{status[language]}</option>)}
                                    </Select>
                                </div>
                            )}

                             <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t.project}</label>
                                <Select value={projectFilter} onChange={e => setFilter('project', e.target.value)}>
                                    <option value="all">{t.allProjects}</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name[language]}</option>)}
                                </Select>
                            </div>
                            
                            {!isLand && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">{t.inCompound}</label>
                                    <Select value={compoundFilter} onChange={e => setFilter('compound', e.target.value)}>
                                        <option value="all">{t.allCompound}</option>
                                        <option value="yes">{t.compoundYes}</option>
                                        <option value="no">{t.compoundNo}</option>
                                    </Select>
                                </div>
                            )}
                        </div>

                         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                             {!isLand && (
                                 <>
                                     <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t_card.beds}</label>
                                        <Input type="number" value={bedsFilter} onChange={e => setFilter('beds', e.target.value)} placeholder="0+" />
                                    </div>
                                     <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t_card.baths}</label>
                                        <Input type="number" value={bathsFilter} onChange={e => setFilter('baths', e.target.value)} placeholder="0+" />
                                    </div>
                                     <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase">{t.floor}</label>
                                        <Input type="number" value={floorFilter} onChange={e => setFilter('floor', e.target.value)} placeholder="Any" />
                                    </div>
                                </>
                             )}
                             <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t.delivery}</label>
                                <Select value={deliveryFilter} onChange={e => setFilter('delivery', e.target.value)}>
                                    <option value="all">{t.allDelivery}</option>
                                    <option value="immediate">{t.immediateDelivery}</option>
                                </Select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t.installments}</label>
                                <Select value={installmentsFilter} onChange={e => setFilter('installments', e.target.value)}>
                                    <option value="all">{t.allInstallments}</option>
                                    <option value="yes">{t.installmentsYes}</option>
                                    <option value="no">{t.installmentsNo}</option>
                                </Select>
                            </div>
                             <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">{t.realEstateFinance}</label>
                                <Select value={realEstateFinanceFilter} onChange={e => setFilter('realEstateFinance', e.target.value)}>
                                    <option value="all">{t.allRealEstateFinance}</option>
                                    <option value="yes">{t.realEstateFinanceYes}</option>
                                    <option value="no">{t.realEstateFinanceNo}</option>
                                </Select>
                            </div>
                         </div>

                        <div className="space-y-2">
                             <label className="text-xs font-bold text-gray-500 uppercase block">{t.amenities}</label>
                             {availableAmenities.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                                    {availableAmenities.map(amenity => (
                                        <label key={amenity.id} className="flex items-center gap-2 cursor-pointer hover:text-amber-600 transition-colors">
                                            <Checkbox 
                                                id={`amenity-${amenity.id}`}
                                                checked={amenitiesFilter.includes(amenity.en)}
                                                onCheckedChange={() => handleAmenitiesChange(amenity.en)}
                                            />
                                            <span className="text-sm select-none">{amenity[language]}</span>
                                        </label>
                                    ))}
                                </div>
                             ) : (
                                 <span className="text-xs text-gray-400 col-span-full">No specific amenities for this type.</span>
                             )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyFilters;
