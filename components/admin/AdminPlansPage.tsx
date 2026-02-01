
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SubscriptionPlanDetails, PlanCategory } from '../../types';
import { CheckCircleIcon, PlusIcon } from '../ui/Icons';
import { getPlans } from '../../services/plans';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '../shared/LanguageContext';
import { Button } from '../ui/Button';

const PlanCard: React.FC<{ 
    plan: SubscriptionPlanDetails, 
    planKey: string,
    planType: string,
    language: 'ar' | 'en'
}> = ({ plan, planKey, planType, language }) => {
    const { t } = useLanguage();
    if (!plan) {
        return <div className="bg-red-100 p-4 rounded-lg text-red-800">Error: Plan data is missing.</div>;
    }
    
    // We need to pass the category/subCategory combo correctly to the edit page
    // Ensure URL encoding for safety
    const categorySegment = encodeURIComponent(planType); 

    return (
        <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col hover:border-amber-400 transition-colors">
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{plan.name}</h3>
            <p className="text-xs text-gray-400 font-mono mt-1 mb-2">Slug: {plan.tier}</p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white my-4">{plan.price}</p>
            
            {plan.commissionRateSale !== undefined && (
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 my-2">
                   {t.adminDashboard.plans.commissionRate.replace('(%)', '')}: {plan.commissionRateSale}%
                </p>
            )}

            <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">{plan.description}</p>
            
            <ul className="space-y-4 mb-8">
                {(plan.features || []).map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <span className={`text-gray-700 dark:text-gray-300 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>{feature}</span>
                    </li>
                ))}
            </ul>

            <Link
                to={`/admin/partners/plans/edit/${categorySegment}/${plan.tier}`}
                className="w-full block text-center font-bold py-2 rounded-lg mt-auto bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-amber-500 hover:text-gray-900 transition-colors"
            >
                {t.adminShared.edit}
            </Link>
        </div>
    );
};


const AdminPlansPage: React.FC<{ availableCategories?: PlanCategory[] }> = ({ availableCategories }) => {
    const { language, t } = useLanguage();
    const t_plans = t.adminDashboard.plans;
    const { data: plans, isLoading: loading } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
    
    // Define tabs including the new sub-categories
    // Note: The 'key' here maps to how we will access data in the `plans` object or handle logic
    const allTabs: { key: string, name: string, dataPath: string[] }[] = [
        { key: 'developer', name: t_plans.planCategories.developer, dataPath: ['developer'] },
        { key: 'agency', name: t_plans.planCategories.agency, dataPath: ['agency'] },
        { key: 'finishing-engineer', name: language === 'ar' ? 'مهندسون (أفراد)' : 'Engineers (Individual)', dataPath: ['finishing', 'engineer'] },
        { key: 'finishing-office', name: language === 'ar' ? 'مكاتب هندسية' : 'Offices', dataPath: ['finishing', 'office'] },
        { key: 'finishing-company', name: language === 'ar' ? 'شركات تشطيب' : 'Companies', dataPath: ['finishing', 'company'] },
        { key: 'individual-sale', name: t_plans.planCategories.sale, dataPath: ['individual', 'sale'] },
        { key: 'individual-rent', name: t_plans.planCategories.rent, dataPath: ['individual', 'rent'] },
    ];
    
    const getVisibleTabs = () => {
        if (!availableCategories) return allTabs;
        const visibleKeys = new Set(availableCategories);
        return allTabs.filter(tab => {
            // Check if base category is allowed
            const baseCat = tab.dataPath[0] as PlanCategory;
            return visibleKeys.has(baseCat);
        });
    };
    
    const tabs = getVisibleTabs();
    const [activeTabKey, setActiveTabKey] = useState<string>(tabs[0]?.key || 'developer');
    
    // Find current tab def
    const activeTabDef = tabs.find(t => t.key === activeTabKey) || tabs[0];

    const renderPlans = () => {
        if (loading || !plans) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
            );
        }

        // Navigate deep into the plans object based on dataPath
        let plansToRender: any = plans;
        for (const pathPart of activeTabDef.dataPath) {
            plansToRender = plansToRender?.[pathPart];
            if (!plansToRender) break;
        }
        plansToRender = plansToRender || {};

        const planKeys = Object.keys(plansToRender);

        return (
            <div>
                 {planKeys.length === 0 ? (
                     <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 mb-4">No plans found for this category.</p>
                        <Link to={`/admin/partners/plans/new?category=${activeTabKey}`}>
                             <Button>Create First Plan</Button>
                        </Link>
                     </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {planKeys.map(planKey => (
                            <PlanCard 
                                key={planKey}
                                planKey={planKey}
                                planType={activeTabKey} // Pass the unique key (e.g. finishing-engineer) to resolve edit URL
                                plan={plansToRender[planKey]?.[language]}
                                language={language}
                            />
                        ))}
                         {/* Card to Add New */}
                         <Link to={`/admin/partners/plans/new?category=${activeTabKey}`} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:border-amber-500 hover:text-amber-500 transition-all group min-h-[400px]">
                            <PlusIcon className="w-16 h-16 mb-4 text-gray-300 group-hover:text-amber-500" />
                            <span className="font-bold text-lg">Add New Plan</span>
                         </Link>
                    </div>
                 )}
            </div>
        );
    };

    return (
        <div className="animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_plans.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t_plans.subtitle}</p>
                </div>
                <Link to={`/admin/partners/plans/new?category=${activeTabKey}`}>
                    <Button className="flex items-center gap-2">
                        <PlusIcon className="w-5 h-5"/>
                        Create Plan
                    </Button>
                </Link>
            </div>
            
            <div className="mb-8 border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTabKey(tab.key)}
                            className={`${
                                activeTabKey === tab.key
                                    ? 'border-amber-500 text-amber-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {renderPlans()}
        </div>
    );
};

export default AdminPlansPage;
