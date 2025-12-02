import React from 'react';
import { SearchIcon, XCircleIcon } from '../ui/Icons';
import { useLanguage } from '../shared/LanguageContext';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { Project, FilterOption } from '../../types';

interface PropertyFiltersProps {
  filters: any; 
  projects?: Project[];
  propertyTypes?: FilterOption[];
  finishingStatuses?: FilterOption[];
}

const PropertyFilters: React.FC<PropertyFiltersProps> = ({ 
    filters, 
    projects = [], 
    propertyTypes = [], 
    finishingStatuses = []
}) => {
    const { language, t } = useLanguage();
    // Access translation namespaces correctly
    const t_page = t.propertiesPage;
    const t_card = t.propertyCard;

    // --- STRICT SAFETY LAYER ---
    const safeFilters = filters || {};
    
    const getVal = (key: string) => {
        const val = safeFilters[key];
        return val !== undefined && val !== null ? val : '';
    };

    const setVal = (key: string, val: any) => {
        if (typeof safeFilters.setFilter === 'function') {
            safeFilters.setFilter(key, val);
        }
    };

    const handleReset = () => {
        if (typeof safeFilters.resetFilters === 'function') {
            safeFilters.resetFilters();
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 transition-all">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t_page.searchLabel}</h2>
                <Button variant="ghost" onClick={handleReset} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs">
                    <XCircleIcon className="w-4 h-4 mr-1" />
                    {language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                </Button>
            </div>

            {/* Main Filters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Search Query */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 relative">
                    <Input 
                        placeholder={t_page.searchPlaceholder} 
                        value={getVal('query')}
                        onChange={(e) => setVal('query', e.target.value)}
                        className="pl-10"
                    />
                    <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* 2. Status */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t_page.statusLabel}</label>
                    <Select value={getVal('status')} onChange={(e) => setVal('status', e.target.value)}>
                        <option value="all">{t_page.allStatuses}</option>
                        <option value="For Sale">{t_page.forSale}</option>
                        <option value="For Rent">{t_page.forRent}</option>
                    </Select>
                </div>

                {/* 3. Type */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t_page.typeLabel}</label>
                    <Select value={getVal('type')} onChange={(e) => setVal('type', e.target.value)}>
                        <option value="all">{t_page.allTypes}</option>
                        {propertyTypes.map(pt => (
                            <option key={pt.id} value={pt.en}>{pt[language]}</option>
                        ))}
                    </Select>
                </div>

                {/* 4. Project */}
                <div>
                     <label className="block text-xs font-medium text-gray-500 mb-1">{t_page.project}</label>
                    <Select value={getVal('project')} onChange={(e) => setVal('project', e.target.value)}>
                        <option value="all">{t_page.allProjects}</option>
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.name[language]}</option>
                        ))}
                    </Select>
                </div>

                {/* 5. Finishing */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{t_page.finishing}</label>
                    <Select value={getVal('finishing')} onChange={(e) => setVal('finishing', e.target.value)}>
                        <option value="all">{t_page.allFinishes}</option>
                        {finishingStatuses.map(fs => (
                            <option key={fs.id} value={fs.en}>{fs[language]}</option>
                        ))}
                    </Select>
                </div>

                {/* 6. Price Range */}
                <div className="sm:col-span-2 flex gap-2">
                    <div className="w-1/2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t_page.minPricePlaceholder}</label>
                        <Input 
                            type="number" 
                            value={getVal('minPrice')}
                            onChange={(e) => setVal('minPrice', e.target.value)}
                            placeholder="0"
                        />
                    </div>
                    <div className="w-1/2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t_page.maxPricePlaceholder}</label>
                        <Input 
                            type="number" 
                            value={getVal('maxPrice')}
                            onChange={(e) => setVal('maxPrice', e.target.value)}
                             placeholder="∞"
                        />
                    </div>
                </div>

                {/* 7. Beds & Baths */}
                <div className="flex gap-2">
                    <div className="w-1/2">
                         <label className="block text-xs font-medium text-gray-500 mb-1">{t_card.beds}</label>
                        <Input 
                            type="number" 
                            value={getVal('beds')} 
                            onChange={(e) => setVal('beds', e.target.value)}
                            placeholder="+"
                        />
                    </div>
                    <div className="w-1/2">
                         <label className="block text-xs font-medium text-gray-500 mb-1">{t_card.baths}</label>
                        <Input 
                            type="number" 
                            value={getVal('baths')}
                            onChange={(e) => setVal('baths', e.target.value)}
                             placeholder="+"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyFilters;