
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Property, FilterOption } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { addProperty as apiAddProperty, updateProperty as apiUpdateProperty, getAllProperties } from '../../services/properties';
import { addNotification } from '../../services/notifications'; // Import notification service
import { getAllProjects } from '../../services/projects';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../../services/filters';
import { Role, Permission } from '../../types';
import { useToast } from '../shared/ToastContext';
import { useSubscriptionUsage } from '../../hooks/useSubscriptionUsage';
import UpgradeNotice from '../shared/UpgradeNotice';
import { useLanguage } from '../shared/LanguageContext';
import { Button } from '../ui/Button';
import FormField, { inputClasses } from '../ui/FormField';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import { useSiteContent } from '../../hooks/useSiteContent';
import { ShieldCheckIcon, InformationCircleIcon } from '../ui/Icons';

// Import new Sub-components
import PropertyBasicInfo from './property/PropertyBasicInfo';
import PropertySpecs from './property/PropertySpecs';
import PropertyFinancials from './property/PropertyFinancials';
import PropertyLocation from './property/PropertyLocation';
import PropertyMedia from './property/PropertyMedia';
import LocationPickerModal from '../shared/LocationPickerModal';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

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
    listingStartDate?: string;
    listingEndDate?: string;
    isInCompound: string;
    realEstateFinanceAvailable: string;
    installmentsAvailable: string;
    delivery: { isImmediate: string; date?: string };
    installments?: { downPayment: number; monthlyInstallment: number; years: number };
    contactMethod: 'platform' | 'direct';
    ownerPhone?: string;
}

