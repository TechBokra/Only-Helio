
import React from 'react';
import { BuildingIcon, CheckCircleIcon, PriceIcon, LocationMarkerIcon, ShieldCheckIcon, CalculatorIcon, SparklesIcon } from '../ui/Icons';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useLanguage } from '../shared/LanguageContext';
import { Card, CardContent } from '../ui/Card';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
    icon,
    title,
    description,
}) => (
    <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-all duration-300 transform hover:-translate-y-1 h-full hover:shadow-xl p-0 overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
        <CardContent className="p-8">
            <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-700 text-amber-600 dark:text-amber-500 p-4 rounded-xl mb-6 inline-block group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
            </div>
        </CardContent>
    </Card>
);

const Integrations: React.FC = () => {
    const { language } = useLanguage();
    const { data: siteContent, isLoading } = useSiteContent();

    if (isLoading || !siteContent) {
        return <section className="py-20 bg-white animate-pulse h-96"></section>;
    }

    const t = siteContent.whyUs[language];

    // Map features to icons dynamically based on index or keyword for variety
    const getIcon = (index: number) => {
        const icons = [
            <LocationMarkerIcon className="w-8 h-8" />, // Specialized
            <ShieldCheckIcon className="w-8 h-8" />,    // Trust
            <CalculatorIcon className="w-8 h-8" />,     // AI Pricing
            <SparklesIcon className="w-8 h-8" />,       // Integrated
        ];
        return icons[index % icons.length];
    };

    return (
        <section className="py-24 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6">{t.title}</h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 mt-4 max-w-3xl mx-auto leading-relaxed">{t.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {t.features.map((feature, index) => (
                        <FeatureCard key={index} {...feature} icon={getIcon(index)} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Integrations;
