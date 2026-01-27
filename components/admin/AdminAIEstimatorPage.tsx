
import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Control, UseFormRegister } from 'react-hook-form';
import type { AIEstimatorConfig } from '../../types';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '../shared/ToastContext';
import { getAIEstimatorConfig, updateAIEstimatorConfig } from '../../services/aiConfig';
import { updateEstimatorPricesWithAI } from '../../services/aiService';
import { inputClasses } from '../ui/FormField';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, CalculatorIcon, SparklesIcon, CheckCircleIcon } from '../ui/Icons';
import { useLanguage } from '../shared/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

const ItemRow: React.FC<{
    control: Control<AIEstimatorConfig>;
    register: UseFormRegister<AIEstimatorConfig>;
    stageIndex: number;
    itemIndex: number;
    removeItem: (index: number) => void;
    itemType: 'basicItems' | 'optionalItems';
}> = ({ register, stageIndex, itemIndex, removeItem, itemType }) => {
    return (
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 mb-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                <div className="md:col-span-2 space-y-2">
                    <input {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.name.ar`)} placeholder="Name (AR)" className={inputClasses} />
                    <input {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.name.en`)} placeholder="Name (EN)" className={inputClasses} />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <input {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.unit.ar`)} placeholder="Unit (AR)" className={inputClasses} />
                    <input {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.unit.en`)} placeholder="Unit (EN)" className={inputClasses} />
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div>
                     <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Total Cost (Min)</label>
                     <input type="number" {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.minPrice`, { valueAsNumber: true })} className={inputClasses} />
                </div>
                <div>
                     <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Total Cost (Max)</label>
                     <input type="number" {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.maxPrice`, { valueAsNumber: true })} className={inputClasses} />
                </div>
                <div>
                     <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Labor Cost (Min)</label>
                     <input type="number" {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.minLabor`, { valueAsNumber: true })} className={inputClasses} />
                </div>
                <div className="relative">
                     <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Labor Cost (Max)</label>
                     <div className="flex gap-2">
                         <input type="number" {...register(`stages.${stageIndex}.${itemType}.${itemIndex}.maxLabor`, { valueAsNumber: true })} className={inputClasses} />
                         <button type="button" onClick={() => removeItem(itemIndex)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/50 self-end">
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StageEditor: React.FC<{
    control: Control<AIEstimatorConfig>;
    register: UseFormRegister<AIEstimatorConfig>;
    stageIndex: number;
    removeStage: (index: number) => void;
    swapStages: (index1: number, index2: number) => void;
    totalStages: number;
}> = ({ control, register, stageIndex, removeStage, swapStages, totalStages }) => {
    const { fields: basicFields, append: appendBasic, remove: removeBasic } = useFieldArray({ control, name: `stages.${stageIndex}.basicItems` });
    const { fields: optionalFields, append: appendOptional, remove: removeOptional } = useFieldArray({ control, name: `stages.${stageIndex}.optionalItems` });

    return (
        <details className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden mb-6" open>
            <summary className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 dark:bg-gray-900/30 select-none">
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 mr-4">
                    <input {...register(`stages.${stageIndex}.name.ar`)} placeholder="Stage Name (AR)" className={inputClasses} onClick={e => e.stopPropagation()}/>
                    <input {...register(`stages.${stageIndex}.name.en`)} placeholder="Stage Name (EN)" className={inputClasses} onClick={e => e.stopPropagation()}/>
                </div>
                 <div className="flex items-center gap-1">
                    <button type="button" onClick={() => swapStages(stageIndex, stageIndex - 1)} disabled={stageIndex === 0} className="p-2 disabled:opacity-30 hover:bg-gray-200 rounded"><ArrowUpIcon className="w-4 h-4"/></button>
                    <button type="button" onClick={() => swapStages(stageIndex, stageIndex + 1)} disabled={stageIndex === totalStages - 1} className="p-2 disabled:opacity-30 hover:bg-gray-200 rounded"><ArrowDownIcon className="w-4 h-4"/></button>
                    <button type="button" onClick={() => window.confirm('Delete stage?') && removeStage(stageIndex)} className="text-red-500 p-2 hover:bg-red-50 rounded"><TrashIcon className="w-4 h-4" /></button>
                </div>
            </summary>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300">Basic Items</h4>
                            <button type="button" onClick={() => appendBasic({ id: `item-${Date.now()}`, name: { ar: '', en: '' }, unit: { ar: '', en: '' }, minPrice: 0, maxPrice: 0, minLabor: 0, maxLabor: 0 })} className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded hover:bg-amber-100">+ Add</button>
                        </div>
                        {basicFields.map((field, index) => <ItemRow key={field.id} control={control} register={register} stageIndex={stageIndex} itemIndex={index} removeItem={removeBasic} itemType="basicItems" />)}
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                            <h4 className="font-bold text-gray-700 dark:text-gray-300">Optional Items</h4>
                             <button type="button" onClick={() => appendOptional({ id: `item-${Date.now()}`, name: { ar: '', en: '' }, unit: { ar: '', en: '' }, minPrice: 0, maxPrice: 0, minLabor: 0, maxLabor: 0 })} className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded hover:bg-amber-100">+ Add</button>
                        </div>
                        {optionalFields.map((field, index) => <ItemRow key={field.id} control={control} register={register} stageIndex={stageIndex} itemIndex={index} removeItem={removeOptional} itemType="optionalItems" />)}
                    </div>
                </div>
            </div>
        </details>
    );
};

const AdminAIEstimatorPage: React.FC = () => {
    const { t, language } = useLanguage();
    const t_page = t.adminDashboard.aiEstimatorSettings;
    const { data: config, isLoading, refetch } = useQuery({ queryKey: ['aiEstimatorConfig'], queryFn: getAIEstimatorConfig });
    const { showToast } = useToast();
    const [isUpdatingWithAI, setIsUpdatingWithAI] = useState(false);

    const { control, register, handleSubmit, reset, getValues, formState: { isSubmitting, isDirty } } = useForm<AIEstimatorConfig>({
        defaultValues: { stages: [], supervisionRate: 15, globalNotes: { ar: '', en: '' } }
    });

    const { fields: stageFields, append, remove, swap } = useFieldArray({ control, name: "stages" });

    useEffect(() => {
        if (config) {
            reset(config);
        }
    }, [config, reset]);

    const onSubmit = async (data: AIEstimatorConfig) => {
        await updateAIEstimatorConfig(data);
        refetch();
        showToast('Estimator settings updated successfully!', 'success');
    };

    const handleAutoUpdate = async () => {
        if (!window.confirm("This will use AI to update prices based on current market data. Continue?")) return;
        
        setIsUpdatingWithAI(true);
        try {
            const currentConfig = getValues();
            const updatedConfig = await updateEstimatorPricesWithAI(currentConfig);
            
            console.log("Updated config from AI:", updatedConfig);
            
            // Hard reset with deep clone to force React Hook Form to re-render all fields
            const newValues = JSON.parse(JSON.stringify(updatedConfig));
            reset(newValues);
            
            showToast("Prices updated from AI! Review changes and click Save.", "success");
        } catch (e: any) {
            console.error(e);
            showToast("Failed to update prices: " + e.message, "error");
        } finally {
            setIsUpdatingWithAI(false);
        }
    };

    if (isLoading || !config) {
        return <div>Loading Estimator settings...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{t_page.title}</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage pricing ranges, labor costs, and supervision fees.</p>
                </div>
                <div className="flex gap-3">
                     <Button 
                        type="button" 
                        onClick={handleAutoUpdate} 
                        isLoading={isUpdatingWithAI}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md flex items-center gap-2"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        {language === 'ar' ? 'تحديث الأسعار بالذكاء الاصطناعي' : 'Auto-Update Prices (AI)'}
                    </Button>
                </div>
            </div>
            
            {config.lastUpdated && (
                <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                    <CheckCircleIcon className="w-4 h-4" />
                    Last AI Market Update: {new Date(config.lastUpdated).toLocaleString()}
                </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><CalculatorIcon className="w-5 h-5 text-amber-500"/> Global Variables</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Supervision Rate (%)</label>
                            <input type="number" {...register('supervisionRate', { valueAsNumber: true })} className={inputClasses + " max-w-[150px]"} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Standard Note (Arabic)</label>
                                <textarea {...register('globalNotes.ar')} className={inputClasses} rows={3} dir="rtl" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Standard Note (English)</label>
                                <textarea {...register('globalNotes.en')} className={inputClasses} rows={3} dir="ltr" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {stageFields.map((field, index) => (
                        <StageEditor 
                            key={field.id} 
                            control={control} 
                            register={register} 
                            stageIndex={index}
                            removeStage={remove}
                            swapStages={swap}
                            totalStages={stageFields.length}
                        />
                    ))}
                </div>

                 <button
                    type="button"
                    onClick={() => append({ id: `stage-${Date.now()}`, name: { ar: '', en: '' }, basicItems: [], optionalItems: [] })}
                    className="w-full text-center font-semibold text-amber-600 bg-amber-50 dark:bg-amber-900/50 hover:bg-amber-100 dark:hover:bg-amber-900 p-4 rounded-lg border-2 border-dashed border-amber-300 dark:border-amber-700"
                >
                    + Add New Stage
                </button>

                <div className="sticky bottom-6 z-20 flex justify-end items-center gap-4 bg-white/90 dark:bg-gray-900/90 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg backdrop-blur-sm">
                    {isDirty && <span className="text-sm font-medium text-amber-600 animate-pulse">Unsaved Changes</span>}
                    <button type="button" onClick={() => reset()} className="mr-4 px-6 py-3 bg-white border border-gray-300 rounded-lg shadow text-gray-700 hover:bg-gray-50">Discard Changes</button>
                    <button type="submit" disabled={isSubmitting} className="bg-amber-500 text-gray-900 font-bold px-8 py-3 rounded-lg hover:bg-amber-600 transition-colors duration-200 disabled:opacity-50 shadow-lg">
                        {isSubmitting ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminAIEstimatorPage;
