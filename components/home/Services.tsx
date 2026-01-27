
import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingIcon, DecorationIcon, FinishingIcon, SparklesIcon, CalculatorIcon } from '../ui/Icons';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useLanguage } from '../shared/LanguageContext';
import { Card, CardContent } from '../ui/Card';

const iconMap: { [key: string]: React.FC<{ className?: string }> } = {
    BuildingIcon,
    FinishingIcon,
    DecorationIcon,
    SparklesIcon,
    CalculatorIcon,
};

const ServiceCard: React.FC<{ icon: React.ReactNode; title: string; description: string; link: string }> = ({
    icon,
    title,
    description,
    link,
}) => (
    <Link to={link} className="block group h-full">
        <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white dark:bg-gray-800 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <CardContent className="p-8 flex flex-col items-start h-full">
                <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 p-4 rounded-2xl mb-6 inline-block group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                    {icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed flex-grow text-base">
                    {description}
                </p>
                <div className="mt-6 flex items-center text-amber-600 dark:text-amber-500 font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <span>Explore Service</span>
                    <svg className="w-4 h-4 ml-2 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </CardContent>
        </Card>
    </Link>
);

const Services: React.FC = () => {
    const { language } = useLanguage();
    const { data: siteContent, isLoading } = useSiteContent();

    if (isLoading || !siteContent) {
        return <section className="py-20 bg-gray-50 animate-pulse h-96"></section>;
    }

    const t = siteContent.services[language];

    return (
        <section className="py-24 bg-gray-50 dark:bg-gray-900 subtle-bg">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <span className="text-amber-600 dark:text-amber-500 font-semibold tracking-wider uppercase text-sm">
                        {language === 'ar' ? 'ماذا نقدم' : 'What We Offer'}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mt-2 mb-6">
                        {t.title}
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        {t.description}
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                    {t.features.map((feature) => {
                        const IconComponent = iconMap[feature.icon] || BuildingIcon;
                        return <ServiceCard key={feature.title} {...feature} icon={<IconComponent className="w-8 h-8" />} />;
                    })}
                </div>
            </div>
        </section>
    );
};

export default Services;
