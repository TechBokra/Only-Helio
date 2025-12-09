
import React from 'react';
import { Request, RequestType } from '../../../types';
import DetailItem from '../../shared/DetailItem';
import { useLanguage } from '../../shared/LanguageContext';
import { 
    BedIcon, BathIcon, AreaIcon, LocationMarkerIcon, 
    BanknotesIcon, CheckCircleIcon, PhotoIcon,
    BuildingIcon, WrenchScrewdriverIcon, CalendarIcon,
    CompoundIcon, FloorIcon
} from '../../ui/Icons';
import { Card, CardContent } from '../../ui/Card';

interface RequestPayloadViewerProps {
    request: Request;
}

const RequestPayloadViewer: React.FC<RequestPayloadViewerProps> = ({ request }) => {
    // 1. CRITICAL FIX: Hooks must be at the very top, before any returns or conditionals
    const { language, t } = useLanguage();
    
    if (!request) {
        return <div className="p-4 text-red-500 bg-red-50 rounded">Error: Request data is missing.</div>;
    }

    const { payload, type } = request;

    // Helper to safely get value from potential multilingual object or string
    const getVal = (val: any): string => {
        if (val === null || val === undefined) return 'N/A';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
            return val[language] || val['en'] || val['ar'] || 'N/A';
        }
        return String(val);
    };

    // --- PROPERTY LISTING REQUEST VIEW ---
    if (type === RequestType.PROPERTY_LISTING_REQUEST) {
        const r = payload as any;
        // Defensive check for payload
        if (!r) return <div className="p-4 text-red-500">No payload data available.</div>;

        const pd = r.propertyDetails || {};
        
        if (!pd || Object.keys(pd).length === 0) return <div className="text-red-500 p-4 bg-red-50 rounded-lg border border-red-200">Error: Property details missing in request payload.</div>;
        
        const mainImage = r.images && r.images.length > 0 ? r.images[0] : null;
        const otherImages = r.images && r.images.length > 1 ? r.images.slice(1) : [];
        
        // Cooperation Logic Visuals
        const isCommission = r.cooperationType === 'commission';
        const paymentStatus = r.paymentStatus || 'pending';
        
        // Dynamic Styling based on Cooperation Type
        const coopStyles = isCommission 
            ? { 
                bg: 'bg-purple-50 dark:bg-purple-900/20', 
                border: 'border-purple-200 dark:border-purple-800', 
                text: 'text-purple-900 dark:text-purple-100',
                iconColor: 'text-purple-600 dark:text-purple-400',
                badge: 'bg-purple-200 text-purple-800 dark:bg-purple-800 dark:text-purple-200'
              } 
            : { 
                bg: 'bg-blue-50 dark:bg-blue-900/20', 
                border: 'border-blue-200 dark:border-blue-800', 
                text: 'text-blue-900 dark:text-blue-100',
                iconColor: 'text-blue-600 dark:text-blue-400',
                badge: 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
              };

        const coopIcon = isCommission ? <BanknotesIcon className={`w-8 h-8 ${coopStyles.iconColor}`} /> : <CheckCircleIcon className={`w-8 h-8 ${coopStyles.iconColor}`} />;
        const coopTitle = isCommission ? (language === 'ar' ? 'نظام العمولة (Commission)' : 'Commission Model') : (language === 'ar' ? 'إعلان مدفوع (Paid Listing)' : 'Paid Listing Model');
        const coopDesc = isCommission 
            ? (language === 'ar' ? 'وافق الشريك على دفع عمولة عند إتمام البيع أو الإيجار.' : 'Partner agrees to pay commission upon successful deal.')
            : (language === 'ar' ? 'تم اختيار باقة الدفع المقدم للإعلان.' : 'Pre-paid listing package selected.');

        return (
            <div className="space-y-8 animate-fadeIn">
                
                {/* 1. FINANCIAL ARRANGEMENT HEADER (Highlighted) */}
                <div className={`p-6 rounded-xl border-2 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${coopStyles.bg} ${coopStyles.border} ${coopStyles.text}`}>
                    <div className="flex items-start gap-4 z-10">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">{coopIcon}</div>
                        <div>
                            <h3 className="text-xl font-bold mb-1">{coopTitle}</h3>
                            <p className="text-sm opacity-90 max-w-xl">{coopDesc}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end z-10 gap-2">
                        <span className="text-xs font-bold uppercase opacity-70">Cooperation Type</span>
                        <span className={`font-mono font-bold text-sm uppercase tracking-wider px-3 py-1 rounded-full ${coopStyles.badge}`}>
                            {r.cooperationType}
                        </span>
                        {!isCommission && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                paymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'
                            }`}>
                                {language === 'ar' ? 'حالة الدفع:' : 'Payment:'} {paymentStatus}
                            </span>
                        )}
                    </div>
                </div>

                {/* 2. PROPERTY VISUAL PREVIEW (Matches Public Site Style) */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg group">
                    {/* Cover Image */}
                    <div className="relative h-80 w-full bg-gray-200 dark:bg-gray-800 group">
                        {mainImage ? (
                            <a href={mainImage} target="_blank" rel="noreferrer" className="block w-full h-full">
                                <img 
                                    src={mainImage} 
                                    alt="Property Cover" 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                            </a>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100 dark:bg-gray-800">
                                <PhotoIcon className="w-16 h-16 opacity-50 mb-2" />
                                <span className="text-sm">No Images</span>
                            </div>
                        )}
                        
                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                             <span className={`px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg text-white backdrop-blur-md ${
                                getVal(pd.purpose) === 'For Sale' || getVal(pd.purpose) === 'للبيع' ? 'bg-green-600/90' : 'bg-sky-600/90'
                            }`}>
                                {getVal(pd.purpose)}
                            </span>
                        </div>

                        {/* Bottom Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                             <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-bold backdrop-blur-sm border border-white/30">
                                            {getVal(pd.propertyType)}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold mb-2 drop-shadow-md leading-tight max-w-2xl">
                                        {getVal(pd.title)}
                                    </h3>
                                    <div className="flex items-center gap-2 text-gray-200 text-sm font-medium">
                                        <LocationMarkerIcon className="w-4 h-4 text-amber-400" />
                                        {getVal(pd.address)}
                                    </div>
                                </div>
                                <div className="text-right">
                                     <p className="text-3xl font-bold text-amber-400 drop-shadow-md bg-black/40 px-4 py-2 rounded-lg backdrop-blur-md border border-amber-500/30">
                                        {pd.price ? Number(pd.price).toLocaleString() : 0} <span className="text-lg text-amber-200">EGP</span>
                                     </p>
                                </div>
                             </div>
                        </div>
                    </div>

                    {/* Key Specs Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 dark:divide-gray-800 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Area</span>
                            <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-white text-lg">
                                <AreaIcon className="w-5 h-5 text-amber-500" />
                                {pd.area || 0} <span className="text-xs font-normal text-gray-500">m²</span>
                            </div>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Bedrooms</span>
                            <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-white text-lg">
                                <BedIcon className="w-5 h-5 text-amber-500" />
                                {pd.bedrooms || 0}
                            </div>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Bathrooms</span>
                            <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-white text-lg">
                                <BathIcon className="w-5 h-5 text-amber-500" />
                                {pd.bathrooms || 0}
                            </div>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center gap-1">
                            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Finishing</span>
                            <div className="flex items-center gap-1.5 font-bold text-gray-800 dark:text-white text-lg">
                                <WrenchScrewdriverIcon className="w-5 h-5 text-amber-500" />
                                <span className="text-sm">{getVal(pd.finishingStatus)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Secondary Specs Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                                <div className="text-gray-400"><CalendarIcon className="w-5 h-5"/></div>
                                <div>
                                    <span className="text-xs text-gray-500 block uppercase">Delivery Date</span>
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                        {pd.deliveryType === 'immediate' ? (language === 'ar' ? 'فوري' : 'Immediate') : `${pd.deliveryMonth}/${pd.deliveryYear}`}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                                <div className="text-gray-400"><CompoundIcon className="w-5 h-5"/></div>
                                <div>
                                    <span className="text-xs text-gray-500 block uppercase">In Compound</span>
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                        {pd.isInCompound ? (language === 'ar' ? 'نعم' : 'Yes') : (language === 'ar' ? 'لا' : 'No')}
                                    </span>
                                </div>
                            </div>
                             <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex items-center gap-3 border border-gray-100 dark:border-gray-700">
                                <div className="text-gray-400"><FloorIcon className="w-5 h-5"/></div>
                                <div>
                                    <span className="text-xs text-gray-500 block uppercase">Floor</span>
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{pd.floor || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Description</h4>
                            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                {getVal(pd.description)}
                            </div>
                        </div>

                        {/* Gallery */}
                        {otherImages.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-gray-800 pb-2">Gallery</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {otherImages.map((img: string, idx: number) => (
                                        <a 
                                            key={idx} 
                                            href={img} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="block aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-amber-500 transition-all shadow-sm group/img relative"
                                        >
                                            <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- FALLBACK FOR OTHER TYPES (Simplified) ---
    if (type === RequestType.PARTNER_APPLICATION) {
        const p = payload as any;
        if (!p) return <div className="p-4">No payload.</div>;
        return (
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailItem label="Company" value={p.companyName} className="font-bold text-lg" />
                        <DetailItem label="Type" value={p.companyType} className="capitalize" />
                        <DetailItem label="Address" value={p.companyAddress} />
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{p.description}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Generic View for other types
    const l = payload as any;
    if (!l) return <div className="p-4">No payload.</div>;

    return (
        <Card>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {l.customerName && <DetailItem label="Name" value={l.customerName} />}
                    {l.phone && <DetailItem label="Phone" value={l.phone} />}
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                        {l.message || l.details || l.customerNotes || 'No content provided.'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default RequestPayloadViewer;
