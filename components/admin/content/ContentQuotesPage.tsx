
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useFieldArray, UseFormReturn } from 'react-hook-form';
import type { SiteContent } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { TrashIcon, ArrowUpIcon, ArrowDownIcon, QuoteIcon, PlusIcon } from '../../ui/Icons';
import { Card } from '../../ui/Card';

type ContentFormContext = UseFormReturn<SiteContent>;

const ContentQuotesPage: React.FC = () => {
    const { register, control } = useOutletContext<ContentFormContext>();
    const { fields, append, remove, swap } = useFieldArray({ control, name: 'quotes' });

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-500 shadow-sm">
                        <QuoteIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Wisdom Quotes</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            Managing <span className="font-bold text-amber-600 px-1">{fields.length}</span> quotes displayed in the Quiet Zone.
                        </p>
                    </div>
                </div>
                <Button 
                    type="button" 
                    onClick={() => append({ quote: { ar: '', en: '' }, author: { ar: '', en: '' } })} 
                    className="flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                >
                    <PlusIcon className="w-5 h-5" /> Add New Quote
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {fields.map((field, index) => (
                    <div key={field.id} className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300">
                        {/* Action Bar */}
                        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm z-10">
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => swap(index, index - 1)} disabled={index === 0}>
                                <ArrowUpIcon className="w-4 h-4" />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7 hover:bg-gray-100 dark:hover:bg-gray-700" onClick={() => swap(index, index + 1)} disabled={index === fields.length - 1}>
                                <ArrowDownIcon className="w-4 h-4" />
                            </Button>
                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => remove(index)}>
                                <TrashIcon className="w-4 h-4"/>
                            </Button>
                        </div>

                        <div className="p-6 relative">
                            {/* Decorative Quote Mark */}
                            <span className="absolute top-6 left-6 text-8xl text-gray-100 dark:text-gray-800/50 font-serif leading-none pointer-events-none select-none">“</span>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-0">
                                {/* Arabic Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span> 
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Arabic Content</h4>
                                    </div>
                                    <div>
                                        <Textarea 
                                            {...register(`quotes.${index}.quote.ar`)} 
                                            placeholder="نص الاقتباس..." 
                                            dir="rtl" 
                                            rows={3} 
                                            className="text-lg font-medium resize-none bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <Input 
                                            {...register(`quotes.${index}.author.ar`)} 
                                            placeholder="اسم القائل" 
                                            dir="rtl" 
                                            className="text-sm bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800"
                                        />
                                    </div>
                                </div>

                                {/* English Section */}
                                <div className="space-y-4 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-700 lg:pl-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> 
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">English Content</h4>
                                    </div>
                                    <div>
                                        <Textarea 
                                            {...register(`quotes.${index}.quote.en`)} 
                                            placeholder="Quote text..." 
                                            dir="ltr" 
                                            rows={3} 
                                            className="text-lg font-medium resize-none bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <Input 
                                            {...register(`quotes.${index}.author.en`)} 
                                            placeholder="Author Name" 
                                            dir="ltr" 
                                            className="text-sm bg-gray-50/50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900/30 px-6 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400 font-mono">
                            <span>INDEX #{index + 1}</span>
                            <span>ID: {field.id.substring(0, 8)}...</span>
                        </div>
                    </div>
                ))}
            </div>

            {fields.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-800/50 transition-colors">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm mb-4">
                        <QuoteIcon className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No quotes added yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm text-center">Add wisdom quotes to inspire your visitors in the Quiet Zone section.</p>
                    <Button type="button" onClick={() => append({ quote: { ar: '', en: '' }, author: { ar: '', en: '' } })} size="lg">
                        Create First Quote
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ContentQuotesPage;
