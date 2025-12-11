import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminPartner, PartnerType, PartnerStatus } from '../../../types';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import { addInternalUser, updateUser } from '../../../services/partners';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';

interface AdminUserFormModalProps {
    userToEdit?: AdminPartner;
    onClose: () => void;
}

interface UserFormData {
    nameAr: string;
    nameEn: string;
    email: string;
    password?: string;
    type: PartnerType;
    status: PartnerStatus;
}

const AdminUserFormModal: React.FC<AdminUserFormModalProps> = ({ userToEdit, onClose }) => {
    const { t } = useLanguage();
    const t_admin = t.adminDashboard;
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormData>();

    useEffect(() => {
        if (userToEdit) {
            reset({
                nameAr: userToEdit.nameAr,
                nameEn: userToEdit.name,
                email: userToEdit.email,
                type: userToEdit.type,
                status: userToEdit.status,
            });
        }
    }, [userToEdit, reset]);

    const addMutation = useMutation({
        mutationFn: (data: Omit<UserFormData, 'status'>) => addInternalUser({
            name: data.nameEn,
            nameAr: data.nameAr,
            email: data.email,
            password: data.password,
            type: data.type
        }),
        onSuccess: () => {
            showToast('User added successfully!', 'success');
            queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] });
            onClose();
        },
        onError: () => showToast('Failed to add user.', 'error'),
    });

    const updateMutation = useMutation({
        mutationFn: (data: { userId: string, updates: UserFormData }) => updateUser(data.userId, {
            name: data.updates.nameEn,
            nameAr: data.updates.nameAr,
            email: data.updates.email,
            type: data.updates.type,
            status: data.updates.status
        }),
        onSuccess: () => {
            showToast('User updated successfully!', 'success');
            queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] });
            onClose();
        },
        onError: () => showToast('Failed to update user.', 'error'),
    });

    const onSubmit = (data: UserFormData) => {
        if (userToEdit) {
            updateMutation.mutate({ userId: userToEdit.id, updates: data });
        } else {
            addMutation.mutate(data);
        }
    };
    
    const isSubmitting = addMutation.isPending || updateMutation.isPending;
    const partnerTypes = Object.entries(t_admin.partnerTypes).filter(([key]) => !['developer', 'agency', 'finishing'].includes(key));

    return (
        <Modal isOpen={true} onClose={onClose} aria-labelledby="user-form-title">
            <ModalHeader onClose={onClose} id="user-form-title">
                {userToEdit ? t_admin.userManagement.editUser : t_admin.userManagement.addUser}
            </ModalHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <ModalContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label>{t_admin.userManagement.form.nameAr}</label><Input {...register('nameAr', { required: true })} /></div>
                        <div><label>{t_admin.userManagement.form.nameEn}</label><Input {...register('nameEn', { required: true })} /></div>
                    </div>
                    <div><label>Email</label><Input type="email" {...register('email', { required: true })} /></div>
                    {!userToEdit && <div><label>{t_admin.userManagement.form.password}</label><Input type="password" {...register('password')} /><p className="text-xs text-gray-500">{t_admin.userManagement.form.passwordHelp}</p></div>}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label>{t_admin.userManagement.role}</label>
                            <Select {...register('type')}>
                                {partnerTypes.map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                            </Select>
                        </div>
                         <div>
                            <label>{t_admin.userManagement.status}</label>
                            <Select {...register('status')}>
                                <option value="active">Active</option>
                                <option value="disabled">Disabled</option>
                            </Select>
                        </div>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button variant="secondary" onClick={onClose} type="button">{t.adminShared.cancel}</Button>
                    <Button type="submit" isLoading={isSubmitting}>{t.adminShared.save}</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default AdminUserFormModal;