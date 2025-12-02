
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SiteContent } from '../../types';
import { inputClasses, selectClasses } from '../ui/FormField';
import { getContent, updateContent as updateSiteContent } from '../../services/content';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../shared/ToastContext';
import { useLanguage } from '../shared/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { CubeIcon, PhotoIcon, GlobeAltIcon, LockClosedIcon } from '../ui/Icons';
import { uploadToCloudinary } from '../../lib/cloudinary';

const AdminSettingsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { data: siteContent, isLoading: dataLoading, refetch } = useQuery({ queryKey: ['siteContent'], queryFn: getContent });
    const { showToast } = useToast();
    
    const { register, handleSubmit, reset, formState: { isSubmitting, isDirty }, setValue } = useForm<SiteContent>();
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const [activeTab, setActiveTab] = useState<'general' | 'banner' | 'contact' | 'social' | 'finance' | 'external'>('general');

    useEffect(() => {
        if (siteContent) {
            const mergedContent = {
                ...siteContent,
                siteName: {
                    ar: siteContent.siteName?.ar || 'ONLY HELIO',
                    en: siteContent.siteName?.en || 'ONLY HELIO'
                },
                externalConfig: {
                    supabase: {
                        url: siteContent.externalConfig?.supabase?.url || 'https://zpcpyxmnqffcmehpfkjl.supabase.co',
                        anonKey: siteContent.externalConfig?.supabase?.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwY3B5eG1ucWZmY21laHBma2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1NjQyODksImV4cCI6MjA4MDE0MDI4OX0.HMa2X03op-grt2TM8-omgubclObxkm4NIPehL6XZ4KI'
                    },
                    cloudinary: {
                        cloudName: siteContent.externalConfig?.cloudinary?.cloudName || 'dwg0hr34g',
                        apiKey: siteContent.externalConfig?.cloudinary?.apiKey || '532568532962456',
                        apiSecret: siteContent.externalConfig?.cloudinary?.apiSecret || 'TG_wSAPS32Qv1gB2M19qmda9uII',
                        uploadPreset: siteContent.externalConfig?.cloudinary?.uploadPreset || 'onlyhelio_uploads'
                    },
                    vercel: {
                        projectUrl: siteContent.externalConfig?.vercel?.projectUrl || ''
                    }
                }
            };
            reset(mergedContent);
            setLogoPreview(siteContent.logoUrl || null);
        }
    }, [siteContent, reset]);

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                setIsUploading(true);
                const url = await uploadToCloudinary(file);
                setValue('logoUrl', url, { shouldDirty: true });
                setLogoPreview(url);
                setIsUploading(false);
            } catch (error) {
                setIsUploading(false);
                showToast("Failed to upload logo", "error");
            }
        }
    };

    const onSubmit = async (formData: SiteContent) => {
        const { finishingServices, ...dataToSave } = formData;
        const finalData = { ...siteContent, ...dataToSave };
        
        await updateSiteContent(finalData);
        refetch();
        showToast('Settings updated successfully!', 'success');
    };

    if (dataLoading) {
        return <div className="p-8 text-center">Loading settings...</div>;
    }
    
    const tabs = [
        { id: 'general', label: 'General Settings' },
        { id: 'banner', label: 'Top Banner' },
        { id: 'contact', label: 'Contact Info' },
        { id: 'social', label: 'Social Media' },
        { id: 'finance', label: 'Finance & Payment' },
        { id: 'external', label: 'External Integrations' },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.adminDashboard.nav.settings}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Manage global settings and system configuration.</p>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="px-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                         <div className="flex -mb-px space-x-6 min-w-max" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        activeTab === tab.id 
                                        ? 'border-amber-500 text-amber-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                         </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* GENERAL SETTINGS */}
                        {activeTab === 'general' && (
                             <div className="space-y-8 animate-fadeIn">
                                {/* Branding Section */}
                                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <PhotoIcon className="w-5 h-5 text-amber-500" />
                                        Branding & Identity
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Logo</label>
                                            <div className="flex items-center gap-4">
                                                <div className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-white overflow-hidden">
                                                    {logoPreview ? (
                                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No Logo</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        id="logo-upload"
                                                        className="hidden"
                                                        onChange={handleLogoChange}
                                                    />
                                                    <label 
                                                        htmlFor="logo-upload"
                                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 cursor-pointer dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                                                    >
                                                        {isUploading ? 'Uploading...' : 'Upload New Logo'}
                                                    </label>
                                                    <p className="text-xs text-gray-500 mt-2">Recommended: PNG, Transparent, 512x512px</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name (English)</label>
                                                <Input {...register('siteName.en')} className={inputClasses} placeholder="ONLY HELIO" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Name (Arabic)</label>
                                                <Input {...register('siteName.ar')} className={inputClasses} placeholder="أونلي هيليو" dir="rtl" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Description (AR) - Footer</label>
                                    <Textarea {...register('footer.ar.description')} className={inputClasses} rows={3} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Site Description (EN) - Footer</label>
                                    <Textarea {...register('footer.en.description')} className={inputClasses} rows={3} />
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Copyright Text (EN)</label>
                                        <Input {...register('footer.copyright.en')} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Copyright Text (AR)</label>
                                        <Input {...register('footer.copyright.ar')} className={inputClasses} />
                                    </div>
                                </div>
                             </div>
                        )}

                        {/* TOP BANNER */}
                        {activeTab === 'banner' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
                                    <Checkbox id="banner-enabled" {...register('topBanner.enabled')} />
                                    <label htmlFor="banner-enabled" className="font-bold text-amber-800 dark:text-amber-200 cursor-pointer">Enable Top Notification Banner</label>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Content (AR)</label>
                                        <Input {...register('topBanner.content.ar')} className={inputClasses} dir="rtl" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banner Content (EN)</label>
                                        <Input {...register('topBanner.content.en')} className={inputClasses} dir="ltr" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONTACT INFO */}
                        {activeTab === 'contact' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                                        <Input {...register('footer.phone')} className={inputClasses} dir="ltr" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                                        <Input {...register('footer.email')} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address (AR)</label>
                                        <Input {...register('footer.ar.address')} className={inputClasses} dir="rtl" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address (EN)</label>
                                        <Input {...register('footer.en.address')} className={inputClasses} dir="ltr" />
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Working Hours (AR)</label>
                                        <Input {...register('footer.ar.hours')} className={inputClasses} dir="rtl" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Working Hours (EN)</label>
                                        <Input {...register('footer.en.hours')} className={inputClasses} dir="ltr" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <Checkbox id="whatsapp-only" {...register('footer.isWhatsAppOnly')} />
                                    <label htmlFor="whatsapp-only" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Use Phone Number for WhatsApp Only (No Calls)</label>
                                </div>
                            </div>
                        )}

                        {/* SOCIAL MEDIA */}
                        {activeTab === 'social' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook URL</label>
                                        <Input {...register('footer.social.facebook')} className={inputClasses} placeholder="https://facebook.com/..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Twitter (X) URL</label>
                                        <Input {...register('footer.social.twitter')} className={inputClasses} placeholder="https://twitter.com/..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram URL</label>
                                        <Input {...register('footer.social.instagram')} className={inputClasses} placeholder="https://instagram.com/..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">LinkedIn URL</label>
                                        <Input {...register('footer.social.linkedin')} className={inputClasses} placeholder="https://linkedin.com/..." />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500">Leave empty or use '#' to hide the icon from the footer.</p>
                            </div>
                        )}

                        {/* FINANCE */}
                        {activeTab === 'finance' && (
                            <div className="space-y-8 animate-fadeIn">
                                {/* InstaPay */}
                                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-purple-600">InstaPay Configuration</h3>
                                        <Checkbox {...register('paymentConfiguration.instapay.enabled')} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Wallet Number</label>
                                            <Input {...register('paymentConfiguration.instapay.number')} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Wallet Name (Optional)</label>
                                            <Input {...register('paymentConfiguration.instapay.walletName')} className={inputClasses} />
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium mb-1">Payment Link (Optional)</label>
                                            <Input {...register('paymentConfiguration.instapay.paymentLink')} className={inputClasses} placeholder="https://instapay.eg/..." />
                                        </div>
                                         <div>
                                            <label className="block text-xs font-medium mb-1">Instructions (AR)</label>
                                            <Input {...register('paymentConfiguration.instapay.instructions.ar')} className={inputClasses} dir="rtl" />
                                        </div>
                                    </div>
                                </div>

                                {/* Paymob (Cards) */}
                                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg opacity-75">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-blue-600">Paymob (Credit Cards)</h3>
                                        <Checkbox {...register('paymentConfiguration.paymob.enabled')} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium mb-1">API Key</label>
                                            <Input type="password" {...register('paymentConfiguration.paymob.apiKey')} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Public Key</label>
                                            <Input {...register('paymentConfiguration.paymob.publicKey')} className={inputClasses} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* EXTERNAL INTEGRATIONS */}
                        {activeTab === 'external' && (
                            <div className="space-y-8 animate-fadeIn">
                                {/* Supabase */}
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                            <CubeIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Supabase</h3>
                                            <p className="text-xs text-gray-500">Database & Authentication</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1 uppercase tracking-wider">Project URL</label>
                                            <Input {...register('externalConfig.supabase.url')} className="font-mono text-sm" placeholder="https://xxx.supabase.co" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1 uppercase tracking-wider">Anon Public Key</label>
                                            <div className="relative">
                                                <Input type="password" {...register('externalConfig.supabase.anonKey')} className="font-mono text-sm pr-10" placeholder="eyJ..." />
                                                <LockClosedIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cloudinary */}
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-800/50">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                            <PhotoIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cloudinary</h3>
                                            <p className="text-xs text-gray-500">Media Management & Optimization</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1 uppercase tracking-wider">Cloud Name</label>
                                            <Input {...register('externalConfig.cloudinary.cloudName')} className="font-mono text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1 uppercase tracking-wider">Upload Preset (Unsigned)</label>
                                            <Input {...register('externalConfig.cloudinary.uploadPreset')} className="font-mono text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1 uppercase tracking-wider">API Key</label>
                                            <Input {...register('externalConfig.cloudinary.apiKey')} className="font-mono text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1 uppercase tracking-wider">API Secret</label>
                                            <div className="relative">
                                                <Input type="password" {...register('externalConfig.cloudinary.apiSecret')} className="font-mono text-sm pr-10" />
                                                <LockClosedIcon className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vercel */}
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                                            <GlobeAltIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Vercel</h3>
                                            <p className="text-xs text-gray-500">Hosting & Deployment</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Project URL</label>
                                            <Input {...register('externalConfig.vercel.projectUrl')} className="font-mono text-sm" placeholder="https://your-project.vercel.app" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-8 flex justify-end items-center gap-4 sticky bottom-6">
                    <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting || (!isDirty && activeTab !== 'general')} className="shadow-lg">
                        {isSubmitting ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsPage;
