
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getAIEstimatorConfig } from '../../services/aiConfig';
import { addLead } from '../../services/leads';
import { useLanguage } from '../shared/LanguageContext';
import { useToast } from '../shared/ToastContext';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { 
    CalculatorIcon, 
    CheckCircleIcon, 
    ChevronRightIcon, 
    ChevronLeftIcon, 
    WrenchScrewdriverIcon,
    BanknotesIcon
} from '../ui/Icons';
// FIX: Added missing import for the 'Input' component.
import { Input } from '../ui/Input';

const AIEstimator: React.FC = () => {
    const { language, t } = useLanguage();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    
    const { data: config, isLoading } = useQuery({ queryKey: ['aiEstimatorConfig'], queryFn: getAIEstimatorConfig });

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({}); // stageId -> itemIds
    const [unitArea, setUnitArea] = useState<number>(100);

    const stages = config?.stages || [];
    const currentStage = stages[currentStep];

    const handleToggleItem = (stageId: string, itemId: string) => {
        setSelectedItems(prev => {
            const currentSelection = prev[stageId] || [];
            const newSelection = currentSelection.includes(itemId)
                ? currentSelection.filter(id => id !== itemId)
                : [...currentSelection, itemId];
            return { ...prev, [stageId]: newSelection };
        });
    };

    const totalPrice = useMemo(() => {
        if (!config) return 0;
        let total = 0;
        stages.forEach(stage => {
            const selectedInStage = selectedItems[stage.id] || [];
            const allItems = [...stage.basicItems, ...stage.optionalItems];
            selectedInStage.forEach(itemId => {
                const item = allItems.find(i => i.id === itemId);
                if (item) {
                    // Basic logic: Many finishing items are per m2, others are fixed. 
                    // For simplicity in this estimator, we assume prices marked as /m2 are multiplied by area, others are fixed/unit.
                    const isPerMeter = item.unit.en === 'm²' || item.unit.ar === 'م²';
                    total += isPerMeter ? item.price * unitArea : item.price;
                }
            });
        });
        return total;
    }, [config, selectedItems, unitArea, stages]);

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
        // Construct a detailed note of the estimation
        let details = `Initial Estimation: ${totalPrice.toLocaleString()} EGP for ${unitArea}m² unit.\n\nSelections:\n`;
        
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
            partnerId: 'admin-user', // Or a specific finishing manager ID
            serviceType: 'finishing',
            customerName: currentUser?.name || 'AI Estimator Lead',
            customerPhone: currentUser?.email || 'N/A', // Using email as a placeholder
            contactTime: 'Any time',
            serviceTitle: `AI Finishing Estimate (${(totalPrice / 1000).toFixed(0)}k EGP for ${unitArea}m²)`,
            customerNotes: details,
            managerId: 'platform-finishing-manager-1' // Route to internal team
        });
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading estimator...</div>
    }

    if (!config || stages.length === 0) {
         return <div className="p-8 text-center">Estimator not configured.</div>
    }

    const progress = ((currentStep + 1) / (stages.length + 1)) * 100;
    
    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-800">
            <div className="container mx-auto px-6">
                <Card className="max-w-4xl mx-auto overflow-hidden">
                    <CardHeader className="text-center bg-gray-100 dark:bg-gray-900 p-6">
                        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CalculatorIcon className="w-8 h-8"/>
                        </div>
                        <CardTitle className="text-3xl font-bold">AI Finishing Estimator</CardTitle>
                        <p className="text-gray-500">Get an instant cost estimate for your finishing project.</p>

                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-6">
                            <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="p-8">
                        {currentStep < stages.length ? (
                            <div className="animate-fadeIn">
                                <h3 className="text-2xl font-bold text-center mb-2">{currentStage.name[language]}</h3>
                                <p className="text-center text-gray-500 mb-8">Step {currentStep + 1} of {stages.length}</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Basic Items */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Basic Items</h4>
                                        {currentStage.basicItems.map(item => (
                                            <label key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/50 cursor-pointer">
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
                                        <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Optional Items</h4>
                                        {currentStage.optionalItems.map(item => (
                                            <label key={item.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
                            <div className="text-center animate-fadeIn">
                                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                                <h3 className="text-2xl font-bold">Final Step: Review & Submit</h3>
                                <p className="text-gray-500 mb-6">Enter your unit area to get the final estimate.</p>
                                <div className="max-w-xs mx-auto mb-6">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Area (m²)</label>
                                    <Input 
                                        type="number" 
                                        value={unitArea} 
                                        onChange={(e) => setUnitArea(parseInt(e.target.value, 10))} 
                                        className="text-center text-lg"
                                    />
                                </div>

                                <Button size="lg" onClick={handleSubmit} isLoading={mutation.isPending}>
                                    Submit Estimation Request
                                </Button>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-6 bg-gray-50 dark:bg-gray-900 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
                        <Button variant="secondary" onClick={() => setCurrentStep(s => s - 1)} disabled={currentStep === 0}>
                            <ChevronLeftIcon className="w-5 h-5 mr-2"/>
                            Back
                        </Button>
                        <div className="text-center">
                            <p className="text-sm text-gray-500">Estimated Total</p>
                            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                                <BanknotesIcon className="w-6 h-6"/>
                                {totalPrice.toLocaleString(language)} EGP
                            </p>
                        </div>
                         <Button onClick={() => setCurrentStep(s => s + 1)} disabled={currentStep >= stages.length}>
                            Next
                            <ChevronRightIcon className="w-5 h-5 ml-2"/>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
};

export default AIEstimator;
