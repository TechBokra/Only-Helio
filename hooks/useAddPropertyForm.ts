
import React, { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addRequest } from '../services/requests';
import { RequestType, AddPropertyRequest, FilterOption } from '../types';
import { useToast } from '../components/shared/ToastContext';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../services/filters';
import { getPlans } from '../services/plans';
import { useLanguage } from '../components/shared/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { fileToBase64 } from '../utils/fileUtils';

const purposeOptions = [
    { en: 'For Sale', ar: 'للبيع' },
    { en: 'For Rent', ar: 'إيجار' },
] as const;

// Helper to map form keys (apartment) to internal DB Types (Apartment)
const typeMapping: Record<string, string> = {
    'apartment': 'Apartment',
    'villa': 'Villa',
    'commercial': 'Commercial',
    'land': 'Land',
    'office': 'Commercial', // Map office to Commercial for now
};

export const useAddPropertyForm = () => {
    const { language, t } = useLanguage();
    const t_page = t.addPropertyPage;
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [purpose, setPurpose] = useState<'For Sale' | 'For Rent' | null>(null);
    const [cooperationType, setCooperationType] = useState<'paid_listing' | 'commission' | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    // Data Fetching
    const { data: propertyTypes, isLoading: isLoadingPropTypes } = useQuery({ queryKey: ['propertyTypes'], queryFn: getAllPropertyTypes });
    const { data: finishingStatuses, isLoading: isLoadingFinishing } = useQuery({ queryKey: ['finishingStatuses'], queryFn: getAllFinishingStatuses });
    const { data: amenities, isLoading: isLoadingAmenities } = useQuery({ queryKey: ['amenities'], queryFn: getAllAmenities });
    const { data: plans, isLoading: isLoadingPlans } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
    const isLoadingContext = isLoadingPropTypes || isLoadingFinishing || isLoadingPlans || isLoadingAmenities;

    // React Hook Form
    const methods = useForm({
        defaultValues: {
            customerName: '', customerPhone: '', contactTime: '',
            description: { ar: '', en: '' },
            propertyType: '', finishingStatus: '', area: '', price: '',
            bedrooms: '', bathrooms: '', floor: '', address: '',
            latitude: '', longitude: '',
            isInCompound: 'no' as 'yes' | 'no',
            deliveryType: 'immediate' as 'immediate' | 'future',
            deliveryMonth: '', deliveryYear: '',
            hasInstallments: 'no' as 'yes' | 'no',
            realEstateFinanceAvailable: 'no' as 'yes' | 'no',
            downPayment: '', monthlyInstallment: '', years: '',
            listingStartDate: '', listingEndDate: '',
            isOwner: false,
            contactMethod: 'platform' as 'platform' | 'direct',
            ownerPhone: '',
            amenities: { en: [] as string[], ar: [] as string[] },
        }
    });
    
    const { register, handleSubmit, watch, setValue, formState: { errors }, reset, getValues } = methods;
    
    const watchPropertyType = watch("propertyType");
    const watchLatitude = watch("latitude");
    const watchLongitude = watch("longitude");
    const watchAmenities = watch('amenities');

    // Mutation for submission
    const mutation = useMutation({
        mutationFn: (data: any) => addRequest(RequestType.PROPERTY_LISTING_REQUEST, data),
        onSuccess: () => {
            setFormSubmitted(true);
            queryClient.invalidateQueries({ queryKey: ['allRequests'] });
        },
        onError: (error) => {
            console.error("Failed to submit property request:", error);
            showToast('Submission failed. Please try again.', 'error');
        }
    });

    const resetForm = () => {
        reset();
        setImages([]);
        setImagePreviews([]);
        setCooperationType(null);
        setPurpose(null);
        setCurrentStep(1);
        setFormSubmitted(false);
    };

    // Step navigation
    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => {
        if (currentStep === 3) setCooperationType(null);
        if (currentStep === 2) setPurpose(null);
        setCurrentStep(prev => prev - 1);
    }
    const handlePurposeSelect = (p: 'For Sale' | 'For Rent') => {
        setPurpose(p);
        nextStep();
    }
    const handleCooperationSelect = (c: 'paid_listing' | 'commission') => {
        setCooperationType(c);
        nextStep();
    }

    const plansForPurpose = useMemo(() => {
        if (!purpose || !plans) return {};
        // Access nested safe check
        const indPlans = (plans as any).individual;
        if (!indPlans) return {};

        const subCategory = purpose === 'For Sale' ? 'sale' : 'rent';
        return indPlans[subCategory] || {};
    }, [purpose, plans]);

    // Image handling
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray: File[] = Array.from(e.target.files);
            if ((images.length + filesArray.length) > 10) {
                showToast('You can only upload a maximum of 10 images.', 'error');
                return;
            }
            setImages(prev => [...prev, ...filesArray]);
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...newPreviews]);
        }
    };
    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Location Modal Handlers
    const handleLocationSelect = (location: { lat: number, lng: number }) => {
        setValue('latitude', String(location.lat), { shouldValidate: true });
        setValue('longitude', String(location.lng), { shouldValidate: true });
        setIsLocationModalOpen(false);
    };

    // Dynamic Options Filtering
    const availableAmenities = useMemo(() => {
        if (!amenities) return [];
        // Map the selected form value (e.g., 'apartment') to the internal English Type (e.g., 'Apartment')
        const internalTypeName = watchPropertyType ? typeMapping[watchPropertyType] : null;

        if (!internalTypeName) return amenities;
        
        return amenities.filter(amenity => 
            !amenity.applicableTo || amenity.applicableTo.length === 0 || amenity.applicableTo.includes(internalTypeName)
        );
    }, [amenities, watchPropertyType]);

    const handleAmenityChange = (amenityEn: string) => {
        const currentAmenitiesEn = watchAmenities?.en || [];
        const newAmenitiesEn = currentAmenitiesEn.includes(amenityEn)
            ? currentAmenitiesEn.filter((a: string) => a !== amenityEn)
            : [...currentAmenitiesEn, amenityEn];
        const amenitiesAr = newAmenitiesEn.map((en: string) => amenities?.find(a => a.en === en)?.ar || en);
        setValue('amenities', { en: newAmenitiesEn, ar: amenitiesAr });
    };
    
    // Form submission
    const onSubmit = async (formData: any) => {
        // Check ownership confirmation from hook state if not passed in formData
        const isOwner = formData.isOwner || getValues('isOwner');
        if (!isOwner) {
            showToast(t_page.errors.mustBeOwner, 'error');
            return;
        }

        if (!cooperationType || !purpose) {
            showToast(t_page.errors.cooperationType, 'error');
            return;
        }
        
        // Mandatory Image Check
        if (images.length === 0) {
            showToast(language === 'ar' ? 'يرجى رفع صورة واحدة على الأقل' : 'Please upload at least one image', 'error');
            return;
        }

        const imageBase64Strings = await Promise.all(images.map(file => fileToBase64(file)));
        
        // Ensure lat/lng are present
        const lat = formData.latitude || getValues('latitude');
        const lng = formData.longitude || getValues('longitude');
        
        // Find property type based on the selected KEY (e.g. 'apartment')
        const selectedTypeOption = propertyTypes?.find(o => o.id.toLowerCase().includes(formData.propertyType) || o.en.toLowerCase() === formData.propertyType) || { en: 'Apartment', ar: 'شقة' };
        const selectedFinishingOption = finishingStatuses?.find(o => o.en.toLowerCase().replace(/ /g,'_') === formData.finishingStatus || o.id.includes(formData.finishingStatus)) || { en: 'Core & Shell', ar: 'بدون تشطيب' };

        const propertyDetails = {
            purpose: purposeOptions.find(o => o.en === purpose)!,
            title: { ar: 'عقار جديد (في انتظار العنوان)', en: 'New Property (Pending Title)' },
            description: { ar: formData['description.ar'] || '', en: formData['description.en'] || '' },
            propertyType: selectedTypeOption,
            finishingStatus: selectedFinishingOption,
            area: parseInt(formData.area),
            price: parseInt(formData.price),
            bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
            bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
            floor: formData.floor ? parseInt(formData.floor) : undefined,
            address: formData.address,
            amenities: formData.amenities || getValues('amenities'),
            location: { lat: parseFloat(lat || '30.0'), lng: parseFloat(lng || '31.0') }, 
            isInCompound: formData.isInCompound === 'yes',
            deliveryType: formData.deliveryType,
            deliveryMonth: formData.deliveryMonth,
            deliveryYear: formData.deliveryYear,
            hasInstallments: formData.hasInstallments === 'yes',
            realEstateFinanceAvailable: formData.realEstateFinanceAvailable === 'yes',
            downPayment: formData.downPayment ? parseInt(formData.downPayment) : undefined,
            monthlyInstallment: formData.monthlyInstallment ? parseInt(formData.monthlyInstallment) : undefined,
            years: formData.years ? parseInt(formData.years) : undefined,
            listingStartDate: formData.listingStartDate,
            listingEndDate: formData.listingEndDate,
            contactMethod: cooperationType === 'commission' ? 'platform' : (formData.contactMethod || getValues('contactMethod')),
            ownerPhone: formData.ownerPhone || getValues('ownerPhone'),
        };
        
        if (cooperationType === 'paid_listing') {
            const planDetails = plansForPurpose['paid_listing'];
            const planPriceString = planDetails?.[language]?.price || "0";
            const priceNumeric = parseInt(planPriceString.replace(/[^0-9]/g, '')) || 0;

            navigate('/payment', { 
                state: { 
                    amount: priceNumeric,
                    description: `Property Listing Fee: ${propertyDetails.title.en || 'New Property'}`,
                    type: 'listing_fee',
                    userId: formData.customerPhone, 
                    userName: formData.customerName,
                    data: {
                        requesterInfo: { name: formData.customerName, phone: formData.customerPhone },
                        payload: {
                            contactTime: formData.contactTime,
                            cooperationType: cooperationType,
                            propertyDetails,
                            images: imageBase64Strings,
                        }
                    }
                } 
            });
        } else {
            mutation.mutate({
                requesterInfo: { name: formData.customerName, phone: formData.customerPhone },
                payload: {
                    contactTime: formData.contactTime,
                    cooperationType: cooperationType,
                    propertyDetails,
                    images: imageBase64Strings,
                }
            });
        }
    };

    return {
        currentStep,
        purpose,
        cooperationType,
        plansForPurpose,
        formSubmitted,
        isLoadingContext,
        isLocationModalOpen,
        imagePreviews,
        
        // Handlers
        nextStep,
        prevStep,
        handlePurposeSelect,
        handleCooperationSelect,
        handleImageChange,
        removeImage,
        setIsLocationModalOpen,
        handleAmenityChange,
        handleLocationSelect,
        resetForm,

        // React Hook Form methods
        register,
        handleSubmit: handleSubmit(onSubmit),
        watch,
        setValue,
        errors,
        formMethods: methods, 
        
        // Exposed raw submit for external callers
        onSubmit,

        // Watchers
        watchPropertyType,
        watchAmenities,
        availableAmenities,
        watchLatitude,
        watchLongitude,
        propertyTypes,
        finishingStatuses,
        
        isSubmitting: mutation.isPending,
    };
};
