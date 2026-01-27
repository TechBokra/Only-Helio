
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAIEstimatorConfig } from '../../services/aiConfig';
import { addLead } from '../../services/leads';
import { generateFinishingAnalysis, AIAnalysisResult } from '../../services/aiService';
import { useLanguage } from '../shared/LanguageContext';
import { useToast } from '../shared/ToastContext';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { 
    CalculatorIcon, 
    CheckCircleIcon, 
    ChevronRightIcon, 
    ChevronLeftIcon, 
    BanknotesIcon,
    SparklesIcon,
    UserPlusIcon,
    PhoneIcon,
    ClipboardDocumentListIcon
} from '../ui/Icons';

const AIEstimator: React.FC = () => {
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const { data: config, isLoading } = useQuery({ queryKey: ['aiEstimatorConfig'], queryFn: getAIEstimatorConfig });

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({}); // stageId -> itemIds
    const [unitArea, setUnitArea] = useState<number>(100);
    
    const [contactForm, setContactForm] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.contactMethods?.phone?.number || ''
    });
    
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

    // Sync user data
    useEffect(() => {
        if (currentUser) {
            setContactForm(prev => ({
                name: prev.name || currentUser.name,
                phone: prev.phone || currentUser.contactMethods?.phone?.number || ''
            }));
        }
    }, [currentUser]);

    const stages = config?.stages || [];
    const currentStage = stages[currentStep];

    const handleToggleItem = (stageId: string, itemId: string) => {
        setSelectedItems(prev => {
            const currentSelection = prev[stageId] || [];
            const newSelection = currentSelection.includes(itemId)
                ? currentSelection.filter(id => id !== itemId)
                : [...currentSelection, itemId];
            setAiResult(null); 
            return { ...prev, [stageId]: newSelection };
        });
    };

    // --- New Range Calculation Logic ---
    const calculateTotals = useMemo(() => {
        if (!config) return { min: 0, max: 0, supervisionMin: 0, supervisionMax: 0, grandTotalMin: 0, grandTotalMax: 0 };
        
        let totalMin = 0;
        let totalMax = 0;
        
        stages.forEach(stage => {
            const selectedInStage = selectedItems[stage.id] || [];
            const allItems = [...stage.basicItems, ...stage.optionalItems];
            
            selectedInStage.forEach(itemId => {
                const item = allItems.find(i => i.id === itemId);
                if (item) {
                    const isPerMeter = item.unit.en === 'm²' || item.unit.ar === 'م²' || item.unit.en === 'm' || item.unit.ar === 'م.ط';
                    const qty = isPerMeter ? unitArea : 1; // Default to 1 for points/pieces
                    
                    totalMin += (item.minPrice || 0) * qty;
                    totalMax += (item.maxPrice || 0) * qty;
                }
            });
        });

        const supervisionRate = config.supervisionRate || 15;
        const supervisionMin = Math.round(totalMin * (supervisionRate / 100));
        const supervisionMax = Math.round(totalMax * (supervisionRate / 100));

        return {
            min: totalMin,
            max: totalMax,
            supervisionMin,
            supervisionMax,
            grandTotalMin: totalMin + supervisionMin,
            grandTotalMax: totalMax + supervisionMax
        };
    }, [config, selectedItems, unitArea, stages]);

    const handleRunAIAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const selectedNames: string[] = [];
            stages.forEach(stage => {
                const selectedInStage = selectedItems[stage.id] || [];
                const allItems = [...stage.basicItems, ...stage.optionalItems];
                allItems.forEach(item => {
                    if (selectedInStage.includes(item.id)) selectedNames.push(item.name[language]);
                });
            });

            // We still call AI for insights, but use our deterministic calc for the base numbers
            const result = await generateFinishingAnalysis(unitArea, selectedNames, language);
            
            // Override with our precise deterministic calculations
            setAiResult({
                ...result,
                lowEstimate: calculateTotals.grandTotalMin,
                highEstimate: calculateTotals.grandTotalMax
            });
        } catch (e) {
            // Fallback if AI fails: Just show our calculated numbers
             setAiResult({
                lowEstimate: calculateTotals.grandTotalMin,
                highEstimate: calculateTotals.grandTotalMax,
                currency: "EGP",
                laborPercentage: 40, // rough estimate
                materialPercentage: 60,
                tips: [],
                marketInsight: config?.globalNotes?.[language] || ""
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const mutation = useMutation({
        mutationFn: addLead,
        onSuccess: () => {
            showToast(language === 'ar' ? 'تم إرسال التقدير بنجاح!' : 'Estimation sent successfully!', 'success');
            navigate('/finishing');
        },
        onError: () => showToast('Failed to submit request.', 'error')
    });

    const handleSubmit = () => {
         const details = `Estimate: ${calculateTotals.grandTotalMin} - ${calculateTotals.grandTotalMax} EGP. Area: ${unitArea}m. Items: ${JSON.stringify(selectedItems)}`;
         mutation.mutate({
            partnerId: 'admin-user',
            serviceType: 'finishing',
            customerName: contactForm.name,
            customerPhone: contactForm.phone,
            contactTime: 'Any time',
            serviceTitle: `Finishing Estimate Request (${unitArea}m)`,
            customerNotes: details,
            managerId: 'platform-finishing-manager-1'
        });
    };

    if (isLoading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;
    if (!config || stages.length === 0) return <div className="p-8 text-center">Config missing.</div>;

    const progress = ((currentStep + 1) / (stages.length + 1)) * 100;

    // Helper to render the breakdown table
    const renderBreakdown = () => {
        return (
            <div className="space-y-4 animate-fadeIn">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg border-b border-gray-200 dark:border-gray-700 pb-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-amber-500" />
                    {language === 'ar' ? 'تفاصيل البنود المختارة' : 'Selected Items Breakdown'}
                </h4>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{language === 'ar' ? 'البند' : 'Item'}</th>
                                <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{language === 'ar' ? 'الوحدة' : 'Unit'}</th>
                                <th scope="col" className="px-4 py-3 text-end text-xs font-medium text-gray-500 uppercase tracking-wider">{language === 'ar' ? 'السعر التقديري' : 'Est. Cost'}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                            {stages.map(stage => {
                                const selectedInStage = selectedItems[stage.id] || [];
                                const allItems = [...stage.basicItems, ...stage.optionalItems];
                                const activeItems = allItems.filter(i => selectedInStage.includes(i.id));
                                
                                if (activeItems.length === 0) return null;

                                return (
                                    <React.Fragment key={stage.id}>
                                        <tr className="bg-amber-50/50 dark:bg-amber-900/10">
                                            <td colSpan={3} className="px-4 py-2 text-sm font-bold text-amber-700 dark:text-amber-500">
                                                {stage.name[language]}
                                            </td>
                                        </tr>
                                        {activeItems.map(item => {
                                            const isPerMeter = item.unit.en === 'm²' || item.unit.ar === 'م²' || item.unit.en === 'm' || item.unit.ar === 'م.ط';
                                            const qty = isPerMeter ? unitArea : 1;
                                            const minCost = (item.minPrice || 0) * qty;
                                            const maxCost = (item.maxPrice || 0) * qty;
                                            
                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                        {item.name[language]}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                                        {item.unit[language]}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-end" dir="ltr">
                                                        {minCost.toLocaleString()} - {maxCost.toLocaleString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <Card className="max-w-4xl mx-auto overflow-hidden shadow-2xl">
                    <CardHeader className="text-center bg-gray-100 dark:bg-gray-900 p-6">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalculatorIcon className="w-8 h-8"/>
                        </div>
                        <CardTitle className="text-3xl font-bold">
                            {language === 'ar' ? 'مقدر التكلفة الذكي' : 'AI Finishing Estimator'}
                        </CardTitle>
                         <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-6">
                            <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-8 min-h-[400px]">
                        {currentStep < stages.length ? (
                            <div className="animate-fadeIn">
                                <h3 className="text-2xl font-bold text-center mb-2">{currentStage.name[language]}</h3>
                                <p className="text-center text-gray-500 mb-8">{language === 'ar' ? 'خطوة' : 'Step'} {currentStep + 1} {language === 'ar' ? 'من' : 'of'} {stages.length}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     {['basicItems', 'optionalItems'].map((type) => (
                                         <div key={type} className="space-y-3">
                                            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b pb-2 mb-3">
                                                {type === 'basicItems' ? (language === 'ar' ? 'أساسيات' : 'Basic') : (language === 'ar' ? 'إضافات' : 'Optional')}
                                            </h4>
                                            {/* @ts-ignore */}
                                            {currentStage[type].map((item: any) => (
                                                <label key={item.id} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${ (selectedItems[currentStage.id] || []).includes(item.id) ? 'bg-amber-50 border-amber-500 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200'}`}>
                                                    <Checkbox 
                                                        checked={(selectedItems[currentStage.id] || []).includes(item.id)}
                                                        onCheckedChange={() => handleToggleItem(currentStage.id, item.id)}
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-grow">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-gray-900 dark:text-white">{item.name[language]}</span>
                                                            <span className="text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                                                                {item.minPrice}-{item.maxPrice}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            <span>/{item.unit[language]}</span>
                                                            {item.minLabor > 0 && (
                                                                <span>{language === 'ar' ? 'مصنعية:' : 'Labor:'} {item.minLabor}-{item.maxLabor}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                     ))}
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fadeIn space-y-8">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold mb-4">{language === 'ar' ? 'المراجعة النهائية' : 'Final Review'}</h3>
                                    <div className="max-w-xs mx-auto mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'ar' ? 'مساحة الوحدة (م²)' : 'Unit Area (m²)'}</label>
                                        <Input type="number" value={unitArea} onChange={(e) => setUnitArea(parseInt(e.target.value, 10))} className="text-center text-lg"/>
                                    </div>
                                </div>

                                {!aiResult ? (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                         <p className="text-gray-600 dark:text-gray-300 mb-4">{language === 'ar' ? 'اضغط لعرض التقرير التفصيلي' : 'Click to view detailed report'}</p>
                                        <Button size="lg" onClick={handleRunAIAnalysis} isLoading={isAnalyzing} className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg">
                                            <SparklesIcon className="w-5 h-5 mr-2" />
                                            {language === 'ar' ? 'تحليل التكلفة' : 'Generate Analysis'}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                                            <h4 className="text-amber-800 dark:text-amber-300 font-semibold mb-4 flex items-center gap-2">
                                                <BanknotesIcon className="w-5 h-5" />
                                                {language === 'ar' ? 'ملخص التكلفة التقديرية' : 'Cost Summary'}
                                            </h4>
                                            
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                                    <span>{language === 'ar' ? 'تكلفة البنود (خامات + مصنعية)' : 'Items Cost (Materials + Labor)'}</span>
                                                    <span className="font-mono">{calculateTotals.min.toLocaleString()} - {calculateTotals.max.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                                    <span>{language === 'ar' ? `نسبة إشراف (${config.supervisionRate}%)` : `Supervision Fees (${config.supervisionRate}%)`}</span>
                                                    <span className="font-mono">{calculateTotals.supervisionMin.toLocaleString()} - {calculateTotals.supervisionMax.toLocaleString()}</span>
                                                </div>
                                                <div className="h-px bg-amber-200 dark:bg-amber-800 my-2"></div>
                                                <div className="flex justify-between items-end">
                                                    <span className="font-bold text-gray-900 dark:text-white">{language === 'ar' ? 'الإجمالي الكلي' : 'Grand Total'}</span>
                                                    <span className="text-2xl font-bold text-amber-700 dark:text-amber-500">
                                                        {calculateTotals.grandTotalMin.toLocaleString()} - {calculateTotals.grandTotalMax.toLocaleString()} <span className="text-sm">EGP</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detailed Breakdown Section */}
                                        {renderBreakdown()}
                                        
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                             <h4 className="font-semibold mb-2 text-gray-900 dark:text-white flex items-center gap-2">
                                                <CheckCircleIcon className="w-5 h-5 text-green-500"/>
                                                {language === 'ar' ? 'ملاحظات هامة' : 'Important Notes'}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                {config.globalNotes?.[language]}
                                            </p>
                                        </div>

                                        {/* Contact & Actions */}
                                         <div id="contact-details-section" className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600 animate-fadeIn">
                                            <h4 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                                                <UserPlusIcon className="w-5 h-5 text-amber-500" />
                                                {language === 'ar' ? 'بيانات التواصل' : 'Contact Details'}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Input value={contactForm.name} onChange={e => setContactForm({...contactForm, name: e.target.value})} placeholder={language === 'ar' ? 'الاسم' : 'Name'} />
                                                <Input value={contactForm.phone} onChange={e => setContactForm({...contactForm, phone: e.target.value})} placeholder={language === 'ar' ? 'الهاتف' : 'Phone'} dir="ltr"/>
                                            </div>
                                        </div>

                                        <div className="flex justify-center pt-4">
                                            <Button size="lg" onClick={handleSubmit} isLoading={mutation.isPending} className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg w-full md:w-auto px-12">
                                                <PhoneIcon className="w-5 h-5" />
                                                {language === 'ar' ? 'تواصل للتنفيذ' : 'Request Execution'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-6 bg-gray-50 dark:bg-gray-900 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
                        <Button variant="secondary" onClick={() => { setCurrentStep(s => s - 1); setAiResult(null); }} disabled={currentStep === 0}>
                            <ChevronLeftIcon className="w-5 h-5 mr-2"/>
                            {language === 'ar' ? 'السابق' : 'Back'}
                        </Button>
                        {currentStep < stages.length && (
                            <Button onClick={() => setCurrentStep(s => s + 1)}>
                                {language === 'ar' ? 'التالي' : 'Next'}
                                <ChevronRightIcon className="w-5 h-5 ml-2"/>
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
};

export default AIEstimator;
