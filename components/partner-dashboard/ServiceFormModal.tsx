
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import type { PartnerService } from '../../types';
import { addPartnerService, updatePartnerService } from '../../services/partnerServices';
import { useLanguage } from '../shared/LanguageContext';
import { useToast } from '../shared/ToastContext';
import { useAuth } from '../auth/AuthContext';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Checkbox } from '../ui/Checkbox';

interface ServiceFormModalProps {
    serviceToEdit?: PartnerService;
    onClose: () => void;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ serviceToEdit, onClose }) => {
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    
    const { register, handleSubmit } = useForm<any>({
        defaultValues: serviceToEdit ? {
            titleAr: serviceToEdit.title.ar,
            titleEn: serviceToEdit.title.en,
            descAr: serviceToEdit.description.ar,
            descEn: serviceToEdit.description.en,
            priceAr: serviceToEdit.priceRange?.ar,
            priceEn: serviceToEdit.priceRange?.en,
            timeAr: serviceToEdit.estimatedTime?.ar,
            timeEn: serviceToEdit.estimatedTime?.en,
            isActive: serviceToEdit.isActive
        } : {
            isActive: true
        }
    });

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const payload: any = {
                title: { ar: data.titleAr, en: data.titleEn },
                description: { ar: data.descAr, en: data.descEn },
                priceRange: { ar: data.priceAr, en: data.priceEn },
                estimatedTime: { ar: data.timeAr, en: data.timeEn },
                isActive: data.isActive,
                partnerId: currentUser!.id
            };

            if (serviceToEdit) {
                await updatePartnerService(serviceToEdit.id, payload);
            } else {
                await addPartnerService(payload);
            }
        },
        onSuccess: () => {
            showToast(serviceToEdit ? 'Service updated' : 'Service added', 'success');
            queryClient.invalidateQueries({ queryKey: ['partnerServices'] });
            onClose();
        }
    });

    return (
        <Modal isOpen={true} onClose={onClose} aria-labelledby="service-modal">
            <ModalHeader id="service-modal" onClose={onClose}>
                {serviceToEdit ? (language === 'ar' ? 'تعديل الخدمة' : 'Edit Service') : (language === 'ar' ? 'إضافة خدمة جديدة' : 'Add New Service')}
            </ModalHeader>
            <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
                <ModalContent className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (AR)</label>
                            <Input {...register('titleAr', { required: true })} dir="rtl" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (EN)</label>
                            <Input {...register('titleEn', { required: true })} dir="ltr" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Description (AR)</label>
                            <Textarea {...register('descAr')} rows={3} dir="rtl" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description (EN)</label>
                            <Textarea {...register('descEn')} rows={3} dir="ltr" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Price Range (AR)</label>
                            <Input {...register('priceAr')} dir="rtl" placeholder="مثال: 5000 ج.م" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Price Range (EN)</label>
                            <Input {...register('priceEn')} dir="ltr" placeholder="e.g. 5000 EGP" />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                        <Checkbox {...register('isActive')} id="isActive" />
                        <label htmlFor="isActive" className="text-sm cursor-pointer">
                            {language === 'ar' ? 'نشط (يظهر في الملف الشخصي)' : 'Active (Visible on Profile)'}
                        </label>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="secondary" onClick={onClose}>{t.adminShared.cancel}</Button>
                    <Button type="submit" isLoading={mutation.isPending}>{t.adminShared.save}</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default ServiceFormModal;
