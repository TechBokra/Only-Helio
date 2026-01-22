
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BedIcon, BathIcon, AreaIcon, HeartIcon, HeartIconSolid, FloorIcon, CompoundIcon, WalletIcon, BanknotesIcon } from '../ui/Icons';
import type { Property } from '../../types';
import { useFavorites } from '../shared/FavoritesContext';
import { isCommercial } from '../../utils/propertyUtils';
import { useToast } from '../shared/ToastContext';
import { useLanguage } from '../shared/LanguageContext';
import { Card, CardContent } from '../ui/Card';

type PropertyCardProps = Property;

const PropertyCard: React.FC<PropertyCardProps> = React.memo((props) => {
  const { language, t } = useLanguage();
  const {
    id,
    imageUrl,
    status,
    price,
    priceNumeric,
    pricePerMeter,
    title,
    beds,
    baths,
    area,
    floor,
    type,
    finishingStatus,
    isInCompound,
    partnerId,
    partnerName,
    installmentsAvailable,
    realEstateFinanceAvailable,
    projectId,
    projectName,
  } = props;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const isForSale = status.en === 'For Sale';
  const isFav = isFavorite(id, 'property');
  const isCommercialProp = isCommercial(props);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id, 'property');
    if (!isFav) {
        showToast(t.favoritesPage.addedToFavorites, 'success');
    } else {
        showToast(t.favoritesPage.removedFromFavorites, 'success');
    }
  };

  const displayPricePerMeter = useMemo(() => {
      if (pricePerMeter?.[language]) {
          return pricePerMeter[language];
      }
      if (status?.en === 'For Sale' && priceNumeric && area && area > 0) {
          const perMeter = Math.round(priceNumeric / area);
          if (language === 'ar') {
              return `${perMeter.toLocaleString('ar-EG')} ج.م/م²`;
          }
          return `EGP ${perMeter.toLocaleString('en-US')}/m²`;
      }
      return null;
  }, [pricePerMeter, status, priceNumeric, area, language]);

  // Robust helper to handle Base64 vs URL images
  const getImageSrc = (src: string, params: string = '') => {
      if (!src) return 'https://via.placeholder.com/800x600?text=No+Image';
      if (src.startsWith('data:')) return src; // Return Base64 as is
      return `${src}${params}`; // Append params for remote URLs
  };

  const displayImage = getImageSrc(imageUrl, '');
  const displayImageSmall = getImageSrc(imageUrl, '&fm=webp&w=480');
  const displayImageMedium = getImageSrc(imageUrl, '&fm=webp&w=800');
  const displayImageLarge = getImageSrc(imageUrl, '&fm=webp&w=1200');

  // Helper for feature badges
  const FeatureBadge = ({ icon: Icon, label }: { icon: any, label: string }) => (
      <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 px-2 py-1 rounded text-[10px] font-medium border border-gray-200 dark:border-gray-600">
          <Icon className="w-3 h-3 text-amber-500" />
          {label}
      </span>
  );

  return (
    <Card className="relative transform hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md">
        {/* Main Stretched Link for the entire card click */}
        <Link 
            to={`/properties/${id}`} 
            className="absolute inset-0 z-0 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg"
            aria-label={`${title[language]} - ${t.propertyCard.viewProject}`}
        >
            <span className="sr-only">View details</span>
        </Link>

        <div className="relative watermarked z-0 bg-gray-200 aspect-[4/3]">
            <Link to={`/properties/${id}`} className="block w-full h-full" tabIndex={-1} aria-hidden="true">
                 <img 
                    src={displayImage}
                    alt={title[language]} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                />
            </Link>
           
          {/* Status Badge: Top Start */}
          <span 
            className={`absolute top-3 ${language === 'ar' ? 'right-3' : 'left-3'} z-10 text-white font-bold px-2.5 py-1 rounded text-xs shadow-sm ${isForSale ? 'bg-green-600' : 'bg-sky-600'}`} 
          >
            {status[language]}
          </span>

          {/* Favorite Button: Top End */}
          <div className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'} z-20`}>
            <button
              onClick={handleFavoriteClick}
              className="p-2 rounded-full bg-white/90 hover:bg-white text-gray-500 hover:text-red-500 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label={isFav ? t.favoritesPage.removeFromFavorites : t.favoritesPage.addToFavorites}
            >
              {isFav ? (
                <HeartIconSolid className="w-4 h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <CardContent className="p-4 flex flex-col flex-grow relative z-10 pointer-events-none bg-white dark:bg-gray-800">
          {/* Price & Rate */}
          <div className="mb-2">
              <p className="text-xl font-bold text-amber-600 dark:text-amber-500">{price[language]}</p>
              {displayPricePerMeter && (
                <p className="text-xs text-gray-400">{displayPricePerMeter}</p>
              )}
          </div>
          
          {/* Title */}
          <h3 className="text-base font-bold text-gray-900 dark:text-white truncate mb-2 group-hover:text-amber-600 transition-colors">{title[language]}</h3>
          
          {/* Feature Badges (Previously floating icons) */}
          <div className="flex flex-wrap gap-2 mb-3">
              {finishingStatus && <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800">{finishingStatus[language]}</span>}
              {isInCompound && <FeatureBadge icon={CompoundIcon} label={t.propertiesPage.inCompound} />}
              {installmentsAvailable && isForSale && <FeatureBadge icon={WalletIcon} label={t.propertiesPage.installments} />}
              {realEstateFinanceAvailable && isForSale && <FeatureBadge icon={BanknotesIcon} label={t.propertiesPage.realEstateFinance} />}
          </div>
          
          {/* Partner / Project Link */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex-grow">
            {partnerName && partnerId !== 'individual-listings' ? (
                <p className="pointer-events-auto truncate">
                    {t.propertyCard.by}{' '}
                    <Link to={`/partners/${partnerId}`} className="font-semibold text-gray-700 dark:text-gray-300 hover:text-amber-500 hover:underline relative z-20">
                        {partnerName}
                    </Link>
                </p>
            ) : partnerName ? (
                 <p className="truncate">{t.propertyCard.by} {partnerName}</p>
            ) : null}

            {projectName && projectId && (
                <p className="pointer-events-auto mt-0.5 truncate">
                    <Link to={`/projects/${projectId}`} className="text-amber-600 dark:text-amber-500 hover:underline text-[10px] relative z-20 font-medium">
                         {projectName[language]}
                    </Link>
                </p>
            )}
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100 dark:border-gray-700">
            {!isCommercialProp ? (
                <>
                    <div className="flex items-center gap-1.5" title={t.propertyCard.beds}>
                        <BedIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{beds}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title={t.propertyCard.baths}>
                        <BathIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{baths}</span>
                    </div>
                </>
            ) : (
                 // Placeholder for alignment in commercial cards
                 <div className="flex-grow"></div>
            )}
            
            <div className="flex items-center gap-1.5" title={t.propertyCard.area}>
                <AreaIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{area} <span className="text-xs font-normal text-gray-500">{t.propertyCard.area}</span></span>
            </div>

            {floor !== undefined && (type.en === 'Apartment' || type.en === 'Commercial') && (
                 <div className="flex items-center gap-1.5" title={t.propertyCard.floor}>
                    <FloorIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{floor}</span>
                </div>
            )}
          </div>
        </CardContent>
    </Card>
  );
});

export default PropertyCard;
