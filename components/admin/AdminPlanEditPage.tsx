
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { SubscriptionPlan, PlanCategory, SubscriptionPlanDetails } from '../../types';
import FormField, { inputClasses } from '../ui/FormField';
import { ArrowLeftIcon, BanknotesIcon, AdjustmentsHorizontalIcon } from '../ui/Icons';
import { getPlans, updatePlan as apiUpdatePlan } from '../../services/plans';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { useToast } from '../shared/ToastContext';

const AdminPlanEditPage: React.FC = () => {
    const { planCategory, planKey } = useParams<{ planCategory: string, planKey: string }>();
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const { showToast } = useToast();
    const queryClient = useQueryClient(); // Need this for cache invalidation

    // Fetch plans with cache time 0 to ensure freshness on mount if needed, or rely on invalidation
    const { data: plans, isLoading } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
    
    const t_page = t.adminDashboard.plans;
    const t_shared = t.adminShared;

    const [arData, setArData] = useState({ price: '', description: '', features: '' });
    const [enData, setEnData] = useState({ price: '', description: '', features: '' });
    
    // Financials
    const [commissions, setCommissions] = useState({ sale: '', rent: '' });
    
    // Dynamic Limits
    const [limits, setLimits] = useState({
        projects: '',
        units: '',
        propertiesTotal: '',
        propertiesSale: '',
        propertiesRent: '',
        portfolio: ''
    });

    const [loadingSave, setLoadingSave] = useState(false);

    // Determine actual plan type and subCategory
    const { realPlanType, subCategory } = useMemo(() => {
        if (planCategory === 'individual-sale') return { realPlanType: 'individual' as PlanCategory, subCategory: 'sale' as 'sale' };
        if (planCategory === 'individual-rent') return { realPlanType: 'individual' as PlanCategory, subCategory: 'rent' as 'rent' };
        return { realPlanType: planCategory as PlanCategory, subCategory: undefined };
    }, [planCategory]);

    useEffect(() => {
        if (plans && realPlanType && planKey) {
            const planSource = subCategory ? (plans as any)?.[realPlanType]?.[subCategory] : plans?.[realPlanType];
            const plan = planSource?.[planKey];

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
                    sale: techData.commissionRateSale !== undefined && techData.commissionRateSale !== null ? String(techData.commissionRateSale) : '',
                    rent: techData.commissionRateRent !== undefined && techData.commissionRateRent !== null ? String(techData.commissionRateRent) : '',
                });
                
                const fmtLimit = (val?: number) => (val === -1 || val === undefined || val === null) ? '' : val.toString();
                setLimits({
                    projects: fmtLimit(techData.limits?.projects),
                    units: fmtLimit(techData.limits?.units),
                    propertiesTotal: fmtLimit(techData.limits?.propertiesTotal),
                    propertiesSale: fmtLimit(techData.limits?.propertiesSale),
                    propertiesRent: fmtLimit(techData.limits?.propertiesRent),
                    portfolio: fmtLimit(techData.limits?.portfolio),
                });
            }
        }
    }, [realPlanType, planKey, subCategory, plans]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!realPlanType || !planKey) return;
        
        setLoadingSave(true);
        
        const parseLimit = (val: string) => {
            if (val === '') return -1;
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? -1 : parsed;
        };

        const parseComm = (val: string) => {
            if (val === '') return undefined;
            const parsed = parseFloat(val);
            return isNaN(parsed) ? undefined : parsed;
        };

        const success = await apiUpdatePlan(realPlanType, planKey as SubscriptionPlan, {
            ar: {
                price: arData.price,
                description: arData.description,
                features: arData.features.split('\n').filter(f => f.trim() !== ''),
            },
            en: {
                price: enData.price,
                description: enData.description,
                features: enData.features.split('\n').filter(f => f.trim() !== ''),
            },
            limits: {
                projects: parseLimit(limits.projects),
                units: parseLimit(limits.units),
                propertiesTotal: parseLimit(limits.propertiesTotal),
                propertiesSale: parseLimit(limits.propertiesSale),
                propertiesRent: parseLimit(limits.propertiesRent),
                portfolio: parseLimit(limits.portfolio),
            },
            commissions: {
                sale: parseComm(commissions.sale),
                rent: parseComm(commissions.rent),
            }
        }, subCategory);
        
        setLoadingSave(false);
        
        if (success) {
            showToast('Plan updated successfully', 'success');
            // CRITICAL: Invalidate the cache so the list page fetches fresh data
            await queryClient.invalidateQueries({ queryKey: ['plans'] });
            navigate('/admin/partners/plans');
        } else {
            showToast('Failed to update plan. Please check console.', 'error');
        }
    };
    
    const planName = useMemo(() => {
        if (!plans || !realPlanType || !planKey) return '';
        const planSource = subCategory ? (plans as any)?.[realPlanType]?.[subCategory] : plans?.[realPlanType];
        return planSource?.[planKey as string]?.en.name || planKey;
    }, [realPlanType, planKey, subCategory, plans]);

    if (isLoading) return <div>Loading...</div>;
    if (!plans) return <div>Plan not found</div>;

    const isDeveloper = realPlanType === 'developer';
    const isAgency = realPlanType === 'agency';
    const isFinishing = realPlanType === 'finishing';

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn pb-20">
            <div className="mb-6">
                <Link to="/admin/partners/plans" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                    {t_shared.backToList}
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t_page.editPlanTitle}: {planName}</h1>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* 1. Content Section */}
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
                            {/* Arabic Fields */}
                            <div className="space-y-4 md:col-span-1">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white border-b pb-2">Arabic Content</h4>
                                <FormField label={`${t_page.price} (AR)`} id="arPrice">
                                    <input value={arData.price} onChange={e => setArData({...arData, price: e.target.value})} className={inputClasses} dir="rtl" />
                                </FormField>
                                <FormField label={`${t_page.description} (AR)`} id="arDesc">
                                    <textarea value={arData.description} onChange={e => setArData({...arData, description: e.target.value})} className={inputClasses} rows={3} dir="rtl" />
                                </FormField>
                                <FormField label={`${t_page.features} (AR)`} id="arFeatures">
                                    <textarea value={arData.features} onChange={e => setArData({...arData, features: e.target.value})} className={inputClasses} rows={6} dir="rtl" />
                                    <p className="text-xs text-gray-500 mt-1">{t_page.featuresHelpText}</p>
                                </FormField>
                            </div>

                            {/* English Fields */}
                            <div className="space-y-4 md:col-span-1">
                                <h4 className="font-bold text-lg text-gray-900 dark:text-white border-b pb-2">English Content</h4>
                                <FormField label={`${t_page.price} (EN)`} id="enPrice">
                                    <input value={enData.price} onChange={e => setEnData({...enData, price: e.target.value})} className={inputClasses} dir="ltr" />
                                </FormField>
                                <FormField label={`${t_page.description} (EN)`} id="enDesc">
                                    <textarea value={enData.description} onChange={e => setEnData({...enData, description: e.target.value})} className={inputClasses} rows={3} dir="ltr" />
                                </FormField>
                                <FormField label={`${t_page.features} (EN)`} id="enFeatures">
                                    <textarea value={enData.features} onChange={e => setEnData({...enData, features: e.target.value})} className={inputClasses} rows={6} dir="ltr" />
                                    <p className="text-xs text-gray-500 mt-1">{t_page.featuresHelpText}</p>
                                </FormField>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Limits & Quotas (The Dynamic Part) */}
                <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <AdjustmentsHorizontalIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                            </div>
                            <CardTitle>{t_page.limitsTitle}</CardTitle>
                        </div>
                        <p className="text-sm text-gray-500">{t_page.limitsSubtitle}</p>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {isDeveloper && (
                                <>
                                    <FormField label={t_page.limits.projects} id="limitProjects">
                                        <input type="number" value={limits.projects} onChange={e => setLimits({...limits, projects: e.target.value})} className={inputClasses} placeholder="Unlimited" />
                                    </FormField>
                                    <FormField label={t_page.limits.units} id="limitUnits">
                                        <input type="number" value={limits.units} onChange={e => setLimits({...limits, units: e.target.value})} className={inputClasses} placeholder="Unlimited" />
                                    </FormField>
                                </>
                            )}
                            
                            {(isAgency || isDeveloper || realPlanType === 'individual') && (
                                <>
                                    <FormField label={t_page.limits.propertiesTotal} id="limitPropertiesTotal">
                                        <input type="number" value={limits.propertiesTotal} onChange={e => setLimits({...limits, propertiesTotal: e.target.value})} className={inputClasses} placeholder="Unlimited" />
                                    </FormField>
                                     <FormField label={t_page.limits.propertiesSale} id="limitPropertiesSale">
                                        <input type="number" value={limits.propertiesSale} onChange={e => setLimits({...limits, propertiesSale: e.target.value})} className={inputClasses} placeholder="Unlimited" />
                                    </FormField>
                                     <FormField label={t_page.limits.propertiesRent} id="limitPropertiesRent">
                                        <input type="number" value={limits.propertiesRent} onChange={e => setLimits({...limits, propertiesRent: e.target.value})} className={inputClasses} placeholder="Unlimited" />
                                    </FormField>
                                </>
                            )}

                            {isFinishing && (
                                <FormField label={t_page.limits.portfolio} id="limitPortfolio">
                                    <input type="number" value={limits.portfolio} onChange={e => setLimits({...limits, portfolio: e.target.value})} className={inputClasses} placeholder="Unlimited" />
                                </FormField>
                            )}
                        </div>
                    </CardContent>
                </Card>

                 {/* 3. Commissions */}
                 <Card>
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                        <CardTitle>{t_page.financialsTitle}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label={t_page.commissionSale} id="commissionSale">
                                <input type="number" step="0.1" value={commissions.sale} onChange={e => setCommissions({...commissions, sale: e.target.value})} className={inputClasses} placeholder="0%" />
                            </FormField>
                             <FormField label={t_page.commissionRent} id="commissionRent">
                                <input type="number" step="0.1" value={commissions.rent} onChange={e => setCommissions({...commissions, rent: e.target.value})} className={inputClasses} placeholder="0" />
                                <p className="text-xs text-gray-500 mt-1">Usually 1 month rent value or percentage.</p>
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
