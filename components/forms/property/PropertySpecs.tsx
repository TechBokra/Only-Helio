
import React, { useMemo, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLanguage } from '../../shared/LanguageContext';
import FormField, { inputClasses, selectClasses } from '../../ui/FormField';
import { Checkbox } from '../../ui/Checkbox';
import type { FilterOption } from '../../../types';

interface PropertySpecsProps {
    propertyTypes: FilterOption[];
    finishingStatuses: FilterOption[];
    amenities: FilterOption[];
    isAdmin?: boolean; // New prop to control visibility of admin-only fields like Listing Status
}

const PropertySpecs: React.FC<PropertySpecsProps> = ({ propertyTypes, finishingStatuses, amenities, isAdmin = false }) => {
    const { register, watch, setValue } = useFormContext();
    const { language, t } = useLanguage();
    const tp = t.propertiesPage;
    const t_prop = t.propertyDetailsPage;
    const t_admin = t.adminDashboard;

    const watchType = watch('type');
    const watchStatus = watch('status');
    const watchFinishingStatus = watch('finishingStatus');
    const watchAmenities = watch('amenities');

    const isLand = watchType?.en === 'Land';
    const isCommercial = watchType?.en === 'Commercial';
    
    // Show Beds & Baths only for Residential types (Not Land AND Not Commercial)
    const showBedBath = !isLand && !isCommercial;

    // Reset irrelevant fields when type changes
    useEffect(() => {
        if (!showBedBath) {
            setValue('beds', 0);
            setValue('baths', 0);
        }
        if (isLand) {
            setValue('floor', 0);
            setValue('finishingStatus', undefined);
        }
    }, [isLand, showBedBath, setValue]);

    const handleComplexChange = (field: 'status' | 'type' | 'finishingStatus', valueEn: string) => {
        let valueAr = '';
        let option: FilterOption | undefined;

        if (field === 'status') {
            if (valueEn === 'For Sale') valueAr = 'للبيع';
            if (valueEn === 'For Rent') valueAr = 'إيجار';
        } else if (field === 'type' && propertyTypes) {
            option = propertyTypes.find(opt => opt.en === valueEn);
            valueAr = option ? option.ar : '';
        } else if (field === 'finishingStatus' && finishingStatuses) {
            option = finishingStatuses.find(opt => opt.en === valueEn);
            valueAr = option ? option.ar : '';
        }
        setValue(field, { en: valueEn, ar: valueAr });
    };

    const handleAmenityChange = (amenityEn: string) => {
        const currentAmenities = watchAmenities?.en || [];
        const newAmenities = currentAmenities.includes(amenityEn)
            ? currentAmenities.filter((a: string) => a !== amenityEn)
            : [...currentAmenities, amenityEn];
        
        const amenitiesAr = newAmenities.map((en: string) => {
            const amenity = amenities?.find(a => a.en === en);
            return amenity ? amenity.ar : en;
        });

        setValue('amenities', { en: newAmenities, ar: amenitiesAr });
    };

    // Filter Finishing Statuses based on selected Property Type
    const availableFinishingStatuses = useMemo(() => {
        if (!finishingStatuses) return [];
        if (isLand) return []; // No finishing for Land

        const selectedType = watchType?.en;
        if (!selectedType) return finishingStatuses;

        return finishingStatuses.filter(status => 
            !status.applicableTo || status.applicableTo.length === 0 || status.applicableTo.includes(selectedType)
        );
    }, [finishingStatuses, watchType, isLand]);

    // Filter Amenities based on selected Property Type
    const availableAmenities = useMemo(() => {
        if (!amenities) return [];
        const selectedType = watchType?.en;
        
        if (!selectedType) return [];

        return amenities.filter(amenity => 
             !amenity.applicableTo || amenity.applicableTo.length === 0 || amenity.applicableTo.includes(selectedType)
        );
    }, [amenities, watchType]);

    return (
        <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 border-gray-100 dark:border-gray-700">
                {t.forms?.specifications || "Specifications"}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <FormField label={tp.statusLabel} id="status.en" required>
                    <select
                        value={watchStatus?.en || 'For Sale'}
                        onChange={e => handleComplexChange('status', e.target.value)}
                        className={selectClasses}
                    >
                        <option value="For Sale">{tp.forSale}</option>
                        <option value="For Rent">{tp.forRent}</option>
                    </select>
                </FormField>
                <FormField label={tp.typeLabel} id="type.en" required>
                    <select
                        value={watchType?.en || ''}
                        onChange={e => handleComplexChange('type', e.target.value)}
                        className={selectClasses}
                    >
                        <option value="">{t.forms?.select || "Select..."}</option>
                        {(propertyTypes || []).map(opt => <option key={opt.id} value={opt.en}>{opt[language]}</option>)}
                    </select>
                </FormField>

                <FormField label={`${t.forms?.area || "Area"} (m²)`} id="area" required>
                    <input type="number" {...register("area", { required: true, valueAsNumber: true })} className={inputClasses} />
                </FormField>
                
                {/* Finishing Status - Hidden for Land */}
                {!isLand && (
                    <FormField label={tp.finishing} id="finishingStatus.en">
                        <select
                            value={watchFinishingStatus?.en || ''}
                            onChange={e => handleComplexChange('finishingStatus', e.target.value)}
                            className={selectClasses}
                        >
                             <option value="">{tp.allFinishes}</option>
                             {availableFinishingStatuses.map(opt => <option key={opt.id} value={opt.en}>{opt[language]}</option>)}
                        </select>
                    </FormField>
                )}
                
                {/* Conditional Fields based on Type (Hidden for Land AND Commercial) */}
                {showBedBath && (
                    <>
                        <FormField label={t_prop.bedrooms} id="beds">
                            <input type="number" {...register("beds", { valueAsNumber: true })} className={inputClasses} placeholder="0" />
                        </FormField>
                        <FormField label={t_prop.bathrooms} id="baths">
                            <input type="number" {...register("baths", { valueAsNumber: true })} className={inputClasses} placeholder="0" />
                        </FormField>
                    </>
                )}

                {/* Floor is hidden for Land and Villa, but kept for Commercial/Apartment */}
                {!isLand && watchType?.en !== 'Villa' && (
                    <FormField label={t_prop.floor} id="floor">
                        <input type="number" {...register("floor", { valueAsNumber: true })} className={inputClasses} placeholder="0" />
                    </FormField>
                )}
            </div>
            
            {/* Listing Status & Dates - Only for Admins/Partners Dashboard */}
            {isAdmin && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-100 dark:border-amber-800/30">
                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-500 mb-3 uppercase tracking-wider">
                        {language === 'ar' ? 'إعدادات النشر (للإدارة)' : 'Listing Settings (Admin)'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField label={t_admin.partnerTable.status} id="listingStatus" required>
                            <select {...register("listingStatus")} className={selectClasses} >
                                <option value="active">{t_admin.manageBanners.active}</option>
                                <option value="inactive">{t_admin.manageBanners.inactive}</option>
                                <option value="draft">Draft (مسودة)</option>
                                <option value="sold">Sold/Rented</option>
                            </select>
                        </FormField>
                        <FormField label={t_admin.editPropertyModal.listingStartDate} id="listingStartDate">
                             <input type="date" {...register("listingStartDate")} className={inputClasses} />
                        </FormField>
                        <FormField label={t_admin.editPropertyModal.listingEndDate} id="listingEndDate">
                             <input type="date" {...register("listingEndDate")} className={inputClasses} />
                        </FormField>
                    </div>
                </div>
            )}

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">{tp.amenities}</label>
                
                {availableAmenities.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {availableAmenities.map(amenity => (
                            <label key={amenity.id} className="flex items-center gap-2 cursor-pointer hover:text-amber-600 transition-colors">
                                <Checkbox
                                    checked={(watchAmenities?.en || []).includes(amenity.en)}
                                    onCheckedChange={() => handleAmenityChange(amenity.en)}
                                    id={`amenity-${amenity.id}`}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300 select-none">{amenity[language]}</span>
                            </label>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 italic">
                        {watchType?.en 
                            ? (language === 'ar' ? 'لا توجد مرافق متاحة لهذا النوع.' : 'No amenities available for this property type.') 
                            : (language === 'ar' ? 'يرجى اختيار نوع العقار أولاً لعرض المميزات.' : 'Please select a property type first to see amenities.')
                        }
                    </p>
                )}
            </div>
        </div>
    );
};

export default PropertySpecs;
