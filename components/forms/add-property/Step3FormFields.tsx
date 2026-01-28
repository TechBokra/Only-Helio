
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useLanguage } from '../../shared/LanguageContext';
import { Button } from '../../ui/Button';
import { Checkbox } from '../../ui/Checkbox';
import { useAddPropertyForm } from '../../../hooks/useAddPropertyForm';
import FormField, { inputClasses, selectClasses } from '../../ui/FormField';

// Import the reusable Property Form components (Unified UI)
import PropertyBasicInfo from '../property/PropertyBasicInfo';
import PropertySpecs from '../property/PropertySpecs';
import PropertyFinancials from '../property/PropertyFinancials';
import PropertyLocation from '../property/PropertyLocation';
import PropertyMedia from '../property/PropertyMedia';
import { useSiteContent } from '../../../hooks/useSiteContent';

// Derive props type from the return type of the hook
type Step3FormFieldsProps = ReturnType<typeof useAddPropertyForm>;

export const Step3FormFields: React.FC<Step3FormFieldsProps> = (props) => {
    const { language, t } = useLanguage();
    const t_page = t.addPropertyPage;
    const { data: siteContent } = useSiteContent();

    const {
        register,
        prevStep,
        mainImagePreview, galleryPreviews,
        handleMainImageChange, handleGalleryImagesChange, removeGalleryImage,
        setIsLocationModalOpen,
        isSubmitting, 
        projects, propertyTypes, finishingStatuses, amenities,
        handleSubmit,
        formMethods
    } = props;
    
    // Explicit form error handling for Owner Contact info
    const { formState: { errors } } = formMethods;

    return (
        <form onSubmit={handleSubmit} className="animate-fadeIn space-y-8">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t_page.formTitle}</h2>
             </div>

             {/* 1. Basic Info (Title, Desc, Address) - Passing [] projects so user can't select specific partner projects unless needed */}
             <PropertyBasicInfo 
                 projects={projects || []} 
                 partnerProjects={[]} 
                 isAdmin={false} 
             />

             {/* 2. Specs (Type, Area, Beds, Amenities) */}
             <PropertySpecs 
                 propertyTypes={propertyTypes || []} 
                 finishingStatuses={finishingStatuses || []} 
                 amenities={amenities || []}
                 isAdmin={false} // Hide admin fields like Listing Status
             />

             {/* 3. Financials (Price, Installments) */}
             <PropertyFinancials />

             {/* 4. Location & Media */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {siteContent?.enableMaps && (
                     <PropertyLocation onOpenMap={() => setIsLocationModalOpen(true)} />
                 )}
                 <PropertyMedia 
                     mainImage={mainImagePreview}
                     galleryImages={galleryPreviews}
                     handleMainImageChange={handleMainImageChange}
                     handleGalleryImagesChange={handleGalleryImagesChange}
                     removeGalleryImage={removeGalleryImage}
                 />
             </div>

             {/* 5. Contact Info (Owner Specific) */}
             <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-lg border border-blue-100 dark:border-blue-800 space-y-4">
                 <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 border-b border-blue-200 pb-2">{t_page.ownerInfo}</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField label={t_page.fullName} id="customerName" required error={errors.customerName?.message as string}>
                        <input type="text" {...register("customerName", { required: t_page.errors.required })} className={inputClasses} />
                     </FormField>
                     <FormField label={t_page.phone} id="customerPhone" required error={errors.customerPhone?.message as string}>
                        <input type="tel" {...register("customerPhone", { required: t_page.errors.required })} className={inputClasses} dir="ltr" />
                     </FormField>
                 </div>
                 <FormField label={t_page.contactTime} id="contactTime" required>
                     <select {...register("contactTime", { required: true })} className={selectClasses}>
                         <option value="">{t_page.selectTime}</option>
                         <option value="morning">{t.formOptions.morning}</option>
                         <option value="afternoon">{t.formOptions.afternoon}</option>
                         <option value="evening">{t.formOptions.evening}</option>
                     </select>
                 </FormField>
             </div>

             {/* 6. Confirmation */}
             <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Checkbox id="isOwner" {...register("isOwner", { required: true })} className="mt-1" />
                    <label htmlFor="isOwner" className={`text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer leading-relaxed ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>{t_page.confirmationLabel}</label>
                </div>
                {errors.isOwner && <p className="text-red-500 text-sm mt-2">{t_page.errors.mustBeOwner}</p>}
            </div>

             <div className="flex justify-between items-center pt-4">
                <Button type="button" variant="secondary" onClick={prevStep}>{t_page.back}</Button>
                <Button type="submit" isLoading={isSubmitting} size="lg" className="px-8">
                    {t_page.submitButton}
                </Button>
            </div>

        </form>
    );
};
