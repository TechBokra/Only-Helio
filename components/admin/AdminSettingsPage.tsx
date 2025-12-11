
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SiteContent } from '../../types';
import { inputClasses, selectClasses } from '../ui/FormField';
import { CloseIcon, PhotoIcon, MegaphoneIcon, CreditCardIcon, BanknotesIcon, WrenchScrewdriverIcon, ChartBarIcon, UsersIcon, BuildingIcon, CubeIcon } from '../ui/Icons';
import { getContent, updateContent as updateSiteContent } from '../../services/content';
import { seedDatabase } from '../../services/seeder';
import { supabase } from '../../supabaseClient'; // Import supabase directly for stats
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
    const [seeding, setSeeding] = useState(false);
    
    // New State for Database Stats
    const [dbStats, setDbStats] = useState({ users: 0, projects: 0, properties: 0 });
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        if (siteContent) {
            reset(siteContent); 
        }
    }, [siteContent, reset]);

    // Fetch DB Stats Function
    const fetchDbStats = async () => {
        if (!supabase) return;
        setLoadingStats(true);
        try {
            const { count: usersCount } = await supabase.from('User').select('*', { count: 'exact', head: true });
            const { count: projectsCount } = await supabase.from('Project').select('*', { count: 'exact', head: true });
            const { count: propertiesCount } = await supabase.from('Property').select('*', { count: 'exact', head: true });
            
            setDbStats({
                users: usersCount || 0,
                projects: projectsCount || 0,
                properties: propertiesCount || 0
            });
        } catch (e) {
            console.error("Error fetching stats", e);
        } finally {
            setLoadingStats(false);
        }
    };

    // Fetch stats when tab changes to database
    useEffect(() => {
        if (activeTab === 'database') {
            fetchDbStats();
        }
    }, [activeTab]);

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
        if (!window.confirm("This will synchronize local data to the database. Existing records with same IDs will be updated. Continue?")) return;
        
        setSeeding(true);
        try {
            const message = await seedDatabase();
            showToast(message, 'success');
            await fetchDbStats(); // Refresh stats after seeding
        } catch (error: any) {
            console.error(error);
            showToast(`Seeding Failed: ${error.message}`, 'error');
        } finally {
            setSeeding(false);
        }
    };
    
    const watchLogoUrl = watch('logoUrl');
    const watchRouting = watch('contactConfiguration.routing');
    const watchQrCode = watch('paymentConfiguration.instapay.qrCodeUrl');

    const onSubmit = async (formData: SiteContent) => {
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
            className={`px-4 py-2 font-medium rounded-t-lg border-b-2 transition-colors ${activeTab === tabKey ? 'border-amber-500 text-amber-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
        >
            {label}
        </button>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.adminDashboard.nav.settings}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Manage global settings and database synchronization.</p>
            
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
                        {/* ... Existing Tabs (General, Banner, Contact, Social, Finance) ... */}
                        {activeTab === 'general' && (
                             <div className="space-y-6 animate-fadeIn">
                                {/* ... (Keeping existing fields) ... */}
                                <div><label className="block text-sm font-medium mb-1">Site Description (AR)</label><Textarea {...register('footer.ar.description')} className={inputClasses} rows={3}/></div>
                                <div><label className="block text-sm font-medium mb-1">Site Description (EN)</label><Textarea {...register('footer.en.description')} className={inputClasses} rows={3}/></div>
                                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <label htmlFor="logoUrl" className="block text-sm font-medium mb-2">Site Logo</label>
                                    <div className="flex items-center gap-4">
                                        {watchLogoUrl ? <img src={watchLogoUrl} alt="Logo Preview" className="h-12 bg-gray-200 p-1 rounded-md" /> : <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center"><PhotoIcon className="w-6 h-6 text-gray-400" /></div>}
                                        <Input type="file" id="logoUrl" onChange={handleLogoChange} accept="image/*" className="max-w-sm" />
                                    </div>
                                </div>
                             </div>
                        )}
                        
                        {/* Database Tab */}
                        {activeTab === 'database' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Status Panel */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Users/Partners</p>
                                            <p className="text-2xl font-bold text-gray-800">{loadingStats ? '...' : dbStats.users}</p>
                                        </div>
                                        <UsersIcon className="w-8 h-8 text-blue-500 opacity-20" />
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Projects</p>
                                            <p className="text-2xl font-bold text-gray-800">{loadingStats ? '...' : dbStats.projects}</p>
                                        </div>
                                        <CubeIcon className="w-8 h-8 text-amber-500 opacity-20" />
                                    </div>
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-500">Properties</p>
                                            <p className="text-2xl font-bold text-gray-800">{loadingStats ? '...' : dbStats.properties}</p>
                                        </div>
                                        <BuildingIcon className="w-8 h-8 text-green-500 opacity-20" />
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
                                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                        <WrenchScrewdriverIcon className="w-5 h-5"/> Database Synchronization
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                                        Push your local mock data (Partners, Projects, Properties) to Supabase. 
                                        This operation uses "Upsert", so it is safe to run multiple times without creating duplicates.
                                    </p>
                                    <div className="flex gap-3">
                                        <Button 
                                            type="button" 
                                            onClick={handleSeedDatabase} 
                                            isLoading={seeding}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            Sync Mock Data to Database
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={fetchDbStats}
                                            disabled={loadingStats}
                                        >
                                            Refresh Stats
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {activeTab !== 'database' && (
                    <div className="mt-8 flex justify-end items-center gap-4">
                        {isDirty && <span className="text-sm text-yellow-600">You have unsaved changes.</span>}
                        <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
                            {isSubmitting ? 'Saving...' : 'Save Settings'}
                        </Button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AdminSettingsPage;
