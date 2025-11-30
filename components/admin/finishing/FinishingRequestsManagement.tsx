import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllLeads, deleteLead as apiDeleteLead } from '../../../services/leads';
// FIX: Corrected import path for useAdminTable hook.
import { useAdminTable } from '../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Lead, LeadStatus } from '../../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
// FIX: Corrected import path for Pagination from 'ui' to 'shared'.
import Pagination from '../../shared/Pagination';
import { Button } from '../../ui/Button';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent, CardFooter } from '../../ui/Card';
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

const FinishingRequestsManagement: React.FC = () => {
    const { language, t } = useLanguage();
    const t_dash = t.dashboard;
    const t_page = t.adminDashboard.finishingManagement;
    const { showToast } = useToast();

    const { data: allLeads, isLoading, refetch } = useQuery({ 
        queryKey: ['allLeadsAdmin'], 
        queryFn: getAllLeads 
    });

    const platformFinishingLeads = useMemo(() => {
        return (allLeads || []).filter(l => 
            l.serviceType === 'finishing' && (l.partnerId === 'admin-user' || l.assignedTo === 'admin-user' || l.assignedTo === 'platform-finishing-manager-1')
        );
    }, [allLeads]);

    const { paginatedItems, totalPages, currentPage, setCurrentPage } = useAdminTable({
        data: platformFinishingLeads,
        itemsPerPage: 10,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (item: Lead, term) => item.customerName.toLowerCase().includes(term),
        filterFns: {},
    });

    const handleDelete = async (id: string) => {
        if (window.confirm(t.adminShared.confirmDelete)) {
            await apiDeleteLead(id);
            showToast('Request deleted successfully', 'success');
            refetch();
        }
    };

    const renderTable = (items: Lead[]) => (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t_dash.leadTable.customer}</TableHead>
                        <TableHead>{t_dash.leadTable.service}</TableHead>
                        <TableHead>{t_dash.leadTable.date}</TableHead>
                        <TableHead>{t_dash.leadTable.status}</TableHead>
                        <TableHead>{t_dash.leadTable.actions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={5} className="text-center p-8">Loading requests...</TableCell></TableRow>
                    ) : items.length > 0 ? (
                        items.map(lead => (
                            <TableRow key={lead.id}>
                                <TableCell className="font-medium">
                                    {lead.customerName}
                                    <div className="text-xs text-gray-500">{lead.customerPhone}</div>
                                </TableCell>
                                <TableCell>{lead.serviceTitle}</TableCell>
                                <TableCell>{new Date(lead.createdAt).toLocaleDateString(language)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[lead.status]}`}>
                                        {t_dash.leadStatus[lead.status] || lead.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Link to={`/admin/requests/${lead.id}`}>
                                            <Button variant="link" size="sm">View Details</Button>
                                        </Link>
                                        <Button variant="link" size="sm" className="text-red-500" onClick={() => handleDelete(lead.id)}>{t.adminShared.delete}</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={5} className="text-center p-8">{t_page.noPlatformRequests}</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    const renderCard = (lead: Lead) => (
        <Card key={lead.id}>
            <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{lead.customerName}</h3>
                        <p className="text-sm text-gray-500">{lead.customerPhone}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[lead.status]}`}>
                        {t_dash.leadStatus[lead.status] || lead.status}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{lead.serviceTitle}</p>
                <p className="text-xs text-gray-400 text-right">{new Date(lead.createdAt).toLocaleDateString(language)}</p>
            </CardContent>
            <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <Button variant="ghost" size="sm" onClick={() => handleDelete(lead.id)} className="text-red-500">{t.adminShared.delete}</Button>
                <Link to={`/admin/requests/${lead.id}`} className="w-full">
                    <Button variant="ghost" className="w-full">View Details</Button>
                </Link>
            </CardFooter>
        </Card>
    );

    return (
        <div className="animate-fadeIn">
            <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{t_dash.leadsTitle}</h2>
            </div>
            <ResponsiveList
                items={paginatedItems}
                renderTable={renderTable}
                renderCard={renderCard}
                emptyState={<div className="text-center p-8 text-gray-500">{t_page.noPlatformRequests}</div>}
            />
            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default FinishingRequestsManagement;