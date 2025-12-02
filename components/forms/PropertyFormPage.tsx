
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Property, FilterOption } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { addProperty as apiAddProperty, updateProperty as apiUpdateProperty, getAllProperties } from '../../services/properties';
import { getAllProjects } from '../../services/projects';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../../services/filters';
import { Role, Permission } from '../../types';
import { useToast } from '../shared/ToastContext';
import { useSubscriptionUsage } from '../../hooks/useSubscriptionUsage';
import UpgradeNotice from '../shared/UpgradeNotice';
import { useLanguage } from '../shared/LanguageContext';
import { Button } from '../ui/Button';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import FormField, { inputClasses, selectClasses } from '../ui/FormField';

// Import Sub-components
import PropertyBasicInfo from './property/PropertyBasicInfo';
import PropertySpecs from './property/PropertySpecs';
import PropertyFinancials from './property/PropertyFinancials';
import PropertyLocation from './property/PropertyLocation';
import PropertyMedia from './property/PropertyMedia';
import LocationPickerModal from '../shared/LocationPickerModal';
import { uploadToCloudinary } from '../../lib/cloudinary';

// Define form data structure export for consistency
export interface PropertyFormData {
    projectId?: string;
    title: { ar: string; en: string };
    description: { ar: string; en: string };
    address: { ar: string; en: string };
    status: { en: string; ar: string };
    type: { en: string; ar: string };
    finishingStatus: { en: string; ar: string };
    area: number;
    priceNumeric: number;
    beds?: number;
    baths?: number;
    floor?: number;
    amenities: { en: string[], ar: string[] };
    location: { lat: number; lng: number };
    listingStatus: string;
    isInCompound: string;
    realEstateFinanceAvailable: string;
    installmentsAvailable: string;
    delivery: { isImmediate: string; date?: string };
    installments?: { downPayment: number; monthlyInstallment: number; years: number };
    contactMethod: 'platform' | 'direct';
    ownerPhone?: string;
    listingStartDate?: string;
    listingEndDate?: string;
}

