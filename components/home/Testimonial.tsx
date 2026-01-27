
import React from 'react';
import { useLanguage } from '../shared/LanguageContext';
import { QuoteIcon } from '../ui/Icons';
import { useSiteContent } from '../../hooks/useSiteContent';

const Testimonial: React.FC = () => {
    const { language } = useLanguage();
    const { data: siteContent, isLoading } = useSiteContent();

    if (isLoading || !siteContent?.testimonials?.items || siteContent.testimonials.items.length === 0) {
        return (
            <section className="py-20 bg-white animate-pulse">
                <div className="container mx-auto px-6 h-64 bg-gray-100 rounded-lg"></div>
            </section>
        );
    }
    
    const testimonialsContent = siteContent.testimonials;
    const sectionTitle = testimonialsContent[language].title;
    const sectionSubtitle = testimonialsContent[language].subtitle;
    const testimonialItems = testimonialsContent.items;

    return (
        <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-amber-50 dark:bg-amber-900/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{sectionTitle}</h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">{sectionSubtitle}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonialItems.map((testimonial, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col h-full">
                            <div className="mb-6">
                                <div className="bg-amber-500/10 w-12 h-12 rounded-full flex items-center justify-center text-amber-500">
                                    <QuoteIcon className="w-6 h-6" />
                                </div>
                            </div>
                            <blockquote className="text-lg text-gray-700 dark:text-gray-300 italic mb-8 flex-grow leading-relaxed">
                                "{testimonial.quote[language]}"
                            </blockquote>
                            <div className="flex items-center gap-4 mt-auto border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                                    {testimonial.author[language].charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{testimonial.author[language]}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location[language]}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonial;
