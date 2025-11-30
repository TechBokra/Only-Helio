
import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// FIX: Added 'PlanCategory' to the import to ensure correct type casting.
import type { Language, PartnerRequest, PlanCategory } from '../../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPartnerRequests, updatePartnerRequestStatus } from '../../../services/partnerRequests';
import { addPartner } from '../../../services/partners';
import { getPlans } from '../../../services/plans';
// FIX: Corrected import path for Icons
import { ArrowLeftIcon } from '../../ui/Icons';
import DetailItem from '../../shared/DetailItem';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';

const AdminPartnerRequestDetailsPage: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    const { data: requests, isLoading } = useQuery({ queryKey: ['partnerRequests'], queryFn: getAllPartnerRequests });
    const { data: plans } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const request = useMemo(() => requests?.find(r => r.id === requestId), [requests, requestId]);

    const mutation = useMutation({
        mutationFn: async ({ status, req }: { status: 'approved' | 'rejected', req: PartnerRequest }) => {
            if (status === 'approved') {
                await addPartner(req);
            }
            await updatePartnerRequestStatus(req.id, status);
        },
        onSuccess: (_, variables) => {
            showToast(`Request has been ${variables.status}.`, 'success');
            queryClient.invalidateQueries({ queryKey: ['partnerRequests'] });
            queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] });
            navigate('/admin/partner-requests');
        },
        onError: () => {
            showToast('Action failed. Please try again.', 'error');
        }
    });

    if (isLoading) return <div>Loading...</div>;
    if (!request) return <div>Request not found.</div>;
    
    // FIX: Cast 'companyType' to 'PlanCategory' to ensure type-safe access to the 'plans' object.
    // Partner applications should only come from 'developer', 'agency', or 'finishing'.
    const companyTypeForPlan = request.companyType as PlanCategory;
    const selectedPlanDetails = plans?.[companyTypeForPlan]?.[request.subscriptionPlan as keyof typeof plans[typeof companyTypeForPlan]]?.[language];


    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/admin/partner-requests" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                {t.adminShared.backToRequests}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{request.companyName}</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-amber-500">{t_admin.table.companyInfo}</h2>
                        <DetailItem label="Company Name" value={request.companyName} />
                        <DetailItem label="Company Type" value={request.companyType} />
                        <DetailItem label="Address" value={request.companyAddress} />
                        <DetailItem label="Website" value={<a href={request.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{request.website}</a>} />
                        <div>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</dt>
                            <dd className="mt-1 text-md text-gray-900 dark:text-white whitespace-pre-line">{request.description}</dd>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-amber-500">{t_admin.table.primaryContact}</h2>
                        <DetailItem label="Name" value={request.contactName} />
                        <DetailItem label="Email" value={request.contactEmail} />
                        <DetailItem label="Phone" value={request.contactPhone} />

                        {request.managementContacts && request.managementContacts.length > 0 && (
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-amber-500">{t_admin.table.managementContacts}</h2>
                                {request.managementContacts.map((contact, index) => (
                                    <div key={index} className="mt-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <p className="font-semibold">{contact.name} <span className="text-sm text-gray-500">({contact.position})</span></p>
                                        <p className="text-sm">{contact.email} | {contact.phone}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                 <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-amber-500 mb-4">{t_admin.subscriptionPlan}</h2>
                    {selectedPlanDetails ? (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                            <p className="font-bold text-lg">{selectedPlanDetails.name}</p>
                            <p className="text-sm">{selectedPlanDetails.description}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500">Plan details not found.</p>
                    )}
                 </div>
                
                 {request.documents && request.documents.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-amber-500 mb-4">{t_admin.table.documents}</h2>
                        <ul className="space-y-2">
                            {request.documents.map((doc, index) => (
                                <li key={index}>
                                    <a href={doc.fileContent} download={doc.fileName} className="text-blue-500 hover:underline">
                                        {doc.fileName} ({t_admin.table.download})
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                 )}

                {request.status === 'pending' && (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-4">
                        <button onClick={() => mutation.mutate({ status: 'rejected', req: request })} disabled={mutation.isPending} className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
                            {t.adminShared.reject}
                        </button>
                         <button onClick={() => mutation.mutate({ status: 'approved', req: request })} disabled={mutation.isPending} className="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors">
                            {t.adminShared.approve}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPartnerRequestDetailsPage;
