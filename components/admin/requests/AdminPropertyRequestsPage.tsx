
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllPropertyRequests } from '../../../services/propertyRequests';
import { useAdminTable } from '../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../shared/Pagination';
import type { AddPropertyRequest } from '../../../types';
import { Button } from '../../ui/Button';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent, CardFooter } from '../../ui/Card';
import CardSkeleton from '../../ui/CardSkeleton';
import TableSkeleton from '../../shared/TableSkeleton';

const AdminPropertyRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    const { data: requests, isLoading } = useQuery({
        queryKey: ['propertyRequests'],
        queryFn: getAllPropertyRequests,
    });

    const filteredRequests = useMemo(() => {
        if (!requests) return [];
        if (activeTab === 'pending') {
            return requests.filter(r => r.status === 'pending');
        } else {
            return requests.filter(r => r.status === 'approved' || r.status === 'rejected');
        }
    }, [requests, activeTab]);

    const { paginatedItems, totalPages, currentPage, setCurrentPage } = useAdminTable({
        data: filteredRequests,
        itemsPerPage: 10,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (item: AddPropertyRequest, term: string) => 
            (item.customerName || '').toLowerCase().includes(term),
        filterFns: {},
    });

    const safeDate = (dateStr: string | undefined) => {
        try {
            if (!dateStr) return 'N/A';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return 'Invalid Date';
            return d.toLocaleDateString(language);
        } catch (e) {
            return 'Error Date';
        }
    };

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
                        <TableHead>{t_admin.table.requester}</TableHead>
                        <TableHead>{t_admin.table.propertyInfo}</TableHead>
                        <TableHead>{t_admin.table.date}</TableHead>
                        <TableHead>{t_admin.table.status}</TableHead>
                        <TableHead>{t_admin.table.actions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((req) => {
                        const info = getPropInfo(req);
                        return (
                            <TableRow key={req.id}>
                                <TableCell>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {req.customerName || 'Unknown'}
                                    </div>
                                    <div className="text-sm text-gray-500">{req.customerPhone || 'No Phone'}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">
                                        {info.type} {info.area ? `- ${info.area}` : ''}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {info.price}
                                    </div>
                                </TableCell>
                                <TableCell>{safeDate(req.createdAt)}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {t_admin.requestStatus[req.status as keyof typeof t_admin.requestStatus] || req.status}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Link to={`/admin/property-requests/${req.id}`}>
                                        <Button variant="outline" size="sm">
                                            {t_admin.table.details}
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        );
                    })}
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
                            <h3 className="font-bold text-gray-900 dark:text-white">{req.customerName || 'Unknown'}</h3>
                            <p className="text-sm text-gray-500">{req.customerPhone}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                        }`}>
                            {t_admin.requestStatus[req.status as keyof typeof t_admin.requestStatus] || req.status}
                        </span>
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                        <p className="text-sm font-semibold text-amber-600">{info.type}</p>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mt-1">
                            <span>{info.area}</span>
                            <span>{info.price}</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 text-right">{safeDate(req.createdAt)}</p>
                </CardContent>
                <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                    <Link to={`/admin/property-requests/${req.id}`} className="w-full">
                        <Button variant="ghost" className="w-full">{t_admin.table.details}</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    };

    const loadingSkeletons = (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
            <div className="hidden lg:block">
                <TableSkeleton cols={5} />
            </div>
        </>
    );

    return (
        <div>
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

            {isLoading ? loadingSkeletons : (
                <ResponsiveList
                    items={paginatedItems}
                    renderTable={renderTable}
                    renderCard={renderCard}
                    emptyState={<div className="text-center p-8 text-gray-500">{t_admin.noPropertyRequests}</div>}
                />
            )}

            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminPropertyRequestsPage;
