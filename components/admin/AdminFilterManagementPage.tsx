
import React, { useState } from 'react';
import type { FilterOption } from '../../types';
import FilterItemFormModal from './FilterItemFormModal';
import { getAllPropertyTypes, getAllFinishingStatuses, getAllAmenities, getAllProjectTypes, deleteFilterOption as apiDeleteFilterOption } from '../../services/filters';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../shared/LanguageContext';
import { useToast } from '../shared/ToastContext';
import { CalculatorIcon, LockClosedIcon } from '../ui/Icons'; // Import Icons

type DataType = 'propertyType' | 'finishingStatus' | 'amenity' | 'projectType';

const FilterManagerSection: React.FC<{
    title: string;
    items: FilterOption[];
    onAdd: () => void;
    onEdit: (item: FilterOption) => void;
    onDelete: (id: string) => void;
}> = ({ title, items, onAdd, onEdit, onDelete }) => {
    const { language, t } = useLanguage();
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h2>
                <button onClick={onAdd} className="bg-amber-500 text-gray-900 font-semibold px-4 py-2 rounded-lg hover:bg-amber-600">
                    {t.adminShared.add}
                </button>
            </div>
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map(item => (
                    <li key={item.id} className="py-3 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">{item[language]}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.en} / {item.ar}</p>
                            {item.applicableTo && item.applicableTo.length > 0 && (
                                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                    Applies to: {item.applicableTo.join(', ')}
                                </p>
                            )}
                        </div>
                        <div className="space-x-4">
                            <button onClick={() => onEdit(item)} className="text-sm font-medium text-amber-600 hover:text-amber-500">{t.adminShared.edit}</button>
                            <button onClick={() => onDelete(item.id)} className="text-sm font-medium text-red-600 hover:text-red-500">{t.adminShared.delete}</button>
                        </div>
                    </li>
                ))}
                {items.length === 0 && <li className="py-4 text-center text-gray-500">No items found.</li>}
            </ul>
        </div>
    );
};

const SystemFieldsSection: React.FC = () => {
    const { language } = useLanguage();
    
    const fields = [
        { en: 'Price Range', ar: 'نطاق السعر', type: 'Numeric Range' },
        { en: 'Area (m²)', ar: 'المساحة (م²)', type: 'Numeric Range' },
        { en: 'Bedrooms', ar: 'غرف النوم', type: 'Number Input' },
        { en: 'Bathrooms', ar: 'الحمامات', type: 'Number Input' },
        { en: 'Floor Level', ar: 'الدور / الطابق', type: 'Number Input' },
    ];

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
                <CalculatorIcon className="w-6 h-6 text-gray-500" />
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'فلاتر النظام الرقمية' : 'System Numeric Filters'}
                </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {language === 'ar' 
                    ? 'هذه الحقول مدمجة في النظام وتقبل قيم رقمية مفتوحة (مثل السعر والمساحة). لا تحتاج إلى إدارة قوائم لها.'
                    : 'These fields are built-in and accept open numeric values (like price & area). They do not require list management.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {fields.map((field, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col justify-between opacity-80">
                        <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{language === 'ar' ? field.ar : field.en}</p>
                            <p className="text-xs text-gray-500 mt-1">{field.type}</p>
                        </div>
                        <div className="mt-3 flex justify-end" title="System Field">
                            <LockClosedIcon className="w-4 h-4 text-gray-400" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminFilterManagementPage: React.FC = () => {
    const { t } = useLanguage();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [modalState, setModalState] = useState<{ isOpen: boolean; dataType?: DataType; itemToEdit?: FilterOption }>({ isOpen: false });

    const { data: propertyTypes = [], isLoading: ptLoading } = useQuery({ queryKey: ['propertyTypes'], queryFn: getAllPropertyTypes });
    const { data: projectTypes = [], isLoading: prjLoading } = useQuery({ queryKey: ['projectTypes'], queryFn: getAllProjectTypes });
    const { data: finishingStatuses = [], isLoading: fsLoading } = useQuery({ queryKey: ['finishingStatuses'], queryFn: getAllFinishingStatuses });
    const { data: amenities = [], isLoading: amLoading } = useQuery({ queryKey: ['amenities'], queryFn: getAllAmenities });
    
    const deleteMutation = useMutation({
        mutationFn: ({ dataType, itemId }: { dataType: DataType, itemId: string }) => apiDeleteFilterOption(dataType, itemId),
        onSuccess: (_, { dataType }) => {
            showToast('Deleted successfully', 'success');
            if (dataType === 'propertyType') queryClient.invalidateQueries({ queryKey: ['propertyTypes'] });
            else if (dataType === 'projectType') queryClient.invalidateQueries({ queryKey: ['projectTypes'] });
            else if (dataType === 'finishingStatus') queryClient.invalidateQueries({ queryKey: ['finishingStatuses'] });
            else if (dataType === 'amenity') queryClient.invalidateQueries({ queryKey: ['amenities'] });
        },
        onError: () => {
            showToast('Failed to delete item', 'error');
        }
    });

    const handleDelete = (dataType: DataType, itemId: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            deleteMutation.mutate({ dataType, itemId });
        }
    };

    const handleSave = () => {
        setModalState({ isOpen: false });
        queryClient.invalidateQueries({ queryKey: ['propertyTypes'] });
        queryClient.invalidateQueries({ queryKey: ['projectTypes'] });
        queryClient.invalidateQueries({ queryKey: ['finishingStatuses'] });
        queryClient.invalidateQueries({ queryKey: ['amenities'] });
    };
    
    if (ptLoading || fsLoading || amLoading || prjLoading) return <div>Loading filters...</div>;

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            {modalState.isOpen && modalState.dataType && (
                <FilterItemFormModal
                    dataType={modalState.dataType}
                    itemToEdit={modalState.itemToEdit}
                    onClose={() => setModalState({ isOpen: false })}
                    onSave={handleSave}
                />
            )}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Filter Management</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage dropdown options, categories, and filter lists.</p>
            </div>
            
            {/* Added System Fields Section for Clarity */}
            <SystemFieldsSection />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <FilterManagerSection
                    title="Property Types"
                    items={propertyTypes}
                    onAdd={() => setModalState({ isOpen: true, dataType: 'propertyType' })}
                    onEdit={(item) => setModalState({ isOpen: true, dataType: 'propertyType', itemToEdit: item })}
                    onDelete={(id) => handleDelete('propertyType', id)}
                />
                
                <FilterManagerSection
                    title="Project Types"
                    items={projectTypes}
                    onAdd={() => setModalState({ isOpen: true, dataType: 'projectType' })}
                    onEdit={(item) => setModalState({ isOpen: true, dataType: 'projectType', itemToEdit: item })}
                    onDelete={(id) => handleDelete('projectType', id)}
                />
            </div>

            <FilterManagerSection
                title="Finishing Statuses"
                items={finishingStatuses}
                onAdd={() => setModalState({ isOpen: true, dataType: 'finishingStatus' })}
                onEdit={(item) => setModalState({ isOpen: true, dataType: 'finishingStatus', itemToEdit: item })}
                onDelete={(id) => handleDelete('finishingStatus', id)}
            />
            <FilterManagerSection
                title="Amenities"
                items={amenities}
                onAdd={() => setModalState({ isOpen: true, dataType: 'amenity' })}
                onEdit={(item) => setModalState({ isOpen: true, dataType: 'amenity', itemToEdit: item })}
                onDelete={(id) => handleDelete('amenity', id)}
            />
        </div>
    );
};

export default AdminFilterManagementPage;
