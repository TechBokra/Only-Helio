
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { deleteLead as apiDeleteLead, getAllLeads } from '../../../services/leads';
import { useAdminTable } from '../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Lead, LeadStatus } from '../../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../shared/Pagination';
import { Button } from '../../ui/Button';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent, CardFooter } from '../../ui/Card';
import { useToast } from '../../shared/ToastContext';
import { inputClasses } from '../../ui/FormField';

const statusColors: { [key in LeadStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'site-visit': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    quoted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const AdminDecorationRequestsPage: React.FC = () => {
    const { language, t: i18n } = useLanguage();
    const t = i18n.adminDashboard;
    const t_dash = i18n.dashboard;
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    const { 
        data: allLeads, 
        isLoading, 
        refetch 
    } = useQuery({ 
        queryKey: ['allLeads'], 
        queryFn: getAllLeads
    });

    const decorationLeads = useMemo(() => {
        if (!allLeads) return [];
        
        const relevant = allLeads.filter(lead => lead.serviceType === 'decorations');
        
        if (activeTab === 'pending') {
            return relevant.filter(l => ['new', 'contacted', 'site-visit', 'quoted', 'in-progress'].includes(l.status));
        } else {
            return relevant.filter(l => ['completed', 'cancelled', 'rejected'].includes(l.status));
        }
    }, [allLeads, activeTab]);

    const { 
        paginatedItems, 
        totalPages, 
        currentPage, 
        setCurrentPage,
        searchTerm,
        setSearchTerm,
    } = useAdminTable({
        data: decorationLeads,
        itemsPerPage: 10,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (item: Lead, term: string) => 
            item.customerName.toLowerCase().includes(term) || 
            item.customerPhone.includes(term) ||
            item.serviceTitle.toLowerCase().includes(term),
        filterFns: {}
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
                                <TableCell className="max-w-xs truncate" title={lead.serviceTitle}>{lead.serviceTitle}</TableCell>
                                <TableCell>{new Date(lead.createdAt).toLocaleDateString(language)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${statusColors[lead.status]}`}>
                                        {t_dash.leadStatus[lead.status] || lead.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Link to={`/admin/decoration-requests/${lead.id}`}>
                                            <Button variant="outline" size="sm">{t.adminShared.details}</Button>
                                        </Link>
                                        <Button variant="link" size="sm" className="text-red-500" onClick={() => handleDelete(lead.id)}>{t.adminShared.delete}</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={5} className="text-center p-8">{t.decorationsManagement.noRequests}</TableCell></TableRow>
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
                <Link to={`/admin/decoration-requests/${lead.id}`} className="w-full">
                    <Button variant="ghost" className="w-full">{t.adminShared.details}</Button>
                </Link>
            </CardFooter>
        </Card>
    );

    return (
        <div className="animate-fadeIn">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t.nav.decorationsRequests}</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage all decoration and art requests.</p>
            </div>

            <div className="mb-6 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'pending'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    {language === 'ar' ? 'قيد الانتظار' : 'Pending Requests'}
                </button>
                <button
                    onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'history'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    {language === 'ar' ? 'الأرشيف' : 'Archive (History)'}
                </button>
            </div>

            <div className="my-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1">
                        <input type="text" placeholder={t.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={inputClasses} />
                    </div>
                </div>
            </div>

            <ResponsiveList
                items={paginatedItems}
                renderTable={renderTable}
                renderCard={renderCard}
                emptyState={<div className="text-center p-8 text-gray-500">{t.decorationsManagement.noRequests}</div>}
            />
            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminDecorationRequestsPage;