const PropertyFormPage: React.FC = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser, hasPermission } = useAuth();
    const { language, t } = useLanguage();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const { data: siteContent } = useSiteContent();
    
    // Correctly determine usage type based on Role
    const usageType = currentUser?.role === Role.DEVELOPER_PARTNER ? 'units' : 'properties';
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
    
    const [mainImage, setMainImage] = useState<string>('');
    const [galleryImages, setGalleryImages] = useState<string[]>([]);
    const [isMapOpen, setIsMapOpen] = useState(false);

    const partnerProjects = useMemo(() => (projects || []).filter(p => p.partnerId === currentUser?.id), [projects, currentUser]);
    const watchContactMethod = watch('contactMethod');

    const isAdmin = hasPermission(Permission.MANAGE_ALL_PROPERTIES);

    // Helper to notify admin on partner submission
    const notifyAdmin = async (propertyTitle: string, partnerName: string) => {
        if (isAdmin) return; // Admins don't need to notify themselves
        try {
            await addNotification({
                userId: 'admin-user', // Hardcoded super admin ID for MVP
                message: {
                    ar: `طلب مراجعة عقار جديد: "${propertyTitle}" من الشريك ${partnerName}`,
                    en: `New property review request: "${propertyTitle}" from partner ${partnerName}`
                },
                link: '/admin/properties/list?status=draft'
            });
        } catch (error) {
            console.error("Failed to notify admin", error);
        }
    };

    const handleNavigationSuccess = async (property?: Property) => {
        queryClient.invalidateQueries({ queryKey: ['allProperties'] });
        queryClient.invalidateQueries({ queryKey: [`partner-properties-${currentUser?.id}`] });
        queryClient.invalidateQueries({ queryKey: ['allPropertiesAdmin'] }); // Invalidate admin list too
        if (propertyId) {
            queryClient.invalidateQueries({ queryKey: [`property-${propertyId}`] });
        }
        
        // Notify Admin if it's a partner submission
        if (!isAdmin && property && currentUser) {
            await notifyAdmin(property.title.ar, currentUser.name);
        }

        const projectId = property?.projectId || watch('projectId');
        
        // Determine redirect logic
        if (hasPermission(Permission.VIEW_ADMIN_DASHBOARD)) {
            navigate('/admin/properties/list');
        } else if (currentUser?.role === Role.DEVELOPER_PARTNER) {
            if (projectId) {
                 navigate(`/dashboard/projects/${projectId}`);
            } else {
                 navigate('/dashboard/properties');
            }
        } else {
            navigate('/dashboard/properties');
        }
    };
    
    const addMutation = useMutation({
        mutationFn: apiAddProperty,
        onSuccess: (newProperty) => {
            if (isAdmin) {
                showToast(td.addSuccess, 'success');
            } else {
                showToast(language === 'ar' ? 'تم حفظ العقار وإرساله للمراجعة.' : 'Property submitted for review.', 'success');
            }
            handleNavigationSuccess(newProperty);
        },
        onError: () => showToast('Failed to add property.', 'error'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ propertyId, updates }: { propertyId: string; updates: Partial<Property> }) => apiUpdateProperty(propertyId, updates),
        onSuccess: (updatedProperty) => {
            if (isAdmin) {
                showToast(td.updateSuccess, 'success');
            } else {
                 showToast(language === 'ar' ? 'تم تحديث العقار وإرساله للمراجعة.' : 'Property updated and submitted for review.', 'success');
            }
            handleNavigationSuccess(updatedProperty);
        },
        onError: () => showToast('Failed to update property.', 'error'),
    });

    useEffect(() => {
        if (propertyId && properties) {
            const prop = properties.find(p => p.id === propertyId);
            const userCanEdit = currentUser && 'type' in currentUser && (prop?.partnerId === currentUser.id || hasPermission(Permission.MANAGE_ALL_PROPERTIES));

            if (prop && userCanEdit) {
                reset({
                    ...prop,
                    projectId: prop.projectId || '', // Ensure empty string if null for select handling
                    isInCompound: String(prop.isInCompound),
                    realEstateFinanceAvailable: String(prop.realEstateFinanceAvailable),
                    installmentsAvailable: String(prop.installmentsAvailable),
                    delivery: { ...prop.delivery, isImmediate: String(prop.delivery.isImmediate) },
                    finishingStatus: prop.finishingStatus || { en: '', ar: '' },
                    installments: prop.installments || { downPayment: 0, monthlyInstallment: 0, years: 0 },
                    contactMethod: prop.contactMethod || 'platform',
                    ownerPhone: prop.ownerPhone || '',
                    // Ensure dates are strings or empty strings for input[type="date"]
                    listingStartDate: prop.listingStartDate ? prop.listingStartDate.split('T')[0] : '',
                    listingEndDate: prop.listingEndDate ? prop.listingEndDate.split('T')[0] : '',
                } as any);
                setMainImage(prop.imageUrl);
                setGalleryImages(prop.gallery);
            } else if (propertyId && !isLoadingContext) {
                const redirectPath = hasPermission(Permission.VIEW_ADMIN_DASHBOARD) ? '/admin/properties' : '/dashboard/properties';
                navigate(redirectPath);
            }
        } else if (!propertyId) {
             reset({
                projectId: searchParams.get('projectId') || '',
                status: { en: 'For Sale', ar: 'للبيع' },
                type: { en: 'Apartment', ar: 'شقة' },
                beds: 0, baths: 0, area: 0, floor: 0,
                location: { lat: 30.129, lng: 31.621 }, // New Heliopolis approx center
                amenities: { ar: [], en: [] },
                installmentsAvailable: 'false',
                isInCompound: 'false',
                realEstateFinanceAvailable: 'false',
                delivery: { isImmediate: 'true', date: '' },
                installments: { downPayment: 0, monthlyInstallment: 0, years: 0 },
                contactMethod: 'platform', ownerPhone: '',
                listingStatus: 'active',
                listingStartDate: new Date().toISOString().split('T')[0],
                priceNumeric: 0,
                title: { ar: '', en: '' }, description: { ar: '', en: '' }, address: { ar: '', en: '' }
            });
            setMainImage('');
            setGalleryImages([]);
        }
    }, [propertyId, currentUser, navigate, properties, reset, searchParams, hasPermission, isLoadingContext]);
    
    // Image Handlers
    const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setMainImage(base64);
        }
    };

    const handleGalleryImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const base64Promises = files.map((file: File) => fileToBase64(file));
            const base64Images = await Promise.all(base64Promises);
            setGalleryImages(prev => [...prev, ...base64Images]);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryImages(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleLocationSelect = (loc: { lat: number, lng: number }) => {
        setValue('location.lat', loc.lat);
        setValue('location.lng', loc.lng);
        setIsMapOpen(false);
    }

    const onSubmit = async (formData: PropertyFormData) => {
        if (!currentUser || !('type' in currentUser) || !amenities) return;
        
        const priceNumeric = Number(formData.priceNumeric) || 0;
        const formattedPriceAr = `${priceNumeric.toLocaleString('ar-EG')} ج.م`;
        const formattedPriceEn = `EGP ${priceNumeric.toLocaleString('en-US')}`;

        const pricePerMeterNumeric = Math.round(priceNumeric / (Number(formData.area) || 1));
        const pricePerMeter = formData.status?.en === 'For Sale' && pricePerMeterNumeric > 0 ? {
            ar: `${pricePerMeterNumeric.toLocaleString('ar-EG')} ج.م/م²`,
            en: `EGP ${pricePerMeterNumeric.toLocaleString('en-US')}/m²`,
        } : undefined;

        // Ensure location defaults if maps are disabled
        const defaultLat = 30.0;
        const defaultLng = 31.0;
        const finalLocation = siteContent?.enableMaps 
            ? formData.location 
            : { lat: defaultLat, lng: defaultLng };
        
        // --- CRITICAL LOGIC: Enforce Draft Status for Non-Admins ---
        // Even on update, if a partner touches it, it goes back to draft for review.
        let listingStatus = formData.listingStatus || 'draft';
        if (!isAdmin) {
             listingStatus = 'draft';
        }

        const propertyData: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl'> = {
            ...formData,
            projectId: formData.projectId || undefined, // Ensure null/undefined if empty string
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
            imageUrl: mainImage,
            gallery: galleryImages,
            listingStatus: listingStatus as any,
            listingStartDate: formData.listingStartDate ? formData.listingStartDate : undefined,
            listingEndDate: formData.listingEndDate ? formData.listingEndDate : undefined,
            type: { en: formData.type.en as any, ar: formData.type.ar },
            beds: formData.beds || 0,
            baths: formData.baths || 0,
            floor: formData.floor,
            location: finalLocation,
            createdAt: propertyId && properties?.find(p => p.id === propertyId)?.createdAt ? properties.find(p => p.id === propertyId)!.createdAt : new Date().toISOString()
        };
        
        if (propertyId) {
            updateMutation.mutate({ propertyId, updates: propertyData });
        } else {
            addMutation.mutate(propertyData);
        }
    };

    if (isLoadingContext && !projects) return <div className="p-8 text-center">Loading form...</div>;

    if (isLimitReached && !propertyId && !isAdmin) {
        return <UpgradeNotice />;
    }
    
    const isSubmitting = addMutation.isPending || updateMutation.isPending;

    return (
        <div>
            {siteContent?.enableMaps && isMapOpen && (
                <LocationPickerModal 
                    onClose={() => setIsMapOpen(false)} 
                    onLocationSelect={handleLocationSelect} 
                    initialLocation={watch('location')}
                />
            )}

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{propertyId ? td.editTitle : td.addTitle}</h1>
            
            {/* Info Alert for Partners: Explanation of Review Process */}
            {!isAdmin && (
                <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r shadow-sm">
                    <div className="flex items-center">
                        <InformationCircleIcon className="w-6 h-6 text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                                {language === 'ar' ? 'ملاحظة هامة' : 'Important Note'}
                            </p>
                            <p className="text-sm text-blue-600 dark:text-blue-200 mt-1">
                                {language === 'ar' 
                                    ? 'أي إضافة أو تعديل على العقارات يتطلب مراجعة وموافقة من إدارة الموقع قبل الظهور للعامة. سيتم حفظ العقار كـ "مسودة" مؤقتاً.'
                                    : 'Any additions or edits to properties require admin approval before appearing publicly. The property will be saved as a "Draft" temporarily.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

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
                        isAdmin={isAdmin} 
                    />

                    <PropertyFinancials />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {siteContent?.enableMaps && (
                            <PropertyLocation onOpenMap={() => setIsMapOpen(true)} />
                        )}
                        
                        <PropertyMedia 
                            mainImage={mainImage}
                            galleryImages={galleryImages}
                            handleMainImageChange={handleMainImageChange}
                            handleGalleryImagesChange={handleGalleryImagesChange}
                            removeGalleryImage={removeGalleryImage}
                        />
                    </div>

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
                            {isAdmin ? td.saveProperty : (language === 'ar' ? 'حفظ وإرسال للمراجعة' : 'Save & Submit for Review')}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};

export default PropertyFormPage;
