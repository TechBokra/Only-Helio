
import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Property } from '../../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPropertyRequests, updatePropertyRequestStatus } from '../../../services/propertyRequests';
import { getRequestById } from '../../../services/requests'; // Generic Fetcher
import { addProperty } from '../../../services/properties';
import { ArrowLeftIcon, ArrowPathIcon } from '../../ui/Icons';
import DetailItem from '../../shared/DetailItem';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import UnifiedMap from '../../shared/UnifiedMap';
import { Button } from '../../ui/Button';
import { supabase } from '../../../supabaseClient';
import { sendPropertyApprovalEmail, sendStatusUpdateEmail } from '../../../services/emailService';
import ConversationThread from '../../shared/ConversationThread'; // Import Thread
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';

const AdminPropertyRequestDetailsPage: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    
    const { data: requests, isLoading } = useQuery({ queryKey: ['propertyRequests'], queryFn: getAllPropertyRequests });
    
    // Fetch generic request wrapper to get messages
    const { data: genericRequest, refetch: refetchGeneric } = useQuery({ 
        queryKey: ['request', requestId], 
        queryFn: () => getRequestById(requestId!),
        enabled: !!requestId
    });

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    const request = useMemo(() => requests?.find(r => r.id === requestId), [requests, requestId]);

    const addPropertyMutation = useMutation({
        mutationFn: (propertyData: Omit<Property, 'id'>) => addProperty(propertyData),
    });

    const updateRequestMutation = useMutation({
        mutationFn: async (status: 'approved' | 'rejected' | 'pending') => {
             await updatePropertyRequestStatus(request!.id, status as any);

             if (request) {
                if (status === 'approved') {
                     const pd = request.propertyDetails as any;
                     const title = pd?.title?.en || 'Property Listing';
                     const email = (request as any).contactEmail || 'user@example.com'; 
                     await sendPropertyApprovalEmail(request.customerName, email, title);
                } else if (status === 'rejected') {
                     const email = (request as any).contactEmail || 'user@example.com';
                     await sendStatusUpdateEmail(request.customerName, email, "Property Listing", status);
                }
             }
        },
        onSuccess: async (data, status) => {
             showToast('Email notification sent.', 'success');

            if (status === 'approved' && request) {
                const pd = request.propertyDetails || {};

                if (!pd.title || !pd.price) {
                    showToast('Cannot approve: Missing basic property details (Price/Title).', 'error');
                    return;
                }

                const priceNumeric = Number(pd.price) || 0;
                const area = Number(pd.area) || 0;
                const pricePerMeter = area > 0 ? Math.round(priceNumeric / area) : 0;

                const getEn = (obj: any) => obj?.en || (typeof obj === 'string' ? obj : '');
                const getAr = (obj: any) => obj?.ar || (typeof obj === 'string' ? obj : '');

                const locLat = pd.location?.lat ? Number(pd.location.lat) : 30.107;
                const locLng = pd.location?.lng ? Number(pd.location.lng) : 31.626;

                const rawType = pd.propertyType || 'Apartment';
                const typeEn = typeof rawType === 'string' ? rawType : (rawType.en || 'Apartment');

                const rawFinishing = pd.finishingStatus || 'Core & Shell';
                const finishingEn = typeof rawFinishing === 'string' ? rawFinishing : (rawFinishing.en || 'Core & Shell');

                const newProperty: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl' | 'projectName'> = {
                    partnerId: 'individual-listings', 
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
                    listingStatus: 'draft', 
                    contactMethod: pd.contactMethod || 'platform',
                    ownerPhone: pd.ownerPhone,
                    listingStartDate: pd.listingStartDate || new Date().toISOString().split('T')[0],
                    createdAt: new Date().toISOString()
                };
                
                try {
                    await addPropertyMutation.mutateAsync(newProperty);
                    showToast(language === 'ar' ? 'تمت الموافقة. تم إنشاء العقار كمسودة للمراجعة.' : 'Approved. Property created as Draft for review.', 'success');
                    navigate('/admin/properties/list?status=draft');
                } catch (err: any) {
                    console.error("Failed to create property:", err);
                    
                    if (supabase && (err.message?.includes('foreign key constraint') || err.code === '23503')) {
                        try {
                            showToast('System: "Individual Listings" account missing. Attempting auto-fix...', 'success');
                            const { error: fixError } = await supabase.from('User').upsert({
                                id: 'individual-listings',
                                name_en: 'Individual Listings',
                                name_ar: 'عقارات الأفراد',
                                email: 'listings@onlyhelio.com',
                                type: 'agency',
                                role: 'AGENCY_PARTNER',
                                status: 'active',
                                subscriptionPlan: 'basic',
                                contactMethods: JSON.stringify({ whatsapp: { enabled: false }, phone: { enabled: false }, form: { enabled: true } }),
                                createdAt: new Date().toISOString()
                            });

                            if (fixError) throw fixError;
                            await addPropertyMutation.mutateAsync(newProperty);
                            
                            showToast('Auto-fix successful! Property created as draft.', 'success');
                            navigate('/admin/properties/list?status=draft');
                            return; 

                        } catch (retryError: any) {
                             console.error("Auto-fix failed:", retryError);
                             showToast(`Auto-fix failed: ${retryError.message}`, 'error');
                        }
                    }

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
    
    // Defensive Check: Ensure pd exists
    const pd = request.propertyDetails || {};
    
    const safeLang = (obj: any) => {
        if (!obj) return 'N/A';
        if (typeof obj === 'string') return obj;
        return obj[language] || obj.en || obj.ar || 'N/A';
    };
    const hasValidLocation = pd.location && !isNaN(Number(pd.location.lat)) && !isNaN(Number(pd.location.lng));

    // Construct a thread-compatible object
    const threadEntity = {
        id: request.id,
        messages: (genericRequest?.payload as any)?.messages || [],
        contactTime: request.contactTime,
        customerNotes: undefined
    };

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn space-y-6">
             <Link to="/admin/property-requests" className="inline-flex items-center gap-2 text-amber-600 hover:underline">
                <ArrowLeftIcon className="w-5 h-5" />
                {t.adminShared.backToRequests}
            </Link>

            <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t_admin.propertyDetailsTitle}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
                    request.status === 'approved' ? 'bg-green-100 text-green-700' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                }`}>
                    {request.status}
                </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Property Details</CardTitle></CardHeader>
                        <CardContent>
                             {Object.keys(pd).length === 0 ? (
                                <div className="text-red-500 italic">No property details provided.</div>
                            ) : (
                                <div className="space-y-6">
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
                                        <DetailItem label="Title (EN)" value={pd.title?.en || 'N/A'} />
                                        <DetailItem label="Title (AR)" value={pd.title?.ar || 'N/A'} />
                                        <DetailItem label="Type" value={safeLang(pd.propertyType)} />
                                        <DetailItem label="Purpose" value={safeLang(pd.purpose)} />
                                        <DetailItem label="Area" value={pd.area ? `${pd.area} m²` : 'N/A'} />
                                        <DetailItem label="Price" value={pd.price ? `EGP ${Number(pd.price).toLocaleString()}` : 'N/A'} />
                                        <DetailItem label="Cooperation" value={request.cooperationType} />
                                     </div>
                                     <DetailItem label="Address" value={pd.address} layout="grid"/>
                                     <DetailItem label="Description" value={<p className="whitespace-pre-line text-sm">{pd.description?.en || pd.description?.ar}</p>} layout="grid"/>
                                     
                                     {hasValidLocation && (
                                        <div className="mt-4 border rounded overflow-hidden h-48">
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
                                     )}
                                </div>
                            )}

                            {request.images && request.images.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-medium text-gray-500 mb-2">Images</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {request.images.map((img: string, idx: number) => (
                                            <a key={idx} href={img} target="_blank" rel="noreferrer" className="block aspect-square">
                                                <img src={img} alt={`Prop ${idx}`} className="w-full h-full object-cover rounded-md border" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Conversation & History</CardTitle></CardHeader>
                        <CardContent>
                             <ConversationThread 
                                lead={threadEntity} 
                                requestId={request.id} 
                                onMessageSent={() => refetchGeneric()} 
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Owner Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                             <DetailItem label="Name" value={request.customerName} />
                             <DetailItem label="Phone" value={request.customerPhone} />
                             <DetailItem label="Preferred Contact" value={request.contactTime} />
                        </CardContent>
                    </Card>

                     <div className="mt-8 pt-6 flex flex-col gap-3">
                        {request.status === 'pending' ? (
                            <>
                                <button onClick={() => updateRequestMutation.mutate('approved')} disabled={updateRequestMutation.isPending || addPropertyMutation.isPending} className="w-full px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors shadow-sm">
                                    {language === 'ar' ? 'موافقة وإنشاء مسودة' : 'Approve & Create Draft'}
                                </button>
                                <button onClick={() => updateRequestMutation.mutate('rejected')} disabled={updateRequestMutation.isPending} className="w-full px-6 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors shadow-sm">
                                {t.adminShared.reject}
                                </button>
                            </>
                        ) : (
                            <Button 
                                variant="secondary" 
                                onClick={() => updateRequestMutation.mutate('pending')} 
                                isLoading={updateRequestMutation.isPending} 
                                className="flex items-center justify-center gap-2 w-full"
                            >
                                <ArrowPathIcon className="w-4 h-4" />
                                {language === 'ar' ? 'إعادة فتح الطلب' : 'Reopen Request'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPropertyRequestDetailsPage;
