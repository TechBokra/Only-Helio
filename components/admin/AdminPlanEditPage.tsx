
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import type { SubscriptionPlan, PlanCategory, SubscriptionPlanDetails, BillingCycle } from '../../types';
import FormField, { inputClasses, selectClasses } from '../ui/FormField';
import { ArrowLeftIcon, BanknotesIcon, AdjustmentsHorizontalIcon, TrashIcon, PlusIcon } from '../ui/Icons';
import { getPlans, updatePlan as apiUpdatePlan, createPlan, deletePlan } from '../../services/plans';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '../shared/ToastContext';
import ConfirmationModal from '../shared/ConfirmationModal';

// Definition of available system limits that logic depends on
const SYSTEM_LIMITS = [
    { key: 'projects', label: { en: 'Max Projects', ar: 'أقصى عدد مشاريع' } },
    { key: 'units', label: { en: 'Max Units (Total)', ar: 'أقصى عدد وحدات' } },
    { key: 'propertiesTotal', label: { en: 'Max Properties (Total)', ar: 'إجمالي العقارات المسموح بها' } },
    { key: 'propertiesSale', label: { en: 'Max Properties (For Sale)', ar: 'أقصى عدد عقارات للبيع' } },
    { key: 'propertiesRent', label: { en: 'Max Properties (For Rent)', ar: 'أقصى عدد عقارات للإيجار' } },
    { key: 'portfolio', label: { en: 'Max Portfolio Items', ar: 'أقصى عدد أعمال المعرض' } },
];

