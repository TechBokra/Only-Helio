
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPropertyRequests, updatePropertyRequestStatus } from '../../../services/propertyRequests';
import { useAdminTable } from '../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../shared/Pagination';
import type { AddPropertyRequest, RequestStatus } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent, CardFooter } from '../../ui/Card';
import { useToast } from '../../shared/ToastContext';

const AdminPropertyRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    const t_shared = t.adminShared;
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const { data: requests, isLoading } = useQuery({
        queryKey: ['propertyRequests'],
        queryFn: getAllPropertyRequests,
    });

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: RequestStatus }) => updatePropertyRequestStatus(id, status),
        onSuccess: () => {
            showToast('Status updated successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['propertyRequests'] });
        },
        onError: () => showToast('Failed to update status', 'error')
    });

    const filteredRequests = useMemo(() => {
        if (!requests) return [];
        if (activeTab === 'pending') {
            return requests.filter(r => r.status === 'pending');
        } else {
            return requests.filter(r => r.status !== 'pending');
        }
    }, [requests, activeTab]);

    const { paginatedItems, totalPages, currentPage, setCurrentPage, searchTerm, setSearchTerm, requestSort, getSortIcon } = useAdminTable({
        data: filteredRequests,
        itemsPerPage: 10,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (item: AddPropertyRequest, term: string) => 
            (item.customerName || '').toLowerCase().includes(term) ||
            (item.customerPhone || '').includes(term),
        filterFns: {
             dateRange: (item: AddPropertyRequest) => {
                if (!dateRange.start && !dateRange.end) return true;
                const date = new Date(item.createdAt).getTime();
                const start = dateRange.start ? new Date(dateRange.start).getTime() : 0;
                const end = dateRange.end ? new Date(dateRange.end).setHours(23,59,59,999) : Infinity;
                return date >= start && date <= end;
            }
        },
    });

    const getPropInfo = (req: AddPropertyRequest) => {
        const pd = req.propertyDetails || {};
        const type = pd.propertyType?.[language] || pd.propertyType?.en || 'N/A';
        const area = pd.area ? `${pd.area} m²` : '';
        const price = pd.price ? new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
            style: 'currency',
            currency: 'EGP',
            minimumFractionDigits: 0,
        }).format(Number(pd.price)) : '';
        return { type, area, price };
    };

    const renderTable = (items: AddPropertyRequest[]) => (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="cursor-pointer" onClick={() => requestSort('customerName')}>
                            {t_admin.table.requester} {getSortIcon('customerName')}
                        </TableHead>
                        <TableHead>{t_admin.table.propertyInfo}</TableHead>
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
                        items.map((req) => {
                            const info = getPropInfo(req);
                            return (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <div className="font-medium text-gray-900 dark:text-white">{req.customerName || 'Unknown'}</div>
                                        <div className="text-sm text-gray-500">{req.customerPhone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{info.type} {info.area ? `- ${info.area}` : ''}</div>
                                        <div className="text-sm text-gray-500">{info.price}</div>
                                    </TableCell>
                                    <TableCell>{new Date(req.createdAt).toLocaleDateString(language)}</TableCell>
                                    <TableCell>
                                        {activeTab === 'history' ? (
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                                req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                {t_admin.requestStatus[req.status as keyof typeof t_admin.requestStatus] || req.status}
                                            </span>
                                        ) : (
                                             <Select 
                                                value={req.status} 
                                                onChange={e => mutation.mutate({ id: req.id, status: e.target.value as RequestStatus })}
                                                className="w-32 h-8 py-1 text-xs"
                                            >
                                                {Object.entries(t_admin.requestStatus).map(([key, label]) => (
                                                    <option key={key} value={key}>{label as string}</option>
                                                ))}
                                            </Select>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Link to={`/admin/property-requests/${req.id}`}>
                                            <Button variant="outline" size="sm">{t_admin.table.details}</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                         <TableRow><TableCell colSpan={5} className="text-center p-8">{t_admin.noPropertyRequests}</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    const renderCard = (req: AddPropertyRequest) => {
        const info = getPropInfo(req);
        return (
            <Card key={req.id}>
                <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">{req.customerName}</h3>
                            <p className="text-sm text-gray-500">{req.customerPhone}</p>
                        </div>
                        <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString(language)}</span>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                        <p className="text-sm font-semibold text-amber-600">{info.type}</p>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <span>{info.area}</span>
                            <span>{info.price}</span>
                        </div>
                    </div>
                    <div className="pt-2">
                         {activeTab === 'history' ? (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                                {req.status}
                            </span>
                        ) : (
                            <Select 
                                value={req.status} 
                                onChange={e => mutation.mutate({ id: req.id, status: e.target.value as RequestStatus })}
                                className="w-full h-9 py-1 text-sm"
                            >
                                {Object.entries(t_admin.requestStatus).map(([key, label]) => (
                                    <option key={key} value={key}>{label as string}</option>
                                ))}
                            </Select>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                    <Link to={`/admin/property-requests/${req.id}`} className="w-full">
                        <Button variant="ghost" className="w-full">{t_admin.table.details}</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.propertyRequestsTitle}</h1>
                <p className="text-gray-500 dark:text-gray-400">{t_admin.propertyRequestsSubtitle}</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => { setActiveTab('pending'); setCurrentPage(1); }} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                    {language === 'ar' ? 'قيد الانتظار' : 'Pending Requests'}
                </button>
                <button onClick={() => { setActiveTab('history'); setCurrentPage(1); }} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
                    {language === 'ar' ? 'الأرشيف' : 'Archive (History)'}
                </button>
            </div>

             {/* Filters */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <div className="md:col-span-2">
                    <Input placeholder={t.adminDashboard.filter.searchByRequesterOrPhone} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} />
                <Input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} />
            </div>

            <ResponsiveList items={paginatedItems} renderTable={renderTable} renderCard={renderCard} emptyState={<div className="text-center p-8 text-gray-500">{t_admin.noPropertyRequests}</div>} />

            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPropertyRequestsPage;
