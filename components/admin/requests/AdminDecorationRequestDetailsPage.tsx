
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Lead, LeadStatus, PortfolioItem } from '../../../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRequestById, updateRequest, addMessageToLead } from '../../../services/requests';
import { getAllPartnersForAdmin } from '../../../services/partners';
import { getAllPortfolioItems } from '../../../services/portfolio';
import { ArrowLeftIcon } from '../../ui/Icons';
import ConversationThread from '../../shared/ConversationThread';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import { useAuth } from '../../auth/AuthContext';
import { Role } from '../../../types';

const statusColors: { [key in LeadStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'site-visit': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    quoted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const AdminDecorationRequestDetailsPage: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const { language, t: i18n } = useLanguage();
    const { showToast } = useToast();
    const { currentUser } = useAuth();
    const queryClient = useQueryClient();
    const t = i18n.adminDashboard.decorationsManagement;

    // 1. Fetch the specific request (which includes message history)
    const { data: request, isLoading: loadingRequest, refetch: refetchRequest } = useQuery({ 
        queryKey: ['request', requestId], 
        queryFn: () => getRequestById(requestId!),
        enabled: !!requestId
    });

    const { data: portfolioItems, isLoading: loadingPortfolio } = useQuery({ queryKey: ['portfolio'], queryFn: getAllPortfolioItems });
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    
    const isLoading = loadingRequest || loadingPortfolio || loadingPartners;

    // Extract Lead data from the generic Request wrapper
    const lead = useMemo(() => {
        if (!request || !request.payload) return null;
        return request.payload as Lead;
    }, [request]);

    const finishingPartners = useMemo(() => (partners || []).filter(p => p.type === 'finishing' || p.type === 'service_manager'), [partners]);
    
    const [status, setStatus] = useState<LeadStatus>('new');
    const [assignedTo, setAssignedTo] = useState<string>('internal-team');

    useEffect(() => {
        if (lead) {
            setStatus(lead.status);
            setAssignedTo(lead.assignedTo || 'internal-team');
        }
    }, [lead]);

    const updateMutation = useMutation({
        mutationFn: async () => {
             if (!request || !lead) return;
             
             // Update logic compatible with the generic updateRequest service
             await updateRequest(request.id, { 
                 status: status as any, // Map lead status to request status if needed
                 assignedTo: assignedTo,
             });
             
             // Add a system note about the update
             if (status !== lead.status) {
                 const senderType = currentUser?.role === Role.SUPER_ADMIN ? 'admin' : 'partner';
                 await addMessageToLead(request.id, {
                     sender: senderType,
                     senderId: currentUser?.id,
                     type: 'note',
                     content: `Status updated to: ${status}`
                 });
             }
        },
        onSuccess: () => {
            showToast('Request updated successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['request', requestId] });
        },
        onError: () => showToast('Failed to update request', 'error')
    });

    if (isLoading) return <div className="p-8 text-center">Loading details...</div>;
    if (!lead || !request) return <div className="p-8 text-center">Request not found.</div>;

    const isCustomRequest = lead.serviceTitle.includes(i18n.customDecorationRequestModal.serviceTitle);
    const referenceWorkTitle = !isCustomRequest ? lead.serviceTitle.replace(`${i18n.decorationRequestModal.reference} `, '') : '';
    const referenceItem = portfolioItems?.find(item => item.title.ar === referenceWorkTitle || item.title.en === referenceWorkTitle);

    // Construct a robust object for the ConversationThread
    const threadEntity = {
        id: request.id,
        messages: lead.messages || [], // Ensure messages exist
        contactTime: lead.contactTime,
        customerNotes: lead.customerNotes
    };

    return (
        <div className="space-y-6 animate-fadeIn">
             <Link to="/admin/platform-decorations/requests" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                {t.backToRequests}
            </Link>
            
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.requestDetails}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${statusColors[status]}`}>
                    {status}
                </span>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold mb-4">{t.requestInformation}</h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <dt className="text-sm text-gray-500 mb-1">Service Title</dt>
                                <dd className="font-semibold text-gray-900 dark:text-white">{lead.serviceTitle}</dd>
                            </div>
                            <div>
                                <dt className="text-sm text-gray-500 mb-1">Request Date</dt>
                                <dd className="font-medium">{new Date(lead.createdAt).toLocaleString(language)}</dd>
                            </div>
                            {lead.referenceImage && (
                                <div className="sm:col-span-2">
                                    <dt className="text-sm text-gray-500 mb-2">Uploaded Reference</dt>
                                    <dd>
                                        <a href={lead.referenceImage} target="_blank" rel="noreferrer">
                                            <img src={lead.referenceImage} alt="Reference" className="w-32 h-32 object-cover rounded-md border border-gray-200 hover:opacity-90" />
                                        </a>
                                    </dd>
                                </div>
                            )}
                        </dl>
                        
                        {referenceItem && (
                             <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold mb-3 text-amber-600">Referenced Portfolio Item</h3>
                                <div className="flex gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <img src={referenceItem.imageUrl} alt={referenceItem.alt} className="w-20 h-20 object-cover rounded-md"/>
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{referenceItem.title[language]}</p>
                                        <p className="text-sm text-gray-500">{referenceItem.category[language]}</p>
                                        {referenceItem.price && <p className="text-sm font-mono mt-1">{referenceItem.price.toLocaleString()} EGP</p>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold mb-4">{t.management}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                 <select value={status} onChange={e => setStatus(e.target.value as LeadStatus)} className={`w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-amber-500 ${statusColors[status]}`}>
                                    {Object.entries(i18n.dashboard.leadStatus).map(([key, value]) => (<option key={key} value={key}>{value as string}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
                                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-amber-500">
                                    <option value="internal-team">Internal Team</option>
                                    {finishingPartners.map(p => <option key={p.id} value={p.id}>{language === 'ar' ? p.nameAr : p.name}</option>)}
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="bg-amber-500 text-white font-semibold px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50">
                                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold mb-4">{t.customerInformation}</h2>
                         <dl className="space-y-4">
                            <div><dt className="text-xs text-gray-500 uppercase font-bold">Name</dt><dd className="font-medium text-lg">{lead.customerName}</dd></div>
                            <div><dt className="text-xs text-gray-500 uppercase font-bold">Phone</dt><dd className="font-medium font-mono" dir="ltr">{lead.customerPhone}</dd></div>
                            <div><dt className="text-xs text-gray-500 uppercase font-bold">Preferred Contact</dt><dd>{lead.contactTime || 'Any time'}</dd></div>
                         </dl>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-[500px]">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold">Conversation & Notes</h2>
                        </div>
                        <div className="flex-grow overflow-hidden">
                             <ConversationThread 
                                lead={threadEntity} 
                                onMessageSent={refetchRequest} 
                                requestId={request.id} 
                            />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDecorationRequestDetailsPage;
