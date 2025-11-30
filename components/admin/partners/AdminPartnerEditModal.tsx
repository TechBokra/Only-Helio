

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminPartner, SubscriptionPlan, PartnerDisplayType } from '../../../types';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import { updatePartnerAdmin } from '../../../services/partners';
import { getPlans } from '../../../services/plans';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';

interface AdminPartnerEditModalProps {
    partner: AdminPartner;
    onClose: () => void;
}

const AdminPartnerEditModal: React.FC<AdminPartnerEditModalProps> = ({ partner, onClose }) => {
    const { language, t } = useLanguage();
    const t_admin = t.adminDashboard;
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [plan, setPlan] = useState<SubscriptionPlan>(partner.subscriptionPlan);
    const [endDate, setEndDate] = useState(partner.subscriptionEndDate?.split('T')[0] || '');
    const [displayType, setDisplayType] = useState<PartnerDisplayType>(partner.displayType);
    
    const { data: plansData } = useQueryClient().getQueryData(['plans']) as { data: any };
    const availablePlans = plansData?.[partner.type] ? Object.keys(plansData[partner.type]) : [];

    const mutation = useMutation({
        mutationFn: (updates: Partial<AdminPartner>) => updatePartnerAdmin(partner.id, updates),
        onSuccess: () => {
            showToast('Partner updated successfully!', 'success');
            queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] });
            onClose();
        },
        onError: () => {
            showToast('Failed to update partner.', 'error');
        }
    });

    const handleSave = () => {
        mutation.mutate({ 
            subscriptionPlan: plan, 
            subscriptionEndDate: endDate || undefined,
            displayType: displayType 
        });
    };

    return (
        <Modal isOpen={true} onClose={onClose} aria-labelledby="edit-partner-title">
            <ModalHeader onClose={onClose} id="edit-partner-title">
                {t_admin.editPartnerTitle}: {language === 'ar' ? partner.nameAr : partner.name}
            </ModalHeader>
            <ModalContent className="space-y-4 pt-2">
                <div>
                    <label className="block text-sm font-medium">{t_admin.changePlan}</label>
                    <Select value={plan} onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}>
                        {availablePlans.map((p: string) => <option key={p} value={p}>{p}</option>)}
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium">{t_admin.updateSubscription}</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                 <div>
                    <label className="block text-sm font-medium">{t_admin.partnerTable.displayType}</label>
                    <Select value={displayType} onChange={(e) => setDisplayType(e.target.value as PartnerDisplayType)}>
                        <option value="standard">{t_admin.partnerDisplayTypes.standard}</option>
                        <option value="featured">{t_admin.partnerDisplayTypes.featured}</option>
                        <option value="mega_project">{t_admin.partnerDisplayTypes.mega_project}</option>
                    </Select>
                </div>
            </ModalContent>
            <ModalFooter>
                <Button variant="secondary" onClick={onClose}>{t.adminShared.cancel}</Button>
                <Button onClick={handleSave} isLoading={mutation.isPending}>{t.adminShared.save}</Button>
            </ModalFooter>
        </Modal>
    );
};

export default AdminPartnerEditModal;