const PropertyFormPage: React.FC = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser, hasPermission } = useAuth();
    const { language, t } = useLanguage();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    
    const usageType = currentUser?.type === 'developer' ? 'units' : 'properties';
    const { isLimitReached } = useSubscriptionUsage(usageType);

    // Data Fetching
    const { data: properties } = useQuery({ queryKey: ['allProperties'], queryFn: getAllProperties });
    const { data: projects, isLoading: isLoadingProjs } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects });
    const { data: propertyTypes, isLoading: isLoadingPropTypes } = useQuery({ queryKey: ['propertyTypes'], queryFn: getAllPropertyTypes });
    const { data: finishingStatuses, isLoading: isLoadingFinishing } = useQuery({ queryKey: ['finishingStatuses'], queryFn: getAllFinishingStatuses });
    const { data: amenities, isLoading: isLoadingAmenities } = useQuery({ queryKey: ['amenities'], queryFn: getAllAmenities });
    
    const isLoadingContext = isLoadingProjs || isLoadingPropTypes || isLoadingFinishing || isLoadingAmenities;

    const td = t.dashboard.propertyForm;
    
    // Form Methods
    const methods = useForm<PropertyFormData>();
    const { handleSubmit, setValue, reset, watch } = methods;
    
    // Image State
    const [mainImage, setMainImage] = useState<string>('');
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [galleryImageFiles, setGalleryImageFiles] = useState<(File | null)[]>([]);

    const [isMapOpen, setIsMapOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const partnerProjects = useMemo(() => (projects || []).filter(p => p.partnerId === currentUser?.id), [projects, currentUser]);
    const watchContactMethod = watch('contactMethod');

    const handleNavigationSuccess = (property?: Property) => {
        queryClient.invalidateQueries({ queryKey: ['allProperties'] });
        queryClient.invalidateQueries({ queryKey: ['allPropertiesAdmin'] });
        queryClient.invalidateQueries({ queryKey: [`partner-properties-${currentUser?.id}`] });
        if (propertyId) {
            queryClient.invalidateQueries({ queryKey: [`property-${propertyId}`] });
        }
        
        const projectId = property?.projectId || watch('projectId');
        
        if (hasPermission(Permission.VIEW_ADMIN_DASHBOARD)) {
            navigate('/admin/properties/list');
        } else if (currentUser?.role === Role.DEVELOPER_PARTNER && projectId) {
            navigate(`/dashboard/projects/${projectId}`);
        } else if (currentUser?.role === Role.DEVELOPER_PARTNER && !projectId) {
            navigate('/dashboard/projects');
        } else {
            navigate('/dashboard/properties');
        }
    };
    
    const addMutation = useMutation({
        mutationFn: apiAddProperty,
        onSuccess: (newProperty) => {
            showToast(td.addSuccess, 'success');
            handleNavigationSuccess(newProperty);
        },
        onError: (error: any) => {
             console.error("Submission Error:", error);
             showToast(`Failed to add property: ${error.message || 'Unknown error'}`, 'error');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ propertyId, updates }: { propertyId: string; updates: Partial<Property> }) => apiUpdateProperty(propertyId, updates),
        onSuccess: (updatedProperty) => {
            showToast(td.updateSuccess, 'success');
            handleNavigationSuccess(updatedProperty);
        },
        onError: (error: any) => {
             console.error("Update Error:", error);
             showToast(`Failed to update property: ${error.message || 'Unknown error'}`, 'error');
        },
    });

    useEffect(() => {
        if (propertyId && properties) {
            const prop = properties.find(p => p.id === propertyId);
            const userCanEdit = currentUser && 'type' in currentUser && (prop?.partnerId === currentUser.id || hasPermission(Permission.MANAGE_ALL_PROPERTIES));

            if (prop && userCanEdit) {
                reset({
                    ...prop,
                    isInCompound: String(prop.isInCompound),
                    realEstateFinanceAvailable: String(prop.realEstateFinanceAvailable),
                    installmentsAvailable: String(prop.installmentsAvailable),
                    delivery: { ...prop.delivery, isImmediate: String(prop.delivery.isImmediate) },
                    finishingStatus: prop.finishingStatus || { en: '', ar: '' },
                    installments: prop.installments || { downPayment: 0, monthlyInstallment: 0, years: 0 },
                    contactMethod: prop.contactMethod || 'platform',
                    ownerPhone: prop.ownerPhone || '',
                    projectId: prop.projectId || '', // Ensure empty string if null for controlled input
                } as any);
                
                setMainImage(prop.imageUrl);
                setMainImageFile(null);
                
                setGalleryImages(prop.gallery || []);
                // Initialize tracker with nulls matching gallery length
                setGalleryImageFiles(new Array(prop.gallery?.length || 0).fill(null));
                
            } else if (propertyId && !isLoadingContext) {
                const redirectPath = hasPermission(Permission.VIEW_ADMIN_DASHBOARD) ? '/admin/properties' : '/dashboard/properties';
                navigate(redirectPath);
            }
        } else if (!propertyId) {
             reset({
                projectId: searchParams.get('projectId') || '', // Default to empty string
                status: { en: 'For Sale', ar: 'للبيع' },
                type: { en: 'Apartment', ar: 'شقة' },
                beds: 3, baths: 2, area: 150, floor: 1,
                location: { lat: 30.129, lng: 31.621 },
                amenities: { ar: [], en: [] },
                installmentsAvailable: 'false',
                isInCompound: 'false',
                realEstateFinanceAvailable: 'false',
                delivery: { isImmediate: 'true', date: '' },
                installments: { downPayment: 0, monthlyInstallment: 0, years: 0 },
                contactMethod: 'platform', ownerPhone: '',
                listingStatus: 'active',
                priceNumeric: 0,
                title: { ar: '', en: '' }, description: { ar: '', en: '' }, address: { ar: '', en: '' }
            });
            setMainImage('');
            setMainImageFile(null);
            setGalleryImages([]);
            setGalleryImageFiles([]);
        }
    }, [propertyId, currentUser, navigate, properties, reset, searchParams, hasPermission, isLoadingContext]);
    
    // Image Handlers
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMainImageFile(file);
            setMainImage(URL.createObjectURL(file));
        }
    };

    const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files: File[] = Array.from(e.target.files);
            // Append new previews
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryImages(prev => [...prev, ...newPreviews]);
            // Append new files to the tracking array
            setGalleryImageFiles(prev => [...prev, ...files]);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
        setGalleryImageFiles(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleLocationSelect = (loc: { lat: number, lng: number }) => {
        setValue('location.lat', loc.lat);
        setValue('location.lng', loc.lng);
        setIsMapOpen(false);
    }

    const onSubmit = async (formData: PropertyFormData) => {
        if (!currentUser || !('type' in currentUser) || !amenities) return;
        
        setIsUploading(true);

        try {
            // 1. Handle Main Image Upload
            let finalMainImage = mainImage;
            if (mainImageFile) {
                try {
                    finalMainImage = await uploadToCloudinary(mainImageFile);
                } catch (e: any) {
                    throw new Error(`Main image upload failed: ${e.message}`);
                }
            }

            // 2. Handle Gallery Uploads
            // We iterate over galleryImages (current view). 
            // Correlate with galleryImageFiles: if entry is File, upload it. If null, use existing URL from galleryImages.
            const finalGalleryImages = await Promise.all(galleryImages.map(async (img, index) => {
                const file = galleryImageFiles[index];
                if (file) {
                     try {
                        return await uploadToCloudinary(file);
                    } catch (e: any) {
                        throw new Error(`Gallery image ${index + 1} upload failed: ${e.message}`);
                    }
                }
                return img; // Existing URL
            }));

            const priceNumeric = Number(formData.priceNumeric) || 0;
            const formattedPriceAr = `${priceNumeric.toLocaleString('ar-EG')} ج.م`;
            const formattedPriceEn = `EGP ${priceNumeric.toLocaleString('en-US')}`;

            const pricePerMeterNumeric = Math.round(priceNumeric / (Number(formData.area) || 1));
            const pricePerMeter = formData.status?.en === 'For Sale' && pricePerMeterNumeric > 0 ? {
                ar: `${pricePerMeterNumeric.toLocaleString('ar-EG')} ج.م/م²`,
                en: `EGP ${pricePerMeterNumeric.toLocaleString('en-US')}/m²`,
            } : undefined;

            const propertyData: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'> = {
                ...formData,
                status: { 
                    en: formData.status.en as 'For Sale' | 'For Rent', 
                    ar: formData.status.ar as 'للبيع' | 'إيجار' 
                },
                isInCompound: formData.isInCompound === 'true',
                realEstateFinanceAvailable: formData.realEstateFinanceAvailable === 'true',
                installmentsAvailable: formData.installmentsAvailable === 'true',
                delivery: {
                    isImmediate: formData.delivery?.isImmediate === 'true',
                    date: formData.delivery?.isImmediate !== 'true' ? formData.delivery.date : undefined,
                },
                partnerId: propertyId ? properties?.find(p => p.id === propertyId)?.partnerId || currentUser.id : currentUser.id,
                price: { ar: formattedPriceAr, en: formattedPriceEn },
                priceNumeric,
                pricePerMeter,
                imageUrl: finalMainImage,
                gallery: finalGalleryImages,
                listingStatus: formData.listingStatus as any,
                type: { en: formData.type.en as any, ar: formData.type.ar },
                beds: formData.beds || 0,
                baths: formData.baths || 0,
                floor: formData.floor,
                projectId: formData.projectId || undefined, // Pass undefined if empty string
                listingStartDate: formData.listingStartDate || undefined,
                listingEndDate: formData.listingEndDate || undefined
            };
            
            if (propertyId) {
                updateMutation.mutate({ propertyId, updates: propertyData });
            } else {
                addMutation.mutate(propertyData);
            }
        } catch (error: any) {
            console.error("Detailed Upload Error:", error);
            const errorMessage = error?.message || "Failed to upload images. Please try again.";
            showToast(errorMessage, "error");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoadingContext && !projects) return <div className="p-8 text-center">Loading form...</div>;

    const isAdmin = hasPermission(Permission.MANAGE_ALL_PROPERTIES);
    if (isLimitReached && !propertyId && !isAdmin) {
        return <UpgradeNotice />;
    }
    
    const isSubmitting = addMutation.isPending || updateMutation.isPending || isUploading;

    return (
        <div>
            {isMapOpen && (
                <LocationPickerModal 
                    onClose={() => setIsMapOpen(false)} 
                    onLocationSelect={handleLocationSelect} 
                    initialLocation={watch('location')}
                />
            )}

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{propertyId ? td.editTitle : td.addTitle}</h1>
            
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto">
                    
                    <PropertyBasicInfo 
                        projects={projects || []} 
                        partnerProjects={partnerProjects} 
                        isAdmin={isAdmin} 
                    />
                    
                    <PropertySpecs 
                        propertyTypes={propertyTypes || []}
                        finishingStatuses={finishingStatuses || []}
                        amenities={amenities || []}
                    />

                    <PropertyFinancials />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <PropertyLocation onOpenMap={() => setIsMapOpen(true)} />
                        
                        <PropertyMedia 
                            mainImage={mainImage}
                            galleryImages={galleryImages}
                            handleMainImageChange={handleMainImageChange}
                            handleGalleryImagesChange={handleGalleryImagesChange}
                            removeGalleryImage={removeGalleryImage}
                        />
                    </div>

                    {/* Contact Routing (Admin/Paid Feature) */}
                    {(isAdmin || (currentUser?.subscriptionPlan === 'paid_listing' && currentUser.type !== 'developer')) && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <fieldset className="space-y-2">
                                <legend className="font-semibold text-amber-500 text-lg mb-2">{td.inquiryRouting}</legend>
                                <RadioGroup className="flex gap-4 pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <RadioGroupItem value="platform" id="contact-platform" {...methods.register("contactMethod")} />
                                        <span className="text-gray-700 dark:text-gray-300">{td.useDefaultSettings}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <RadioGroupItem value="direct" id="contact-direct" {...methods.register("contactMethod")} />
                                        <span className="text-gray-700 dark:text-gray-300">{td.customizeForProperty}</span>
                                    </label>
                                </RadioGroup>
                                {watchContactMethod === 'direct' && (
                                    <div className="pt-4 animate-fadeIn max-w-md">
                                        <FormField label={td.directContactPhone} id="ownerPhone">
                                            <input type="tel" {...methods.register("ownerPhone", { required: watchContactMethod === 'direct' })} className={inputClasses} dir="ltr" placeholder="+20..." />
                                        </FormField>
                                    </div>
                                )}
                            </fieldset>
                        </div>
                    )}

                    <div className="flex justify-end pt-4 pb-12">
                        <Button type="submit" isLoading={isSubmitting} size="lg" className="px-12">
                            {isSubmitting ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : td.saveProperty}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};

export default PropertyFormPage;
