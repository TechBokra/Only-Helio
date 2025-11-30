
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SiteContent } from '../../types';
import { inputClasses } from '../ui/FormField';
import { TrashIcon } from '../ui/Icons';
import { getContent, updateContent as updateSiteContent } from '../../services/content';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../shared/ToastContext';
import { useLanguage } from '../shared/LanguageContext';

const AdminFinishingServicesPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { data: siteContent, isLoading: dataLoading, refetch } = useQuery({ queryKey: ['siteContent'], queryFn: getContent });
    const { showToast } = useToast();
    
    const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting, isDirty } } = useForm<{ finishingServices: SiteContent['finishingServices'] }>();
    
    useEffect(() => {
        if (siteContent) {
            reset({ finishingServices: siteContent.finishingServices });
        }
    }, [siteContent, reset]);

    const watchFinishingServices = watch('finishingServices');

    const handleAddTier = (serviceIndex: number) => {
        const currentTiers = watchFinishingServices?.[serviceIndex]?.pricingTiers || [];
        const newTier = { unitType: { ar: '', en: '' }, areaRange: { ar: '', en: '' }, price: 0 };
        setValue(`finishingServices.${serviceIndex}.pricingTiers`, [...currentTiers, newTier], { shouldDirty: true });
    };

    const handleRemoveTier = (serviceIndex: number, tierIndex: number) => {
        const currentTiers = watchFinishingServices?.[serviceIndex]?.pricingTiers || [];
        setValue(`finishingServices.${serviceIndex}.pricingTiers`, currentTiers.filter((_: any, i: number) => i !== tierIndex), { shouldDirty: true });
    };

    const onSubmit = async (formData: { finishingServices: SiteContent['finishingServices'] }) => {
        await updateSiteContent({ finishingServices: formData.finishingServices });
        refetch();
        showToast('Services updated successfully!', 'success');
    };

    if (dataLoading) {
        return <div>Loading services...</div>;
    }

    return (
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                    <div className="space-y-8">
                        {(watchFinishingServices || []).map((service: any, serviceIndex: number) => (
                            <div key={serviceIndex} className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                                <h4 className="font-bold text-amber-600 dark:text-amber-500 text-lg mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex justify-between">
                                    <span>Package {serviceIndex + 1}</span>
                                    <span className="text-xs text-gray-400 font-normal px-2 py-1 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                        {service.title.en}
                                    </span>
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Package Title (AR)</label>
                                        <input {...register(`finishingServices.${serviceIndex}.title.ar`)} className={inputClasses} dir="rtl" placeholder="مثال: باقة الاستشارة الشاملة" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Package Title (EN)</label>
                                        <input {...register(`finishingServices.${serviceIndex}.title.en`)} className={inputClasses} dir="ltr" placeholder="e.g. Comprehensive Consultation Package" />
                                    </div>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (AR)</label>
                                        <textarea {...register(`finishingServices.${serviceIndex}.description.ar`)} className={inputClasses} rows={3} dir="rtl"/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (EN)</label>
                                        <textarea {...register(`finishingServices.${serviceIndex}.description.en`)} className={inputClasses} rows={3} dir="ltr"/>
                                    </div>
                                </div>
                                
                                {service.pricingTiers && (
                                    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                        <h5 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                                            <span>Pricing Tiers (Sub-options)</span>
                                            <button type="button" onClick={() => handleAddTier(serviceIndex)} className="text-sm text-white bg-amber-500 hover:bg-amber-600 px-3 py-1 rounded-md font-bold shadow-sm transition-colors">+ Add Tier</button>
                                        </h5>
                                        {service.pricingTiers.map((tier: any, tierIndex: number) => (
                                            <div key={tierIndex} className="p-4 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 relative shadow-sm group">
                                                <button type="button" onClick={() => handleRemoveTier(serviceIndex, tierIndex)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors"><TrashIcon className="w-4 h-4" /></button>
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div><label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Unit Type (AR)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.unitType.ar`)} className={inputClasses} dir="rtl" placeholder="مثال: شقة" /></div>
                                                        <div><label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Unit Type (EN)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.unitType.en`)} className={inputClasses} dir="ltr" placeholder="e.g. Apartment" /></div>
                                                        <div><label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Area/Scope (AR)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.areaRange.ar`)} className={inputClasses} dir="rtl" placeholder="مثال: حتى 150 متر" /></div>
                                                        <div><label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Area/Scope (EN)</label><input {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.areaRange.en`)} className={inputClasses} dir="ltr" placeholder="e.g. Up to 150m" /></div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Price (EGP)</label>
                                                        <input type="number" {...register(`finishingServices.${serviceIndex}.pricingTiers.${tierIndex}.price`, { valueAsNumber: true })} className={inputClasses} placeholder="0" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                         {service.pricingTiers.length === 0 && (
                                            <p className="text-sm text-gray-400 italic">No pricing tiers added yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 flex justify-end items-center gap-4 sticky bottom-6 z-10">
                    {isDirty && <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 animate-pulse">Unsaved changes</span>}
                    <button type="submit" disabled={isSubmitting || !isDirty} className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50 shadow-lg">
                        {isSubmitting ? 'Saving...' : 'Save All Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminFinishingServicesPage;
