
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSiteContent } from '../../hooks/useSiteContent';
import { useLanguage } from '../shared/LanguageContext';
import { SearchIcon, BuildingIcon, WrenchScrewdriverIcon, HomeIcon } from '../ui/Icons';
import { Card } from '../ui/Card';

const Hero: React.FC = () => {
    const { language, t } = useLanguage();
    const { data: siteContent, isLoading } = useSiteContent();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'finish'>('buy');
    const [propertyType, setPropertyType] = useState('all');

    const heroImages = siteContent?.hero?.images || [];

    useEffect(() => {
        if (heroImages.length === 0) return;
        const timer = setTimeout(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 6000); 
        return () => clearTimeout(timer);
    }, [currentImageIndex, heroImages.length]);

    const handleSearch = () => {
        if (activeTab === 'finish') {
            navigate('/finishing');
        } else {
            const status = activeTab === 'buy' ? 'For Sale' : 'For Rent';
            let url = `/properties?status=${encodeURIComponent(status)}`;
            if (propertyType !== 'all') {
                url += `&type=${propertyType}`;
            }
            navigate(url);
        }
    };

    return (
        <section className="relative h-[600px] lg:h-[700px] flex items-center justify-center text-center text-white overflow-hidden">
            {heroImages.map((image, index) => (
                 <div key={image.src} className={`slider-image ${index === currentImageIndex ? 'active' : ''}`}>
                    <div className="watermarked w-full h-full">
                        <img
                            src={image.src}
                            alt={image.alt[language] || ''}
                            className="w-full h-full object-cover disable-image-interaction"
                            loading="lazy"
                        />
                    </div>
                </div>
            ))}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/70 via-black/50 to-black/70 z-10"></div>

            <div className="relative z-20 px-4 container mx-auto flex flex-col items-center">
                {isLoading || !siteContent ? (
                    <div className="animate-pulse w-full max-w-4xl h-40 bg-white/10 rounded-lg"></div>
                ) : (
                    <>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-shadow animate-slideInUp drop-shadow-lg leading-tight">
                            {siteContent.hero[language].title}
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-100 mb-10 text-shadow animate-slideInUp font-medium leading-relaxed" style={{ animationDelay: '100ms' }}>
                            {siteContent.hero[language].subtitle}
                        </p>
                    </>
                )}

                {/* Quick Search Box */}
                <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-2 animate-slideInUp border-0" style={{ animationDelay: '200ms' }}>
                    <div className="flex gap-2 p-2 bg-gray-100/80 rounded-xl mb-4 overflow-x-auto">
                        <button 
                            onClick={() => setActiveTab('buy')}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'buy' ? 'bg-white text-amber-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                        >
                            <HomeIcon className="w-5 h-5" />
                            {language === 'ar' ? 'شراء عقار' : 'Buy Property'}
                        </button>
                        <button 
                            onClick={() => setActiveTab('rent')}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'rent' ? 'bg-white text-amber-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                        >
                            <BuildingIcon className="w-5 h-5" />
                            {language === 'ar' ? 'استئجار عقار' : 'Rent Property'}
                        </button>
                        <button 
                            onClick={() => setActiveTab('finish')}
                            className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'finish' ? 'bg-white text-amber-600 shadow-md transform scale-105' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200'}`}
                        >
                            <WrenchScrewdriverIcon className="w-5 h-5" />
                            {language === 'ar' ? 'تشطيب وديكور' : 'Finishing & Decor'}
                        </button>
                    </div>

                    <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
                        {activeTab !== 'finish' ? (
                            <>
                                <div className="w-full md:w-1/3">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider text-left px-1">{t.propertiesPage.typeLabel}</label>
                                    <select 
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-gray-900 font-medium"
                                        value={propertyType}
                                        onChange={(e) => setPropertyType(e.target.value)}
                                    >
                                        <option value="all">{t.propertiesPage.allTypes}</option>
                                        <option value="Apartment">{t.propertiesPage.apartment}</option>
                                        <option value="Villa">{t.propertiesPage.villa}</option>
                                        <option value="Commercial">{t.propertiesPage.commercial}</option>
                                        <option value="Land">{t.propertiesPage.land}</option>
                                    </select>
                                </div>
                                <div className="w-full md:flex-grow">
                                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider text-left px-1">{language === 'ar' ? 'الكلمات المفتاحية' : 'Keywords'}</label>
                                    <input 
                                        type="text" 
                                        placeholder={t.propertiesPage.searchPlaceholder}
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-gray-900"
                                    />
                                </div>
                                <button 
                                    onClick={handleSearch}
                                    className="w-full md:w-auto min-w-[160px] bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 mt-5 md:mt-0"
                                >
                                    <SearchIcon className="w-5 h-5" />
                                    {language === 'ar' ? 'ابحث الآن' : 'Search Now'}
                                </button>
                            </>
                        ) : (
                             <div className="w-full flex flex-col md:flex-row items-center gap-4">
                                <div className="flex-grow text-center md:text-left px-4">
                                    <h3 className="text-lg font-bold text-gray-900">{language === 'ar' ? 'هل تبحث عن تشطيب شقتك؟' : 'Looking to finish your unit?'}</h3>
                                    <p className="text-gray-500 text-sm">{language === 'ar' ? 'احسب التكلفة التقديرية فوراً أو تصفح باقات التشطيب.' : 'Calculate estimated cost instantly or browse finishing packages.'}</p>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <Link to="/estimator" className="flex-1 md:flex-none text-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors">
                                        {language === 'ar' ? 'حساب التكلفة' : 'Calculate Cost'}
                                    </Link>
                                    <Link to="/finishing" className="flex-1 md:flex-none text-center bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-amber-500/30 transition-colors">
                                        {language === 'ar' ? 'عرض الباقات' : 'View Packages'}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </section>
    );
};

export default Hero;
