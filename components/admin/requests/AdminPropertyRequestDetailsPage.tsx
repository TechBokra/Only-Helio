
import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { AddPropertyRequest, Request } from '../../../types';
import { RequestType } from '../../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPropertyRequests, updatePropertyRequestStatus } from '../../../services/propertyRequests';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, WrenchScrewdriverIcon } from '../../ui/Icons';
import DetailItem from '../../shared/DetailItem';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import UnifiedMap from '../../shared/UnifiedMap';
import { Button } from '../../ui/Button';
import RequestPayloadViewer from './RequestPayloadViewer';

const AdminPropertyRequestDetailsPage: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    const { data: requests, isLoading } = useQuery({ queryKey: ['propertyRequests'], queryFn: getAllPropertyRequests });
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    const request = useMemo(() => requests?.find(r => r.id === requestId), [requests, requestId]);

    // Adapt specific AddPropertyRequest structure to the generic Request structure expected by the viewer
    const requestForViewer = useMemo((): Request | null => {
        if (!request) return null;
        return {
            id: request.id,
            type: RequestType.PROPERTY_LISTING_REQUEST,
            status: request.status,
            assignedTo: '',
            createdAt: request.createdAt,
            updatedAt: request.createdAt,
            requesterInfo: {
                name: request.customerName,
                phone: request.customerPhone
            },
            payload: {
                propertyDetails: request.propertyDetails,
                cooperationType: request.cooperationType,
                images: request.images,
                paymentStatus: (request as any).paymentStatus // Ensure payment status is passed if present
            }
        };
    }, [request]);

    const updateRequestMutation = useMutation({
        mutationFn: (status: 'rejected') => updatePropertyRequestStatus(request!.id, status),
        onSuccess: (_, status) => {
            showToast(`Request has been ${status}.`, 'success');
            queryClient.invalidateQueries({ queryKey: ['propertyRequests'] });
            navigate('/admin/properties/listing-requests');
        },
        onError: () => {
            showToast('Action failed. Please try again.', 'error');
        }
    });

    const handleEditAndPublish = () => {
        if (!request) return;
        // Navigate to the Add Property page with the request data pre-filled in state
        navigate('/admin/properties/new', { 
            state: { 
                fromRequest: request 
            } 
        });
    };

    if (isLoading) return <div>Loading...</div>;
    if (!request) return <div>Request not found.</div>;
    
    const { propertyDetails: pd } = request;

    if (!pd) {
        return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-200">Error: Request data is corrupt or missing details.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto animate-fadeIn">
             <Link to="/admin/properties/listing-requests" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-6 font-medium">
                <ArrowLeftIcon className="w-4 h-4" />
                {t.adminShared.backToRequests}
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t_admin.propertyDetailsTitle}</h1>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${
                    request.status === 'new' ? 'bg-blue-100 text-blue-700' : 
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                    Status: {request.status}
                </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-8">
                     {/* Payload Viewer (Includes Financial & Property Card) */}
                    {requestForViewer && <RequestPayloadViewer request={requestForViewer} />}

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-amber-500 rounded-full"></span> Owner Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DetailItem label="Full Name" value={request.customerName} />
                            <DetailItem label="Phone Number" value={request.customerPhone} />
                            <DetailItem label="Preferred Contact Time" value={request.contactTime} />
                            <DetailItem label="Submission Date" value={new Date(request.createdAt).toLocaleString()} />
                        </div>
                    </div>

                    {pd.location && (
                         <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-1 h-6 bg-amber-500 rounded-full"></span> Submitted Location
                            </h2>
                            <div className="h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative z-0">
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
                            <p className="text-xs text-gray-500 mt-2 font-mono">
                                Lat: {pd.location.lat}, Lng: {pd.location.lng}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Column: Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                            Decision & Actions
                        </h3>
                        
                        {request.status === 'pending' || request.status === 'new' ? (
                            <div className="space-y-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                    <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2 text-sm uppercase tracking-wider">Review Process</h4>
                                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 list-disc list-inside">
                                        <li>Verify property details & images.</li>
                                        <li>Check financial arrangement.</li>
                                        <li>Click "Edit & Publish" to finalize.</li>
                                    </ul>
                                </div>

                                <Button 
                                    onClick={handleEditAndPublish} 
                                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-4 text-lg shadow-lg shadow-amber-500/20 transition-all hover:-translate-y-0.5"
                                >
                                    <WrenchScrewdriverIcon className="w-5 h-5" />
                                    {language === 'ar' ? 'تعديل ونشر' : 'Edit & Publish'}
                                </Button>
                                
                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                                    <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold">Or</span>
                                    <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                                </div>

                                <Button 
                                    onClick={() => updateRequestMutation.mutate('rejected')} 
                                    disabled={updateRequestMutation.isPending} 
                                    variant="danger"
                                    className="w-full flex items-center justify-center gap-2 opacity-90 hover:opacity-100"
                                >
                                    <XCircleIcon className="w-5 h-5" />
                                    {t.adminShared.reject}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner
                                    ${request.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                    {request.status === 'approved' ? <CheckCircleIcon className="w-10 h-10" /> : <XCircleIcon className="w-10 h-10" />}
                                </div>
                                <p className="text-gray-900 dark:text-white font-bold text-xl capitalize mb-2">{request.status}</p>
                                <p className="text-sm text-gray-500">This request has been processed.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPropertyRequestDetailsPage;
