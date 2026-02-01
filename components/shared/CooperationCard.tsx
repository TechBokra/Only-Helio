
import React from 'react';
import type { Language, SubscriptionPlanDetails, CommissionDisplayConfig } from '../../types';
import { CheckCircleIcon } from '../ui/Icons';
import { useLanguage } from './LanguageContext';
import { Card, CardContent } from '../ui/Card';

interface CooperationCardProps {
    planDetails: SubscriptionPlanDetails;
    isSelected: boolean;
    onSelect: () => void;
}

const CooperationCard: React.FC<CooperationCardProps> = ({ planDetails, isSelected, onSelect }) => {
    const { language, t } = useLanguage();
    const t_page = t.addPropertyPage;
    
    // Helper to format commission display
    const renderCommission = (commission?: CommissionDisplayConfig) => {
        if (!commission || commission.type === 'hidden') return null;
        
        let displayValue = '';
        const label = t.adminDashboard.plans.commissionRate.replace('(%)', '').trim(); // "Commission Rate" or "نسبة العمولة"

        switch (commission.type) {
            case 'percentage':
                displayValue = `${commission.value}%`;
                break;
            case 'fixed':
                displayValue = `${commission.value} ${language === 'ar' ? 'ج.م' : 'EGP'}`;
                break;
            case 'text':
                displayValue = String(commission.value);
                break;
            default:
                return null;
        }

        return (
            <p className="text-lg font-semibold text-gray-700 mb-4">
                {label}: {displayValue}
            </p>
        );
    };

    return (
        <Card
            onClick={onSelect}
            className={`relative p-0 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col text-center
                ${isSelected ? 'border-2 border-amber-500 bg-amber-50/50 shadow-xl' : ''}`
            }
        >
            {isSelected && <CheckCircleIcon className="w-7 h-7 text-amber-500 absolute top-4 right-4" />}
            <CardContent className="p-6 flex flex-col h-full text-center">
                <h3 className="text-2xl font-bold text-amber-600">{planDetails.name}</h3>
                <p className="text-gray-500 my-4 flex-grow">{planDetails.description}</p>
                <p className="text-xl font-bold text-gray-800 mb-4">{planDetails.price}</p>
                
                {renderCommission(planDetails.commission)}
                
                <ul className="space-y-2 mb-6 text-sm text-left">
                    {planDetails.features.map((benefit: string, index: number) => (
                        <li key={index} className="flex items-start">
                            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className={`text-gray-600 ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>{benefit}</span>
                        </li>
                    ))}
                </ul>
                <button type="button" className={`w-full font-bold py-3 rounded-lg mt-auto transition-colors ${isSelected ? 'bg-amber-500 text-gray-900' : 'bg-gray-200'}`}>
                    {t_page.cooperation.selectButton}
                </button>
            </CardContent>
        </Card>
    )
};

export default CooperationCard;
