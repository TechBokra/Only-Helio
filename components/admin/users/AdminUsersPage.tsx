
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllPartnersForAdmin, deletePartner } from '../../../services/partners';
import { useAdminTable } from '../../hooks/useAdminTable';
import { useLanguage } from '../../shared/LanguageContext';
import { AdminPartner, PartnerStatus, PartnerType, Role } from '../../../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import Pagination from '../../shared/Pagination';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import ConfirmationModal from '../../shared/ConfirmationModal';
import { ResponsiveList } from '../../shared/ResponsiveList';
import { Card, CardContent } from '../../ui/Card';

const AdminUsersPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const queryClient = useQueryClient();
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const { data: partners, isLoading } = useQuery({
        queryKey: ['allPartnersAdmin'],
        queryFn: getAllPartnersForAdmin,
    });

    const internalUserRoles = [
        Role.SUPER_ADMIN,
        Role.DECORATION_MANAGER,
        Role.PLATFORM_FINISHING_MANAGER,
        Role.FINISHING_MARKET_MANAGER,
        Role.PLATFORM_REAL_ESTATE_MANAGER,
        Role.REAL_ESTATE_MARKET_MANAGER,
        Role.PARTNER_RELATIONS_MANAGER,
        Role.CONTENT_MANAGER,
        Role.SERVICE_MANAGER,
        Role.CUSTOMER_RELATIONS_MANAGER,
        Role.LISTINGS_MANAGER,
    ];

    const users = React.useMemo(() => (partners || []).filter(p => internalUserRoles.includes(p.role)), [partners]);


    const deleteMutation = useMutation({
        mutationFn: deletePartner,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] });
            setUserToDelete(null);
        },
    });

    const {
        paginatedItems,
        totalPages,
        currentPage,
        setCurrentPage,
        searchTerm,
        setSearchTerm,
        filters,
        setFilter,
    } = useAdminTable({
        data: users,
        itemsPerPage: 15,
        initialSort: { key: 'name', direction: 'ascending' },
        searchFn: (p: AdminPartner, term: string) =>
            p.name.toLowerCase().includes(term) ||
            (p.nameAr && p.nameAr.toLowerCase().includes(term)) ||
            p.email.toLowerCase().includes(term),
        filterFns: {
            type: (p: AdminPartner, v) => p.type === v,
            status: (p: AdminPartner, v) => p.status === v,
        },
    });

    const internalUserTypes = Object.entries(t_admin.partnerTypes).filter(
        ([key]) => !['developer', 'agency', 'finishing'].includes(key),
    );

    const renderTable = (items: AdminPartner[]) => (
         <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t_admin.userManagement.user}</TableHead>
                        <TableHead>{t_admin.userManagement.role}</TableHead>
                        <TableHead>{t_admin.userManagement.status}</TableHead>
                        <TableHead>{t_admin.userManagement.actions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                        {isLoading ? (
                        <TableRow><TableCell colSpan={4} className="text-center p-8">Loading users...</TableCell></TableRow>
                    ) : items.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <img src={user.imageUrl} alt={user.name} className="w-10 h-10 rounded-full object-cover"/>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">{language === 'ar' ? user.nameAr : user.name}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="capitalize">{t_admin.partnerTypes[user.type as keyof typeof t_admin.partnerTypes]}</TableCell>
                            <TableCell>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {user.status}
                                </span>
                            </TableCell>
                            <TableCell className="space-x-2">
                                <Link to={`/admin/users/edit/${user.id}`}>
                                    <Button variant="link">{t_admin.userManagement.editUser}</Button>
                                </Link>
                                <Button variant="link" className="text-red-500" onClick={() => setUserToDelete(user.id)}>{t.adminShared.delete}</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );

    const renderCard = (user: AdminPartner) => (
        <Card key={user.id}>
            <CardContent className="p-4 flex items-center gap-4">
                 <img src={user.imageUrl} alt={user.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0"/>
                 <div className="flex-grow min-w-0">
                     <h3 className="font-bold text-gray-900 dark:text-white truncate">{language === 'ar' ? user.nameAr : user.name}</h3>
                     <p className="text-xs text-gray-500 truncate">{user.email}</p>
                     <div className="flex gap-2 mt-2">
                         <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium">{t_admin.partnerTypes[user.type as keyof typeof t_admin.partnerTypes]}</span>
                         <span className={`px-2 py-0.5 rounded text-xs font-medium ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{user.status}</span>
                     </div>
                 </div>
            </CardContent>
            <div className="flex border-t border-gray-200 dark:border-gray-700">
                 <Link to={`/admin/users/edit/${user.id}`} className="flex-1">
                     <Button variant="ghost" className="w-full rounded-none rounded-bl-lg">{t_admin.userManagement.editUser}</Button>
                 </Link>
                 <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
                 <Button variant="ghost" className="flex-1 rounded-none rounded-br-lg text-red-500 hover:bg-red-50" onClick={() => setUserToDelete(user.id)}>{t.adminShared.delete}</Button>
            </div>
        </Card>
    );

    return (
        <div>
            {userToDelete && (
                <ConfirmationModal
                    isOpen={!!userToDelete}
                    onClose={() => setUserToDelete(null)}
                    onConfirm={() => deleteMutation.mutate(userToDelete)}
                    title="Delete User"
                    message={t_admin.userManagement.confirmDelete}
                />
            )}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t_admin.userManagement.title}</h1>
                 <Link to="/admin/users/new">
                    <Button>{t_admin.userManagement.addUser}</Button>
                </Link>
            </div>

            <div className="mb-4 flex gap-4 flex-wrap">
                <Input
                    placeholder={t_admin.filter.searchByNameOrEmail}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                />
                <Select value={filters.type || 'all'} onChange={(e) => setFilter('type', e.target.value)} className="max-w-xs">
                    <option value="all">
                        {t_admin.filter.filterByType} ({t_admin.filter.all})
                    </option>
                    {internalUserTypes.map(([key, value]) => (
                        <option key={key} value={key}>
                            {value as string}
                        </option>
                    ))}
                </Select>
                 <Select value={filters.status || 'all'} onChange={e => setFilter('status', e.target.value)} className="max-w-xs">
                    <option value="all">{t_admin.filter.filterByStatus} ({t_admin.filter.all})</option>
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                </Select>
            </div>
             
            <ResponsiveList 
                items={paginatedItems}
                renderTable={renderTable}
                renderCard={renderCard}
                emptyState={<div className="text-center py-8 text-gray-500">No users found.</div>}
            />

            <div className="mt-4">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
        </div>
    );
};

export default AdminUsersPage;
