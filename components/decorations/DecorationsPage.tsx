
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Language, PortfolioItem } from '../../types';
import BannerDisplay from '../shared/BannerDisplay';
import SEO from '../shared/SEO';
import { usePortfolioItems } from '../../hooks/usePortfolioItems';
import { useDecorationCategories } from '../../hooks/useDecorationCategories';
import { useLanguage } from '../shared/LanguageContext';
import { useFavorites } from '../shared/FavoritesContext';
import { useToast } from '../shared/ToastContext';
import { HeartIcon, HeartIconSolid, ShareIcon, WhatsAppIcon, ShoppingCartIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from '../ui/Icons';
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

    // State for Active Category (Using ID for stability)
    const [activeCategoryId, setActiveCategoryId] = useState('');
    
    // State for Viewer (Lightbox)
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);

    // Initialize Active Category
    useEffect(() => {
        if (decorationCategories && decorationCategories.length > 0 && !activeCategoryId) {
            setActiveCategoryId(decorationCategories[0].id);
        }
    }, [decorationCategories, activeCategoryId]);

    // Robust Filtering Logic: Try CategoryID first, then Name matching as fallback
    const filteredWorks = useMemo(() => {
        if (!activeCategoryId || !allWorks || !decorationCategories) return [];
        
        const activeCategory = decorationCategories.find(c => c.id === activeCategoryId);
        if (!activeCategory) return [];

        return allWorks.filter(work => {
            // 1. Match by ID (Best)
            if (work.categoryId && work.categoryId === activeCategoryId) return true;
            
            // 2. Fallback: Match by Name (Loose check)
            const catNameEn = activeCategory.name.en.toLowerCase();
            const catNameAr = activeCategory.name.ar; // Arabic comparison usually strict
            
            const workCatEn = work.category.en.toLowerCase();
            const workCatAr = work.category.ar;

            return workCatEn === catNameEn || workCatAr === catNameAr;
        });
    }, [allWorks, activeCategoryId, decorationCategories]);

    const activeCategoryDescription = useMemo(() => {
        const cat = decorationCategories?.find(c => c.id === activeCategoryId);
        return cat ? cat.description[language] : '';
    }, [decorationCategories, activeCategoryId, language]);

    // --- Helper for Image URLs ---
    const getImageSrc = (src: string | undefined) => {
        if (!src) return 'https://via.placeholder.com/800x1000?text=No+Image';
        // If Base64, return as is
        if (src.startsWith('data:')) return src;
        // If URL already has query params, append with &, otherwise ?
        const separator = src.includes('?') ? '&' : '?';
        return `${src}${separator}fm=webp&q=80`;
    };

    // --- Actions ---

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
        const catName = decorationCategories?.find(c => c.id === activeCategoryId)?.name[language];
        const serviceTitle = `${t_custom_decor_modal.serviceTitle}: ${catName}`;
        navigate('/request-service', {
            state: {
                serviceTitle,
                partnerId: 'admin-user',
                categoryName: catName,
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

    // Viewer Navigation
    const handleNext = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setViewerIndex(prev => (prev === null || prev === filteredWorks.length - 1) ? 0 : prev + 1);
    }, [filteredWorks.length]);

    const handlePrev = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setViewerIndex(prev => (prev === null || prev === 0) ? filteredWorks.length - 1 : prev - 1);
    }, [filteredWorks.length]);

    const handleCloseViewer = () => setViewerIndex(null);

    // Keyboard support for viewer
    useEffect(() => {
        if (viewerIndex === null) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') language === 'ar' ? handlePrev() : handleNext(); // RTL logic logic handled in UI, keeping logical direction
            if (e.key === 'ArrowLeft') language === 'ar' ? handleNext() : handlePrev();
            if (e.key === 'Escape') handleCloseViewer();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [viewerIndex, handleNext, handlePrev, language]);
    
    const currentViewerItem = viewerIndex !== null ? filteredWorks[viewerIndex] : null;

    return (
        <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
            <SEO 
                title={`${t.nav.decorations} | ONLY HELIO`}
                description={content.heroSubtitle}
            />
            
            {/* Share Modal */}
            {shareModalOpen && (
                <div className="fixed inset-0 bg-black/70 z-[60] flex justify-center items-center p-4 animate-fadeIn" onClick={() => setShareModalOpen(false)}>
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

            {/* Custom Lightbox / Viewer */}
            {currentViewerItem && (
                <div className="fixed inset-0 bg-black/95 z-[70] flex items-center justify-center animate-fadeIn" onClick={handleCloseViewer}>
                    
                    {/* Close Button */}
                    <button onClick={handleCloseViewer} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors">
                        <CloseIcon className="w-8 h-8" />
                    </button>

                    {/* Navigation Buttons */}
                    {filteredWorks.length > 1 && (
                        <>
                            <button onClick={handlePrev} className={`absolute top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors z-50 ${language === 'ar' ? 'right-4' : 'left-4'}`}>
                                <ChevronLeftIcon className="w-8 h-8" />
                            </button>
                            <button onClick={handleNext} className={`absolute top-1/2 -translate-y-1/2 p-3 bg-black/50 text-white rounded-full hover:bg-white/20 transition-colors z-50 ${language === 'ar' ? 'left-4' : 'right-4'}`}>
                                <ChevronRightIcon className="w-8 h-8" />
                            </button>
                        </>
                    )}

                    <div className="relative w-full h-full max-w-7xl mx-auto flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                        
                        {/* Image Container */}
                        <div className="flex-grow h-[60vh] md:h-full flex items-center justify-center relative bg-black/40 p-4">
                             {/* Transparent Overlay for Protection */}
                             <div className="absolute inset-0 z-20" onContextMenu={(e) => e.preventDefault()} />
                             
                             <img 
                                src={currentViewerItem.imageUrl} 
                                alt={currentViewerItem.alt} 
                                className="max-h-full max-w-full object-contain shadow-2xl rounded-sm disable-image-interaction" 
                                onContextMenu={(e) => e.preventDefault()}
                                draggable={false}
                            />
                        </div>

                        {/* Details Panel (Side on Desktop, Bottom on Mobile) */}
                        <div className="w-full md:w-96 bg-white dark:bg-gray-800 p-6 flex flex-col justify-center border-l border-gray-200 dark:border-gray-700 shadow-xl overflow-y-auto">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {currentViewerItem.title[language]}
                            </h2>
                            <p className="text-amber-500 font-semibold mb-6">{currentViewerItem.category[language]}</p>
                            
                            <div className="space-y-4 mb-8 text-sm text-gray-600 dark:text-gray-300">
                                {currentViewerItem.dimensions && (
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <span>{t_decor_page.dimensions}</span>
                                        <span className="font-bold">{currentViewerItem.dimensions}</span>
                                    </div>
                                )}
                                {currentViewerItem.price && (
                                    <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                        <span>{language === 'ar' ? 'السعر' : 'Price'}</span>
                                        <span className="font-bold">{currentViewerItem.price.toLocaleString()} EGP</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                                     <span>{t_decor_page.availability}</span>
                                     <span className={`px-2 py-0.5 rounded text-xs font-bold ${currentViewerItem.availability === 'In Stock' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {currentViewerItem.availability === 'In Stock' ? t_decor_page.inStock : t_decor_page.madeToOrder}
                                     </span>
                                </div>
                            </div>
                            
                            <div className="mt-auto space-y-3">
                                <Button 
                                    onClick={() => openRequestPage(currentViewerItem)}
                                    className="w-full py-4 text-lg shadow-lg"
                                >
                                    {currentViewerItem.availability === 'In Stock' && currentViewerItem.price ? (
                                        <span className="flex items-center gap-2"><ShoppingCartIcon className="w-5 h-5"/> {language === 'ar' ? 'شراء الآن' : 'Buy Now'}</span>
                                    ) : t_decor_page.inquireNow}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={handleCloseViewer}
                                    className="w-full"
                                >
                                    {t.adminShared.close}
                                </Button>
                            </div>
                            
                            <div className="mt-6 text-center text-xs text-gray-400">
                                {viewerIndex !== null ? viewerIndex + 1 : 0} / {filteredWorks.length}
                            </div>
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
                    
                    {/* Category Tabs */}
                    <div className="flex justify-center mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        <div className="flex flex-nowrap -mb-px space-x-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                            {(decorationCategories || []).map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategoryId(cat.id)}
                                    className={`px-6 py-3 font-semibold text-lg md:text-xl border-b-4 transition-colors duration-200 whitespace-nowrap ${
                                        activeCategoryId === cat.id
                                        ? 'border-amber-500 text-amber-500'
                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-amber-500 hover:border-amber-500/50'
                                    }`}
                                >
                                    {cat.name[language]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-center max-w-4xl mx-auto mb-12 animate-fadeIn">
                         <p className="text-lg text-gray-600 dark:text-gray-400">
                            {activeCategoryDescription}
                        </p>
                        <button
                            onClick={openCustomRequestPage}
                            className="mt-6 bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 shadow-md shadow-amber-500/20"
                        >
                            {t_decor_page.requestCustomDesign}
                        </button>
                    </div>

                    <BannerDisplay location="decorations" />
                   
                   {/* Portfolio Grid */}
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 animate-fadeIn mt-12">
                       {isLoading ? (
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
                               <div 
                                    key={`${work.id}-${index}`} 
                                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-300 cursor-pointer"
                                    onClick={() => setViewerIndex(index)}
                                >
                                   <div className="relative">
                                       <div className="aspect-[4/5] bg-gray-100 dark:bg-gray-700 relative watermarked">
                                           {/* Protection Overlay */}
                                           <div className="absolute inset-0 z-10" onContextMenu={(e) => e.preventDefault()}></div>
                                           
                                           <img 
                                                src={getImageSrc(work.imageUrl)}
                                                alt={work.alt} 
                                                className="w-full h-full object-cover disable-image-interaction" 
                                                loading="lazy" 
                                                onContextMenu={(e) => e.preventDefault()}
                                            />
                                           
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 pointer-events-none">
                                                <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                                    {language === 'ar' ? 'عرض التفاصيل' : 'View Details'}
                                                </span>
                                            </div>
                                       </div>
                                       {work.availability && (
                                           <span className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} text-xs font-bold px-2 py-1 rounded-full text-white z-20 ${work.availability === 'In Stock' ? 'bg-green-600' : 'bg-sky-600'}`}>
                                               {work.availability === 'In Stock' ? t_decor_page.inStock : t_decor_page.madeToOrder}
                                           </span>
                                       )}
                                       <button 
                                            onClick={handleFavoriteClick} 
                                            className="absolute top-3 left-3 p-2 rounded-full bg-black/50 hover:bg-black/75 transition-colors z-30" 
                                            aria-label={isFav ? t.favoritesPage.removeFromFavorites : t.favoritesPage.addToFavorites}
                                        >
                                            {isFav ? <HeartIconSolid className="w-5 h-5 text-red-500" /> : <HeartIcon className="w-5 h-5 text-white" />}
                                        </button>
                                   </div>
                                   <div className="p-4 flex flex-col flex-grow relative z-20 bg-white dark:bg-gray-800">
                                       <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate mb-2">{work.title[language]}</h3>
                                       <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4 flex-wrap gap-2">
                                           {work.price != null && <span className="font-semibold text-amber-500 text-base">{new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: 'EGP', minimumFractionDigits: 0 }).format(work.price)}</span>}
                                           {work.dimensions && <span className="text-xs">{t_decor_page.dimensions}: {work.dimensions}</span>}
                                       </div>
                                       <button 
                                           onClick={(e) => { e.stopPropagation(); openRequestPage(work); }}
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
