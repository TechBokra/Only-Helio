
import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Language, PartnerRequest, PlanCategory } from '../../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPartnerRequests, updatePartnerRequestStatus } from '../../../services/partnerRequests';
import { getRequestById } from '../../../services/requests'; // Import generic fetcher
import { addPartner } from '../../../services/partners';
import { getPlans } from '../../../services/plans';
import { ArrowLeftIcon } from '../../ui/Icons';
import DetailItem from '../../shared/DetailItem';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import { sendStatusUpdateEmail } from '../../../services/emailService';
import ConversationThread from '../../shared/ConversationThread'; // Import Thread
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';

const AdminPartnerRequestDetailsPage: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    
    // 1. Fetch specific data for display
    const { data: requests, isLoading } = useQuery({ queryKey: ['partnerRequests'], queryFn: getAllPartnerRequests });
    
    // 2. Fetch generic request wrapper to get messages
    const { data: genericRequest, refetch: refetchGeneric } = useQuery({ 
        queryKey: ['request', requestId], 
        queryFn: () => getRequestById(requestId!),
        enabled: !!requestId
    });

    const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const request = useMemo(() => requests?.find(r => r.id === requestId), [requests, requestId]);

    const mutation = useMutation({
        mutationFn: async ({ status, req }: { status: 'approved' | 'rejected', req: PartnerRequest }) => {
            if (status === 'approved') {
                await addPartner(req, 'pending_setup');
            }
            await updatePartnerRequestStatus(req.id, status);
            
            // Send Email Notification
            await sendStatusUpdateEmail(
                req.contactName, 
                req.contactEmail, 
                "Partner Application", 
                status
            );
        },
        onSuccess: (_, variables) => {
            showToast('Email notification sent to applicant.', 'success');

            if (variables.status === 'approved') {
                showToast(language === 'ar' ? 'تمت الموافقة. الشريك الآن في حالة "تحت التجهيز".' : 'Approved. Partner created as "Pending Setup".', 'success');
                navigate('/admin/partners/list?status=pending_setup'); 
            } else {
                showToast(language === 'ar' ? 'تم رفض الطلب.' : 'Request rejected.', 'success');
                navigate('/admin/partner-requests');
            }
            queryClient.invalidateQueries({ queryKey: ['partnerRequests'] });
            queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] });
        },
        onError: (error: any) => {
            console.error("Partner approval failed:", error);
            const msg = error.message || 'Action failed. Please try again.';
            showToast(msg, 'error');
        }
    });

    if (isLoading) return <div>Loading...</div>;
    if (!request) return <div>Request not found.</div>;
    
    const companyTypeForPlan = request.companyType as PlanCategory;
    const selectedPlanDetails = plans?.[companyTypeForPlan]?.[request.subscriptionPlan as keyof typeof plans[typeof companyTypeForPlan]]?.[language];

    // Construct a thread-compatible object
    const threadEntity = {
        id: request.id,
        messages: (genericRequest?.payload as any)?.messages || [],
        contactTime: undefined,
        customerNotes: request.description // Treat initial description as note
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Link to="/admin/partner-requests" className="inline-flex items-center gap-2 text-amber-600 hover:underline">
                <ArrowLeftIcon className="w-5 h-5" />
                {t.adminShared.backToRequests}
            </Link>
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{request.companyName}</h1>
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
                         <CardHeader><CardTitle>{t_admin.table.companyInfo}</CardTitle></CardHeader>
                         <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailItem label="Company Name" value={request.companyName} />
                                <DetailItem label="Company Type" value={request.companyType} />
                                <DetailItem label="Address" value={request.companyAddress} />
                                <DetailItem label="Website" value={<a href={request.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{request.website}</a>} />
                            </div>
                            <div className="mt-4">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                                <dd className="mt-1 text-md text-gray-900 dark:text-white whitespace-pre-line">{request.description}</dd>
                            </div>
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
                        <CardHeader><CardTitle>{t_admin.table.primaryContact}</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <DetailItem label="Name" value={request.contactName} />
                            <DetailItem label="Email" value={request.contactEmail} />
                            <DetailItem label="Phone" value={request.contactPhone} />
                        </CardContent>
                    </Card>
                    
                    <Card>
                         <CardHeader><CardTitle>{t_admin.subscriptionPlan}</CardTitle></CardHeader>
                         <CardContent>
                            {selectedPlanDetails ? (
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                                    <p className="font-bold text-lg">{selectedPlanDetails.name}</p>
                                    <p className="text-sm">{selectedPlanDetails.description}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500">Plan details not found.</p>
                            )}
                         </CardContent>
                    </Card>

                    {request.status === 'pending' && (
                        <Card className="border-t-4 border-t-amber-500">
                             <CardContent className="pt-6 flex flex-col gap-3">
                                 <button onClick={() => mutation.mutate({ status: 'approved', req: request })} disabled={mutation.isPending} className="w-full px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">
                                    {language === 'ar' ? 'قبول وتأسيس الشريك' : 'Approve & Create Partner'}
                                </button>
                                <button onClick={() => mutation.mutate({ status: 'rejected', req: request })} disabled={mutation.isPending} className="w-full px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
                                    {t.adminShared.reject}
                                </button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPartnerRequestDetailsPage;
