
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Language, SubscriptionPlan, SubscriptionPlanDetails } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { CheckCircleIcon, PhotoIcon, WrenchScrewdriverIcon, BuildingIcon, CubeIcon } from '../ui/Icons';
import { useSubscriptionUsage } from '../../hooks/useSubscriptionUsage';
import { useLanguage } from '../shared/LanguageContext';

const PlanCard: React.FC<{
    planKey: SubscriptionPlan,
    plan: SubscriptionPlanDetails,
    isCurrent: boolean,
    isUpgradeOption: boolean,
    language: Language,
    t: any,
    onUpgrade: (planKey: SubscriptionPlan, priceString: string) => void
}> = ({ planKey, plan, isCurrent, isUpgradeOption, language, t, onUpgrade }) => {
    const t_sub = t.dashboardSubscription;

    return (
        <div className={`border-2 rounded-lg p-6 h-full flex flex-col ${
            isCurrent 
            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-900/20' 
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
        }`}>
             {isCurrent && <div className="text-center mb-4 text-sm font-bold text-amber-600 dark:text-amber-400">{t_sub.yourCurrentPlan}</div>}
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{plan.name}</h3>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white my-4">{plan.price}</p>
            <p className="text-gray-500 dark:text-gray-400 mb-6 flex-grow">{plan.description}</p>
            
            <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className={`text-gray-700 dark:text-gray-300 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>{feature}</span>
                    </li>
                ))}
            </ul>

            {isUpgradeOption && (
                 <button
                    onClick={() => onUpgrade(planKey, plan.price)}
                    className="w-full font-bold py-3 rounded-lg mt-auto bg-amber-500 text-gray-900 hover:bg-amber-600 transition-colors"
                >
                    {t.dashboard.upgradePlan}
                </button>
            )}
        </div>
    );
};

// Component to render a single usage bar (encapsulates hook logic)
const UsageProgressBar: React.FC<{ 
    type: 'properties' | 'projects' | 'units' | 'portfolio' | 'services', 
    label: string,
    icon: React.FC<{className?: string}>
}> = ({ type, label, icon: Icon }) => {
    const { usageCount, limit } = useSubscriptionUsage(type);
    
    // Check for unlimited (-1) or Infinity
    const isUnlimited = limit === -1 || limit === Infinity;
    const usagePercentage = isUnlimited ? 0 : Math.min(100, (usageCount / limit) * 100);

    return (
        <div className="mb-6 last:mb-0">
             <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-500 dark:text-gray-300">
                        <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">
                    {usageCount} {isUnlimited ? '' : `/ ${limit}`}
                    {isUnlimited && <span className="text-xs text-green-600 font-normal ml-1">(Unlimited)</span>}
                </span>
            </div>
            {!isUnlimited && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${usagePercentage >= 100 ? 'bg-red-500' : (usagePercentage > 80 ? 'bg-amber-500' : 'bg-green-500')}`}
                        style={{width: `${usagePercentage}%`}}
                    ></div>
                </div>
            )}
        </div>
    );
};

const DashboardSubscriptionPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_sub = t.dashboardSubscription;
    const t_home = t.dashboardHome;
    const t_dash = t.dashboard;
    
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // Determine which metrics to show based on partner type
    const metricsToShow = useMemo(() => {
        if (!currentUser) return [];
        switch(currentUser.type) {
            case 'finishing':
                return [
                    { type: 'portfolio', label: t_home.totalPortfolio, icon: PhotoIcon },
                    { type: 'services', label: t_dash.nav.services, icon: WrenchScrewdriverIcon }
                ];
            case 'developer':
                return [
                    { type: 'projects', label: t_home.totalProjects, icon: CubeIcon },
                    { type: 'units', label: t_home.totalUnits, icon: BuildingIcon }
                ];
            case 'agency':
            default:
                return [
                    { type: 'properties', label: t_sub.propertiesListed, icon: BuildingIcon }
                ];
        }
    }, [currentUser, t_home, t_dash, t_sub]);

    const planOrder: SubscriptionPlan[] = useMemo(() => {
        if (currentUser?.type === 'finishing') {
            // Check subCategory to determine plan structure (e.g. Engineer vs Company)
            // Simplified fallback:
            return ['commission', 'professional', 'elite', 'freelancer_basic', 'freelancer_pro', 'studio_growth', 'corporate_elite'];
        }
        return ['basic', 'professional', 'elite'];
    }, [currentUser?.type]);

    const handleUpgrade = (planKey: SubscriptionPlan, priceString: string) => {
        if (!currentUser) return;
        const amount = parseInt(priceString.replace(/[^0-9]/g, '')) || 0;
        
        navigate('/payment', {
            state: {
                amount,
                description: `Upgrade Plan to ${planKey}`,
                type: 'subscription_fee',
                userId: currentUser.id,
                userName: currentUser.name,
                data: { isUpgrade: true, newPlan: planKey, partnerId: currentUser.id }
            }
        });
    };

    if (!currentUser || !('type' in currentUser)) {
        return <div>Loading...</div>;
    }

    const planCategory = currentUser.type as 'developer' | 'agency' | 'finishing';
    
    // Logic to fetch correct plan details object
    // Assuming t.subscriptionPlans has the structure: { finishing: { engineer: { ... }, company: { ... } }, developer: { ... } }
    let plansForCurrentUserType: any = t.subscriptionPlans[planCategory];
    
    // If it's finishing, we might need to dig deeper based on current plan key existence or subCategory logic
    // For MVP/Demo: flatten the lookup or try to find where the current plan exists
    if (planCategory === 'finishing') {
        // Try direct lookup first
        if (!plansForCurrentUserType[currentUser.subscriptionPlan]) {
             // Search in subcategories if not found at top level
             const foundSub = Object.values(plansForCurrentUserType).find((subGroup: any) => subGroup[currentUser.subscriptionPlan]);
             if (foundSub) plansForCurrentUserType = foundSub;
        }
    }
    
    const currentPlanKey = currentUser.subscriptionPlan;
    const currentPlanDetails = plansForCurrentUserType ? plansForCurrentUserType[currentPlanKey] : null;
    
    // Filter upgrades: Show plans that are logically "higher" or different than current
    // Simple filter: Show all except current
    const upgradeOptions = plansForCurrentUserType 
        ? Object.keys(plansForCurrentUserType).filter(k => k !== currentPlanKey) 
        : [];

    return (
        <div className="animate-fadeIn">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_sub.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_sub.subtitle}</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Left Column: Current Plan Status */}
                <div className="lg:col-span-1 space-y-6">
                     <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t_sub.currentPlanTitle}</h2>
                     {currentPlanDetails ? (
                        <PlanCard
                            planKey={currentPlanKey}
                            plan={currentPlanDetails}
                            isCurrent={true}
                            isUpgradeOption={false}
                            language={language}
                            t={t}
                            onUpgrade={handleUpgrade}
                        />
                    ) : (
                        <div className="border-2 border-red-500 bg-red-50/50 dark:bg-red-900/20 p-6 rounded-lg text-center">
                            <p className="font-bold text-red-700 dark:text-red-300">Plan Status Unknown</p>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                                {language === 'ar' ? 'يرجى التواصل مع الدعم الفني.' : 'Please contact support.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Usage Stats & Upgrades */}
                <div className="lg:col-span-2 space-y-10">
                    
                    {/* Usage Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t_sub.usageTitle}</h2>
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                             {metricsToShow.map(metric => (
                                 // @ts-ignore
                                 <UsageProgressBar 
                                     key={metric.type} 
                                     type={metric.type as any} 
                                     label={metric.label} 
                                     icon={metric.icon} 
                                 />
                             ))}
                        </div>
                    </div>
                    
                    {/* Upgrade Options Section */}
                    {upgradeOptions.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t_sub.upgradeOptionsTitle}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {upgradeOptions.map(planKey => (
                                    <PlanCard
                                        key={planKey}
                                        planKey={planKey}
                                        plan={plansForCurrentUserType[planKey]}
                                        isCurrent={false}
                                        isUpgradeOption={true}
                                        language={language}
                                        t={t}
                                        onUpgrade={handleUpgrade}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default DashboardSubscriptionPage;
