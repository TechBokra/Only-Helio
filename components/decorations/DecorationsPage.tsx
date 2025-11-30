
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Language, PortfolioItem } from '../../types';
import BannerDisplay from '../shared/BannerDisplay';
import SEO from '../shared/SEO';
import { usePortfolioItems } from '../../hooks/usePortfolioItems';
import { useDecorationCategories } from '../../hooks/useDecorationCategories';
import { useLanguage } from '../shared/LanguageContext';
import { useFavorites } from '../shared/FavoritesContext';
import { useToast } from '../shared/ToastContext';
import { HeartIcon, HeartIconSolid, ShareIcon, WhatsAppIcon, ShoppingCartIcon } from '../ui/Icons';
import { Button } from '../ui/Button';
import { useSiteContent } from '../../hooks/useSiteContent';

const DecorationsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_decor_page = t.decorationsPage;
    const t_decor_modal = t.decorationRequestModal;
    const t_custom_decor_modal = t.customDecorationRequestModal;
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { isFavorite, toggleFavorite } = useFavorites();

    const { data: siteContent, isLoading: isLoadingContent } = useSiteContent();
    const { data: allWorks, isLoading: isLoadingWorks } = usePortfolioItems();
    const { data: decorationCategories, isLoading: isLoadingCats } = useDecorationCategories();
    const isLoading = isLoadingWorks || isLoadingCats || isLoadingContent;

    // Use dynamic content if available, fallback to translation file
    const content = siteContent?.decorationsPage?.[language] || t_decor_page;

    // Mapping for category descriptions from siteContent
    const categoryDescriptions: Record<string, string> = {
        'Wall Sculptures': content.sculptures_desc,
        'منحوتات جدارية': content.sculptures_desc,
        'Canvas Paintings': content.paintings_desc,
        'لوحات كانفس': content.paintings_desc,
        'Antiques & Decor': content.antiques_desc,
        'تحف وديكورات': content.antiques_desc,
    };

    const tabs = useMemo(() => (decorationCategories || []).map(cat => ({
        key: cat.id,
        name: cat.name[language],
        // Fallback to category description from API/File if not found in siteContent mapping
        desc: categoryDescriptions[cat.name[language]] || cat.description[language]
    })), [decorationCategories, language, content]);
    
    const [activeTab, setActiveTab] = useState('');
    const [shareModalOpen, setShareModalOpen] = useState(false);

    useEffect(() => {
        if (tabs.length > 0 && !activeTab) {
            setActiveTab(tabs[0].name);
        }
    }, [tabs, activeTab]);

    const filteredWorks = useMemo(() => {
        if (!activeTab || !allWorks) return [];
        return allWorks.filter(work => work.category[language] === activeTab);
    }, [allWorks, activeTab, language]);

    const openRequestPage = (work: PortfolioItem) => {
        const isBuyNow = work.availability === 'In Stock' && work.price;
        const serviceTitle = isBuyNow 
            ? `${language === 'ar' ? 'شراء:' : 'Purchase:'} ${work.title[language]}`
            : `${t_decor_modal.reference} ${work.title[language]}`;
            
        navigate('/request-service', {
            state: {
                serviceTitle,
                partnerId: 'admin-user',
                workItem: work,
                serviceType: 'decorations',
                isPurchase: isBuyNow
            }
        });
    };
    
    const openCustomRequestPage = () => {
        const serviceTitle = `${t_custom_decor_modal.serviceTitle}: ${activeTab}`;
        navigate('/request-service', {
            state: {
                serviceTitle,
                partnerId: 'admin-user',
                categoryName: activeTab,
                isCustom: true,
                serviceType: 'decorations'
            }
        });
    };
    
    const handleWhatsAppShare = () => {
        const urlToShare = window.location.href;
        const text = encodeURIComponent(`${t.nav.decorations} | ONLY HELIO\n${content.heroSubtitle}\n${urlToShare}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        setShareModalOpen(false);
    };

    const handleCopyLink = async () => {
        const urlToShare = window.location.href;
        try {
            await navigator.clipboard.writeText(urlToShare);
            showToast(t.sharing.linkCopied, 'success');
            setShareModalOpen(false);
        } catch (err) {
            showToast(t.sharing.shareFailed, 'error');
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
            <SEO 
                title={`${t.nav.decorations} | ONLY HELIO`}
                description={content.heroSubtitle}
            />
            {shareModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={() => setShareModalOpen(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                            {t.sharing.shareDecorations}
                        </h3>
                        <div className="space-y-3">
                             <Button onClick={handleCopyLink} variant="outline" className="w-full justify-center">
                                {t.sharing.copyLink}
                            </Button>
                            <Button onClick={handleWhatsAppShare} className="w-full justify-center bg-green-500 hover:bg-green-600 text-white">
                                <WhatsAppIcon className="w-5 h-5 mr-2" />
                                {t.sharing.shareOnWhatsApp}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Hero Section */}
            <section className="relative h-[50vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1616046229478-9901c5536a45?fm=webp&q=75&w=1600&auto=format&fit=crop')" }}>
                <div className="absolute top-0 left-0 w-full h-full bg-black/70 z-10"></div>
                <div className="relative z-20 px-4 container mx-auto text-white">
                    <h1 className="text-4xl md:text-6xl font-extrabold">{content.heroTitle}</h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-200 mt-4">{content.heroSubtitle}</p>
                     <div className="mt-6">
                        <Button
                            onClick={() => setShareModalOpen(true)}
                            variant="secondary"
                            className="bg-white/20 text-white border-white/50 hover:bg-white/30"
                        >
                            <ShareIcon className="w-5 h-5 mr-2" />
                            {t.sharing.share}
                        </Button>
                    </div>
                </div>
            </section>

            <div className="py-20">
                <div className="container mx-auto px-6">
                    <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap -mb-px space-x-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`px-6 py-3 font-semibold text-xl border-b-4 transition-colors duration-200 ${
                                        activeTab === tab.name
                                        ? 'border-amber-500 text-amber-500'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:border-amber-500/50'
                                    }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-center max-w-4xl mx-auto mb-12 animate-fadeIn">
                         <p className="text-lg text-gray-600 dark:text-gray-400">
                            {tabs.find(tab => tab.name === activeTab)?.desc}
                        </p>
                        <button
                            onClick={openCustomRequestPage}
                            className="mt-6 bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20"
                        >
                            {t_decor_page.requestCustomDesign}
                        </button>
                    </div>

                    <BannerDisplay location="decorations" />
                   
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 animate-fadeIn mt-12">
                       {isLoading && !activeTab ? (
                           Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-gray-200 dark:bg-gray-800 rounded-lg aspect-[4/5] animate-pulse"></div>
                           ))
                       ) : filteredWorks.map((work, index) => {
                            const isFav = isFavorite(work.id, 'portfolio');
                            const isBuyNow = work.availability === 'In Stock' && work.price;
                            
                            const handleFavoriteClick = (e: React.MouseEvent) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(work.id, 'portfolio');
                                showToast(isFav ? t.favoritesPage.removedFromFavorites : t.favoritesPage.addedToFavorites, 'success');
                            };
                            
                           return (
                               <div key={`${work.imageUrl}-${index}`} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
                                   <div className="relative">
                                       <div className="aspect-[4/5] bg-gray-100 dark:bg-gray-700">
                                           <picture>
                                               <source type="image/webp" srcSet={`${work.imageUrl}&fm=webp`} />
                                               <img src={work.imageUrl} alt={work.alt} className="w-full h-full object-cover" loading="lazy" />
                                           </picture>
                                       </div>
                                       {work.availability && (
                                           <span className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} text-xs font-bold px-2 py-1 rounded-full text-white ${work.availability === 'In Stock' ? 'bg-green-600' : 'bg-sky-600'}`}>
                                               {work.availability === 'In Stock' ? t_decor_page.inStock : t_decor_page.madeToOrder}
                                           </span>
                                       )}
                                       <button onClick={handleFavoriteClick} className="absolute top-3 left-3 p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors z-10" aria-label={isFav ? t.favoritesPage.removeFromFavorites : t.favoritesPage.addToFavorites}>
                                            {isFav ? <HeartIconSolid className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5 text-white" />}
                                        </button>
                                   </div>
                                   <div className="p-4 flex flex-col flex-grow">
                                       <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate mb-2">{work.title[language]}</h3>
                                       <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap gap-2">
                                           {work.price != null && <span className="font-semibold text-amber-500 text-base">{new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(work.price)}</span>}
                                           {work.dimensions && <span className="text-xs">{t_decor_page.dimensions}: {work.dimensions}</span>}
                                       </div>
                                       <button 
                                           onClick={() => openRequestPage(work)}
                                           className={`w-full mt-auto font-bold px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${isBuyNow ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-amber-500 hover:bg-amber-600 text-gray-900'}`}
                                       >
                                           {isBuyNow && <ShoppingCartIcon className="w-4 h-4" />}
                                           {isBuyNow ? (language === 'ar' ? 'شراء الآن' : 'Buy Now') : t_decor_page.inquireNow}
                                       </button>
                                   </div>
                               </div>
                           )
                        })}
                   </div>

                   { !isLoading && filteredWorks.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-500 dark:text-gray-400">
                                {language === 'ar' ? 'لا توجد أعمال في هذا القسم حاليًا.' : 'No works in this section currently.'}
                            </p>
                        </div>
                   )}

                </div>
            </div>
        </div>
    );
};

export default DecorationsPage;
