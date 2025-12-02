
import React, { useState, useMemo } from 'react';
import type { Project, AdminPartner, FilterOption } from '../../types';
import { SearchIcon, ChevronRightIcon, AdjustmentsHorizontalIcon } from '../ui/Icons';
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
    const [showAdvanced, setShowAdvanced] = useState(false);

    // CRITICAL FIX: Fail fast if filters prop is undefined to prevent "reading 'beds' of undefined" error.
    if (!filters) {
        return null;
    }

    // Safe destructuring with default values
    const { 
        setFilter, 
        resetFilters,
        status = 'all', 
        type = 'all', 
        query = '', 
        minPrice = '', 
        maxPrice = '', 
        project = 'all', 
        finishing = 'all', 
        installments = 'all', 
        floor = '', 
        compound = 'all', 
        delivery = 'all', 
        amenities: amenitiesFilter = [],
        beds = '', 
        baths = '', 
        realEstateFinance = 'all',
    } = filters;

    const isAnyFilterActive = useMemo(() => {
        return (
            status !== 'all' || type !== 'all' || query !== '' ||
            minPrice !== '' || maxPrice !== '' || project !== 'all' ||
            finishing !== 'all' || installments !== 'all' || realEstateFinance !== 'all' ||
            floor !== '' || compound !== 'all' || delivery !== 'all' ||
            (amenitiesFilter && amenitiesFilter.length > 0) || beds !== '' || baths !== ''
        );
    }, [
        status, type, query, minPrice, maxPrice, 
        project, finishing, installments, realEstateFinance, 
        floor, compound, delivery, amenitiesFilter, beds, baths
    ]);

    const handleAmenitiesChange = (amenityEn: string) => {
        if (!setFilter) return;
        const currentAmenities = amenitiesFilter || [];
        const newAmenities = currentAmenities.includes(amenityEn)
            ? currentAmenities.filter((a: string) => a !== amenityEn)
            : [...currentAmenities, amenityEn];
        setFilter('amenities', newAmenities);
    };

    // Helper to check applicability
    const isApplicable = (option: FilterOption) => {
        if (type === 'all' || type === '') return true;
        if (!option.applicableTo || option.applicableTo.length === 0) return true;
        return option.applicableTo.includes(type);
    };

    const availableAmenities = useMemo(() => {
        return (amenities || []).filter(isApplicable);
    }, [amenities, type]);

    const availableFinishingStatuses = useMemo(() => {
        return (finishingStatuses || []).filter(isApplicable);
    }, [finishingStatuses, type]);

    return (
      <>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>
        
        <div className="mb-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2 lg:col-span-4">
              <label htmlFor="search-query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.searchLabel}</label>
              <div className="relative">
                  <Input 
                    type="text" 
                    id="search-query"
                    value={query} 
                    onChange={e => setFilter('q', e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="pl-10"
                  />
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.statusLabel}</label>
                <Select value={status} onChange={e => setFilter('status', e.target.value)}>
                    <option value="all">{t.allStatuses}</option>
                    <option value="For Sale">{t.forSale}</option>
                    <option value="For Rent">{t.forRent}</option>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.typeLabel}</label>
                <Select value={type} onChange={e => setFilter('type', e.target.value)}>
                    <option value="all">{t.allTypes}</option>
                    {propertyTypes.map(pt => (
                        <option key={pt.id} value={pt.en}>{pt[language]}</option>
                    ))}
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.priceRange}</label>
                <div className="flex gap-2">
                    <Input 
                        type="number" 
                        placeholder={t.minPricePlaceholder} 
                        value={minPrice} 
                        onChange={e => setFilter('minPrice', e.target.value)} 
                    />
                    <Input 
                        type="number" 
                        placeholder={t.maxPricePlaceholder} 
                        value={maxPrice} 
                        onChange={e => setFilter('maxPrice', e.target.value)} 
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.finishing}</label>
                <Select value={finishing} onChange={e => setFilter('finishing', e.target.value)} disabled={availableFinishingStatuses.length === 0}>
                    <option value="all">{t.allFinishes}</option>
                    {availableFinishingStatuses.map(statusOption => (
                        <option key={statusOption.id} value={statusOption.en}>{statusOption[language]}</option>
                    ))}
                </Select>
            </div>
          </div>
          
          {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.project}</label>
                     <Select value={project} onChange={e => setFilter('project', e.target.value)}>
                        <option value="all">{t.allProjects}</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name[language]}</option>)}
                    </Select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.installments}</label>
                     <Select value={installments} onChange={e => setFilter('installments', e.target.value)}>
                        <option value="all">{t.allInstallments}</option>
                        <option value="yes">{t.installmentsYes}</option>
                        <option value="no">{t.installmentsNo}</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.realEstateFinance}</label>
                     <Select value={realEstateFinance} onChange={e => setFilter('realEstateFinance', e.target.value)}>
                        <option value="all">{t.allRealEstateFinance}</option>
                        <option value="yes">{t.realEstateFinanceYes}</option>
                        <option value="no">{t.realEstateFinanceNo}</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.inCompound}</label>
                     <Select value={compound} onChange={e => setFilter('compound', e.target.value)}>
                        <option value="all">{t.allCompound}</option>
                        <option value="yes">{t.compoundYes}</option>
                        <option value="no">{t.compoundNo}</option>
                    </Select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.delivery}</label>
                     <Select value={delivery} onChange={e => setFilter('delivery', e.target.value)}>
                        <option value="all">{t.allDelivery}</option>
                        <option value="immediate">{t.immediateDelivery}</option>
                    </Select>
                  </div>
                   <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.floor}</label>
                        <Input type="number" value={floor} onChange={e => setFilter('floor', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.propertyCard.beds}</label>
                        <Input type="number" value={beds} onChange={e => setFilter('beds', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.propertyCard.baths}</label>
                        <Input type="number" value={baths} onChange={e => setFilter('baths', e.target.value)} />
                      </div>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.amenities}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {availableAmenities.map(amenity => (
                              <div key={amenity.id} className="flex items-center gap-2">
                                  <Checkbox 
                                    id={`amenity-${amenity.id}`}
                                    checked={(amenitiesFilter || []).includes(amenity.en)}
                                    onCheckedChange={() => handleAmenitiesChange(amenity.en)}
                                  />
                                  <label htmlFor={`amenity-${amenity.id}`} className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
                                      {amenity[language]}
                                  </label>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          <div className="flex justify-between items-center pt-2">
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 focus:outline-none"
              >
                  <AdjustmentsHorizontalIcon className="w-5 h-5" />
                  {showAdvanced ? t.hideFilters : t.advancedFilters}
                  {showAdvanced ? <ChevronRightIcon className={`w-4 h-4 rotate-90 transition-transform`} /> : <ChevronRightIcon className={`w-4 h-4 transition-transform`} />}
              </button>

              {isAnyFilterActive && (
                  <Button variant="ghost" onClick={resetFilters} size="sm" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                      Reset Filters
                  </Button>
              )}
          </div>
        </div>
      </>
    );
};

export default PropertyFilters;
