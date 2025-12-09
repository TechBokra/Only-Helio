
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getContactMessages, updateMessageStatus } from '../../../services/messages';
import { useAdminTable } from '../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../shared/Pagination';
import type { ContactMessageModel, RequestStatus } from '../../../types';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { Link } from 'react-router-dom';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent, CardFooter } from '../../ui/Card';

const statusColors: { [key in RequestStatus]?: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    reviewed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const AdminContactRequestsPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard.adminRequests;
    const queryClient = useQueryClient();

    const { data: requests, isLoading } = useQuery({
        queryKey: ['contactRequests'],
        queryFn: getContactMessages,
    });

    const mutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: RequestStatus }) => updateMessageStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contactRequests'] });
        },
    });

    const { paginatedItems, totalPages, currentPage, setCurrentPage } = useAdminTable({
        data: requests,
        itemsPerPage: 10,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: (item: ContactMessageModel, term: string) => item.name.toLowerCase().includes(term) || item.phone.includes(term),
        filterFns: {},
    });

    const renderTable = (items: ContactMessageModel[]) => (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t_admin.table.requester}</TableHead>
                        <TableHead>{t_admin.table.message}</TableHead>
                        <TableHead>{t_admin.table.date}</TableHead>
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
                                <TableCell className="max-w-sm truncate" title={req.message}>
                                    {req.message}
                                </TableCell>
                                <TableCell>{new Date(req.createdAt).toLocaleDateString(language)}</TableCell>
                                <TableCell>
                                    <Select
                                        value={req.status}
                                        onChange={(e) => mutation.mutate({ id: req.id, status: e.target.value as RequestStatus })}
                                        className={`text-xs font-medium w-32 ${statusColors[req.status] || 'bg-gray-100'}`}
                                    >
                                        <option value="new">New</option>
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="closed">Closed</option>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Link to={`/admin/communication/messages/${req.id}`}>
                                        <Button variant="link" size="sm">{t_admin.table.details}</Button>
                                    </Link>
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

    const renderCard = (req: ContactMessageModel) => (
        <Card key={req.id}>
            <CardContent className="p-4 space-y-3">
                 <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{req.name}</h3>
                        <p className="text-sm text-gray-500">{req.phone}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString(language)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 bg-gray-50 dark:bg-gray-800 p-2 rounded">{req.message}</p>
            </CardContent>
            <CardFooter className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                 <span className={`px-2 py-1 rounded text-xs capitalize ${statusColors[req.status] || 'bg-gray-100'}`}>{req.status}</span>
                 <Link to={`/admin/communication/messages/${req.id}`}>
                    <Button variant="ghost" size="sm">{t_admin.table.details}</Button>
                </Link>
            </CardFooter>
        </Card>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_admin.contactRequestsTitle}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">{t_admin.contactRequestsSubtitle}</p>

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
