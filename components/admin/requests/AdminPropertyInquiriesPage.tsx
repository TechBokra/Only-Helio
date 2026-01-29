
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPropertyInquiries, updatePropertyInquiryStatus, deletePropertyInquiry } from '../../../services/propertyInquiries';
import { useAdminTable } from '../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../shared/Pagination';
import type { PropertyInquiryRequest, RequestStatus } from '../../../types';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import ConfirmationModal from '../../shared/ConfirmationModal';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent, CardFooter } from '../../ui/Card';
import { useToast } from '../../shared/ToastContext';

const AdminPropertyInquiriesPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const t_requests = t_admin.adminRequests;
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

    const { data: requests, isLoading } = useQuery({ queryKey: ['propertyInquiries'], queryFn: getAllPropertyInquiries });

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: RequestStatus }) => updatePropertyInquiryStatus(id, status),
        onSuccess: () => {
             showToast('Status updated successfully', 'success');
             queryClient.invalidateQueries({ queryKey: ['propertyInquiries'] });
        },
        onError: () => showToast('Failed to update status', 'error')
    });

    const deleteMutation = useMutation({
        mutationFn: deletePropertyInquiry,
        onSuccess: () => {
             showToast('Deleted successfully', 'success');
             queryClient.invalidateQueries({ queryKey: ['propertyInquiries'] });
             setRequestToDelete(null);
        },
    });

    const filteredRequests = useMemo(() => {
        if (!requests) return [];
        if (activeTab === 'pending') {
             return requests.filter(r => r.status === 'pending' || r.status === 'new');
        } else {
             return requests.filter(r => r.status !== 'pending' && r.status !== 'new');
        }
    }, [requests, activeTab]);

    const { paginatedItems, totalPages, currentPage, setCurrentPage, searchTerm, setSearchTerm, requestSort, getSortIcon } = useAdminTable({
        data: filteredRequests,
        itemsPerPage: 10,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (item: PropertyInquiryRequest, term: string) =>
            item.customerName.toLowerCase().includes(term) || item.customerPhone.includes(term),
        filterFns: {
             dateRange: (item: PropertyInquiryRequest) => {
                if (!dateRange.start && !dateRange.end) return true;
                const date = new Date(item.createdAt).getTime();
                const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
                const end = dateRange.end ? new Date(dateRange.end).setHours(23,59,59,999) : Infinity;
                return date >= start && date <= end;
            }
        },
    });

    const renderTable = (items: PropertyInquiryRequest[]) => (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('customerName')}>{t_requests.table.requester} {getSortIcon('customerName')}</TableHead>
                        <TableHead>{t_admin.propertyInquiries.table.details}</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('createdAt')}>{t_requests.table.date} {getSortIcon('createdAt')}</TableHead>
                        <TableHead>{t_requests.table.status}</TableHead>
                        <TableHead>{t_requests.table.actions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={5} className="text-center p-8">Loading...</TableCell></TableRow>
                    ) : items.length > 0 ? (
                        items.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <div className="font-medium text-gray-900 dark:text-white">{req.customerName}</div>
                                    <div className="text-sm text-gray-500">{req.customerPhone}</div>
                                </TableCell>
                                <TableCell className="max-w-sm truncate" title={req.details}>{req.details}</TableCell>
                                <TableCell>{new Date(req.createdAt).toLocaleDateString(language)}</TableCell>
                                <TableCell>
                                    <Select
                                        value={req.status}
                                        onChange={(e) => mutation.mutate({ id: req.id, status: e.target.value as RequestStatus })}
                                        className="w-32 h-8 py-1 text-xs"
                                    >
                                        {Object.entries(t_requests.requestStatus).map(([key, value]) => (
                                            <option key={key} value={key}>{value as string}</option>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Link to={`/admin/property-inquiries/${req.id}`}>
                                            <Button variant="outline" size="sm">{t_requests.table.details}</Button>
                                        </Link>
                                        <Button variant="link" className="text-red-500" onClick={() => setRequestToDelete(req.id)}>{t_requests.table.delete}</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={5} className="text-center p-8">{t_admin.propertyInquiries.noRequests}</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    const renderCard = (req: PropertyInquiryRequest) => (
        <Card key={req.id}>
             <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{req.customerName}</h3>
                        <p className="text-sm text-gray-500">{req.customerPhone}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString(language)}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {req.details}
                </div>
                 <div className="pt-2">
                    <Select
                        value={req.status}
                        onChange={(e) => mutation.mutate({ id: req.id, status: e.target.value as RequestStatus })}
                        className="w-full h-9 py-1 text-sm"
                    >
                        {Object.entries(t_requests.requestStatus).map(([key, value]) => (
                            <option key={key} value={key}>{value as string}</option>
                        ))}
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <Link to={`/admin/property-inquiries/${req.id}`} className="w-full">
                    <Button variant="ghost" size="sm" className="w-full">{t_requests.table.details}</Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setRequestToDelete(req.id)}>{t_requests.table.delete}</Button>
            </CardFooter>
        </Card>
    );

    return (
        <div className="space-y-6">
            {requestToDelete && (
                <ConfirmationModal
                    isOpen={!!requestToDelete}
                    onClose={() => setRequestToDelete(null)}
                    onConfirm={() => deleteMutation.mutate(requestToDelete)}
                    title={t_admin.adminShared.delete}
                    message={t_requests.confirmDelete}
                />
            )}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.nav.propertyInquiries}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t_admin.propertyInquiries.subtitle}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => { setActiveTab('pending'); setCurrentPage(1); }} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                    {language === 'ar' ? 'قيد الانتظار' : 'Pending'}
                </button>
                <button onClick={() => { setActiveTab('history'); setCurrentPage(1); }} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                    {language === 'ar' ? 'الأرشيف' : 'Archive'}
                </button>
            </div>

            {/* Filters */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="md:col-span-2">
                    <Input placeholder={t.adminDashboard.filter.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} />
                <Input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} />
            </div>

            <ResponsiveList items={paginatedItems} renderTable={renderTable} renderCard={renderCard} emptyState={<div className="text-center p-8 text-gray-500">{t_admin.propertyInquiries.noRequests}</div>} />

            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPropertyInquiriesPage;
