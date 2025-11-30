import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Language, Lead, LeadStatus } from '../../../types';
import { useQuery } from '@tanstack/react-query';
import { getAllLeads, deleteLead as apiDeleteLead } from '../../../services/leads';
import { inputClasses } from '../../ui/FormField';
// FIX: Corrected import path for Pagination from 'ui' to 'shared'.
import Pagination from '../../shared/Pagination';
import { useLanguage } from '../../shared/LanguageContext';
// FIX: Corrected import path for useAdminTable hook.
import { useAdminTable } from '../../hooks/useAdminTable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent, CardFooter } from '../../ui/Card';
import { Button } from '../../ui/Button';

const statusColors: { [key in LeadStatus]: string } = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    contacted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'site-visit': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300',
    quoted: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const ITEMS_PER_PAGE = 10;

const RequestsManagement: React.FC = () => {
    const { language, t: i18n } = useLanguage();
    const t = i18n.adminDashboard.decorationsManagement;
    const { data: allLeads, refetch: refetchLeads, isLoading: loadingLeads } = useQuery({ queryKey: ['allLeads'], queryFn: getAllLeads });
    const loading = loadingLeads;

    const decorationLeads = useMemo(() => (allLeads || []).filter(lead => lead.serviceType === 'decorations'), [allLeads]);

    const {
        paginatedItems, totalPages, currentPage, setCurrentPage,
        setFilter, requestSort, getSortIcon
    } = useAdminTable({
        data: decorationLeads,
        itemsPerPage: ITEMS_PER_PAGE,
        initialSort: { key: 'createdAt', direction: 'descending' },
        searchFn: () => true, // No search on this page
        filterFns: {
            startDate: (l: Lead, v: string) => new Date(l.createdAt) >= new Date(v),
            endDate: (l: Lead, v: string) => new Date(l.createdAt) <= new Date(v),
        }
    });

    const handleDelete = async (itemId: string) => {
        if (window.confirm(t.confirmDelete)) {
            await apiDeleteLead(itemId);
            refetchLeads();
        }
    };

    const renderTable = (items: Lead[]) => (
        <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                       <TableRow>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('customerName')}>Customer{getSortIcon('customerName')}</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('serviceTitle')}>Service{getSortIcon('serviceTitle')}</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('createdAt')}>Date{getSortIcon('createdAt')}</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => requestSort('status')}>Status{getSortIcon('status')}</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center p-8">Loading...</TableCell></TableRow>
                        ) : items.length > 0 ? (
                            items.map(lead => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium text-gray-900 dark:text-white">{lead.customerName}<br/><span className="font-normal text-gray-500">{lead.customerPhone}</span></TableCell>
                                    <TableCell>{lead.serviceTitle}</TableCell>
                                    <TableCell>{new Date(lead.createdAt).toLocaleDateString(language)}</TableCell>
                                    <TableCell><span className={`px-2 py-1 text-xs rounded-full ${statusColors[lead.status]}`}>{i18n.dashboard.leadStatus[lead.status]}</span></TableCell>
                                    <TableCell className="space-x-4">
                                        <Link to={`/admin/platform-decorations/requests/${lead.id}`} className="font-medium text-amber-600 hover:underline">View</Link>
                                        <button onClick={() => handleDelete(lead.id)} className="font-medium text-red-600 hover:underline">{i18n.adminShared.delete}</button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} className="text-center p-8">{t.noRequests}</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
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
                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[lead.status]}`}>
                        {i18n.dashboard.leadStatus[lead.status]}
                    </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{lead.serviceTitle}</p>
                <p className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString(language)}</p>
            </CardContent>
            <CardFooter className="p-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(lead.id)}>
                    {i18n.adminShared.delete}
                </Button>
                <Link to={`/admin/platform-decorations/requests/${lead.id}`}>
                    <Button variant="ghost" size="sm" className="text-amber-600 hover:bg-amber-50">View</Button>
                </Link>
            </CardFooter>
        </Card>
    );
    
    return (
        <div className="animate-fadeIn">
             <div className="mb-4 flex gap-4">
                <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">{t.startDate}</label>
                    <input type="date" onChange={e => setFilter('startDate', e.target.value)} className={inputClasses}/>
                </div>
                 <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">{t.endDate}</label>
                    <input type="date" onChange={e => setFilter('endDate', e.target.value)} className={inputClasses}/>
                </div>
            </div>

            <ResponsiveList
                items={paginatedItems}
                renderTable={renderTable}
                renderCard={renderCard}
                emptyState={<div className="text-center p-8">{t.noRequests}</div>}
            />

            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default RequestsManagement;