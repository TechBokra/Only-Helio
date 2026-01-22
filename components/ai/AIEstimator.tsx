
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
    ChartBarIcon,
    UserPlusIcon
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
    
    // Contact State
    const [contactForm, setContactForm] = useState({
        name: currentUser?.name || '',
        phone: currentUser?.phone || ''
    });

    // Sync user data if logged in
    useEffect(() => {
        if (currentUser) {
            setContactForm(prev => ({
                name: prev.name || currentUser.name,
                phone: prev.phone || currentUser.phone || ''
            }));
        }
    }, [currentUser]);
    
    // AI Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

    const stages = config?.stages || [];
    const currentStage = stages[currentStep];

    const handleToggleItem = (stageId: string, itemId: string) => {
        setSelectedItems(prev => {
            const currentSelection = prev[stageId] || [];
            const newSelection = currentSelection.includes(itemId)
                ? currentSelection.filter(id => id !== itemId)
                : [...currentSelection, itemId];
            
            // Invalidate AI result if selection changes
            setAiResult(null); 
            return { ...prev, [stageId]: newSelection };
        });
    };

    const staticTotalPrice = useMemo(() => {
        if (!config) return 0;
        let total = 0;
        stages.forEach(stage => {
            const selectedInStage = selectedItems[stage.id] || [];
            const allItems = [...stage.basicItems, ...stage.optionalItems];
            selectedInStage.forEach(itemId => {
                const item = allItems.find(i => i.id === itemId);
                if (item) {
                    const isPerMeter = item.unit.en === 'm²' || item.unit.ar === 'م²';
                    total += isPerMeter ? item.price * unitArea : item.price;
                }
            });
        });
        return total;
    }, [config, selectedItems, unitArea, stages]);

    const handleRunAIAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            // Collect selected item names for the prompt
            const selectedNames: string[] = [];
            stages.forEach(stage => {
                const selectedInStage = selectedItems[stage.id] || [];
                const allItems = [...stage.basicItems, ...stage.optionalItems];
                allItems.forEach(item => {
                    if (selectedInStage.includes(item.id)) {
                        selectedNames.push(item.name[language]);
                    }
                });
            });

            const result = await generateFinishingAnalysis(unitArea, selectedNames, language);
            setAiResult(result);
        } catch (e) {
            showToast("Failed to generate AI analysis", "error");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const mutation = useMutation({
        mutationFn: addLead,
        onSuccess: () => {
            showToast(language === 'ar' ? 'تم إرسال التقدير بنجاح! سيتواصل معك فريقنا.' : 'Estimation sent successfully! Our team will contact you.', 'success');
            navigate('/finishing');
        },
        onError: () => {
            showToast('Failed to submit request.', 'error');
        }
    });

    const handleSubmit = () => {
        if (!contactForm.name.trim() || !contactForm.phone.trim()) {
            showToast(language === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف للمتابعة' : 'Please enter your name and phone number to proceed', 'error');
            const contactSection = document.getElementById('contact-details-section');
            contactSection?.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        let details = `Detailed AI Estimate for ${unitArea}m².\n`;
        if (aiResult) {
            details += `AI Range: ${aiResult.lowEstimate.toLocaleString()} - ${aiResult.highEstimate.toLocaleString()} EGP.\n`;
            details += `Insight: ${aiResult.marketInsight}\n`;
        } else {
            details += `Static Estimate: ${staticTotalPrice.toLocaleString()} EGP.\n`;
        }
        
        details += `\nSelections:\n`;
        stages.forEach(stage => {
            const selectedInStage = selectedItems[stage.id] || [];
            if (selectedInStage.length > 0) {
                details += `- ${stage.name.en}: `;
                const items = [...stage.basicItems, ...stage.optionalItems]
                    .filter(i => selectedInStage.includes(i.id))
                    .map(i => i.name.en)
                    .join(', ');
                details += items + '\n';
            }
        });
        
        mutation.mutate({
            partnerId: 'admin-user',
            serviceType: 'finishing',
            customerName: contactForm.name,
            customerPhone: contactForm.phone,
            contactTime: 'Any time',
            serviceTitle: `Finishing Estimate Request`,
            customerNotes: details,
            managerId: 'platform-finishing-manager-1'
        });
    };

    if (isLoading) {
        return <div className="p-8 text-center flex justify-center"><Spinner size="lg" /></div>
    }

    if (!config || stages.length === 0) {
         return <div className="p-8 text-center">Estimator not configured.</div>
    }

    const progress = ((currentStep + 1) / (stages.length + 1)) * 100;
    
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
                        <p className="text-gray-500">
                            {language === 'ar' ? 'احصل على تقدير فوري لتكلفة التشطيب مدعوم بالذكاء الاصطناعي.' : 'Get an instant, AI-powered cost estimate for your finishing project.'}
                        </p>

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
                                    {/* Basic Items */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b pb-2 mb-3">
                                            {language === 'ar' ? 'أساسيات' : 'Basic Items'}
                                        </h4>
                                        {currentStage.basicItems.map(item => (
                                            <label key={item.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${ (selectedItems[currentStage.id] || []).includes(item.id) ? 'bg-amber-50 border-amber-500 dark:bg-amber-900/20' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200'}`}>
                                                <Checkbox 
                                                    id={item.id} 
                                                    checked={(selectedItems[currentStage.id] || []).includes(item.id)}
                                                    onCheckedChange={() => handleToggleItem(currentStage.id, item.id)}
                                                />
                                                <div className="flex-grow">
                                                    <span className="font-medium text-gray-900 dark:text-white">{item.name[language]}</span>
                                                    <span className="text-xs text-gray-500 block">
                                                        ~{item.price.toLocaleString()} EGP / {item.unit[language]}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {/* Optional Items */}
                                     <div className="space-y-3">
                                        <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b pb-2 mb-3">
                                            {language === 'ar' ? 'إضافات' : 'Optional Upgrades'}
                                        </h4>
                                        {currentStage.optionalItems.map(item => (
                                            <label key={item.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-700/50 ${(selectedItems[currentStage.id] || []).includes(item.id) ? 'bg-amber-50 border-amber-500 dark:bg-amber-900/20' : 'bg-white dark:bg-gray-800 border-gray-200'}`}>
                                                <Checkbox 
                                                    id={item.id} 
                                                    checked={(selectedItems[currentStage.id] || []).includes(item.id)}
                                                    onCheckedChange={() => handleToggleItem(currentStage.id, item.id)}
                                                />
                                                <div className="flex-grow">
                                                    <span className="font-medium text-gray-900 dark:text-white">{item.name[language]}</span>
                                                    <span className="text-xs text-gray-500 block">
                                                        ~{item.price.toLocaleString()} EGP / {item.unit[language]}
                                                    </span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="animate-fadeIn space-y-8">
                                <div className="text-center">
                                    <h3 className="text-2xl font-bold mb-4">{language === 'ar' ? 'مراجعة وتحليل' : 'Review & Analysis'}</h3>
                                    <div className="max-w-xs mx-auto mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{language === 'ar' ? 'مساحة الوحدة (م²)' : 'Unit Area (m²)'}</label>
                                        <Input 
                                            type="number" 
                                            value={unitArea} 
                                            onChange={(e) => {
                                                setUnitArea(parseInt(e.target.value, 10));
                                                setAiResult(null); // Reset analysis on area change
                                            }} 
                                            className="text-center text-lg"
                                        />
                                    </div>
                                </div>

                                {!aiResult ? (
                                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                                            {language === 'ar' 
                                                ? 'اضغط أدناه للحصول على تحليل تفصيلي للتكلفة مدعوم بالذكاء الاصطناعي بناءً على أسعار السوق الحالية.' 
                                                : 'Click below to get a detailed AI-powered cost analysis based on current market rates.'}
                                        </p>
                                        <Button 
                                            size="lg" 
                                            onClick={handleRunAIAnalysis} 
                                            isLoading={isAnalyzing}
                                            className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/20"
                                        >
                                            <SparklesIcon className="w-5 h-5 mr-2" />
                                            {language === 'ar' ? 'تحليل التكلفة بالذكاء الاصطناعي' : 'Generate AI Cost Analysis'}
                                        </Button>
                                        <div className="mt-4 text-sm text-gray-400">
                                            {language === 'ar' ? 'التقدير المبدئي (بدون ذكاء اصطناعي):' : 'Rough Estimate (No AI):'} {staticTotalPrice.toLocaleString()} EGP
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                                                <h4 className="text-amber-800 dark:text-amber-300 font-semibold mb-2 flex items-center gap-2">
                                                    <BanknotesIcon className="w-5 h-5" />
                                                    {language === 'ar' ? 'نطاق التكلفة المتوقع' : 'Estimated Cost Range'}
                                                </h4>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                    {aiResult.lowEstimate.toLocaleString()} - {aiResult.highEstimate.toLocaleString()} <span className="text-sm font-normal">EGP</span>
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                                                    "{aiResult.marketInsight}"
                                                </p>
                                            </div>
                                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                                <h4 className="text-gray-800 dark:text-gray-200 font-semibold mb-4 flex items-center gap-2">
                                                    <ChartBarIcon className="w-5 h-5 text-blue-500" />
                                                    {language === 'ar' ? 'توزيع التكلفة' : 'Cost Breakdown'}
                                                </h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span>{language === 'ar' ? 'خامات' : 'Materials'}</span>
                                                            <span className="font-bold">{aiResult.materialPercentage}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div className="bg-blue-500 h-2 rounded-full" style={{width: `${aiResult.materialPercentage}%`}}></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span>{language === 'ar' ? 'مصنعية' : 'Labor'}</span>
                                                            <span className="font-bold">{aiResult.laborPercentage}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div className="bg-green-500 h-2 rounded-full" style={{width: `${aiResult.laborPercentage}%`}}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <h4 className="text-gray-800 dark:text-gray-200 font-semibold mb-4 flex items-center gap-2">
                                                <SparklesIcon className="w-5 h-5 text-purple-500" />
                                                {language === 'ar' ? 'نصائح التوفير والجودة' : 'Smart Tips for You'}
                                            </h4>
                                            <ul className="space-y-3">
                                                {aiResult.tips.map((tip, idx) => (
                                                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                                                        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        
                                        {/* Contact Details Section */}
                                        <div id="contact-details-section" className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-xl border border-gray-200 dark:border-gray-600 animate-fadeIn">
                                            <h4 className="text-gray-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                                                <UserPlusIcon className="w-5 h-5 text-amber-500" />
                                                {language === 'ar' ? 'بيانات التواصل (مطلوب للمتابعة)' : 'Contact Details (Required for Follow-up)'}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'} <span className="text-red-500">*</span>
                                                    </label>
                                                    <Input 
                                                        value={contactForm.name} 
                                                        onChange={e => setContactForm({...contactForm, name: e.target.value})} 
                                                        placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
                                                    </label>
                                                    <Input 
                                                        value={contactForm.phone} 
                                                        onChange={e => setContactForm({...contactForm, phone: e.target.value})} 
                                                        placeholder="01xxxxxxxxx"
                                                        dir="ltr"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-center pt-4">
                                            <Button size="lg" onClick={handleSubmit} isLoading={mutation.isPending}>
                                                {language === 'ar' ? 'إرسال طلب تنفيذ' : 'Request Execution'}
                                            </Button>
                                        </div>
                                        
                                        <div className="text-center">
                                            <button onClick={() => setAiResult(null)} className="text-sm text-gray-500 hover:text-amber-500 underline">
                                                {language === 'ar' ? 'إعادة التقييم' : 'Re-calculate'}
                                            </button>
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
