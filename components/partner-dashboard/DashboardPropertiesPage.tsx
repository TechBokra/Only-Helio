
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Property } from '../../types';
import { Role } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { BuildingIcon, ClockIcon, PlusIcon, LockClosedIcon } from '../ui/Icons';
import { inputClasses } from '../ui/FormField';
import UpgradePlanModal from '../shared/UpgradePlanModal';
import ExportDropdown from '../shared/ExportDropdown';
import { deleteProperty as apiDeleteProperty } from '../../services/properties';
import { useSubscriptionUsage } from '../../hooks/useSubscriptionUsage';
import { useLanguage } from '../shared/LanguageContext';
import { Select } from '../ui/Select';
import { Card, CardContent, CardFooter } from '../ui/Card';
import ConfirmationModal from '../shared/ConfirmationModal';
import ErrorState from '../shared/ErrorState';
import PropertyCardSkeleton from '../shared/PropertyCardSkeleton';
import { Button } from '../ui/Button';

const DashboardPropertiesPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_dash = t.dashboard;
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const usageType = currentUser?.role === Role.DEVELOPER_PARTNER ? 'units' : 'properties';

    const {
        data: partnerProperties,
        isLoading: loading,
        isError,
        isLimitReached,
        canAddSale,
        canAddRent,
        limits,
        counts,
        refetch,
    } = useSubscriptionUsage(usageType);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

    const filteredProperties = useMemo(() => {
        if (!partnerProperties) return [];
        let filteredProps = [...(partnerProperties as Property[])];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredProps = filteredProps.filter((prop) => prop.title[language].toLowerCase().includes(lowercasedFilter));
        }

        if (statusFilter !== 'all') {
            filteredProps = filteredProps.filter((prop) => prop.status.en === statusFilter);
        }

        return filteredProps;
    }, [partnerProperties, searchTerm, statusFilter, language]);

    if (currentUser?.role !== Role.AGENCY_PARTNER && currentUser?.role !== Role.DEVELOPER_PARTNER) {
        return null;
    }

    const handleDelete = async () => {
        if (!propertyToDelete) return;
        await apiDeleteProperty(propertyToDelete);
        setPropertyToDelete(null);
        refetch();
    };

    const handleAddPropertyClick = (type?: 'For Sale' | 'For Rent') => {
        // If strict limit reached for ANY type (Total limit)
        if (isLimitReached) {
            setIsUpgradeModalOpen(true);
            return;
        }

        // Check specific limits if type is provided
        if (type === 'For Sale' && !canAddSale) {
             setIsUpgradeModalOpen(true);
             return;
        }
        if (type === 'For Rent' && !canAddRent) {
             setIsUpgradeModalOpen(true);
             return;
        }

        navigate('/dashboard/properties/new');
    };

    const exportColumns = {
        [`title.${language}`]: t_dash.propertyTable.title,
        [`status.${language}`]: t_dash.propertyTable.status,
        [`price.${language}`]: t_dash.propertyTable.price,
        listingStatus: language === 'ar' ? 'حالة النشر' : 'Listing Status',
        area: language === 'ar' ? 'المساحة (م²)' : 'Area (m²)',
    };

    if (isError) {
        return <ErrorState onRetry={refetch} />;
    }

    const showSplitLimits = limits.sale !== -1 && limits.rent !== -1;

    return (
        <div>
            {isUpgradeModalOpen && <UpgradePlanModal onClose={() => setIsUpgradeModalOpen(false)} />}
            {propertyToDelete && (
                <ConfirmationModal
                    isOpen={!!propertyToDelete}
                    onClose={() => setPropertyToDelete(null)}
                    onConfirm={handleDelete}
                    title="Delete Property"
                    message={t_dash.propertyTable.confirmDelete}
                    confirmText="Delete"
                />
            )}
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t_dash.propertiesTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {currentUser.role === Role.DEVELOPER_PARTNER 
                            ? (language === 'ar' ? 'إدارة وحداتك العقارية' : 'Manage your Real Estate Units')
                            : (language === 'ar' ? 'إدارة عقاراتك' : 'Manage your Properties')
                        }
                    </p>
                    
                    {/* Limits Badge */}
                    <div className="flex gap-2 mt-2">
                        {showSplitLimits ? (
                            <>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${!canAddSale ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                    Sale: {counts.sale} / {limits.sale === -1 ? '∞' : limits.sale}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium border ${!canAddRent ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                    Rent: {counts.rent} / {limits.rent === -1 ? '∞' : limits.rent}
                                </span>
                            </>
                        ) : (
                             <span className={`text-xs px-2 py-1 rounded-full font-medium border ${isLimitReached ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                Total: {counts.total} / {limits.total === -1 ? '∞' : limits.total}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <ExportDropdown data={filteredProperties} columns={exportColumns} filename="my-properties" />
                    
                    <button
                        onClick={() => handleAddPropertyClick()}
                        disabled={isLimitReached && (!canAddSale && !canAddRent)}
                        className={`flex items-center gap-2 font-semibold px-6 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap ${
                            (isLimitReached && (!canAddSale && !canAddRent))
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-amber-500 text-gray-900 hover:bg-amber-600'
                        }`}
                    >
                        {(isLimitReached && (!canAddSale && !canAddRent)) ? <LockClosedIcon className="w-4 h-4"/> : <PlusIcon className="w-5 h-5"/>}
                        {currentUser.role === Role.DEVELOPER_PARTNER 
                            ? (language === 'ar' ? 'إضافة وحدة' : 'Add Unit')
                            : t_dash.addProperty
                        }
                    </button>
                </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-4">
                <input
                    type="text"
                    placeholder={t_dash.filter.search}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={inputClasses + ' max-w-xs'}
                />
                <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="max-w-xs"
                >
                    <option value="all">
                        {t_dash.filter.filterByStatus} ({t_dash.filter.all})
                    </option>
                    <option value="For Sale">{t.propertiesPage.forSale}</option>
                    <option value="For Rent">{t.propertiesPage.forRent}</option>
                </Select>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
                </div>
            ) : filteredProperties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProperties.map((prop) => {
                        const isForSale = prop.status.en === 'For Sale';
                        const isActive = prop.listingStatus === 'active';
                        return (
                            <Card key={prop.id} className="group flex flex-col p-0 overflow-hidden relative hover:shadow-lg transition-shadow">
                                {/* Listing Status Badge */}
                                <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full text-xs font-bold shadow-md uppercase tracking-wider flex items-center gap-1 ${
                                    isActive ? 'bg-green-500 text-white' : 'bg-amber-100 text-amber-700 border border-amber-300'
                                }`}>
                                    {!isActive && <ClockIcon className="w-3 h-3" />}
                                    {isActive 
                                        ? (language === 'ar' ? 'منشور' : 'Live') 
                                        : (language === 'ar' ? 'قيد المراجعة' : 'Pending Review')}
                                </div>

                                <div className="relative">
                                    <img src={prop.imageUrl} alt={prop.title[language]} className={`w-full h-48 object-cover ${!isActive ? 'opacity-80' : ''}`} />
                                    <span
                                        className={`absolute top-3 ${
                                            language === 'ar' ? 'right-3' : 'left-3'
                                        } text-white font-semibold px-3 py-1 rounded-md text-xs ${
                                            isForSale ? 'bg-green-600' : 'bg-sky-600'
                                        }`}
                                    >
                                        {prop.status[language]}
                                    </span>
                                </div>
                                <CardContent className="p-4 flex flex-col flex-grow">
                                    <h3 className="font-bold text-gray-900 dark:text-white truncate" title={prop.title[language]}>
                                        {prop.title[language]}
                                    </h3>
                                    <p className="text-amber-500 font-semibold mt-1">{prop.price[language]}</p>
                                    {prop.projectName && (
                                        <p className="text-xs text-gray-500 mt-2 truncate">
                                            {language === 'ar' ? 'مشروع:' : 'Project:'} {prop.projectName[language]}
                                        </p>
                                    )}
                                </CardContent>
                                <CardFooter className="p-3 border-t border-gray-200 dark:border-gray-700 justify-end gap-2 bg-gray-50 dark:bg-gray-800/50">
                                    <Link
                                        to={`/dashboard/properties/edit/${prop.id}`}
                                        className="font-medium text-amber-600 dark:text-amber-500 hover:underline text-sm px-3 py-1 rounded-md hover:bg-amber-100 dark:hover:bg-amber-900/50"
                                    >
                                        {t_dash.propertyTable.edit}
                                    </Link>
                                    <button
                                        onClick={() => setPropertyToDelete(prop.id)}
                                        className="font-medium text-red-600 dark:text-red-500 hover:underline text-sm px-3 py-1 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50"
                                    >
                                        {t_dash.propertyTable.delete}
                                    </button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <BuildingIcon className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">{t_dash.propertyTable.noProperties}</p>
                </div>
            )}
        </div>
    );
};

export default DashboardPropertiesPage;
