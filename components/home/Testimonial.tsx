
import React from 'react';
import { useLanguage } from '../shared/LanguageContext';
import { QuoteIcon } from '../ui/Icons';
import { useSiteContent } from '../../hooks/useSiteContent';

const Testimonial: React.FC = () => {
    const { language } = useLanguage();
    const { data: siteContent, isLoading } = useSiteContent();

    if (isLoading || !siteContent?.testimonials?.items || siteContent.testimonials.items.length === 0) {
        return (
            <section className="py-20 bg-white subtle-bg animate-pulse">
                <div className="container mx-auto px-6 h-64"></div>
            </section>
        );
    }
    
    const testimonialsContent = siteContent.testimonials;
    const sectionTitle = testimonialsContent[language].title;
    const sectionSubtitle = testimonialsContent[language].subtitle;
    const testimonialItems = testimonialsContent.items;

    return (
        <section className="py-20 bg-white subtle-bg">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{sectionTitle}</h2>
                    <p className="text-lg text-gray-500 mt-4 max-w-3xl mx-auto">{sectionSubtitle}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {testimonialItems.map((testimonial: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-8 rounded-lg shadow-md border border-gray-200">
                            <QuoteIcon className="w-12 h-12 text-amber-400 mb-4" />
                            <blockquote className="text-lg text-gray-700 italic mb-6">
                                "{testimonial.quote[language]}"
                            </blockquote>
                            <footer className="font-semibold">
                                <p className="text-gray-900">{testimonial.author[language]}</p>
                                <p className="text-gray-500 text-sm">{testimonial.location[language]}</p>
                            </footer>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonial;
