
import React from 'react';
import { Link } from 'react-router-dom';
import { BedIcon, BathIcon, AreaIcon, LocationMarkerIcon, CompoundIcon, WalletIcon, BanknotesIcon } from '../ui/Icons';
import type { Property } from '../../types';
import { isCommercial } from '../../utils/propertyUtils';
import { useLanguage } from '../shared/LanguageContext';

const StatItem: React.FC<{ icon: React.ReactNode; value: string | number; label?: string }> = ({ icon, value, label }) => (
    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300" title={label}>
        <div className="text-gray-400 dark:text-gray-500">{icon}</div>
        <span className="font-bold text-sm">{value}</span>
        {label && <span className="text-xs text-gray-500 hidden sm:inline">{label}</span>}
    </div>
);

const PropertyListItem: React.FC<Property> = (props) => {
    const { language, t } = useLanguage();
    const t_card = t.propertyCard;
    const { 
        id, imageUrl, imageUrl_small, imageUrl_medium, status, price, title, address, beds, baths, area, 
        partnerId, partnerName, partnerImageUrl, type, isInCompound, installmentsAvailable, realEstateFinanceAvailable 
    } = props;
    
    const isForSale = status.en === 'For Sale';
    const isCommercialProp = isCommercial(props);

    // Robust helper to handle Base64 vs URL images
    const getImageSrc = (src: string | undefined, params: string = '') => {
        if (!src) return 'https://via.placeholder.com/800x600?text=No+Image';
        if (src.startsWith('data:')) return src; // Return Base64 as is
        return `${src}${params}`; // Append params for remote URLs
    };

    const mainImageSrc = getImageSrc(imageUrl_medium || imageUrl, '');
    const srcSet = imageUrl && !imageUrl.startsWith('data:') ? 
        `${getImageSrc(imageUrl_small || imageUrl, '&fm=webp&w=480')} 480w, ${getImageSrc(imageUrl_medium || imageUrl, '&fm=webp&w=800')} 800w` 
        : undefined;

    return (
        <Link to={`/properties/${id}`} className="block group">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row overflow-hidden h-full">
                
                {/* Image Section */}
                <div className="relative w-full sm:w-48 md:w-64 h-48 sm:h-auto flex-shrink-0 bg-gray-100">
                    {srcSet ? (
                         <img 
                            src={mainImageSrc}
                            srcSet={srcSet}
                            sizes="(max-width: 640px) 100vw, 300px"
                            alt={title[language]} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            loading="lazy"
                        />
                    ) : (
                         <img 
                            src={mainImageSrc}
                            alt={title[language]} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            loading="lazy"
                        />
                    )}
                   
                    <span 
                        className={`absolute top-3 ${language === 'ar' ? 'right-3' : 'left-3'} text-white font-bold px-2 py-1 rounded text-[10px] shadow-sm z-10 ${isForSale ? 'bg-green-600' : 'bg-sky-600'}`}
                    >
                        {status[language]}
                    </span>
                </div>
                
                {/* Content Section */}
                <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/50">{type[language]}</span>
                                {isInCompound && <span className="text-[10px] text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded flex items-center gap-1"><CompoundIcon className="w-3 h-3" /> {t.propertiesPage.inCompound}</span>}
                            </div>
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-500 whitespace-nowrap">{price[language]}</p>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-amber-600 transition-colors mb-2">
                            {title[language]}
                        </h3>
                        
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <LocationMarkerIcon className="w-4 h-4 flex-shrink-0" />
                            <p className="line-clamp-1">{address[language]}</p>
                        </div>

                         <div className="flex flex-wrap gap-2 mb-4">
                            {installmentsAvailable && isForSale && (
                                <span className="text-[10px] flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                    <WalletIcon className="w-3 h-3"/> {t.propertiesPage.installments}
                                </span>
                            )}
                             {realEstateFinanceAvailable && isForSale && (
                                <span className="text-[10px] flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                    <BanknotesIcon className="w-3 h-3"/> {t.propertiesPage.realEstateFinance}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-6">
                            {!isCommercialProp && (
                                <>
                                    <StatItem icon={<BedIcon className="w-4 h-4" />} value={beds} label={t_card.beds} />
                                    <StatItem icon={<BathIcon className="w-4 h-4" />} value={baths} label={t_card.baths} />
                                </>
                            )}
                            <StatItem icon={<AreaIcon className="w-4 h-4" />} value={area} label={t_card.area} />
                        </div>
                        
                        {partnerName && (
                            <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
                                {partnerImageUrl ? <img src={partnerImageUrl} alt={partnerName} className="w-6 h-6 rounded-full object-cover" /> : null}
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden md:inline truncate max-w-[120px]">{partnerName}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default PropertyListItem;
