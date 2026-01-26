
import React, { useState, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
    BedIcon, BathIcon, AreaIcon, CheckBadgeIcon, ShareIcon, HeartIcon, HeartIconSolid, 
    FloorIcon, CalendarIcon, WalletIcon, BuildingIcon, WrenchScrewdriverIcon, CompoundIcon, BanknotesIcon, 
    WhatsAppIcon, PhoneIcon, LocationMarkerIcon, SwimmingPoolIcon, ParkIcon, ShieldCheckIcon, ElevatorIcon,
    ArrowLeftIcon, ArrowRightIcon
} from '../ui/Icons';
import type { Language, Property } from '../../types';
import { useFavorites } from '../shared/FavoritesContext';
import Lightbox from '../shared/Lightbox';
import BannerDisplay from '../shared/BannerDisplay';
import { getPropertyById, getAllProperties } from '../../services/properties';
import DetailItem from '../shared/DetailItem';
import ContactOptionsModal from '../shared/ContactOptionsModal';
import { useToast } from '../shared/ToastContext';
import SEO from '../shared/SEO';
import DetailSection from '../shared/DetailSection';
import PropertyDetailsSkeleton from '../shared/PropertyDetailsSkeleton';
import { getPartnerById } from '../../services/partners';
import { useLanguage } from '../shared/LanguageContext';
import { isCommercial } from '../../utils/propertyUtils';
import { Button } from '../ui/Button';
import StackedImageGallery from './StackedImageGallery';
import UnifiedMap from '../shared/UnifiedMap';
import MortgageCalculator from './MortgageCalculator';
import PropertyCard from './PropertyCard';
import { useSiteContent } from '../../hooks/useSiteContent';

const PropertyDetailsPage: React.FC = () => {
    const { propertyId } = useParams<{ propertyId: string }>();
    const { language, t } = useLanguage();
    const t_page = t.propertyDetailsPage;
    const { isFavorite, toggleFavorite } = useFavorites();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { data: siteContent } = useSiteContent();

    const fetchProperty = useCallback(() => getPropertyById(propertyId!), [propertyId]);
    const { data: property, isLoading: isLoadingProp } = useQuery({ queryKey: [`property-${propertyId}`], queryFn: fetchProperty, enabled: !!propertyId });
    
    // Fetch similar properties for the recommendation engine
    const { data: allProperties } = useQuery({ queryKey: ['allProperties'], queryFn: getAllProperties });

    const { data: partner, isLoading: isLoadingPartner } = useQuery({
        queryKey: [`partner-${property?.partnerId}`],
        queryFn: () => getPartnerById(property!.partnerId),
        enabled: !!property?.partnerId,
    });
    
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxStartIndex, setLightboxStartIndex] = useState(0);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [shareModalState, setShareModalState] = useState({ isOpen: false });
    
    const isLoading = isLoadingProp || isLoadingPartner;
    const isFav = propertyId ? isFavorite(propertyId, 'property') : false;

    const handleFavoriteClick = useCallback(() => {
        if(!propertyId) return;
        toggleFavorite(propertyId, 'property');
        showToast(isFav ? t.favoritesPage.removedFromFavorites : t.favoritesPage.addedToFavorites, 'success');
    }, [propertyId, isFav, toggleFavorite, showToast, t.favoritesPage]);

    const handleShare = useCallback(() => {
        setShareModalState({ isOpen: true });
    }, []);
    
    const handleCloseShareModal = () => {
        setShareModalState({ isOpen: false });
    };

    const handleContact = useCallback(() => {
        if (!partner?.contactMethods) {
            navigate('/request-service', { 
                state: {
                    partnerId: property?.partnerId, 
                    serviceTitle: `${t_page.inquiryAbout} "${property?.title[language]}"`,
                    propertyId: property?.id
                } 
            });
            return;
        }
        const { whatsapp, phone, form } = partner.contactMethods;
        const hasEnabledMethod = (whatsapp.enabled && whatsapp.number) || (phone.enabled && phone.number) || form.enabled;
        if (!hasEnabledMethod) {
            navigate('/request-service', { 
                state: {
                    partnerId: property?.partnerId, 
                    serviceTitle: `${t_page.inquiryAbout} "${property?.title[language]}"`,
                    propertyId: property?.id
                } 
            });
        } else {
            setContactModalOpen(true);
        }
    }, [partner, property, language, t_page.inquiryAbout, navigate]);

    const handleImageClick = (index: number) => {
        setLightboxStartIndex(index);
        setLightboxOpen(true);
    };

    // Calculate Similar Properties
    const similarProperties = useMemo(() => {
        if (!property || !allProperties) return [];
        return allProperties.filter(p => 
            p.id !== property.id && 
            p.type.en === property.type.en &&
            p.status.en === property.status.en
        ).slice(0, 3);
    }, [property, allProperties]);

    // Helper to get specific icon for amenities
    const getAmenityIcon = (key: string) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('pool') || lowerKey.includes('سباحة')) return SwimmingPoolIcon;
        if (lowerKey.includes('garden') || lowerKey.includes('park') || lowerKey.includes('حديقة')) return ParkIcon;
        if (lowerKey.includes('security') || lowerKey.includes('أمن')) return ShieldCheckIcon;
        if (lowerKey.includes('elevator') || lowerKey.includes('مصعد')) return ElevatorIcon;
        if (lowerKey.includes('garage') || lowerKey.includes('parking') || lowerKey.includes('سيارات')) return CompoundIcon; // Fallback to Compound/Garage like icon
        return CheckBadgeIcon;
    }

    const BackIcon = language === 'ar' ? ArrowRightIcon : ArrowLeftIcon;

    if (isLoading) {
        return <PropertyDetailsSkeleton />;
    }

    if (!property) {
        return (
            <div className="text-center py-20 container mx-auto">
                <SEO title={t_page.notFoundTitle} description={t_page.notFoundText} />
                <h1 className="text-4xl font-bold">{t_page.notFoundTitle}</h1>
                <p className="mt-4 text-gray-500">{t_page.notFoundText}</p>
                <Link to="/properties" className="mt-8 inline-block bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg">{t_page.backButton}</Link>
            </div>
        );
    }
    
    const pageTitle = `${property.title[language]} | ONLY HELIO`;
    const pageDescription = property.description[language].substring(0, 160);
    
    const amenityKeys = property.amenities.en || [];
    const allImages = [property.imageUrl, ...property.gallery].filter(Boolean);

    const handleWhatsAppShare = () => {
        const urlToShare = window.location.href;
        const text = encodeURIComponent(`${property.title[language]}\n${urlToShare}`);
        window.open(`https://wa.me/?text=${text}`, '_blank');
        handleCloseShareModal();
    };

    const handleCopyLink = async () => {
        const urlToShare = window.location.href;
        try {
            await navigator.clipboard.writeText(urlToShare);
            showToast(t.sharing.linkCopied, 'success');
            handleCloseShareModal();
        } catch (err) {
            showToast(t.sharing.shareFailed, 'error');
        }
    };

    return (
      <>
        <SEO title={pageTitle} description={pageDescription} imageUrl={property.imageUrl} />
        {lightboxOpen && <Lightbox images={allImages} startIndex={lightboxStartIndex} onClose={() => setLightboxOpen(false)} />}
        
        {contactModalOpen && partner?.contactMethods && (
            <ContactOptionsModal
                isOpen={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                contactMethods={partner.contactMethods}
                onSelectForm={() => navigate('/request-service', { 
                    state: { 
                        partnerId: property.partnerId, 
                        serviceTitle: `${t_page.inquiryAbout} "${property.title[language]}"`,
                        propertyId: property.id
                    } 
                })}
            />
        )}
        
        {shareModalState.isOpen && (
            <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={handleCloseShareModal}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                        {t.sharing.shareProperty}
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

        <div className="py-12 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6">
                
                <Link to="/properties" className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors mb-6">
                    <BackIcon className="w-4 h-4" />
                    {t_page.backButton}
                </Link>

                <div className="lg:flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{property.title[language]}</h1>
                         <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
                            <LocationMarkerIcon className="w-4 h-4 text-amber-500" /> {property.address[language]}
                        </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-4 mt-4 lg:mt-0">
                         <button onClick={handleShare} className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label={t.sharing.shareProperty}>
                            <ShareIcon className="w-6 h-6"/>
                        </button>
                        <button onClick={handleFavoriteClick} className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" aria-label={isFav ? t.favoritesPage.removeFromFavorites : t.favoritesPage.addToFavorites}>
                            {isFav ? <HeartIconSolid className="w-6 h-6 text-red-500" /> : <HeartIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-2 space-y-8">
                        <StackedImageGallery
                            images={allImages}
                            onImageClick={handleImageClick}
                            alt={property.title[language]}
                        />
                       
                        <DetailSection title={t_page.description}>
                            <p className="whitespace-pre-line text-gray-600 dark:text-gray-300 leading-relaxed">{property.description[language]}</p>
                        </DetailSection>
                        
                        {/* Conditionally Render Map based on settings */}
                        {siteContent?.enableMaps && (
                            <DetailSection title={t_page.location}>
                                <div className="rounded-lg overflow-hidden h-[400px] border border-gray-200 dark:border-gray-700">
                                    <UnifiedMap 
                                        mode="read"
                                        markers={[{
                                            id: property.id,
                                            lat: property.location.lat,
                                            lng: property.location.lng,
                                            color: 'amber'
                                        }]}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    {language === 'ar' ? 'الإحداثيات:' : 'Coordinates:'} {property.location.lat.toFixed(4)}, {property.location.lng.toFixed(4)}
                                </p>
                            </DetailSection>
                        )}

                        {amenityKeys.length > 0 && (
                            <DetailSection title={t_page.amenities}>
                                <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {amenityKeys.map(amenityKey => {
                                        const Icon = getAmenityIcon(amenityKey);
                                        const label = t_page.amenitiesIncluded[amenityKey] || amenityKey;
                                        return (
                                            <li key={amenityKey} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <div className="p-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 flex-shrink-0">
                                                    <Icon className="w-5 h-5"/>
                                                </div>
                                                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                                    {label}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </DetailSection>
                        )}

                        {/* Similar Properties */}
                        {similarProperties.length > 0 && (
                            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t.similarProperties}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {similarProperties.map(prop => (
                                        <PropertyCard key={prop.id} {...prop} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <BannerDisplay location="details" />

                   </div>
                   <div className="lg:col-span-1">
                        <div className="sticky top-28 space-y-6">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                               <p className="text-3xl font-bold text-amber-500">{property.price[language]}</p>
                               <div className="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    {!isCommercial(property) && <>
                                        <div className="flex items-center gap-2"><BedIcon className="w-5 h-5 text-gray-400"/> {property.beds}</div>
                                        <div className="flex items-center gap-2"><BathIcon className="w-5 h-5 text-gray-400"/> {property.baths}</div>
                                    </>}
                                    <div className="flex items-center gap-2"><AreaIcon className="w-5 h-5 text-gray-400"/> {property.area} {t.propertyCard.area}</div>
                               </div>
                            </div>
                            
                             <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                                {partner ? (
                                    <div className="flex items-center gap-4">
                                        <img src={partner.imageUrl} alt={partner.name} className="w-14 h-14 rounded-full object-cover border border-gray-100"/>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-semibold">{t.propertyCard.by}</p>
                                            <p className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{partner.name}</p>
                                        </div>
                                    </div>
                                ) : <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>}
                                <button onClick={handleContact} className="w-full mt-6 bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
                                    {t_page.contactButton}
                                </button>
                             </div>

                             <DetailSection title={t_page.keyInfo}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <DetailItem label={t.propertiesPage.typeLabel} value={property.type[language]} icon={<BuildingIcon className="w-5 h-5 text-gray-400"/>} layout="grid" className="sm:col-span-2"/>
                                    
                                    <DetailItem label={t_page.area} value={`${property.area} ${t.propertyCard.area}`} icon={<AreaIcon className="w-5 h-5 text-gray-400"/>} layout="grid" className="sm:col-span-2" />

                                    {!isCommercial(property) && (
                                        <>
                                            <DetailItem label={t_page.bedrooms} value={property.beds} icon={<BedIcon className="w-5 h-5 text-gray-400"/>} layout="grid" className="sm:col-span-2" />
                                            <DetailItem label={t_page.bathrooms} value={property.baths} icon={<BathIcon className="w-5 h-5 text-gray-400"/>} layout="grid" className="sm:col-span-2" />
                                        </>
                                    )}

                                    {property.finishingStatus && <DetailItem label={t.propertiesPage.finishing} value={property.finishingStatus[language]} icon={<WrenchScrewdriverIcon className="w-5 h-5 text-gray-400"/>} layout="grid" className="sm:col-span-2"/>}
                                    {property.floor !== undefined && (property.type.en === 'Apartment' || property.type.en === 'Commercial') && <DetailItem label={t_page.floor} value={property.floor} icon={<FloorIcon className="w-5 h-5 text-gray-400"/>} layout="grid" className="sm:col-span-2"/>}
                                    {property.isInCompound && <DetailItem label={t_page.inCompound} value={t_page.yes} icon={<CompoundIcon className="w-5 h-5 text-gray-400"/>} layout="grid" className="sm:col-span-2"/>}
                                </div>
                             </DetailSection>

                             <DetailSection title={t_page.deliveryPayment}>
                                <DetailItem label={t_page.deliveryDate} value={property.delivery.isImmediate ? t_page.immediate : property.delivery.date} icon={<CalendarIcon className="w-5 h-5 text-gray-400"/>}/>
                                {property.installmentsAvailable && property.status.en === 'For Sale' && (
                                     <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                         <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                            <WalletIcon className="w-5 h-5 text-gray-400"/>
                                            {t_page.installmentsPlan}
                                         </h4>
                                         <div className="space-y-2 pl-7">
                                            <DetailItem label={t_page.downPayment} value={property.installments?.downPayment.toLocaleString(language)} className="text-sm" />
                                            <DetailItem label={t_page.monthlyInstallment} value={property.installments?.monthlyInstallment.toLocaleString(language)} className="text-sm" />
                                            <DetailItem label={t_page.years} value={property.installments?.years} className="text-sm" />
                                         </div>
                                     </div>
                                )}
                                {property.realEstateFinanceAvailable && property.status.en === 'For Sale' && <DetailItem label={t_page.realEstateFinanceAvailable} value={t_page.yes} icon={<BanknotesIcon className="w-5 h-5 text-gray-400"/>} />}
                             </DetailSection>
                             
                             {/* Mortgage Calculator */}
                             {property.status.en === 'For Sale' && (
                                 <MortgageCalculator propertyPrice={property.priceNumeric} />
                             )}

                             {property.projectId && property.projectName && (
                                <Link to={`/projects/${property.projectId}`} className="block group">
                                    <DetailSection title={t_page.partOfProject}>
                                        <p className="font-bold text-lg group-hover:text-amber-500 transition-colors">{property.projectName[language]}</p>
                                        <span className="text-amber-500 font-semibold hover:underline text-sm flex items-center gap-1 mt-1">
                                            {t_page.viewProject} <BackIcon className="w-3 h-3 rotate-180" />
                                        </span>
                                    </DetailSection>
                                </Link>
                             )}
                        </div>
                   </div>
                </div>
            </div>
        </div>
      </>
    );
};

export default PropertyDetailsPage;
