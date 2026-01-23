
import React from 'react';
import CooperationCard from '../../shared/CooperationCard';
import { useLanguage } from '../../shared/LanguageContext';
import { SubscriptionPlan } from '../../../types';
import { ExclamationCircleIcon } from '../../ui/Icons';

interface Step2CooperationProps {
    purpose: 'For Sale' | 'For Rent' | null;
    plans: any;
    isLoading: boolean;
    selectedPlan: 'paid_listing' | 'commission' | null;
    onSelectPlan: (plan: 'paid_listing' | 'commission') => void;
    onBack: () => void;
}

export const Step2Cooperation: React.FC<Step2CooperationProps> = ({ purpose, plans, isLoading, selectedPlan, onSelectPlan, onBack }) => {
    const { language, t } = useLanguage();
    const t_page = t.addPropertyPage;

    const hasPlans = plans && Object.keys(plans).length > 0;

    return (
        <fieldset className="space-y-6 animate-fadeIn">
            <legend className="text-lg font-semibold text-amber-500 mb-2">{t_page.cooperation.title}</legend>
            <p className="text-sm text-gray-500 -mt-2 mb-4">{t_page.cooperation.subtitle}</p>
            
            <div className="grid sm:grid-cols-2 gap-6">
                {isLoading ? (
                    <>
                        <div className="border-2 rounded-lg p-6 h-64 bg-gray-100 animate-pulse"></div>
                        <div className="border-2 rounded-lg p-6 h-64 bg-gray-100 animate-pulse"></div>
                    </>
                ) : hasPlans ? (
                    Object.keys(plans).map((planKey) => (
                        <CooperationCard
                            key={planKey}
                            planDetails={plans[planKey][language]}
                            isSelected={selectedPlan === planKey}
                            onSelect={() => onSelectPlan(planKey as any)}
                        />
                    ))
                ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                        <ExclamationCircleIcon className="w-12 h-12 text-gray-400 mb-2" />
                        <p className="text-gray-600 font-medium">
                            {language === 'ar' 
                                ? 'عذراً، لا توجد خطط متاحة لهذا الخيار حالياً.' 
                                : 'Sorry, no plans available for this option currently.'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {language === 'ar'
                                ? 'يرجى التواصل مع الدعم الفني أو المحاولة لاحقاً.'
                                : 'Please contact support or try again later.'}
                        </p>
                    </div>
                )}
            </div>
            
            <div className="flex justify-start pt-4">
                <button type="button" onClick={onBack} className="text-sm font-semibold text-gray-500 hover:text-gray-700 underline">
                    {t_page.back}
                </button>
            </div>
        </fieldset>
    );
};
