
import React, { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Language, Lead, LeadStatus, AdminPartner } from '../../../types';
import { useQuery } from '@tanstack/react-query';
import { getAllLeads, updateLead } from '../../../services/leads';
import { getAllPartnersForAdmin } from '../../../services/partners';
import { getAllPortfolioItems } from '../../../services/portfolio';
import { ArrowLeftIcon } from '../../ui/Icons';
import ConversationThread from '../../shared/ConversationThread';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';

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
    const t = i18n.adminDashboard.decorationsManagement;
    const { data: allLeads, refetch: refetchLeads, isLoading: loadingLeads } = useQuery({ queryKey: ['allLeads'], queryFn: getAllLeads });
    const { data: portfolioItems, isLoading: loadingPortfolio } = useQuery({ queryKey: ['portfolio'], queryFn: getAllPortfolioItems });
    const { data: partners, isLoading: loadingPartners } = useQuery({ queryKey: ['allPartnersAdmin'], queryFn: getAllPartnersForAdmin });
    const isLoading = loadingLeads || loadingPortfolio || loadingPartners;

    const lead = useMemo(() => (allLeads || []).find(l => l.id === requestId), [allLeads, requestId]);
    const finishingPartners = useMemo(() => (partners || []).filter(p => p.type === 'finishing' || p.type === 'service_manager'), [partners]);
    
    const [status, setStatus] = useState<LeadStatus>(lead?.status || 'new');
    const [assignedTo, setAssignedTo] = useState<string>(lead?.assignedTo || 'internal-team');

    React.useEffect(() => {
        if (lead) {
            setStatus(lead.status);
            setAssignedTo(lead.assignedTo || 'internal-team');
        }
    }, [lead]);

    const handleUpdate = async () => {
        if (lead) {
            await updateLead(lead.id, { status, assignedTo });
            refetchLeads();
            showToast('Request updated successfully', 'success');
        }
    };

    if (isLoading) return <div>Loading details...</div>;
    if (!lead) return <div>Request not found.</div>;

    const isCustomRequest = lead.serviceTitle.includes(i18n.customDecorationRequestModal.serviceTitle);
    const referenceWorkTitle = !isCustomRequest ? lead.serviceTitle.replace(`${i18n.decorationRequestModal.reference} `, '') : '';
    const referenceItem = portfolioItems?.find(item => item.title.ar === referenceWorkTitle || item.title.en === referenceWorkTitle);

    return (
        <div className="space-y-6">
             <Link to="/admin/platform-decorations/requests" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                {t.backToRequests}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t.requestDetails}</h1>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                     <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold mb-4">{t.requestInformation}</h2>
                        <dl className="grid grid-cols-2 gap-4">
                            <div><dt className="text-sm text-gray-500">Service</dt><dd className="font-semibold">{lead.serviceTitle}</dd></div>
                            <div><dt className="text-sm text-gray-500">Date</dt><dd>{new Date(lead.createdAt).toLocaleString(language)}</dd></div>
                        </dl>
                        {referenceItem && (
                             <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <h3 className="font-semibold mb-2">Reference Item</h3>
                                <div className="flex gap-4">
                                    <img src={referenceItem.imageUrl} alt={referenceItem.alt} className="w-24 h-24 object-cover rounded-md"/>
                                    <div>
                                        <p className="font-bold">{referenceItem.title[language]}</p>
                                        <p className="text-sm text-gray-500">{referenceItem.category[language]}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold mb-4">{t.management}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                 <select value={status} onChange={e => setStatus(e.target.value as LeadStatus)} className={`w-full mt-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-transparent text-xs font-medium ${statusColors[status]}`}>
                                    {Object.entries(i18n.dashboard.leadStatus).map(([key, value]) => (<option key={key} value={key} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{value as string}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Assign To</label>
                                <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="w-full mt-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700">
                                    <option value="internal-team">Internal Team</option>
                                    {finishingPartners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="text-sm font-medium">Internal Notes</label>
                            <textarea rows={3} placeholder="Add notes for the team..." className="w-full mt-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"></textarea>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <button onClick={handleUpdate} className="bg-amber-500 text-gray-900 font-semibold px-6 py-2 rounded-lg">Save Changes</button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h2 className="text-xl font-bold mb-4">{t.customerInformation}</h2>
                         <dl className="space-y-3">
                            <div><dt className="text-sm text-gray-500">Name</dt><dd className="font-semibold">{lead.customerName}</dd></div>
                            <div><dt className="text-sm text-gray-500">Phone</dt><dd className="font-semibold" dir="ltr">{lead.customerPhone}</dd></div>
                            <div><dt className="text-sm text-gray-500">Preferred Contact</dt><dd>{lead.contactTime}</dd></div>
                         </dl>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold p-6">Conversation</h2>
                         <ConversationThread lead={lead} onMessageSent={refetchLeads} requestId={lead.id} />
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminDecorationRequestDetailsPage;
