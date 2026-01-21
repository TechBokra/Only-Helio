
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SiteContent } from '../../types';
import { inputClasses } from '../ui/FormField';
import { PhotoIcon, BanknotesIcon, CreditCardIcon, CircleStackIcon, ArrowPathIcon } from '../ui/Icons';
import { getContent, updateContent as updateSiteContent } from '../../services/content';
import { seedDatabase } from '../../services/seeder';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../shared/ToastContext';
import { useLanguage } from '../shared/LanguageContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';
import { Select } from '../ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const AdminSettingsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const { data: siteContent, isLoading: dataLoading, refetch } = useQuery({ queryKey: ['siteContent'], queryFn: getContent });
    const { showToast } = useToast();
    
    const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting, isDirty } } = useForm<SiteContent>();
    
    const [activeTab, setActiveTab] = useState<'general' | 'banner' | 'contact' | 'social' | 'finance' | 'database'>('general');
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedLog, setSeedLog] = useState<string>('');

    useEffect(() => {
        if (siteContent) {
            reset(siteContent); 
        }
    }, [siteContent, reset]);


    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setValue('logoUrl', base64, { shouldDirty: true });
        }
    };

    const handleQrCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setValue('paymentConfiguration.instapay.qrCodeUrl', base64, { shouldDirty: true });
        }
    };

    const handleSeedDatabase = async () => {
        if (!window.confirm("Warning: This will attempt to insert mock data into your database. Existing records with same IDs will be updated. Continue?")) return;
        
        setIsSeeding(true);
        setSeedLog('Starting seed process...');
        try {
            const result = await seedDatabase();
            setSeedLog(result);
            showToast('Database seeded successfully!', 'success');
        } catch (error: any) {
            console.error(error);
            setSeedLog(`Error: ${error.message}`);
            showToast('Seeding failed. Check console.', 'error');
        } finally {
            setIsSeeding(false);
        }
    };
    
    const watchLogoUrl = watch('logoUrl');
    const watchRouting = watch('contactConfiguration.routing');
    const watchQrCode = watch('paymentConfiguration.instapay.qrCodeUrl');

    const onSubmit = async (formData: SiteContent) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { finishingServices, ...dataToSave } = formData;
        await updateSiteContent(dataToSave as Partial<SiteContent>);
        refetch();
        showToast('Settings updated successfully!', 'success');
    };

    if (dataLoading) {
        return <div>Loading settings...</div>;
    }
    
    const TabButton: React.FC<{tabKey: any, label: string}> = ({tabKey, label}) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabKey)}
            className={`px-4 py-2 font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${activeTab === tabKey ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.adminDashboard.nav.settings}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Manage global settings and configuration.</p>
            
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                    <div className="px-6 border-b border-gray-200 dark:border-gray-700">
                         <div className="flex -mb-px space-x-6 overflow-x-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            <TabButton tabKey="general" label="General" />
                            <TabButton tabKey="banner" label="Top Banner" />
                            <TabButton tabKey="contact" label="Contact" />
                            <TabButton tabKey="finance" label="Finance" />
                            <TabButton tabKey="social" label="Social" />
                            <TabButton tabKey="database" label="Database" />
                         </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                             <div className="space-y-6 animate-fadeIn">
                                <div><label className="block text-sm font-medium mb-1">Site Description (AR)</label><Textarea {...register('footer.ar.description')} className={inputClasses} rows={3}/></div>
                                <div><label className="block text-sm font-medium mb-1">Site Description (EN)</label><Textarea {...register('footer.en.description')} className={inputClasses} rows={3}/></div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-medium mb-1">Address (AR)</label><Input {...register('footer.ar.address')} className={inputClasses}/></div>
                                    <div><label className="block text-sm font-medium mb-1">Address (EN)</label><Input {...register('footer.en.address')} className={inputClasses}/></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div><label className="block text-sm font-medium mb-1">Hours (AR)</label><Input {...register('footer.ar.hours')} className={inputClasses}/></div>
                                    <div><label className="block text-sm font-medium mb-1">Hours (EN)</label><Input {...register('footer.en.hours')} className={inputClasses}/></div>
                                </div>
                                
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <label htmlFor="logoUrl" className="block text-sm font-medium mb-2">Site Logo</label>
                                    <div className="flex items-center gap-4">
                                        {watchLogoUrl ? <img src={watchLogoUrl} alt="Logo Preview" className="h-12 bg-gray-200 p-1 rounded-md" /> : <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center"><PhotoIcon className="w-6 h-6 text-gray-400" /></div>}
                                        <Input type="file" id="logoUrl" onChange={handleLogoChange} accept="image/*" className="max-w-sm" />
                                    </div>
                                </div>
                             </div>
                        )}

                        {/* BANNER TAB */}
                         {activeTab === 'banner' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="flex items-center gap-2 mb-4">
                                    <Checkbox id="topBanner" {...register('topBanner.enabled')} />
                                    <label htmlFor="topBanner" className="font-medium cursor-pointer">Enable Top Banner</label>
                                </div>
                                <div><label className="block text-sm font-medium mb-1">Banner Text (AR)</label><Input {...register('topBanner.content.ar')} className={inputClasses}/></div>
                                <div><label className="block text-sm font-medium mb-1">Banner Text (EN)</label><Input {...register('topBanner.content.en')} className={inputClasses}/></div>
                            </div>
                        )}

                        {/* CONTACT TAB */}
                        {activeTab === 'contact' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Form Routing Strategy</label>
                                    <Select {...register('contactConfiguration.routing')} className={inputClasses}>
                                        <option value="internal">Store in CRM Only</option>
                                        <option value="email">Send Email Only</option>
                                        <option value="both">Both CRM & Email</option>
                                    </Select>
                                </div>
                                {watchRouting !== 'internal' && (
                                    <div><label className="block text-sm font-medium mb-1">Target Email for Notifications</label><Input type="email" {...register('contactConfiguration.targetEmail')} className={inputClasses}/></div>
                                )}
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div><label className="block text-sm font-medium mb-1">Contact Phone</label><Input {...register('footer.phone')} className={inputClasses}/></div>
                                     <div><label className="block text-sm font-medium mb-1">Contact Email (Public)</label><Input {...register('footer.email')} className={inputClasses}/></div>
                                </div>
                            </div>
                        )}

                        {/* FINANCE TAB */}
                         {activeTab === 'finance' && (
                            <div className="space-y-8 animate-fadeIn">
                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><BanknotesIcon className="w-5 h-5 text-amber-500"/> InstaPay Settings</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                         <div className="flex items-center gap-2 mb-2">
                                            <Checkbox id="instapay-enabled" {...register('paymentConfiguration.instapay.enabled')} />
                                            <label htmlFor="instapay-enabled" className="font-medium cursor-pointer">Enable InstaPay</label>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="block text-xs mb-1">Wallet Number</label><Input {...register('paymentConfiguration.instapay.number')} className={inputClasses}/></div>
                                            <div><label className="block text-xs mb-1">Wallet Name (Optional)</label><Input {...register('paymentConfiguration.instapay.walletName')} className={inputClasses}/></div>
                                        </div>
                                         <div><label className="block text-xs mb-1">Payment Link (Optional)</label><Input {...register('paymentConfiguration.instapay.paymentLink')} className={inputClasses} placeholder="https://instapay.app/..."/></div>
                                         
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div><label className="block text-xs mb-1">Instructions (AR)</label><Textarea {...register('paymentConfiguration.instapay.instructions.ar')} className={inputClasses}/></div>
                                            <div><label className="block text-xs mb-1">Instructions (EN)</label><Textarea {...register('paymentConfiguration.instapay.instructions.en')} className={inputClasses}/></div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-xs mb-2">QR Code Image</label>
                                            <div className="flex items-center gap-4">
                                                {watchQrCode ? <img src={watchQrCode} alt="QR Preview" className="h-20 bg-white p-1 rounded border" /> : null}
                                                <Input type="file" accept="image/*" onChange={handleQrCodeChange} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader><CardTitle className="flex items-center gap-2"><CreditCardIcon className="w-5 h-5 text-blue-500"/> Paymob Settings</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Checkbox id="paymob-enabled" {...register('paymentConfiguration.paymob.enabled')} />
                                            <label htmlFor="paymob-enabled" className="font-medium cursor-pointer">Enable Paymob (Cards)</label>
                                        </div>
                                         <div className="grid grid-cols-1 gap-4">
                                            <div><label className="block text-xs mb-1">API Key</label><Input type="password" {...register('paymentConfiguration.paymob.apiKey')} className={inputClasses}/></div>
                                            <div><label className="block text-xs mb-1">Secret Key</label><Input type="password" {...register('paymentConfiguration.paymob.secretKey')} className={inputClasses}/></div>
                                            <div><label className="block text-xs mb-1">Public Key</label><Input type="text" {...register('paymentConfiguration.paymob.publicKey')} className={inputClasses}/></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* SOCIAL TAB */}
                         {activeTab === 'social' && (
                            <div className="space-y-4 animate-fadeIn">
                                <div><label className="block text-sm font-medium mb-1">Facebook URL</label><Input {...register('footer.social.facebook')} className={inputClasses}/></div>
                                <div><label className="block text-sm font-medium mb-1">Twitter URL</label><Input {...register('footer.social.twitter')} className={inputClasses}/></div>
                                <div><label className="block text-sm font-medium mb-1">Instagram URL</label><Input {...register('footer.social.instagram')} className={inputClasses}/></div>
                                <div><label className="block text-sm font-medium mb-1">LinkedIn URL</label><Input {...register('footer.social.linkedin')} className={inputClasses}/></div>
                            </div>
                        )}

                        {/* DATABASE TAB */}
                        {activeTab === 'database' && (
                            <div className="space-y-8 animate-fadeIn">
                                <Card className="border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-900/10">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                                            <CircleStackIcon className="w-5 h-5"/> 
                                            Initial Data Seeding
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                            Click the button below to populate the database with the initial mock data (Partners, Projects, Properties, etc.) defined in the source code.
                                            <br/>
                                            <strong>Note:</strong> This will update existing records if IDs match, or insert new ones. It is safe to run multiple times.
                                        </p>
                                        
                                        <div className="flex flex-col gap-4">
                                            <Button 
                                                type="button" 
                                                onClick={handleSeedDatabase} 
                                                isLoading={isSeeding}
                                                className="bg-amber-600 hover:bg-amber-700 text-white w-fit"
                                            >
                                                <ArrowPathIcon className="w-4 h-4 mr-2" />
                                                Seed Database Now
                                            </Button>
                                            
                                            {seedLog && (
                                                <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-md h-40 overflow-y-auto whitespace-pre-wrap">
                                                    {seedLog}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                        
                    </div>
                </div>
                
                <div className="mt-8 flex justify-end items-center gap-4">
                    {isDirty && <span className="text-sm text-yellow-600">You have unsaved changes.</span>}
                    <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                        {isSubmitting ? 'Saving...' : 'Save Settings'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettingsPage;