const AdminPlanEditPage: React.FC = () => {
    const { planCategory: routeCategory, planKey: routeKey } = useParams<{ planCategory: string, planKey: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const isCreateMode = !routeKey;
    const initialCategory = routeCategory || searchParams.get('category') || 'developer';

    const { data: plans, isLoading } = useQuery({ queryKey: ['plans'], queryFn: getPlans, enabled: !isCreateMode });
    
    const t_page = t.adminDashboard.plans;
    const t_shared = t.adminShared;

    // --- State ---
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [newPlanSlug, setNewPlanSlug] = useState('');
    const [newPlanName, setNewPlanName] = useState({ en: '', ar: '' });

    const [arData, setArData] = useState({ price: '', description: '', features: '' });
    const [enData, setEnData] = useState({ price: '', description: '', features: '' });
    const [commissions, setCommissions] = useState({ sale: '', rent: '' });
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    
    // Dynamic Limits State: Array of { key, value }
    const [activeLimits, setActiveLimits] = useState<{ key: string; value: number }[]>([]);
    const [limitToAdd, setLimitToAdd] = useState<string>(''); // Key of limit to add

    const [loadingSave, setLoadingSave] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Determine context
    const { realPlanType, subCategory } = useMemo(() => {
        const cat = isCreateMode ? selectedCategory : routeCategory;
        if (cat === 'individual-sale') return { realPlanType: 'individual' as PlanCategory, subCategory: 'sale' as 'sale' };
        if (cat === 'individual-rent') return { realPlanType: 'individual' as PlanCategory, subCategory: 'rent' as 'rent' };
        return { realPlanType: cat as PlanCategory, subCategory: undefined };
    }, [routeCategory, selectedCategory, isCreateMode]);

    // Load Data on Edit
    useEffect(() => {
        if (!isCreateMode && plans && realPlanType && routeKey) {
            const planSource = subCategory ? (plans as any)?.[realPlanType]?.[subCategory] : plans?.[realPlanType];
            const plan = planSource?.[routeKey];

            if (plan) {
                const typedPlan = plan as { ar: SubscriptionPlanDetails, en: SubscriptionPlanDetails };
                setArData({
                    price: typedPlan.ar.price,
                    description: typedPlan.ar.description,
                    features: typedPlan.ar.features.join('\n'),
                });
                setEnData({
                    price: typedPlan.en.price,
                    description: typedPlan.en.description,
                    features: typedPlan.en.features.join('\n'),
                });
                
                const techData = typedPlan.en;
                setCommissions({
                    sale: techData.commissionRateSale !== undefined ? String(techData.commissionRateSale) : '',
                    rent: techData.commissionRateRent !== undefined ? String(techData.commissionRateRent) : '',
                });
                setBillingCycle(techData.billingCycle || 'monthly');

                // Convert Limits Object to Array for Dynamic Editing
                if (techData.limits) {
                    const loadedLimits = Object.entries(techData.limits)
                        .filter(([_, val]) => val !== undefined && val !== null) // Only active limits
                        .map(([key, val]) => ({ key, value: Number(val) }));
                    setActiveLimits(loadedLimits);
                }
            }
        }
    }, [isCreateMode, realPlanType, routeKey, subCategory, plans]);

    // --- Limit Management Handlers ---

    const handleAddLimit = () => {
        if (!limitToAdd) return;
        if (activeLimits.find(l => l.key === limitToAdd)) {
            showToast('This limit is already added.', 'error');
            return;
        }
        // Default to -1 (Unlimited) or 10
        setActiveLimits([...activeLimits, { key: limitToAdd, value: -1 }]);
        setLimitToAdd('');
    };

    const handleRemoveLimit = (keyToRemove: string) => {
        setActiveLimits(activeLimits.filter(l => l.key !== keyToRemove));
    };

    const handleLimitValueChange = (key: string, newValue: string) => {
        const numValue = newValue === '' ? 0 : parseInt(newValue, 10);
        setActiveLimits(activeLimits.map(l => l.key === key ? { ...l, value: isNaN(numValue) ? 0 : numValue } : l));
    };

    // --- Save Handler ---

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingSave(true);
        
        // Construct Limits Object from Array
        const limitsObject: any = {};
        activeLimits.forEach(item => {
            limitsObject[item.key] = item.value;
        });

        const parseComm = (val: string) => val === '' ? undefined : parseFloat(val);
        
        const payload = {
            ar: {
                name: isCreateMode ? newPlanName.ar : undefined,
                price: arData.price,
                description: arData.description,
                features: arData.features.split('\n').filter(f => f.trim() !== ''),
            },
            en: {
                name: isCreateMode ? newPlanName.en : undefined,
                price: enData.price,
                description: enData.description,
                features: enData.features.split('\n').filter(f => f.trim() !== ''),
            },
            limits: limitsObject,
            commissions: {
                sale: parseComm(commissions.sale),
                rent: parseComm(commissions.rent),
            },
            billingCycle: billingCycle
        };

        let success = false;
        
        try {
            if (isCreateMode) {
                 if (!newPlanSlug || !newPlanName.en || !newPlanName.ar) {
                     showToast('Please fill in Plan ID and Names.', 'error');
                     setLoadingSave(false);
                     return;
                 }
                 success = await createPlan(realPlanType, newPlanSlug, payload, subCategory);
            } else {
                 if (!routeKey) return;
                 success = await apiUpdatePlan(realPlanType, routeKey as SubscriptionPlan, payload, subCategory);
            }
            
            setLoadingSave(false);
            
            if (success) {
                showToast(`Plan ${isCreateMode ? 'created' : 'updated'} successfully`, 'success');
                await queryClient.invalidateQueries({ queryKey: ['plans'] });
                navigate('/admin/partners/plans');
            } else {
                showToast('Operation failed. Please check console.', 'error');
            }
        } catch (e: any) {
             setLoadingSave(false);
             showToast(`Error: ${e.message}`, 'error');
        }
    };
    
    const handleDelete = async () => {
        if (!routeKey) return;
        const success = await deletePlan(realPlanType, routeKey, subCategory);
        if (success) {
             showToast('Plan deleted successfully', 'success');
             await queryClient.invalidateQueries({ queryKey: ['plans'] });
             navigate('/admin/partners/plans');
        } else {
             showToast('Failed to delete plan.', 'error');
        }
    };

    // Filter available limits to add (exclude already added)
    const availableLimitsToAdd = SYSTEM_LIMITS.filter(sl => !activeLimits.find(al => al.key === sl.key));

    if (isLoading && !isCreateMode) return <div>Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn pb-20">
             {showDeleteModal && (
                <ConfirmationModal
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDelete}
                    title="Delete Plan"
                    message="Are you sure you want to delete this plan? This action cannot be undone."
                    confirmText="Delete"
                />
            )}
            
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <Link to="/admin/partners/plans" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                        <ArrowLeftIcon className="w-5 h-5" />
                        {t_shared.backToList}
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {isCreateMode ? 'Create New Plan' : `${t_page.editPlanTitle}: ${routeKey}`}
                    </h1>
                </div>
                {!isCreateMode && (
                     <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="flex items-center gap-2">
                        <TrashIcon className="w-5 h-5" /> Delete Plan
                    </Button>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                
                {/* 1. Basic Config (Create Mode) */}
                {isCreateMode && (
                     <Card className="border-l-4 border-l-blue-500">
                        <CardHeader><CardTitle>Plan Configuration</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select 
                                    value={selectedCategory} 
                                    onChange={(e) => setSelectedCategory(e.target.value)} 
                                    className={selectClasses}
                                >
                                    <option value="developer">Developer</option>
                                    <option value="agency">Agency</option>
                                    <option value="finishing">Finishing</option>
                                    <option value="individual-sale">Individual (Sale)</option>
                                    <option value="individual-rent">Individual (Rent)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Unique Slug (ID)</label>
                                <input 
                                    type="text" 
                                    value={newPlanSlug} 
                                    onChange={(e) => setNewPlanSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                                    className={inputClasses} 
                                    placeholder="e.g. platinum-plus" 
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Name (EN)</label>
                                <input value={newPlanName.en} onChange={e => setNewPlanName({...newPlanName, en: e.target.value})} className={inputClasses} placeholder="Platinum Plus" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Name (AR)</label>
                                <input value={newPlanName.ar} onChange={e => setNewPlanName({...newPlanName, ar: e.target.value})} className={inputClasses} dir="rtl" placeholder="بلاتينيوم بلس" />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* 2. Display Content */}
                <Card>
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                <BanknotesIcon className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                            </div>
                            <CardTitle>Display Content</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white border-b pb-2">Arabic</h4>
                                <FormField label={`${t_page.price} (AR)`} id="arPrice">
                                    <input value={arData.price} onChange={e => setArData({...arData, price: e.target.value})} className={inputClasses} dir="rtl" />
                                </FormField>
                                <FormField label={`${t_page.description} (AR)`} id="arDesc">
                                    <textarea value={arData.description} onChange={e => setArData({...arData, description: e.target.value})} className={inputClasses} rows={3} dir="rtl" />
                                </FormField>
                                <FormField label={`${t_page.features} (AR)`} id="arFeatures">
                                    <textarea value={arData.features} onChange={e => setArData({...arData, features: e.target.value})} className={inputClasses} rows={5} dir="rtl" />
                                </FormField>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-bold text-gray-900 dark:text-white border-b pb-2">English</h4>
                                <FormField label={`${t_page.price} (EN)`} id="enPrice">
                                    <input value={enData.price} onChange={e => setEnData({...enData, price: e.target.value})} className={inputClasses} dir="ltr" />
                                </FormField>
                                <FormField label={`${t_page.description} (EN)`} id="enDesc">
                                    <textarea value={enData.description} onChange={e => setEnData({...enData, description: e.target.value})} className={inputClasses} rows={3} dir="ltr" />
                                </FormField>
                                <FormField label={`${t_page.features} (EN)`} id="enFeatures">
                                    <textarea value={enData.features} onChange={e => setEnData({...enData, features: e.target.value})} className={inputClasses} rows={5} dir="ltr" />
                                </FormField>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 3. DYNAMIC LIMITS (Field-Level Management) */}
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                         <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <AdjustmentsHorizontalIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle>{t_page.limitsTitle}</CardTitle>
                                    <p className="text-sm text-gray-500">{t_page.limitsSubtitle}</p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Active Limits List */}
                        <div className="space-y-3 mb-6">
                            {activeLimits.length > 0 ? (
                                activeLimits.map((limit, idx) => {
                                    const systemLabel = SYSTEM_LIMITS.find(sl => sl.key === limit.key)?.label[language === 'ar' ? 'ar' : 'en'] || limit.key;
                                    return (
                                        <div key={idx} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm animate-fadeIn">
                                            <div className="flex-grow">
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{systemLabel}</label>
                                                <input 
                                                    type="number" 
                                                    value={limit.value} 
                                                    onChange={(e) => handleLimitValueChange(limit.key, e.target.value)} 
                                                    className={inputClasses + " h-9"}
                                                    placeholder="-1 for Unlimited"
                                                />
                                            </div>
                                            <div className="self-end pb-1">
                                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleRemoveLimit(limit.key)}>
                                                    <TrashIcon className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-center text-gray-500 italic py-4">No limits defined. This plan is fully unlimited.</p>
                            )}
                        </div>

                        {/* Add New Limit Control */}
                        <div className="flex gap-2 items-end pt-4 border-t border-gray-200 dark:border-gray-700">
                             <div className="flex-grow">
                                <label className="block text-sm font-medium mb-1">Add Limitation Field</label>
                                <select 
                                    className={selectClasses} 
                                    value={limitToAdd} 
                                    onChange={(e) => setLimitToAdd(e.target.value)}
                                >
                                    <option value="">Select a limit to add...</option>
                                    {availableLimitsToAdd.map(opt => (
                                        <option key={opt.key} value={opt.key}>{opt.label[language === 'ar' ? 'ar' : 'en']}</option>
                                    ))}
                                </select>
                            </div>
                            <Button type="button" onClick={handleAddLimit} disabled={!limitToAdd} className="mb-[2px]">
                                <PlusIcon className="w-5 h-5 mr-1" /> Add
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                 {/* 4. Financials (Commissions & Billing) */}
                 <Card>
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                        <CardTitle>{t_page.financialsTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Billing Cycle</label>
                                <select 
                                    value={billingCycle} 
                                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                                    className={selectClasses}
                                >
                                    <option value="monthly">{language === 'ar' ? 'شهري' : 'Monthly'}</option>
                                    <option value="yearly">{language === 'ar' ? 'سنوي' : 'Yearly'}</option>
                                    <option value="one_time">{language === 'ar' ? 'مرة واحدة' : 'One Time'}</option>
                                </select>
                            </div>
                            <FormField label={t_page.commissionSale} id="commissionSale">
                                <input type="number" step="0.1" value={commissions.sale} onChange={e => setCommissions({...commissions, sale: e.target.value})} className={inputClasses} placeholder="0%" />
                            </FormField>
                             <FormField label={t_page.commissionRent} id="commissionRent">
                                <input type="number" step="0.1" value={commissions.rent} onChange={e => setCommissions({...commissions, rent: e.target.value})} className={inputClasses} placeholder="0" />
                                <p className="text-xs text-gray-500 mt-1">Rent: Value 1 = 1 Month Rent</p>
                            </FormField>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700 gap-3">
                    <Button type="button" variant="secondary" onClick={() => navigate('/admin/partners/plans')}>{t_shared.cancel}</Button>
                    <Button type="submit" isLoading={loadingSave}>
                        {t_shared.save}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminPlanEditPage;
