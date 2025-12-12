
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { SiteContent } from '../../types';
import { inputClasses } from '../ui/FormField';
import { CloseIcon, PhotoIcon, MegaphoneIcon, CreditCardIcon, BanknotesIcon, WrenchScrewdriverIcon, ChartBarIcon, UsersIcon, BuildingIcon, CubeIcon, InboxIcon, SparklesIcon, ClipboardDocumentListIcon, PhoneIcon, SearchIcon } from '../ui/Icons';
import { getContent, updateContent as updateSiteContent } from '../../services/content';
import { seedDatabase } from '../../services/seeder';
import { supabase } from '../../supabaseClient';
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
    
    // Comprehensive DB Stats State
    const [dbStats, setDbStats] = useState({ 
        // Core
        users: 0, 
        projects: 0, 
        properties: 0, 
        // Content
        portfolio: 0, 
        categories: 0,
        // CRM / Requests
        leads: 0,
        partnerRequests: 0,
        propertyRequests: 0,
        contactRequests: 0,
        inquiries: 0
    });
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        if (siteContent) {
            reset(siteContent); 
        }
    }, [siteContent, reset]);

    // Fetch DB Stats Function
    const fetchDbStats = async () => {
        if (!supabase) return;
        const client = supabase; // Capture non-null client for closure
        setLoadingStats(true);
        try {
            // Helper to get count safely
            const getCount = async (table: string) => {
                try {
                    const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
                    if (error) return 0;
                    return count || 0;
                } catch (e) { return 0; }
            };

            const [
                users, projects, properties, 
                portfolio, categories, 
                leads, partnerReqs, propReqs, contacts, inquiries
            ] = await Promise.all([
                getCount('User'),
                getCount('Project'),
                getCount('Property'),
                getCount('PortfolioItem'),
                getCount('DecorationCategory'),
                getCount('Lead'),
                getCount('PartnerRequest'),
                getCount('PropertyListingRequest'),
                getCount('ContactRequest'),
                getCount('PropertyInquiry')
            ]);
            
            setDbStats({
                users, projects, properties,
                portfolio, categories,
                leads, partnerRequests: partnerReqs, propertyRequests: propReqs, 
                contactRequests: contacts, inquiries
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
        if (!window.confirm("This will synchronize ALL local data (Core, Content, Requests) to the database. Continue?")) return;
        
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

    const StatBox: React.FC<{ label: string, value: number, icon: any, color: string }> = ({ label, value, icon: Icon, color }) => (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                <Icon className={`w-5 h-5 ${color} opacity-70`} />
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{loadingStats ? '...' : value}</p>
        </div>
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
                        
                        {/* DATABASE TAB (Detailed) */}
                        {activeTab === 'database' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Core Data */}
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Core Data</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <StatBox label="Users" value={dbStats.users} icon={UsersIcon} color="text-blue-500" />
                                    <StatBox label="Projects" value={dbStats.projects} icon={CubeIcon} color="text-amber-500" />
                                    <StatBox label="Properties" value={dbStats.properties} icon={BuildingIcon} color="text-green-500" />
                                </div>

                                {/* Content & Services */}
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Services & Content</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <StatBox label="Portfolio Items" value={dbStats.portfolio} icon={SparklesIcon} color="text-purple-500" />
                                    <StatBox label="Decor Categories" value={dbStats.categories} icon={SparklesIcon} color="text-pink-500" />
                                </div>

                                {/* CRM & Requests */}
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">CRM & Requests</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                                    <StatBox label="General Leads" value={dbStats.leads} icon={InboxIcon} color="text-red-500" />
                                    <StatBox label="Partner Apps" value={dbStats.partnerRequests} icon={UsersIcon} color="text-indigo-500" />
                                    <StatBox label="Listing Reqs" value={dbStats.propertyRequests} icon={ClipboardDocumentListIcon} color="text-orange-500" />
                                    <StatBox label="Search Inquiries" value={dbStats.inquiries} icon={SearchIcon} color="text-teal-500" />
                                    <StatBox label="Contacts" value={dbStats.contactRequests} icon={PhoneIcon} color="text-cyan-500" />
                                </div>

                                <div className="p-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
                                    <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                        <WrenchScrewdriverIcon className="w-5 h-5"/> Full Database Synchronization
                                    </h3>
                                    <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                                        Push all mock data (Core, Content, Requests) to Supabase. This uses "Upsert", so it is safe to run multiple times.
                                    </p>
                                    <div className="flex gap-3">
                                        <Button 
                                            type="button" 
                                            onClick={handleSeedDatabase} 
                                            isLoading={seeding}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            Sync All Mock Data
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
