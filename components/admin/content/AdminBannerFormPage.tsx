
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Banner } from '../../../types';
import { addBanner, updateBanner, getAllBanners } from '../../../services/banners';
import { uploadToCloudinary } from '../../../lib/cloudinary';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Checkbox } from '../../ui/Checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import FormField, { inputClasses, selectClasses } from '../../ui/FormField';
import { ArrowLeftIcon, PhotoIcon, SparklesIcon, CloseIcon } from '../../ui/Icons';

const LOCATION_GUIDE = {
    home: {
        label: { en: 'Home Page (Main Slider)', ar: 'الصفحة الرئيسية (السلايدر الرئيسي)' },
        dimensions: '1920x640px',
        aspectRatio: '3:1',
        note: { en: 'High resolution, wide format.', ar: 'دقة عالية، تنسيق عريض.' }
    },
    properties: {
        label: { en: 'Properties Page (Header)', ar: 'صفحة العقارات (الرأس)' },
        dimensions: '1920x300px',
        aspectRatio: '6:1',
        note: { en: 'Ultra wide, short height header.', ar: 'عريض جداً، ارتفاع قصير.' }
    },
    finishing: {
        label: { en: 'Finishing Page (Header)', ar: 'صفحة التشطيبات (الرأس)' },
        dimensions: '1920x300px',
        aspectRatio: '6:1',
        note: { en: 'Ultra wide header.', ar: 'رأس عريض جداً.' }
    },
    decorations: {
        label: { en: 'Decorations Page (Header)', ar: 'صفحة الديكورات (الرأس)' },
        dimensions: '1920x300px',
        aspectRatio: '6:1',
        note: { en: 'Ultra wide header.', ar: 'رأس عريض جداً.' }
    },
    details: {
        label: { en: 'Details Page (Sidebar)', ar: 'صفحة التفاصيل (الشريط الجانبي)' },
        dimensions: '800x600px',
        aspectRatio: '4:3',
        note: { en: 'Boxy or rectangular format.', ar: 'تنسيق مربع أو مستطيل.' }
    }
};

