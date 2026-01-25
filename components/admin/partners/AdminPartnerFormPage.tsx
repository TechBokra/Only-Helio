
import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PartnerRequest, PartnerType, SubscriptionPlan, PartnerDisplayType, AdminPartner, PartnerStatus } from '../../../types';
import { useLanguage } from '../../shared/LanguageContext';
import { useToast } from '../../shared/ToastContext';
import { addPartner, getPartnerById, updatePartnerAdmin } from '../../../services/partners';
import { getPlans } from '../../../services/plans';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Textarea } from '../../ui/Textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { ArrowLeftIcon, UsersIcon } from '../../ui/Icons';

interface PartnerFormValues {
    companyName: string; // En Name
    companyNameAr: string; // Ar Name
    contactEmail: string;
    description: string; // En Description
    descriptionAr: string; // Ar Description
    companyType: PartnerType;
    subscriptionPlan: SubscriptionPlan;
    displayType: PartnerDisplayType;
    endDate?: string;
    status: PartnerStatus;
    password?: string;
}

const AdminPartnerFormPage: React.FC = () => {
    const { partnerId } = useParams();
    const isEdit = !!partnerId;
    const { t, language } = useLanguage();
    const t_admin = t.adminDashboard;
    const { showToast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const { data: plansData } = useQuery({ queryKey: ['plans'], queryFn: getPlans });
    
    // For Edit Mode: Fetch Partner
    const { data: partnerToEdit, isLoading: loadingPartner } = useQuery({
        queryKey: ['partner', partnerId],
        queryFn: () => getPartnerById(partnerId!),
        enabled: isEdit
    });

    const { register, handleSubmit, reset, watch } = useForm<PartnerFormValues>({
        defaultValues: {
            companyType: 'agency',
            subscriptionPlan: 'basic',
            displayType: 'standard',
            status: 'active'
        }
    });

    useEffect(() => {
        if (isEdit && partnerToEdit) {
            const p = partnerToEdit as AdminPartner;
            reset({
                companyName: p.name, // Maps to name_en
                companyNameAr: p.nameAr, // Maps to name_ar
                contactEmail: p.email,
                companyType: p.type,
                subscriptionPlan: p.subscriptionPlan,
                displayType: p.displayType,
                endDate: p.subscriptionEndDate?.split('T')[0],
                description: p.description, // Maps to description_en
                descriptionAr: p.descriptionAr, // Maps to description_ar
                status: p.status
            });
        }
    }, [isEdit, partnerToEdit, reset]);

    const addMutation = useMutation({
        mutationFn: ({ data, status }: { data: PartnerRequest, status: PartnerStatus }) => addPartner(data, status),
        onSuccess: () => {
            showToast('Partner added successfully!', 'success');
            queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] });
            navigate('/admin/partners/list');
        },
        onError: () => showToast('Failed to add partner.', 'error'),
    });

    const updateMutation = useMutation({
        mutationFn: (updates: any) => updatePartnerAdmin(partnerId!, updates),
        onSuccess: () => {
            showToast('Partner updated successfully!', 'success');
            queryClient.invalidateQueries({ queryKey: ['allPartnersAdmin'] });
            queryClient.invalidateQueries({ queryKey: ['partner', partnerId] });
            navigate('/admin/partners/list');
        },
        onError: () => showToast('Failed to update partner.', 'error'),
    });

    const onSubmit = (data: PartnerFormValues) => {
        if (isEdit) {
            // Correctly map form fields to API update payload (which expects nameEn, nameAr etc)
            const updates: any = {
                subscriptionPlan: data.subscriptionPlan,
                subscriptionEndDate: data.endDate || undefined,
                displayType: data.displayType,
                status: data.status,
                nameEn: data.companyName,
                nameAr: data.companyNameAr,
                email: data.contactEmail,
                descriptionEn: data.description,
                descriptionAr: data.descriptionAr,
                type: data.companyType
            };
            
            if (data.password) {
                updates.password = data.password;
            }

             updateMutation.mutate(updates);
        } else {
             // Construct a valid PartnerRequest object with defaults for missing fields
             const fullData: PartnerRequest = {
                companyName: data.companyName, // Usually EN name for request
                // In a real add partner request flow from admin, we might want to support AR name explicitly if the API supported it directly
                // For now sticking to request interface
                contactEmail: data.contactEmail,
                companyType: data.companyType,
                subscriptionPlan: data.subscriptionPlan,
                description: data.description,
                
                // Defaults for required fields not in this form
                id: `temp-${Date.now()}`,
                createdAt: new Date().toISOString(),
                documents: [],
                managementContacts: [],
                logo: 'https://via.placeholder.com/150',
                status: 'approved',
                contactName: 'Admin Entry',
                contactPhone: '',
                companyAddress: 'N/A',
                website: ''
            };
            addMutation.mutate({ data: fullData, status: data.status });
        }
    };

    const companyType = watch('companyType');
    const partnerTypes = ['developer', 'agency', 'finishing'];
    const availablePlans = plansData && companyType ? Object.keys(plansData[companyType as keyof typeof plansData] || {}) : ['basic', 'professional', 'elite', 'commission'];
    const partnerStatuses = Object.entries(t_admin.partnerStatuses);

    if (isEdit && loadingPartner) return <div>Loading Partner...</div>;

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="mb-6">
                <Link to="/admin/partners/list" className="inline-flex items-center gap-2 text-amber-600 hover:underline mb-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                    {t.adminShared.backToList}
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {isEdit ? t_admin.editPartnerTitle : "Add New Partner"}
                </h1>
            </div>

            <Card>
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <UsersIcon className="w-6 h-6 text-amber-600 dark:text-amber-500" />
                        </div>
                        <CardTitle>{isEdit ? (partnerToEdit as any)?.name : 'Business Details'}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Name (English)</label>
                                <Input {...register('companyName', { required: true })} placeholder="e.g. Sunrise Developments" dir="ltr" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Company Name (Arabic)</label>
                                <Input {...register('companyNameAr')} placeholder="مثال: شروق للتطوير العقاري" dir="rtl" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Email</label>
                            <Input type="email" {...register('contactEmail', { required: true })} placeholder="contact@company.com" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Password</label>
                            <Input type="password" {...register('password')} placeholder={isEdit ? "Leave blank to keep current password" : "Required for new partner"} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Description (English)</label>
                                <Textarea {...register('description')} rows={3} dir="ltr" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Description (Arabic)</label>
                                <Textarea {...register('descriptionAr')} rows={3} dir="rtl" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">{t_admin.partnerTable.type}</label>
                                <Select {...register('companyType')} disabled={isEdit}>
                                    {partnerTypes.map(type => <option key={type} value={type}>{t_admin.partnerTypes[type as keyof typeof t_admin.partnerTypes]}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">{t_admin.partnerTable.subscriptionPlan}</label>
                                <Select {...register('subscriptionPlan')}>
                                    {availablePlans.map((plan: string) => <option key={plan} value={plan}>{plan}</option>)}
                                </Select>
                            </div>
                        </div>

                        {isEdit && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t_admin.updateSubscription}</label>
                                    <Input type="date" {...register('endDate')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">{t_admin.partnerTable.displayType}</label>
                                    <Select {...register('displayType')}>
                                        <option value="standard">{t_admin.partnerDisplayTypes.standard}</option>
                                        <option value="featured">{t_admin.partnerDisplayTypes.featured}</option>
                                        <option value="mega_project">{t_admin.partnerDisplayTypes.mega_project}</option>
                                    </Select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium mb-1">{t_admin.partnerTable.status}</label>
                                    <Select {...register('status')}>
                                        {partnerStatuses.map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                                    </Select>
                                </div>
                            </div>
                        )}
                        
                        {!isEdit && (
                            <div className="bg-amber-50 p-3 rounded text-xs text-amber-800">
                                Note: If password is left blank, 'password123' will be assigned by default.
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700 gap-3">
                            <Button variant="secondary" type="button" onClick={() => navigate('/admin/partners/list')}>{t.adminShared.cancel}</Button>
                            <Button type="submit" isLoading={addMutation.isPending || updateMutation.isPending}>{t.adminShared.save}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminPartnerFormPage;
