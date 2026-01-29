
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Imported 'keepPreviousData' for use with TanStack Query v5's placeholderData option.
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import SEO from '../shared/SEO';
import { useLanguage } from '../shared/LanguageContext';
import { GridIcon, ListIcon, PhoneIcon, SearchIcon } from '../ui/Icons';
import PropertyFilters from './PropertyFilters';
import PropertyCard from './PropertyCard';
import PropertyListItem from './PropertyListItem';
import PropertyCardSkeleton from '../shared/PropertyCardSkeleton';
import PropertyListItemSkeleton from '../shared/PropertyListItemSkeleton';
import { getAllProjects } from '../../services/projects';
import { getAllPartnersForAdmin } from '../../services/partners';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../../services/filters';
import { getPaginatedProperties } from '../../services/properties';
import { usePropertyFilters } from '../../hooks/usePropertyFilters';
import Pagination from '../shared/Pagination';

const ITEMS_PER_PAGE = 12;

const PropertiesPage: React.FC = () => {
    const { language, t } = useLanguage();
    const navigate = useNavigate();
    const t_page = t.propertiesPage;
    
    const filterControls = usePropertyFilters();
    const { 
        page, view, status, type, query, minPrice, maxPrice, 
        minArea, maxArea, // Added minArea and maxArea here
        project, finishing, installments, realEstateFinance, floor, compound, delivery, 
        amenities: amenitiesFilter, beds, baths, setFilter, setPage
    } = filterControls;
    
    // Fetch dependencies (dropdown options)
    const { data: projects, isLoading: pLoading } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects });
    const { data: partners, isLoading: paLoading } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const { data: propertyTypes, isLoading: ptLoading } = useQuery({ queryKey: ['propertyTypes'], queryFn: getAllPropertyTypes });
    const { data: finishingStatuses, isLoading: fsLoading } = useQuery({ queryKey: ['finishingStatuses'], queryFn: getAllFinishingStatuses });
    const { data: amenities, isLoading: amLoading } = useQuery({ queryKey: ['amenities'], queryFn: getAllAmenities });
    
    // Memoize filters to prevent unnecessary query refetches
    const queryFilters = useMemo(() => ({
        view: view as 'grid' | 'list', // Explicit cast to fix TS error
        status, type, query, minPrice, maxPrice, 
        minArea, maxArea, // Include minArea and maxArea here
        project, finishing, 
        installments, realEstateFinance, floor, compound, delivery, 
        amenities: amenitiesFilter, beds, baths
    }), [
        view,
        status, type, query, minPrice, maxPrice, 
        minArea, maxArea, // Add dependency here
        project, finishing, 
        installments, realEstateFinance, floor, compound, delivery, 
        amenitiesFilter, beds, baths
    ]);

    // Fetch properties
    const { data: propertiesData, isLoading: propsLoading } = useQuery({
        queryKey: ['properties', page, queryFilters],
        queryFn: () => getPaginatedProperties({ 
            page: page, 
            limit: ITEMS_PER_PAGE, 
            filters: queryFilters as any, // Cast to any to bypass strict view check here if needed
            disablePagination: false,
        }),
        // FIX: Replaced deprecated `keepPreviousData: true` with `placeholderData: keepPreviousData` for TanStack Query v5.
        placeholderData: keepPreviousData,
    });
    
    const isLoadingDependencies = pLoading || paLoading || ptLoading || fsLoading || amLoading;
    const isLoadingAny = isLoadingDependencies || propsLoading;
    const properties = propertiesData?.properties || [];
    const totalProperties = propertiesData?.total || 0;
    const totalPages = Math.ceil(totalProperties / ITEMS_PER_PAGE);

    // This logic was incorrect in the original file, it should depend on filterControls.view
    const gridClasses = filterControls.view === 'list' 
        ? 'grid-cols-1 gap-4' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8';

    const handleRequestAssistance = () => {
        // Redirect to Service Request page with explicit type 'property_inquiry'
        navigate('/request-service', { 
            state: { 
                serviceTitle: language === 'ar' ? 'طلب بحث عن عقار' : 'Property Search Request',
                partnerId: 'admin-user', // Platform request
                serviceType: 'property_inquiry'
            } 
        });
    };

    const AssistanceNote = ({ centered = false }: { centered?: boolean }) => (
        <div className={`mt-10 p-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left ${centered ? 'mx-auto max-w-2xl' : ''}`}>
            <div className="bg-amber-100 dark:bg-amber-800 p-4 rounded-full flex-shrink-0">
                <SearchIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-grow">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {language === 'ar' ? 'في حالة عدم عثورك على العقار المنشود' : 'Couldn\'t find the property you are looking for?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {language === 'ar' ? 'يرجى التواصل للمساعدة، وسيقوم فريقنا بالبحث لك عن العقار المناسب.' : 'Please contact us for assistance, and our team will help you find the perfect property.'}
                </p>
            </div>
            <button 
                onClick={handleRequestAssistance}
                className="flex-shrink-0 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-md transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
                <PhoneIcon className="w-5 h-5" />
                {language === 'ar' ? 'تواصل للمساعدة' : 'Contact Support'}
            </button>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-900 min-h-screen">
            <SEO title={`${t.nav.properties} | ONLY HELIO`} description={t_page.subtitle} />
            
            <div className="container mx-auto px-6 py-8">
                <PropertyFilters
                    filters={filterControls as any}
                    projects={projects || []}
                    partners={partners || []}
                    propertyTypes={propertyTypes || []}
                    finishingStatuses={finishingStatuses || []}
                    amenities={amenities || []}
                />
            </div>
            
            {/* Toolbar Section */}
            <div className="bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700 py-4 sticky top-16 lg:top-20 z-30 shadow-sm">
                <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            {t.propertiesPage.resultsFound.replace('{count}', String(totalProperties))}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white dark:bg-gray-700 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
                            <button
                                onClick={() => setFilter('view', 'grid')}
                                className={`p-2 rounded-md transition-all ${filterControls.view === 'grid' ? 'bg-amber-500 text-white shadow' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                aria-label="Grid View"
                                title={language === 'ar' ? 'عرض شبكي' : 'Grid View'}
                            >
                                <GridIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setFilter('view', 'list')}
                                className={`p-2 rounded-md transition-all ${filterControls.view === 'list' ? 'bg-amber-500 text-white shadow' : 'text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                                aria-label="List View"
                                title={language === 'ar' ? 'عرض قائمة' : 'List View'}
                            >
                                <ListIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-6 py-12">
                {isLoadingAny ? (
                    <div className={`grid ${gridClasses}`}>
                        {Array.from({ length: 6 }).map((_, i) => filterControls.view === 'list' ? <PropertyListItemSkeleton key={i} /> : <PropertyCardSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        {properties.length > 0 ? (
                            <>
                                <div className={`grid ${gridClasses}`}>
                                    {properties.map(prop => (
                                        filterControls.view === 'list' ? (
                                            <PropertyListItem key={prop.id} {...prop} />
                                        ) : (
                                            <PropertyCard key={prop.id} {...prop} />
                                        )
                                    ))}
                                </div>
                                <div className="mt-12">
                                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                                </div>
                                
                                {/* Assistance Note at bottom of results */}
                                <AssistanceNote />
                            </>
                        ) : (
                            <div className="py-16">
                                <div className="text-center mb-8">
                                     <p className="text-xl text-gray-500 dark:text-gray-400 font-medium mb-2">{t_page.noResults}</p>
                                     <p className="text-gray-400 text-sm">
                                         {language === 'ar' ? 'حاول تغيير معايير البحث أو إزالة بعض الفلاتر.' : 'Try changing search criteria or removing filters.'}
                                     </p>
                                </div>
                                
                                {/* Assistance Note Centered for Empty State */}
                                <AssistanceNote centered />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PropertiesPage;
