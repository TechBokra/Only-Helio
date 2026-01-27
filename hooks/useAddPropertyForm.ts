
import React, { useState, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addRequest } from '../services/requests';
import { RequestType } from '../types';
import { useToast } from '../components/shared/ToastContext';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities } from '../services/filters';
import { getPlans } from '../services/plans';
import { getAllProjects } from '../services/projects';
import { useLanguage } from '../components/shared/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { fileToBase64 } from '../utils/fileUtils';

export const useAddPropertyForm = () => {
    const { language, t } = useLanguage();
    const t_page = t.addPropertyPage;
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [currentStep, setCurrentStep] = useState(1);
    const [purpose, setPurpose] = useState<'For Sale' | 'For Rent' | null>(null);
    const [cooperationType, setCooperationType] = useState<'paid_listing' | 'commission' | null>(null);
    
    // Image State
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string>('');
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    
    // Safety Ref AND State for strict prevention
    const isSubmittingRef = useRef(false);
    
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
            customerName: '', customerPhone: '', contactTime: '', isOwner: false,
            projectId: '',
            title: { ar: '', en: '' }, description: { ar: '', en: '' }, address: { ar: '', en: '' },
            type: { en: 'Apartment', ar: 'شقة' },
            status: { en: 'For Sale', ar: 'للبيع' },
            finishingStatus: { en: '', ar: '' },
            area: 0, priceNumeric: 0, beds: 0, baths: 0, floor: 0,
            location: { lat: 30.0, lng: 31.0 },
            isInCompound: 'false', realEstateFinanceAvailable: 'false', installmentsAvailable: 'false',
            delivery: { isImmediate: 'true', date: '' },
            installments: { downPayment: 0, monthlyInstallment: 0, years: 0 },
            amenities: { en: [] as string[], ar: [] as string[] },
            listingStartDate: new Date().toISOString().split('T')[0],
            listingEndDate: '',
            contactMethod: 'platform' as 'platform' | 'direct',
            ownerPhone: '',
            deliveryType: 'immediate' as 'immediate' | 'future',
        }
    });
    
    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = methods;
    const watchLocation = watch("location");

    // Mutation
    const mutation = useMutation({
        mutationFn: (data: any) => addRequest(RequestType.PROPERTY_LISTING_REQUEST, data),
        onSuccess: () => {
            setCurrentStep(4); // Success Step
            queryClient.invalidateQueries({ queryKey: ['allRequests'] });
            isSubmittingRef.current = false;
        },
        onError: (error) => {
            console.error("Failed to submit property request:", error);
            showToast('Submission failed. Please try again.', 'error');
            isSubmittingRef.current = false;
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
        isSubmittingRef.current = false;
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => {
        if (currentStep === 3) setCooperationType(null);
        if (currentStep === 2) setPurpose(null);
        setCurrentStep(prev => prev - 1);
    }
    const handlePurposeSelect = (p: 'For Sale' | 'For Rent') => {
        setPurpose(p);
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

    // Image Handlers
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

    const handleLocationSelect = (location: { lat: number, lng: number }) => {
        setValue('location.lat', location.lat, { shouldDirty: true });
        setValue('location.lng', location.lng, { shouldDirty: true });
        setIsLocationModalOpen(false);
    };

    const onSubmit = async (formData: any) => {
        // Prevent double submission
        if (isSubmittingRef.current || currentStep === 4) return;
        isSubmittingRef.current = true;

        const isOwner = formData.isOwner;
        if (!isOwner) {
            showToast(t_page.errors.mustBeOwner, 'error');
            isSubmittingRef.current = false;
            return;
        }

        if (!cooperationType || !purpose) {
            showToast(t_page.errors.cooperationType, 'error');
            isSubmittingRef.current = false;
            return;
        }
        
        if (!mainImageFile) {
            showToast(language === 'ar' ? 'يرجى رفع الصورة الرئيسية' : 'Please upload a main image', 'error');
            isSubmittingRef.current = false;
            return;
        }

        try {
            const mainImageBase64 = await fileToBase64(mainImageFile);
            const galleryBase64Strings = await Promise.all(galleryFiles.map(file => fileToBase64(file)));
            const allImages = [mainImageBase64, ...galleryBase64Strings];

            const propertyDetails = {
                ...formData,
                purpose: { en: purpose, ar: purpose === 'For Sale' ? 'للبيع' : 'إيجار' },
                propertyType: formData.type,
                finishingStatus: formData.finishingStatus,
                price: formData.priceNumeric,
                listingStatus: 'pending', 
                deliveryType: formData.delivery?.isImmediate === 'true' ? 'immediate' : 'future',
                title: formData.title,
                description: formData.description,
                address: formData.address,
            };
            
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
                    isSubmittingRef.current = false;
                } else {
                     mutation.mutate(payloadData);
                }
            } else {
                mutation.mutate(payloadData);
            }
        } catch (e) {
            console.error("Preparation failed", e);
            isSubmittingRef.current = false;
        }
    };

    return {
        currentStep, purpose, cooperationType, plansForPurpose, formSubmitted: currentStep === 4,
        isLoadingContext, isLocationModalOpen,
        mainImagePreview, galleryPreviews,
        nextStep, prevStep, handlePurposeSelect, handleCooperationSelect,
        handleMainImageChange, handleGalleryImagesChange, removeGalleryImage,
        setIsLocationModalOpen, handleLocationSelect, resetForm,
        register, handleSubmit: handleSubmit(onSubmit), watch, setValue, errors, formMethods: methods, 
        projects, propertyTypes, finishingStatuses, amenities, watchLocation,
        isSubmitting: mutation.isPending || isSubmittingRef.current,
    };
};