const AdminBannerFormPage: React.FC = () => {
    const { bannerId } = useParams();
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const isEdit = !!bannerId;
    const t_page = t.adminDashboard.manageBanners;
    const t_shared = t.adminShared;

    const { data: banners } = useQuery({ queryKey: ['banners'], queryFn: getAllBanners });
    const bannerToEdit = banners?.find(b => b.id === bannerId);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { register, handleSubmit, setValue, watch, reset } = useForm<Partial<Banner>>({
        defaultValues: {
            status: 'active',
            locations: [],
            startDate: '',
            endDate: ''
        }
    });

    const watchedLocations = watch('locations') || [];

    useEffect(() => {
        if (isEdit && bannerToEdit) {
            reset({
                title: bannerToEdit.title,
                link: bannerToEdit.link,
                status: bannerToEdit.status,
                locations: bannerToEdit.locations,
                startDate: bannerToEdit.startDate ? bannerToEdit.startDate.split('T')[0] : '',
                endDate: bannerToEdit.endDate ? bannerToEdit.endDate.split('T')[0] : '',
            });
            setImagePreview(bannerToEdit.imageUrl);
        }
    }, [isEdit, bannerToEdit, reset]);

    const addMutation = useMutation({
        mutationFn: (data: Omit<Banner, 'id'>) => addBanner(data),
        onSuccess: () => {
            showToast('Banner created successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            navigate('/admin/banners');
        },
        onError: () => showToast('Failed to create banner', 'error')
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: string, updates: Partial<Banner> }) => updateBanner(data.id, data.updates),
        onSuccess: () => {
            showToast('Banner updated successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['banners'] });
            navigate('/admin/banners');
        },
        onError: () => showToast('Failed to update banner', 'error')
    });

    const handleLocationChange = (loc: string, checked: boolean) => {
        const current = watchedLocations;
        if (checked) {
            setValue('locations', [...current, loc]);
        } else {
            setValue('locations', current.filter(l => l !== loc));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: any) => {
        setIsUploading(true);
        try {
            let imageUrl = isEdit ? bannerToEdit?.imageUrl : '';

            if (imageFile) {
                imageUrl = await uploadToCloudinary(imageFile);
            }

            if (!imageUrl) {
                showToast('Please upload an image', 'error');
                setIsUploading(false);
                return;
            }

            const bannerData = {
                ...data,
                imageUrl,
                startDate: data.startDate || undefined,
                endDate: data.endDate || undefined,
            };

            if (isEdit && bannerId) {
                updateMutation.mutate({ id: bannerId, updates: bannerData });
            } else {
                addMutation.mutate(bannerData);
            }
        } catch (error) {
            console.error("Submission error", error);
            showToast('Failed to save banner', 'error');
        } finally {
            setIsUploading(false);
        }
    };
    
    const activeRecommendation = useMemo(() => {
        if (watchedLocations.length === 0) return null;
        const lastSelected = watchedLocations[watchedLocations.length - 1] as keyof typeof LOCATION_GUIDE;
        return LOCATION_GUIDE[lastSelected];
    }, [watchedLocations]);

    const isLoading = addMutation.isPending || updateMutation.isPending || isUploading;

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn">
            <div className="mb-6">
                <Link to="/admin/banners" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Banners
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {isEdit ? t_page.editBanner : t_page.addBanner}
                </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image */}
                    <div className="lg:col-span-1 space-y-6">
                         <Card>
                            <CardHeader><CardTitle className="text-lg">{t_page.bannerImage}</CardTitle></CardHeader>
                            <CardContent>
                                <div className={`relative aspect-video rounded-lg overflow-hidden border-2 border-dashed ${!imagePreview ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50' : 'border-amber-500'} transition-all group`}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                            <PhotoIcon className="w-10 h-10 mb-2 opacity-50" />
                                            <span className="text-xs">Click to upload</span>
                                        </div>
                                    )}
                                    <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white font-semibold text-sm">
                                        {imagePreview ? 'Change Image' : 'Upload Image'}
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    </label>
                                </div>
                                
                                {activeRecommendation && (
                                    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-sm">
                                        <p className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                            <SparklesIcon className="w-4 h-4" /> 
                                            {language === 'ar' ? 'الأبعاد الموصى بها:' : 'Recommended:'}
                                        </p>
                                        <p className="text-blue-600 dark:text-blue-400 mt-1 font-mono text-xs">
                                            {activeRecommendation.dimensions} ({activeRecommendation.aspectRatio})
                                        </p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                            {activeRecommendation.note[language]}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Banner Details</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label={t_page.bannerTitle} id="title">
                                        <Input {...register('title', { required: true })} className={inputClasses} placeholder="Ex: Summer Sale 2024" />
                                    </FormField>
                                    <FormField label={t_page.bannerLink} id="link">
                                        <Input {...register('link')} className={inputClasses} placeholder="e.g., /properties" />
                                    </FormField>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t_page.displayLocations}</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {(Object.keys(LOCATION_GUIDE) as (keyof typeof LOCATION_GUIDE)[]).map(loc => (
                                            <label key={loc} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${watchedLocations.includes(loc) ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' : 'bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                                <Checkbox
                                                    checked={watchedLocations.includes(loc)}
                                                    onCheckedChange={(checked) => handleLocationChange(loc, checked)}
                                                />
                                                <div className="flex-grow">
                                                    <span className="font-medium text-gray-800 dark:text-white capitalize">{loc}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <FormField label={t_page.status} id="status">
                                        <Select {...register('status')} className={selectClasses}>
                                            <option value="active">{t_page.active}</option>
                                            <option value="inactive">{t_page.inactive}</option>
                                        </Select>
                                    </FormField>
                                    <FormField label={t_page.startDate} id="startDate">
                                        <Input type="date" {...register('startDate')} className={inputClasses} />
                                    </FormField>
                                    <FormField label={t_page.endDate} id="endDate">
                                        <Input type="date" {...register('endDate')} className={inputClasses} />
                                    </FormField>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="secondary" type="button" onClick={() => navigate('/admin/banners')}>{t_shared.cancel}</Button>
                    <Button type="submit" isLoading={isLoading}>
                        {t_shared.save}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminBannerFormPage;
