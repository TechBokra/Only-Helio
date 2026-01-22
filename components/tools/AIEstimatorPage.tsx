
import React from 'react';
import AIEstimator from '../ai/AIEstimator';
import SEO from '../shared/SEO';
import { useLanguage } from '../shared/LanguageContext';

const AIEstimatorPage: React.FC = () => {
    const { language } = useLanguage();
    
    return (
        <>
            <SEO 
                title={language === 'ar' ? 'مقدر تكلفة التشطيب الذكي | ONLY HELIO' : 'AI Finishing Cost Estimator | ONLY HELIO'}
                description={language === 'ar' 
                    ? 'احصل على تقدير فوري ودقيق لتكلفة تشطيب وحدتك العقارية باستخدام الذكاء الاصطناعي.' 
                    : 'Get an instant, accurate AI-powered cost estimate for finishing your property unit.'} 
            />
            <div className="bg-gray-50 dark:bg-gray-900 min-h-screen pt-10 pb-20">
                <div className="container mx-auto px-6 mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {language === 'ar' ? 'حاسبة التكلفة الذكية' : 'Smart Cost Calculator'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {language === 'ar' 
                            ? 'خطط لميزانيتك بدقة. استخدم أداتنا المدعومة بالذكاء الاصطناعي لحساب تكلفة تشطيب منزلك بناءً على أسعار السوق الحالية.'
                            : 'Plan your budget accurately. Use our AI-powered tool to calculate your home finishing cost based on current market rates.'}
                    </p>
                </div>
                <AIEstimator />
            </div>
        </>
    );
};

export default AIEstimatorPage;
