
import React, { useState, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addRequest } from '../services/requests';
import { RequestType, AddPropertyRequest, FilterOption } from '../types';
import { useToast } from '../components/shared/ToastContext';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../services/filters';
import { getPlans } from '../services/plans';
import { getAllProjects } from '../services/projects';
import { useLanguage } from '../components/shared/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { fileToBase64 } from '../utils/fileUtils';

const purposeOptions = [
    { en: 'For Sale', ar: 'للبيع' },
    { en: 'For Rent', ar: 'إيجار' },
] as const;

export const useAddPropertyForm = () => {
    const { language, t } = useLanguage();
    const t_page = t.addPropertyPage;
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [purpose, setPurpose] = useState<'For Sale' | 'For Rent' | null>(null);
    const [cooperationType, setCooperationType] = useState<'paid_listing' | 'commission' | null>(null);
    
    // Image State (Split to match Admin UI)
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    // Data Fetching
    const { data: propertyTypes, isLoading: isLoadingPropTypes } = useQuery({ queryKey: ['propertyTypes'], queryFn: getAllPropertyTypes });
    const { data: finishingStatuses, isLoading: isLoadingFinishing } = useQuery({ queryKey: ['finishingStatuses'], queryFn: getAllFinishingStatuses });
    const { data: amenities, isLoading: isLoadingAmenities } = useQuery({ queryKey: ['amenities'], queryFn: getAllAmenities });
    const { data: plans, isLoading: isLoadingPlans } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
    const { data: projects, isLoading: isLoadingProjects } = useQuery({ queryKey: ['allProjects'], queryFn: getAllProjects });

    const isLoadingContext = isLoadingPropTypes || isLoadingFinishing || isLoadingPlans || isLoadingAmenities || isLoadingProjects;

    // React Hook Form
    const methods = useForm({
        defaultValues: {
            // Owner Info
            customerName: '', 
            customerPhone: '', 
            contactTime: '',
            isOwner: false,
            
            // Property Core (Matching Admin Form Structure)
            projectId: '',
            title: { ar: '', en: '' },
            description: { ar: '', en: '' },
            address: { ar: '', en: '' },
            
            type: { en: 'Apartment', ar: 'شقة' }, // Store as object to match Admin components
            status: { en: 'For Sale', ar: 'للبيع' },
            finishingStatus: { en: '', ar: '' },
            
            area: 0, 
            priceNumeric: 0,
            beds: 0, 
            baths: 0, 
            floor: 0,
            
            location: { lat: 30.0, lng: 31.0 },
            
            // Features
            isInCompound: 'false',
            realEstateFinanceAvailable: 'false',
            installmentsAvailable: 'false',
            
            delivery: { isImmediate: 'true', date: '' },
            installments: { downPayment: 0, monthlyInstallment: 0, years: 0 },
            
            amenities: { en: [] as string[], ar: [] as string[] },
            
            listingStartDate: new Date().toISOString().split('T')[0],
            listingEndDate: '',
            contactMethod: 'platform' as 'platform' | 'direct',
            ownerPhone: '',
            
            // Legacy/Mapping fields
            deliveryType: 'immediate' as 'immediate' | 'future', // For backward compat if needed
        }
    });
    
    const { register, handleSubmit, watch, setValue, formState: { errors }, reset, getValues } = methods;
    
    // Watchers for UI updates
    const watchType = watch("type");
    const watchLocation = watch("location");

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
        setMainImageFile(null);
        setMainImagePreview('');
        setGalleryFiles([]);
        setGalleryPreviews([]);
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
        // Pre-fill status based on selection
        setValue('status', { en: p, ar: p === 'For Sale' ? 'للبيع' : 'إيجار' });
        nextStep();
    }
    const handleCooperationSelect = (c: 'paid_listing' | 'commission') => {
        setCooperationType(c);
        nextStep();
    }

    const plansForPurpose = useMemo(() => {
        if (!purpose || !plans) return {};
        const indPlans = (plans as any).individual;
        if (!indPlans) return {};
        const subCategory = purpose === 'For Sale' ? 'sale' : 'rent';
        return indPlans[subCategory] || {};
    }, [purpose, plans]);

    // --- Image Handling (Unified with Admin Logic) ---
    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray: File[] = Array.from(e.target.files);
            setGalleryFiles(prev => [...prev, ...filesArray]);
            const newPreviews = filesArray.map(file => URL.createObjectURL(file));
            setGalleryPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeGalleryImage = (index: number) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Location Modal Handlers
    const handleLocationSelect = (location: { lat: number, lng: number }) => {
        setValue('location.lat', location.lat, { shouldDirty: true });
        setValue('location.lng', location.lng, { shouldDirty: true });
        setIsLocationModalOpen(false);
    };

    // Form submission
    const onSubmit = async (formData: any) => {
        const isOwner = formData.isOwner;
        if (!isOwner) {
            showToast(t_page.errors.mustBeOwner, 'error');
            return;
        }

        if (!cooperationType || !purpose) {
            showToast(t_page.errors.cooperationType, 'error');
            return;
        }
        
        // Mandatory Image Check
        if (!mainImageFile) {
            showToast(language === 'ar' ? 'يرجى رفع الصورة الرئيسية' : 'Please upload a main image', 'error');
            return;
        }

        // Process Images
        const mainImageBase64 = await fileToBase64(mainImageFile);
        const galleryBase64Strings = await Promise.all(galleryFiles.map(file => fileToBase64(file)));
        
        // Combine images for the Request Payload (Main first)
        const allImages = [mainImageBase64, ...galleryBase64Strings];

        // Prepare Property Details Object (Matching Property Schema)
        const propertyDetails = {
            ...formData,
            // Explicitly ensure critical fields are structured for the Property Entity
            purpose: { en: purpose, ar: purpose === 'For Sale' ? 'للبيع' : 'إيجار' },
            propertyType: formData.type,
            finishingStatus: formData.finishingStatus,
            price: formData.priceNumeric,
            listingStatus: 'pending', // Initial status for request
            
            // Map flat fields to nested structures if needed, or keep as is if Admin Form components populated them correctly
            deliveryType: formData.delivery?.isImmediate === 'true' ? 'immediate' : 'future',
            
            // Used for search/filtering in Admin Request list
            title: formData.title,
            description: formData.description,
            address: formData.address,
        };
        
        // Common payload
        const payloadData = {
            requesterInfo: { name: formData.customerName, phone: formData.customerPhone },
            payload: {
                contactTime: formData.contactTime,
                cooperationType: cooperationType,
                propertyDetails,
                images: allImages,
            }
        };
        
        if (cooperationType === 'paid_listing') {
            // Retrieve dynamic price
            const planDetails = plansForPurpose['paid_listing'];
            const planPriceString = planDetails?.[language]?.price || "0";
            const priceNumeric = parseInt(planPriceString.replace(/[^0-9]/g, '')) || 0;

            if (priceNumeric > 0) {
                 navigate('/payment', { 
                    state: { 
                        amount: priceNumeric,
                        description: `Property Listing Fee: ${propertyDetails.title.en || 'New Property'}`,
                        type: 'listing_fee',
                        userId: formData.customerPhone, 
                        userName: formData.customerName,
                        data: payloadData
                    } 
                });
            } else {
                 mutation.mutate(payloadData);
            }
        } else {
            mutation.mutate(payloadData);
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
        
        // Image State
        mainImagePreview,
        galleryPreviews,
        
        // Handlers
        nextStep,
        prevStep,
        handlePurposeSelect,
        handleCooperationSelect,
        handleMainImageChange,
        handleGalleryImagesChange,
        removeGalleryImage,
        setIsLocationModalOpen,
        handleLocationSelect,
        resetForm,

        // React Hook Form methods
        register,
        handleSubmit: handleSubmit(onSubmit),
        watch,
        setValue,
        errors,
        formMethods: methods, 
        
        // Data
        projects,
        propertyTypes,
        finishingStatuses,
        amenities,
        
        watchLocation,
        
        isSubmitting: mutation.isPending,
    };
};
