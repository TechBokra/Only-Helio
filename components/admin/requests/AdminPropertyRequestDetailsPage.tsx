
import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Property } from '../../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPropertyRequests, updatePropertyRequestStatus } from '../../../services/propertyRequests';
import { addProperty } from '../../../services/properties';
import { ArrowLeftIcon, ArrowPathIcon } from '../../ui/Icons';
import DetailItem from '../../shared/DetailItem';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import UnifiedMap from '../../shared/UnifiedMap';
import { Button } from '../../ui/Button';
import { supabase } from '../../../supabaseClient';

const AdminPropertyRequestDetailsPage: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    const { data: requests, isLoading } = useQuery({ queryKey: ['propertyRequests'], queryFn: getAllPropertyRequests });
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    const request = useMemo(() => requests?.find(r => r.id === requestId), [requests, requestId]);

    const addPropertyMutation = useMutation({
        mutationFn: (propertyData: Omit<Property, 'id'>) => addProperty(propertyData),
    });

    const updateRequestMutation = useMutation({
        mutationFn: (status: 'approved' | 'rejected' | 'pending') => updatePropertyRequestStatus(request!.id, status as any),
        onSuccess: async (data, status) => {
            if (status === 'approved' && request) {
                const pd = request.propertyDetails || {};

                // Basic validation before approval
                if (!pd.title || !pd.price) {
                    showToast('Cannot approve: Missing basic property details (Price/Title).', 'error');
                    return;
                }

                const priceNumeric = Number(pd.price) || 0;
                const area = Number(pd.area) || 0;
                const pricePerMeter = area > 0 ? Math.round(priceNumeric / area) : 0;

                // Safe access helpers
                const getEn = (obj: any) => obj?.en || (typeof obj === 'string' ? obj : '');
                const getAr = (obj: any) => obj?.ar || (typeof obj === 'string' ? obj : '');

                // Safely handle location
                const locLat = pd.location?.lat ? Number(pd.location.lat) : 30.107;
                const locLng = pd.location?.lng ? Number(pd.location.lng) : 31.626;

                // Map Property Type safely
                const rawType = pd.propertyType || 'Apartment';
                const typeEn = typeof rawType === 'string' ? rawType : (rawType.en || 'Apartment');

                // Map Finishing safely
                const rawFinishing = pd.finishingStatus || 'Core & Shell';
                const finishingEn = typeof rawFinishing === 'string' ? rawFinishing : (rawFinishing.en || 'Core & Shell');

                const newProperty: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl' | 'projectName'> = {
                    partnerId: 'individual-listings', // This ID MUST exist in User table
                    title: { 
                        en: getEn(pd.title) || `Property: ${typeEn}`, 
                        ar: getAr(pd.title) || `عقار: ${typeEn === 'Apartment' ? 'شقة' : typeEn}` 
                    },
                    description: { 
                        en: getEn(pd.description) || '', 
                        ar: getAr(pd.description) || '' 
                    },
                    address: { en: pd.address || '', ar: pd.address || '' },
                    location: { lat: locLat, lng: locLng },
                    status: pd.purpose || { en: 'For Sale', ar: 'للبيع' },
                    type: { 
                        en: typeEn, 
                        ar: typeEn === 'Apartment' ? 'شقة' : (typeEn === 'Villa' ? 'فيلا' : typeEn) 
                    },
                    finishingStatus: { 
                        en: finishingEn, 
                        ar: finishingEn 
                    },
                    area: area,
                    price: { 
                        en: `EGP ${priceNumeric.toLocaleString('en-US')}`,
                        ar: `${priceNumeric.toLocaleString('ar-EG')} ج.م`
                    },
                    priceNumeric: priceNumeric,
                    pricePerMeter: pricePerMeter > 0 ? {
                        en: `EGP ${pricePerMeter.toLocaleString('en-US')}/m²`,
                        ar: `${pricePerMeter.toLocaleString('ar-EG')} ج.م/م²`
                    } : undefined,
                    beds: Number(pd.bedrooms) || 0,
                    baths: Number(pd.bathrooms) || 0,
                    floor: Number(pd.floor) || 0,
                    amenities: pd.amenities || { en: [], ar: [] },
                    isInCompound: pd.isInCompound === 'yes' || pd.isInCompound === true,
                    delivery: { 
                        isImmediate: pd.deliveryType === 'immediate', 
                        date: pd.deliveryType === 'future' ? `${pd.deliveryYear}-${pd.deliveryMonth}` : undefined
                    },
                    installmentsAvailable: pd.hasInstallments === 'yes' || pd.hasInstallments === true,
                    installments: (pd.hasInstallments === 'yes' || pd.hasInstallments === true) ? {
                        downPayment: Number(pd.downPayment) || 0,
                        monthlyInstallment: Number(pd.monthlyInstallment) || 0,
                        years: Number(pd.years) || 0
                    } : undefined,
                    realEstateFinanceAvailable: pd.realEstateFinanceAvailable === 'yes' || pd.realEstateFinanceAvailable === true,
                    imageUrl: request.images && request.images[0] ? request.images[0] : 'https://via.placeholder.com/800x600?text=No+Image',
                    gallery: request.images ? request.images.slice(1) : [],
                    // Changed from 'active' to 'draft' as requested
                    listingStatus: 'draft', 
                    contactMethod: pd.contactMethod || 'platform',
                    ownerPhone: pd.ownerPhone,
                    listingStartDate: pd.listingStartDate || new Date().toISOString().split('T')[0],
                };
                
                try {
                    await addPropertyMutation.mutateAsync(newProperty);
                    showToast(language === 'ar' ? 'تمت الموافقة. تم إنشاء العقار كمسودة للمراجعة.' : 'Approved. Property created as Draft for review.', 'success');
                    // Redirect to the Drafts list directly
                    navigate('/admin/properties/list?status=draft');
                } catch (err: any) {
                    console.error("Failed to create property:", err);
                    
                    // SELF-HEALING LOGIC
                    // Check if error is related to missing partner ID (Foreign Key Constraint)
                    if (supabase && (err.message?.includes('foreign key constraint') || err.code === '23503')) {
                        try {
                            showToast('System: "Individual Listings" account missing. Attempting auto-fix...', 'success');
                            
                            // 1. Create the missing system user
                            const { error: fixError } = await supabase.from('User').upsert({
                                id: 'individual-listings',
                                name_en: 'Individual Listings',
                                name_ar: 'عقارات الأفراد',
                                email: 'listings@onlyhelio.com',
                                type: 'agency',
                                status: 'active',
                                subscriptionPlan: 'basic',
                                contactMethods: JSON.stringify({ whatsapp: { enabled: false }, phone: { enabled: false }, form: { enabled: true } }),
                                createdAt: new Date().toISOString()
                            });

                            if (fixError) throw fixError;

                            // 2. Retry creating the property
                            await addPropertyMutation.mutateAsync(newProperty);
                            
                            showToast('Auto-fix successful! Property created as draft.', 'success');
                            navigate('/admin/properties/list?status=draft');
                            return; // Exit successfully

                        } catch (retryError: any) {
                             console.error("Auto-fix failed:", retryError);
                             showToast(`Auto-fix failed: ${retryError.message}`, 'error');
                        }
                    }

                    // If auto-fix failed or wasn't applicable, revert the request status
                    try {
                         await updatePropertyRequestStatus(request.id, 'pending');
                         queryClient.invalidateQueries({ queryKey: ['propertyRequests'] });
                    } catch (revertError) {
                        console.error("Failed to revert request status:", revertError);
                    }
                    
                    showToast(`Failed to create property: ${err.message}`, 'error');
                }
            } else if (status === 'pending') {
                showToast('Request status reset to Pending.', 'success');
                queryClient.invalidateQueries({ queryKey: ['propertyRequests'] });
            } else {
                showToast(`Request has been ${status}.`, 'success');
                queryClient.invalidateQueries({ queryKey: ['propertyRequests'] });
                navigate('/admin/property-requests');
            }
        },
        onError: (error: any) => {
            console.error("Update error:", error);
            showToast('Action failed. Please try again.', 'error');
        }
    });

    if (isLoading) return <div className="p-8 text-center">Loading...</div>;
    
    if (!request) return (
        <div className="p-8 text-center bg-white rounded-lg shadow dark:bg-gray-800 dark:text-white">
            <h3 className="text-lg font-bold text-red-500">Request not found</h3>
            <Link to="/admin/property-requests" className="text-amber-500 hover:underline mt-4 block">Return to list</Link>
        </div>
    );
    
    // SAFEGUARD: Ensure propertyDetails exists
    const pd = request.propertyDetails || {};

    // Helper for safe nested access to prevent React Error #31
    const safeLang = (obj: any) => {
        if (!obj) return 'N/A';
        if (typeof obj === 'string') return obj;
        return obj[language] || obj.en || obj.ar || 'N/A';
    };

    // Verify location data for Map
    const hasValidLocation = pd.location && 
                             !isNaN(Number(pd.location.lat)) && 
                             !isNaN(Number(pd.location.lng));

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
             <Link to="/admin/property-requests" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                {t.adminShared.backToRequests}
            </Link>
            <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t_admin.propertyDetailsTitle}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
                    request.status === 'approved' ? 'bg-green-100 text-green-700' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                }`}>
                    {request.status}
                </span>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 space-y-8">
                 <section>
                    <h2 className="text-xl font-bold text-amber-500 mb-4">Owner Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailItem label="Name" value={request.customerName} />
                        <DetailItem label="Phone" value={request.customerPhone} />
                        <DetailItem label="Contact Time" value={request.contactTime} />
                    </div>
                </section>
                
                 <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-amber-500 mb-4">Cooperation & Listing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <DetailItem label="Cooperation Model" value={request.cooperationType} />
                        <DetailItem label="Listing Start Date" value={pd.listingStartDate} />
                        <DetailItem label="Listing End Date" value={pd.listingEndDate} />
                    </div>
                 </section>

                <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-amber-500 mb-4">Property Details</h2>
                    
                    {Object.keys(pd).length === 0 ? (
                        <div className="text-red-500 italic">No property details provided in this request.</div>
                    ) : (
                         <>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                                <DetailItem label="Title (EN)" value={pd.title?.en || 'N/A'} />
                                <DetailItem label="Title (AR)" value={pd.title?.ar || 'N/A'} />
                                <DetailItem label="Purpose" value={safeLang(pd.purpose)} />
                                <DetailItem label="Property Type" value={safeLang(pd.propertyType)} />
                                <DetailItem label="Finishing" value={safeLang(pd.finishingStatus)} />
                                <DetailItem label="Area" value={pd.area ? `${pd.area} m²` : 'N/A'} />
                                <DetailItem label="Price" value={pd.price ? `EGP ${Number(pd.price).toLocaleString()}` : 'N/A'} />
                                <DetailItem label="Bedrooms" value={pd.bedrooms} />
                                <DetailItem label="Bathrooms" value={pd.bathrooms} />
                                <DetailItem label="Floor" value={pd.floor} />
                                <DetailItem label="In Compound" value={pd.isInCompound ? t.propertyDetailsPage.yes : t.propertyDetailsPage.no} />
                                <DetailItem label="Installments" value={pd.hasInstallments ? t.propertyDetailsPage.yes : t.propertyDetailsPage.no} />
                                <DetailItem label="Real Estate Finance" value={pd.realEstateFinanceAvailable ? t.propertyDetailsPage.yes : t.propertyDetailsPage.no} />
                                <DetailItem label="Delivery" value={pd.deliveryType === 'immediate' ? 'Immediate' : `${pd.deliveryMonth || '?'}/${pd.deliveryYear || '?'}`} />
                             </div>
                             <div className="mt-4 space-y-2">
                                 <DetailItem label="Address" value={pd.address} layout="grid"/>
                                 <DetailItem label="Description (EN)" value={<p className="whitespace-pre-line">{pd.description?.en || '-'}</p>} layout="grid"/>
                                 <DetailItem label="Description (AR)" value={<p className="whitespace-pre-line">{pd.description?.ar || '-'}</p>} layout="grid"/>
                                 <DetailItem label="Amenities" value={(pd.amenities?.en || []).join(', ')} layout="grid" />
                             </div>

                             {hasValidLocation ? (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-gray-500 mb-2">Location Verification</h3>
                                    <div className="h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                        <UnifiedMap 
                                            mode="read"
                                            markers={[{
                                                id: 'request-location',
                                                lat: Number(pd.location.lat),
                                                lng: Number(pd.location.lng),
                                                color: 'amber'
                                            }]}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 font-mono">
                                        Lat: {pd.location.lat}, Lng: {pd.location.lng}
                                    </p>
                                </div>
                             ) : (
                                <div className="mt-6 p-4 bg-gray-100 rounded text-gray-500 text-sm italic">
                                    No valid location coordinates provided.
                                </div>
                             )}
                         </>
                    )}
                </section>

                {pd.hasInstallments && (
                    <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-amber-500 mb-4">Installment Details</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <DetailItem label="Down Payment" value={`EGP ${Number(pd.downPayment || 0).toLocaleString()}`} />
                            <DetailItem label="Monthly" value={`EGP ${Number(pd.monthlyInstallment || 0).toLocaleString()}`} />
                            <DetailItem label="Years" value={pd.years} />
                        </div>
                    </section>
                )}

                 {request.images && request.images.length > 0 ? (
                    <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-amber-500 mb-4">Images</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {request.images.map((img: string, index: number) => (
                                <a key={index} href={img} target="_blank" rel="noreferrer">
                                    <img src={img} alt={`Property ${index+1}`} className="w-full h-32 object-cover rounded-md border border-gray-100" />
                                </a>
                            ))}
                        </div>
                    </section>
                ) : (
                    <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-amber-500 mb-4">Images</h2>
                        <p className="text-gray-500 italic">No images uploaded.</p>
                    </section>
                )}

                 <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                    {request.status === 'pending' ? (
                        <>
                            <button onClick={() => updateRequestMutation.mutate('rejected')} disabled={updateRequestMutation.isPending} className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
                               {t.adminShared.reject}
                            </button>
                             <button onClick={() => updateRequestMutation.mutate('approved')} disabled={updateRequestMutation.isPending || addPropertyMutation.isPending} className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">
                                {language === 'ar' ? 'موافقة وإنشاء مسودة' : 'Approve & Create Draft'}
                            </button>
                        </>
                    ) : (
                        <Button 
                            variant="secondary" 
                            onClick={() => updateRequestMutation.mutate('pending')} 
                            isLoading={updateRequestMutation.isPending} 
                            className="flex items-center gap-2"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            {language === 'ar' ? 'إعادة فتح الطلب (تعيين كمعلق)' : 'Reopen Request (Set to Pending)'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPropertyRequestDetailsPage;
