
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllPartnerRequests } from '../../../services/partnerRequests';
// FIX: Corrected import path for useAdminTable hook.
import { useAdminTable } from '../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
// FIX: Corrected import path for Pagination from 'ui' to 'shared'.
import Pagination from '../../shared/Pagination';
import type { PartnerRequest } from '../../../types';
import { Button } from '../../ui/Button';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent, CardFooter } from '../../ui/Card';

const AdminPartnerRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

    const { data: requests, isLoading } = useQuery({ 
        queryKey: ['partnerRequests'], 
        queryFn: getAllPartnerRequests 
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
        searchFn: (item: PartnerRequest, term: string) => 
            item.companyName.toLowerCase().includes(term) || 
            item.contactName.toLowerCase().includes(term),
        filterFns: {},
    });

    const renderTable = (items: PartnerRequest[]) => (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t_admin.table.companyInfo}</TableHead>
                        <TableHead>{t_admin.table.primaryContact}</TableHead>
                        <TableHead>{t_admin.table.date}</TableHead>
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
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {t_admin.requestStatus[req.status as keyof typeof t_admin.requestStatus]}
                                    </span>
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
                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        req.status === 'approved' ? 'bg-green-100 text-green-700' :
                        req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                         {t_admin.requestStatus[req.status as keyof typeof t_admin.requestStatus] || req.status}
                    </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                    <p><span className="font-semibold">Contact:</span> {req.contactName}</p>
                    <p className="text-gray-500">{req.contactPhone}</p>
                </div>
                <p className="text-xs text-gray-400 text-right">{new Date(req.createdAt).toLocaleDateString(language)}</p>
            </CardContent>
            <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                 <Link to={`/admin/partner-requests/${req.id}`} className="w-full">
                    <Button variant="ghost" className="w-full">{t_admin.table.details}</Button>
                </Link>
            </CardFooter>
        </Card>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.partnerRequestsTitle}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{t_admin.partnerRequestsSubtitle}</p>
                </div>
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
