
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPartnerServices, deletePartnerService } from '../../services/partnerServices';
import type { PartnerService } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../shared/LanguageContext';
import { Button } from '../ui/Button';
import { PlusIcon, TrashIcon, WrenchScrewdriverIcon } from '../ui/Icons';
import { Card, CardContent } from '../ui/Card';
import ServiceFormModal from './ServiceFormModal';
import ConfirmationModal from '../shared/ConfirmationModal';
import { useToast } from '../shared/ToastContext';

const DashboardServicesPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { language, t } = useLanguage();
    const t_dash = t.dashboard;
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<PartnerService | undefined>(undefined);
    const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

    const { data: services, isLoading } = useQuery({
        queryKey: ['partnerServices', currentUser?.id],
        queryFn: () => getPartnerServices(currentUser!.id),
        enabled: !!currentUser
    });

    const deleteMutation = useMutation({
        mutationFn: deletePartnerService,
        onSuccess: () => {
            showToast('Service deleted successfully', 'success');
            queryClient.invalidateQueries({ queryKey: ['partnerServices'] });
            setServiceToDelete(null);
        }
    });

    const handleEdit = (service: PartnerService) => {
        setServiceToEdit(service);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setServiceToEdit(undefined);
        setIsModalOpen(true);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            {isModalOpen && (
                <ServiceFormModal 
                    onClose={() => setIsModalOpen(false)} 
                    serviceToEdit={serviceToEdit} 
                />
            )}

            {serviceToDelete && (
                <ConfirmationModal
                    isOpen={!!serviceToDelete}
                    onClose={() => setServiceToDelete(null)}
                    onConfirm={() => deleteMutation.mutate(serviceToDelete)}
                    title={t.adminShared.delete}
                    message={t_dash.confirmDeleteWork} // Using generic delete message
                />
            )}

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {language === 'ar' ? 'خدماتي' : 'My Services'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {language === 'ar' ? 'إدارة قائمة الخدمات التي تقدمها للعملاء.' : 'Manage the list of services you offer to clients.'}
                    </p>
                </div>
                <Button onClick={handleCreate} className="flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    {language === 'ar' ? 'إضافة خدمة' : 'Add Service'}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(services || []).map(service => (
                    <Card key={service.id} className="group relative overflow-hidden hover:border-amber-400 transition-colors">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600">
                                    <WrenchScrewdriverIcon className="w-6 h-6" />
                                </div>
                                <div className="flex gap-2">
                                     <Button variant="secondary" size="sm" onClick={() => handleEdit(service)}>
                                        {t.adminShared.edit}
                                    </Button>
                                    <button 
                                        onClick={() => setServiceToDelete(service.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {service.title[language]}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3">
                                {service.description[language]}
                            </p>

                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-sm space-y-2">
                                {service.priceRange && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{language === 'ar' ? 'السعر:' : 'Price:'}</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{service.priceRange[language]}</span>
                                    </div>
                                )}
                                {service.estimatedTime && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">{language === 'ar' ? 'الوقت:' : 'Time:'}</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{service.estimatedTime[language]}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                
                {(services || []).length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                        <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">{language === 'ar' ? 'لم تقم بإضافة خدمات بعد.' : 'You haven\'t added any services yet.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardServicesPage;
