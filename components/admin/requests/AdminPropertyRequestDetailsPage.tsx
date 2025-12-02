
import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { AddPropertyRequest, Property } from '../../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPropertyRequests, updatePropertyRequestStatus } from '../../../services/propertyRequests';
import { addProperty } from '../../../services/properties';
import { ArrowLeftIcon } from '../../ui/Icons';
import DetailItem from '../../shared/DetailItem';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import UnifiedMap from '../../shared/UnifiedMap';

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
        mutationFn: (status: 'approved' | 'rejected') => updatePropertyRequestStatus(request!.id, status),
        onSuccess: async (data, status) => {
            if (status === 'approved' && request) {
                const pd = request.propertyDetails;

                if (!pd) {
                    showToast('Cannot approve: Missing property details.', 'error');
                    return;
                }

                const priceNumeric = Number(pd.price) || 0;
                const area = Number(pd.area) || 0;
                const pricePerMeter = area > 0 ? Math.round(priceNumeric / area) : 0;

                // Safe access helpers
                const getEn = (obj: any) => obj?.en || '';
                const getAr = (obj: any) => obj?.ar || '';

                const newProperty: Omit<Property, 'id' | 'partnerName' | 'partnerImageUrl' | 'projectName'> = {
                    partnerId: 'individual-listings',
                    title: { 
                        en: getEn(pd.title) || 'Untitled Property', 
                        ar: getAr(pd.title) || 'عقار بدون عنوان' 
                    },
                    description: { 
                        en: getEn(pd.description) || '', 
                        ar: getAr(pd.description) || '' 
                    },
                    address: { en: pd.address || '', ar: pd.address || '' },
                    location: pd.location || { lat: 30.0, lng: 31.0 },
                    status: { 
                        en: (pd.purpose?.en || 'For Sale') as 'For Sale' | 'For Rent', 
                        ar: (pd.purpose?.ar || 'للبيع') as 'للبيع' | 'إيجار'
                    },
                    type: { 
                        en: (getEn(pd.propertyType) || 'Apartment') as string, 
                        ar: (getAr(pd.propertyType) || 'شقة') as string
                    },
                    finishingStatus: pd.finishingStatus ? { 
                        en: getEn(pd.finishingStatus), 
                        ar: getAr(pd.finishingStatus) 
                    } : undefined,
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
                    isInCompound: !!pd.isInCompound,
                    delivery: { 
                        isImmediate: pd.deliveryType === 'immediate', 
                        date: pd.deliveryType === 'future' ? `${pd.deliveryMonth}/${pd.deliveryYear}` : undefined
                    },
                    installmentsAvailable: !!pd.hasInstallments,
                    installments: pd.hasInstallments ? {
                        downPayment: Number(pd.downPayment) || 0,
                        monthlyInstallment: Number(pd.monthlyInstallment) || 0,
                        years: Number(pd.years) || 0
                    } : undefined,
                    realEstateFinanceAvailable: !!pd.realEstateFinanceAvailable,
                    imageUrl: request.images && request.images[0] ? request.images[0] : 'https://via.placeholder.com/800x600?text=No+Image',
                    gallery: request.images ? request.images.slice(1) : [],
                    listingStatus: 'active',
                    contactMethod: pd.contactMethod || 'platform',
                    ownerPhone: pd.ownerPhone,
                    listingStartDate: pd.listingStartDate || new Date().toISOString().split('T')[0],
                };
                await addPropertyMutation.mutateAsync(newProperty);
            }
            showToast(`Request has been ${status}.`, 'success');
            queryClient.invalidateQueries({ queryKey: ['propertyRequests'] });
            navigate('/admin/properties/listing-requests');
        },
        onError: () => {
            showToast('Action failed. Please try again.', 'error');
        }
    });

    if (isLoading) return <div>Loading...</div>;
    if (!request) return <div>Request not found.</div>;
    
    const { propertyDetails: pd } = request;

    // Guard against missing pd
    if (!pd) {
        return <div className="p-8 text-center text-red-500">Error: Request data is corrupt or missing details.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
             <Link to="/admin/properties/listing-requests" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                {t.adminShared.backToRequests}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t_admin.propertyDetailsTitle}</h1>
            
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
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                        <DetailItem label="Title (EN)" value={pd.title?.en} />
                        <DetailItem label="Title (AR)" value={pd.title?.ar} />
                        <DetailItem label="Purpose" value={pd.purpose?.[language]} />
                        <DetailItem label="Property Type" value={pd.propertyType?.[language]} />
                        <DetailItem label="Finishing" value={pd.finishingStatus?.[language]} />
                        <DetailItem label="Area" value={`${pd.area} m²`} />
                        <DetailItem label="Price" value={`EGP ${pd.price?.toLocaleString()}`} />
                        <DetailItem label="Bedrooms" value={pd.bedrooms} />
                        <DetailItem label="Bathrooms" value={pd.bathrooms} />
                        <DetailItem label="Floor" value={pd.floor} />
                        <DetailItem label="In Compound" value={pd.isInCompound ? t.propertyDetailsPage.yes : t.propertyDetailsPage.no} />
                        <DetailItem label="Installments" value={pd.hasInstallments ? t.propertyDetailsPage.yes : t.propertyDetailsPage.no} />
                        <DetailItem label="Real Estate Finance" value={pd.realEstateFinanceAvailable ? t.propertyDetailsPage.yes : t.propertyDetailsPage.no} />
                        <DetailItem label="Delivery" value={pd.deliveryType === 'immediate' ? 'Immediate' : `${pd.deliveryMonth}/${pd.deliveryYear}`} />
                     </div>
                     <div className="mt-4 space-y-2">
                         <DetailItem label="Address" value={pd.address} layout="grid"/>
                         <DetailItem label="Description (EN)" value={<p className="whitespace-pre-line">{pd.description?.en}</p>} layout="grid"/>
                         <DetailItem label="Description (AR)" value={<p className="whitespace-pre-line">{pd.description?.ar}</p>} layout="grid"/>
                         <DetailItem label="Amenities" value={(pd.amenities?.en || []).join(', ')} layout="grid" />
                     </div>

                     {pd.location && (
                        <div className="mt-6">
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Location Verification</h3>
                            <div className="h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                <UnifiedMap 
                                    mode="read"
                                    markers={[{
                                        id: 'request-location',
                                        lat: pd.location.lat,
                                        lng: pd.location.lng,
                                        color: 'amber'
                                    }]}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1 font-mono">
                                Lat: {pd.location.lat}, Lng: {pd.location.lng}
                            </p>
                        </div>
                     )}
                </section>

                {pd.hasInstallments && (
                    <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-amber-500 mb-4">Installment Details</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <DetailItem label="Down Payment" value={`EGP ${pd.downPayment?.toLocaleString()}`} />
                            <DetailItem label="Monthly" value={`EGP ${pd.monthlyInstallment?.toLocaleString()}`} />
                            <DetailItem label="Years" value={pd.years} />
                        </div>
                    </section>
                )}

                 {request.images && request.images.length > 0 && (
                    <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-amber-500 mb-4">Images</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {request.images.map((img: string, index: number) => (
                                <a key={index} href={img} target="_blank" rel="noreferrer">
                                    <img src={img} alt={`Property ${index+1}`} className="w-full h-32 object-cover rounded-md" />
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                 {request.status === 'pending' && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                        <button onClick={() => updateRequestMutation.mutate('rejected')} disabled={updateRequestMutation.isPending} className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
                           {t.adminShared.reject}
                        </button>
                         <button onClick={() => updateRequestMutation.mutate('approved')} disabled={updateRequestMutation.isPending || addPropertyMutation.isPending} className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">
                            {t.adminShared.approve} & Create Listing
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPropertyRequestDetailsPage;
