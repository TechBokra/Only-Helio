
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllContactRequests, updateContactRequestStatus, deleteContactRequest } from '../../../services/contactRequests';
import { useAdminTable } from '../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../shared/Pagination';
import type { ContactRequest, RequestStatus } from '../../../types';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import ConfirmationModal from '../../shared/ConfirmationModal';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent, CardFooter } from '../../ui/Card';
import { useToast } from '../../shared/ToastContext';

const AdminContactRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    const t_shared = t.adminShared;
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [requestToDelete, setRequestToDelete] = useState<string | null>(null);

    const { data: requests, isLoading } = useQuery({ queryKey: ['contactRequests'], queryFn: getAllContactRequests });

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: RequestStatus }) => updateContactRequestStatus(id, status),
        onSuccess: () => {
            showToast('Status updated successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['contactRequests'] });
        },
        onError: () => showToast('Failed to update status', 'error')
    });

    const deleteMutation = useMutation({
        mutationFn: deleteContactRequest,
        onSuccess: () => {
            showToast('Request deleted', 'success');
            queryClient.invalidateQueries({ queryKey: ['contactRequests'] });
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
        searchFn: (item: ContactRequest, term: string) => item.name.toLowerCase().includes(term) || item.phone.includes(term),
        filterFns: {
             dateRange: (item: ContactRequest) => {
                if (!dateRange.start && !dateRange.end) return true;
                const date = new Date(item.createdAt).getTime();
                const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
                const end = dateRange.end ? new Date(dateRange.end).setHours(23,59,59,999) : Infinity;
                return date >= start && date <= end;
            }
        },
    });

    const renderTable = (items: ContactRequest[]) => (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>{t_admin.table.requester} {getSortIcon('name')}</TableHead>
                        <TableHead>{t_admin.table.message}</TableHead>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('createdAt')}>{t_admin.table.date} {getSortIcon('createdAt')}</TableHead>
                        <TableHead>{t_admin.table.status}</TableHead>
                        <TableHead>{t_admin.table.actions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow><TableCell colSpan={5} className="text-center p-8">Loading...</TableCell></TableRow>
                    ) : items.length > 0 ? (
                        items.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <div className="font-medium text-gray-900 dark:text-white">{req.name}</div>
                                    <div className="text-sm text-gray-500">{req.phone}</div>
                                </TableCell>
                                <TableCell className="max-w-sm truncate" title={req.message}>{req.message}</TableCell>
                                <TableCell>{new Date(req.createdAt).toLocaleDateString(language)}</TableCell>
                                <TableCell>
                                     <Select
                                        value={req.status}
                                        onChange={(e) => mutation.mutate({ id: req.id, status: e.target.value as RequestStatus })}
                                        className="w-32 h-8 py-1 text-xs"
                                    >
                                        {Object.entries(t_admin.requestStatus).map(([key, value]) => (
                                            <option key={key} value={key}>{value as string}</option>
                                        ))}
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Link to={`/admin/contact-requests/${req.id}`}>
                                            <Button variant="outline" size="sm">{t_admin.table.details}</Button>
                                        </Link>
                                        <Button variant="link" className="text-red-500" onClick={() => setRequestToDelete(req.id)}>{t_admin.table.delete}</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow><TableCell colSpan={5} className="text-center p-8">{t_admin.noContactRequests}</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    const renderCard = (req: ContactRequest) => (
        <Card key={req.id}>
            <CardContent className="p-4 space-y-3">
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{req.name}</h3>
                        <p className="text-sm text-gray-500">{req.phone}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString(language)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 bg-gray-50 dark:bg-gray-800 p-2 rounded">{req.message}</p>
                 <div className="pt-2">
                    <Select
                        value={req.status}
                        onChange={(e) => mutation.mutate({ id: req.id, status: e.target.value as RequestStatus })}
                        className="w-full h-9 py-1 text-sm"
                    >
                        {Object.entries(t_admin.requestStatus).map(([key, value]) => (
                            <option key={key} value={key}>{value as string}</option>
                        ))}
                    </Select>
                </div>
            </CardContent>
            <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                 <Link to={`/admin/contact-requests/${req.id}`} className="w-full">
                    <Button variant="ghost" size="sm" className="w-full">{t_admin.table.details}</Button>
                </Link>
                 <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setRequestToDelete(req.id)}>{t_admin.table.delete}</Button>
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
                    title={t_shared.delete}
                    message={t_admin.confirmDelete}
                />
            )}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.contactRequestsTitle}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t_admin.contactRequestsSubtitle}</p>
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

            <ResponsiveList
                items={paginatedItems}
                renderTable={renderTable}
                renderCard={renderCard}
                emptyState={<div className="text-center p-8 text-gray-500">{t_admin.noContactRequests}</div>}
            />

            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminContactRequestsPage;
