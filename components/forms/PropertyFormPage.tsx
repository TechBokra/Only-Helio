
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Property, AddPropertyRequest } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { addProperty as apiAddProperty, updateProperty as apiUpdateProperty, getAllProperties } from '../../services/properties';
import { updatePropertyRequestStatus } from '../../services/propertyRequests';
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
    
    // Additional fields used in request mapping or form state
    hasInstallments?: string;
    deliveryType?: string;
    deliveryMonth?: string;
    deliveryYear?: string;
    downPayment?: string;
    monthlyInstallment?: string;
    years?: string;
}

const PropertyFormPage: React.FC = () => {
    const { propertyId } = useParams();
    const navigate = useNavigate();
    const locationHook = useLocation(); // Use location to get state
    const [searchParams] = useSearchParams();
    const { currentUser, hasPermission } = useAuth();
    const { language, t } = useLanguage();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    
    // Check if we are editing from a Request
    const requestData = locationHook.state?.fromRequest as AddPropertyRequest | undefined;
    
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

    const handleNavigationSuccess = async (property?: Property) => {
        // If this was from a request, mark the request as approved
        if (requestData) {
            await updatePropertyRequestStatus(requestData.id, 'approved');
            showToast('Original request marked as Approved.', 'success');
            queryClient.invalidateQueries({ queryKey: ['propertyRequests'] });
        }

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
        if (requestData && !propertyId) {
            // --- PRE-FILL FROM REQUEST DATA ---
            const pd = requestData.propertyDetails;
            const safeVal = (val: any) => val || '';
            const safeNum = (val: any) => Number(val) || 0;
            const getEn = (obj: any) => obj?.en || obj || '';
            const getAr = (obj: any) => obj?.ar || obj || '';

            reset({
                title: { ar: getAr(pd.title) || 'عقار جديد (من طلب)', en: getEn(pd.title) || 'New Property (From Request)' },
                description: { ar: getAr(pd.description), en: getEn(pd.description) },
                address: { ar: safeVal(pd.address), en: safeVal(pd.address) },
                priceNumeric: safeNum(pd.price),
                area: safeNum(pd.area),
                status: pd.purpose || { en: 'For Sale', ar: 'للبيع' },
                type: { en: getEn(pd.propertyType), ar: getAr(pd.propertyType) },
                finishingStatus: pd.finishingStatus || { en: '', ar: '' },
                beds: safeNum(pd.bedrooms),
                baths: safeNum(pd.bathrooms),
                floor: safeNum(pd.floor),
                isInCompound: pd.isInCompound ? 'true' : 'false',
                installmentsAvailable: pd.hasInstallments ? 'true' : 'false',
                realEstateFinanceAvailable: pd.realEstateFinanceAvailable ? 'true' : 'false',
                delivery: { isImmediate: pd.deliveryType === 'immediate' ? 'true' : 'false', date: pd.deliveryType === 'future' ? `${pd.deliveryYear}-${pd.deliveryMonth}` : '' },
                installments: { 
                    downPayment: safeNum(pd.downPayment), 
                    monthlyInstallment: safeNum(pd.monthlyInstallment), 
                    years: safeNum(pd.years) 
                },
                location: pd.location || { lat: 30.129, lng: 31.621 },
                amenities: pd.amenities || { ar: [], en: [] },
                contactMethod: pd.contactMethod || 'platform',
                ownerPhone: pd.ownerPhone || '',
                listingStatus: 'active', // Default to active when approving
                projectId: '',
            } as any);

            if (requestData.images && requestData.images.length > 0) {
                setMainImage(requestData.images[0]);
                if (requestData.images.length > 1) {
                     setGalleryImages(requestData.images.slice(1));
                     setGalleryImageFiles(new Array(requestData.images.length - 1).fill(null)); // No files to upload, just URLs
                }
            }

        } else if (propertyId && properties) {
            // --- EDIT EXISTING PROPERTY ---
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
                    projectId: prop.projectId || '', 
                } as any);
                
                setMainImage(prop.imageUrl);
                setMainImageFile(null);
                
                setGalleryImages(prop.gallery || []);
                setGalleryImageFiles(new Array(prop.gallery?.length || 0).fill(null));
                
            } else if (propertyId && !isLoadingContext) {
                const redirectPath = hasPermission(Permission.VIEW_ADMIN_DASHBOARD) ? '/admin/properties' : '/dashboard/properties';
                navigate(redirectPath);
            }
        } else if (!propertyId && !requestData) {
             // --- NEW BLANK PROPERTY ---
             reset({
                projectId: searchParams.get('projectId') || '',
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
    }, [propertyId, currentUser, navigate, properties, reset, searchParams, hasPermission, isLoadingContext, requestData]);
    
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
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryImages(prev => [...prev, ...newPreviews]);
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
        if (!currentUser || !('type' in currentUser)) return;
        
        setIsUploading(true);

        try {
            // 1. Handle Main Image Upload
            let finalMainImage = mainImage;
            if (mainImageFile) {
                finalMainImage = await uploadToCloudinary(mainImageFile);
            } else if (!finalMainImage && requestData) {
                 // If coming from request and no new file, stick with existing URL (already in mainImage)
            }

            // 2. Handle Gallery Uploads
            const finalGalleryImages = await Promise.all(galleryImages.map(async (img, index) => {
                const file = galleryImageFiles[index];
                if (file) {
                     return await uploadToCloudinary(file);
                }
                return img; // Existing URL from edit or request
            }));

            const priceNumeric = Number(formData.priceNumeric) || 0;
            const formattedPriceAr = `${priceNumeric.toLocaleString('ar-EG')} ج.م`;
            const formattedPriceEn = `EGP ${priceNumeric.toLocaleString('en-US')}`;

            const pricePerMeterNumeric = Math.round(priceNumeric / (Number(formData.area) || 1));
            const pricePerMeter = formData.status?.en === 'For Sale' && pricePerMeterNumeric > 0 ? {
                ar: `${pricePerMeterNumeric.toLocaleString('ar-EG')} ج.م/م²`,
                en: `EGP ${pricePerMeterNumeric.toLocaleString('en-US')}/m²`,
            } : undefined;

            const safeInt = (val: any) => (val !== '' && val !== undefined && val !== null) ? Number(val) : undefined;
            
            // Determine Partner ID
            // If editing, keep existing. If new from request, maybe assign to 'individual-listings' or current admin
            let targetPartnerId = currentUser.id;
            if (requestData) targetPartnerId = 'individual-listings'; // Default for requests
            if (propertyId) targetPartnerId = properties?.find(p => p.id === propertyId)?.partnerId || currentUser.id;

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
                partnerId: targetPartnerId,
                price: { ar: formattedPriceAr, en: formattedPriceEn },
                priceNumeric,
                pricePerMeter,
                imageUrl: finalMainImage,
                gallery: finalGalleryImages,
                listingStatus: formData.listingStatus as any,
                type: { en: formData.type.en as any, ar: formData.type.ar },
                beds: safeInt(formData.beds) || 0,
                baths: safeInt(formData.baths) || 0,
                floor: safeInt(formData.floor),
                projectId: formData.projectId || undefined,
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
            showToast(error.message || "Failed to save property.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoadingContext && !projects) return <div className="p-8 text-center">Loading form...</div>;

    const isAdmin = hasPermission(Permission.MANAGE_ALL_PROPERTIES);
    // Bypass limit check if we are processing a request or editing
    if (isLimitReached && !propertyId && !requestData && !isAdmin) {
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

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {propertyId ? td.editTitle : requestData ? 'Review & Publish Request' : td.addTitle}
                </h1>
                {requestData && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-amber-200">
                        Converting Request to Listing
                    </span>
                )}
            </div>
            
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

                    <div className="flex justify-end pt-4 pb-12 gap-4">
                        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSubmitting} size="lg" className="px-12">
                            {isSubmitting 
                                ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                                : (requestData ? 'Approve & Publish' : td.saveProperty)
                            }
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};

export default PropertyFormPage;
