
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPartnerRequests, updatePartnerRequestStatus } from '../../../services/partnerRequests';
import { useAdminTable } from '../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../shared/Pagination';
import type { PartnerRequest } from '../../../types';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent, CardFooter } from '../../ui/Card';
import { useToast } from '../../shared/ToastContext';

const AdminPartnerRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    const t_shared = t.adminShared;
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    // Fetch Data
    const { data: requests, isLoading } = useQuery({ 
        queryKey: ['partnerRequests'], 
        queryFn: getAllPartnerRequests 
    });

    // Mutation for Inline Status Update
    const statusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => 
            updatePartnerRequestStatus(id, status),
        onSuccess: () => {
            showToast('Status updated successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['partnerRequests'] });
        },
        onError: () => showToast('Failed to update status', 'error')
    });

    // Filter by Tab (Pending vs History)
    const tabFilteredRequests = useMemo(() => {
        if (!requests) return [];
        if (activeTab === 'pending') {
            return requests.filter(r => r.status === 'pending');
        } else {
            return requests.filter(r => r.status === 'approved' || r.status === 'rejected');
        }
    }, [requests, activeTab]);

    // Admin Table Hook with Sorting and Filtering
    const { 
        paginatedItems, 
        totalPages, 
        currentPage, 
        setCurrentPage, 
        searchTerm, 
        setSearchTerm,
        requestSort,
        getSortIcon
    } = useAdminTable({
        data: tabFilteredRequests,
        itemsPerPage: 10,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (item: PartnerRequest, term: string) => 
            item.companyName.toLowerCase().includes(term) || 
            item.contactName.toLowerCase().includes(term) ||
            item.contactPhone.includes(term),
        filterFns: {
            dateRange: (item: PartnerRequest) => {
                if (!dateRange.start && !dateRange.end) return true;
                const date = new Date(item.createdAt).getTime();
                const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
                const end = dateRange.end ? new Date(dateRange.end).setHours(23,59,59,999) : Infinity;
                return date >= start && date <= end;
            }
        },
    });

    const renderTable = (items: PartnerRequest[]) => (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('companyName')}>
                            {t_admin.table.companyInfo} {getSortIcon('companyName')}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('contactName')}>
                            {t_admin.table.primaryContact} {getSortIcon('contactName')}
                        </TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('createdAt')}>
                            {t_admin.table.date} {getSortIcon('createdAt')}
                        </TableHead>
                        <TableHead>{t_admin.table.status}</TableHead>
                        <TableHead>{t_admin.table.actions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={5} className="text-center p-8">Loading...</TableCell></TableRow>
                    ) : items.length > 0 ? (
                        items.map(req => (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <div className="font-medium text-gray-900 dark:text-white">{req.companyName}</div>
                                    <div className="text-sm text-gray-500 capitalize">{req.companyType}</div>
                                </TableCell>
                                <TableCell>
                                    <div>{req.contactName}</div>
                                    <div className="text-sm text-gray-500">{req.contactPhone}</div>
                                </TableCell>
                                <TableCell>{new Date(req.createdAt).toLocaleDateString(language)}</TableCell>
                                <TableCell>
                                    {activeTab === 'pending' ? (
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs"
                                                onClick={() => statusMutation.mutate({ id: req.id, status: 'approved' })}
                                            >
                                                {t_shared.approve}
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="danger" 
                                                className="h-7 px-2 text-xs"
                                                onClick={() => statusMutation.mutate({ id: req.id, status: 'rejected' })}
                                            >
                                                {t_shared.reject}
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                            req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {req.status}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Link to={`/admin/partner-requests/${req.id}`}>
                                        <Button variant="outline" size="sm">
                                            {t_admin.table.details}
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={5} className="text-center p-8">{t_admin.noPartnerRequests}</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    const renderCard = (req: PartnerRequest) => (
        <Card key={req.id}>
            <CardContent className="p-4 space-y-3">
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{req.companyName}</h3>
                        <p className="text-sm text-gray-500 capitalize">{req.companyType}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString(language)}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-semibold">Contact:</span> {req.contactName}</p>
                    <p className="text-gray-500">{req.contactPhone}</p>
                </div>
                
                 {activeTab === 'pending' ? (
                     <div className="flex gap-2 pt-2">
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => statusMutation.mutate({ id: req.id, status: 'approved' })}>{t_shared.approve}</Button>
                        <Button size="sm" variant="danger" className="flex-1" onClick={() => statusMutation.mutate({ id: req.id, status: 'rejected' })}>{t_shared.reject}</Button>
                    </div>
                 ) : (
                    <div className={`text-center py-1 rounded text-xs font-bold ${req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {req.status.toUpperCase()}
                    </div>
                 )}
            </CardContent>
            <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                 <Link to={`/admin/partner-requests/${req.id}`} className="w-full">
                    <Button variant="ghost" className="w-full">{t_admin.table.details}</Button>
                </Link>
            </CardFooter>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.partnerRequestsTitle}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t_admin.partnerRequestsSubtitle}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => { setActiveTab('pending'); setCurrentPage(1); }}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'pending'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    {language === 'ar' ? 'قيد الانتظار' : 'Pending Requests'}
                </button>
                <button
                    onClick={() => { setActiveTab('history'); setCurrentPage(1); }}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === 'history'
                            ? 'border-amber-500 text-amber-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                >
                    {language === 'ar' ? 'الأرشيف' : 'Request Archive'}
                </button>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="md:col-span-2">
                    <Input 
                        placeholder={t.adminDashboard.filter.search} 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                <Input 
                    type="date" 
                    value={dateRange.start} 
                    onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} 
                />
                <Input 
                    type="date" 
                    value={dateRange.end} 
                    onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} 
                />
            </div>

            <ResponsiveList
                items={paginatedItems}
                renderTable={renderTable}
                renderCard={renderCard}
                emptyState={<div className="text-center p-8 text-gray-500">{t_admin.noPartnerRequests}</div>}
            />

            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPartnerRequestsPage;
