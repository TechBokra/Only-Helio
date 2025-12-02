
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PartnerType, SubscriptionPlan, PlanCategory, OfficialDocument } from '../../types';
import FormField, { inputClasses, selectClasses } from '../ui/FormField';
import { CheckCircleIcon, UsersIcon, ArrowRightIcon, ArrowLeftIcon, PhotoIcon, ClipboardDocumentListIcon, BuildingIcon } from '../ui/Icons';
import { addRequest } from '../../services/requests';
import { RequestType } from '../../types';
import SubscriptionPlanSelector from '../shared/SubscriptionPlanSelector';
import { useLanguage } from '../shared/LanguageContext';
import { useToast } from '../shared/ToastContext';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { commonSchemas } from '../../utils/validation';
import { uploadToCloudinary } from '../../lib/cloudinary';

// Validation Schema
const registerSchema = z.object({
    companyName: commonSchemas.name,
    contactName: commonSchemas.name,
    contactEmail: commonSchemas.email,
    contactPhone: commonSchemas.phoneEG,
    companyAddress: z.string().min(5, "Address is too short"),
    website: commonSchemas.url,
    description: z.string().min(20, "Description must be at least 20 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

const PLAN_PRICES: Record<string, Record<string, number>> = {
    developer: { basic: 0, professional: 5000, elite: 15000 },
    agency: { basic: 0, professional: 2000, elite: 5000 },
    finishing: { commission: 0, professional: 3000, elite: 8000 },
};

const RegisterPage: React.FC = () => {
    const { language, t } = useLanguage();
    const t_page = t.partnerRequestForm;
    const { showToast } = useToast();
    const navigate = useNavigate();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [companyType, setCompanyType] = useState<PartnerType | ''>('');
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | ''>('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [docFiles, setDocFiles] = useState<FileList | null>(null);

    const { register, handleSubmit, formState: { errors }, trigger } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onBlur'
    });

    const mutation = useMutation({
        mutationFn: (data: any) => addRequest(RequestType.PARTNER_APPLICATION, data),
        onSuccess: () => {
            setFormSubmitted(true);
            window.scrollTo(0, 0);
        },
        onError: (error) => {
            console.error("Submission failed:", error);
            showToast(language === 'ar' ? 'فشل إرسال الطلب. حاول مرة أخرى.' : 'Submission failed. Please try again.', 'error');
        }
    });

    const nextStep = async () => {
        if (currentStep === 1) {
            if (companyType && selectedPlan) setCurrentStep(2);
            else showToast(language === 'ar' ? 'الرجاء اختيار نوع الشركة والباقة' : 'Please select company type and plan', 'error');
        } else if (currentStep === 2) {
            const isStepValid = await trigger();
            if (isStepValid) setCurrentStep(3);
        }
    };
    
    const prevStep = () => setCurrentStep(prev => prev - 1);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFinalSubmit = async (data: RegisterFormData) => {
        if (!logoFile) {
            showToast(language === 'ar' ? 'يرجى رفع شعار الشركة' : "Please upload a company logo.", "error");
            return;
        }
        
        try {
            setIsUploading(true);
            
            // 1. Upload Logo
            const logoUrl = await uploadToCloudinary(logoFile);
            
            // 2. Upload Documents
            let docsUrls: OfficialDocument[] = [];
            if (docFiles) {
                 const filesArray = Array.from(docFiles);
                 const filePromises = filesArray.map(async (file: File) => ({
                    fileName: file.name,
                    fileContent: await uploadToCloudinary(file)
                }));
                docsUrls = await Promise.all(filePromises);
            }
            
            const finalData = {
                companyType,
                subscriptionPlan: selectedPlan,
                ...data,
                logo: logoUrl,
                documents: docsUrls,
                managementContacts: [] 
            };

            const typeKey = companyType as string;
            const planKey = selectedPlan as string;
            const price = PLAN_PRICES[typeKey]?.[planKey] || 0;

            if (price > 0) {
                 navigate('/payment', { 
                    state: { 
                        amount: price,
                        description: `Partner Subscription: ${companyType} (${selectedPlan})`,
                        type: 'subscription_fee',
                        userId: data.contactEmail, 
                        userName: data.companyName,
                        data: finalData
                    } 
                });
            } else {
                mutation.mutate({
                    requesterInfo: { name: data.contactName, phone: data.contactPhone, email: data.contactEmail },
                    payload: finalData,
                });
            }
        } catch (error) {
            console.error(error);
            showToast(language === 'ar' ? 'خطأ في رفع الملفات' : "Error uploading files.", "error");
        } finally {
            setIsUploading(false);
        }
    };
    
    if (formSubmitted) {
        return (
            <div className="py-20 bg-white dark:bg-gray-900 flex items-center justify-center text-center min-h-[60vh]">
                <div className="max-w-xl">
                    <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{t.auth.registerSuccessTitle}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">{t.auth.registerSuccessMessage}</p>
                    <Link to="/" className="bg-amber-500 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors">
                        {t.addPropertyPage.backToHome}
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="py-20 bg-gray-50 dark:bg-gray-800 min-h-screen">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{t.auth.registerTitle}</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">{t.auth.registerSubtitle}</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Left Sidebar: Steps Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700 sticky top-28">
                             <div className="flex items-center gap-2 mb-8 text-amber-500">
                                <UsersIcon className="w-6 h-6" />
                                <h2 className="text-xl font-bold">{language === 'ar' ? 'خطوات التسجيل' : 'Registration Steps'}</h2>
                            </div>
                            <ul className="space-y-8 relative">
                                {/* Vertical Line */}
                                <div className={`absolute top-4 bottom-4 ${language === 'ar' ? 'right-[15px]' : 'left-[15px]'} w-0.5 bg-gray-200 dark:bg-gray-700 -z-10`}></div>
                                
                                <li className="flex items-start group">
                                    <div className={`flex-shrink-0 rounded-full h-8 w-8 flex items-center justify-center font-bold border-2 transition-colors z-10 ${currentStep >= 1 ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 text-gray-500'}`}>1</div>
                                    <div className={`${language === 'ar' ? 'mr-4' : 'ml-4'}`}>
                                        <p className={`font-semibold ${currentStep === 1 ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'}`}>{t_page.step1_title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{t_page.step1_subtitle}</p>
                                    </div>
                                </li>
                                <li className="flex items-start group">
                                    <div className={`flex-shrink-0 rounded-full h-8 w-8 flex items-center justify-center font-bold border-2 transition-colors z-10 ${currentStep >= 2 ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 text-gray-500'}`}>2</div>
                                    <div className={`${language === 'ar' ? 'mr-4' : 'ml-4'}`}>
                                        <p className={`font-semibold ${currentStep === 2 ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'}`}>{t_page.step2_title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{t_page.step2_subtitle}</p>
                                    </div>
                                </li>
                                <li className="flex items-start group">
                                    <div className={`flex-shrink-0 rounded-full h-8 w-8 flex items-center justify-center font-bold border-2 transition-colors z-10 ${currentStep >= 3 ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white dark:bg-gray-800 border-gray-300 text-gray-500'}`}>3</div>
                                    <div className={`${language === 'ar' ? 'mr-4' : 'ml-4'}`}>
                                        <p className={`font-semibold ${currentStep === 3 ? 'text-amber-600' : 'text-gray-700 dark:text-gray-300'}`}>{t_page.step3_title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{t_page.step3_subtitle}</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Form Area */}
                    <div className="lg:col-span-2">
                         <div className="bg-white dark:bg-gray-900 p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm min-h-[500px] flex flex-col">
                             
                            {currentStep === 1 && (
                                <section className="animate-fadeIn space-y-6 flex-grow flex flex-col">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t_page.step1_title}</h2>
                                        <p className="text-gray-500">{t_page.step1_subtitle}</p>
                                    </div>
                                    
                                    <FormField label={t_page.companyType} id="companyType">
                                        <Select 
                                            value={companyType} 
                                            onChange={(e) => { setCompanyType(e.target.value as PartnerType); setSelectedPlan(''); }}
                                            className={selectClasses}
                                        >
                                            <option value="" disabled>{t_page.selectType}</option>
                                            <option value="developer">{t_page.developer}</option>
                                            <option value="finishing">{t_page.finishing}</option>
                                            <option value="agency">{t_page.agency}</option>
                                        </Select>
                                    </FormField>
                                    
                                    {companyType && (
                                        <div className="mt-8 animate-fadeIn">
                                            <SubscriptionPlanSelector 
                                                partnerType={companyType as PlanCategory}
                                                selectedPlan={selectedPlan}
                                                onSelectPlan={(plan) => setSelectedPlan(plan)}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="mt-auto pt-8 flex justify-end border-t border-gray-100 dark:border-gray-700">
                                        <Button onClick={nextStep} disabled={!companyType || !selectedPlan} size="lg" className="flex items-center gap-2">
                                            {t_page.next} {language === 'ar' ? <ArrowLeftIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </section>
                            )}
                            
                            {currentStep === 2 && (
                                <section className="animate-fadeIn space-y-6 flex-grow flex flex-col">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t_page.step2_title}</h2>
                                        <p className="text-gray-500">{t_page.step2_subtitle}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField label={t_page.companyName} id="companyName" error={errors.companyName?.message}>
                                            <Input {...register('companyName')} className={inputClasses} />
                                        </FormField>
                                        <FormField label={t_page.companyAddress} id="companyAddress" error={errors.companyAddress?.message}>
                                            <Input {...register('companyAddress')} className={inputClasses} />
                                        </FormField>
                                        <FormField label={t_page.contactName} id="contactName" error={errors.contactName?.message}>
                                            <Input {...register('contactName')} className={inputClasses} />
                                        </FormField>
                                        <FormField label={t_page.contactPhone} id="contactPhone" error={errors.contactPhone?.message}>
                                            <Input {...register('contactPhone')} placeholder="01xxxxxxxxx" dir="ltr" className={inputClasses} />
                                        </FormField>
                                        <FormField label={t_page.contactEmail} id="contactEmail" error={errors.contactEmail?.message}>
                                            <Input {...register('contactEmail')} type="email" dir="ltr" className={inputClasses} />
                                        </FormField>
                                        <FormField label={t_page.website} id="website" error={errors.website?.message}>
                                            <Input {...register('website')} placeholder="https://..." dir="ltr" className={inputClasses} />
                                        </FormField>
                                    </div>
                                    <div>
                                         <FormField label={t_page.companyDescription} id="description" error={errors.description?.message}>
                                            <textarea {...register('description')} className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none dark:text-white" rows={4} />
                                        </FormField>
                                    </div>
                                    
                                    <div className="mt-auto pt-8 flex justify-between border-t border-gray-100 dark:border-gray-700">
                                        <Button type="button" variant="secondary" onClick={prevStep}>{t_page.back}</Button>
                                        <Button type="button" onClick={nextStep} size="lg" className="flex items-center gap-2">
                                            {t_page.next} {language === 'ar' ? <ArrowLeftIcon className="w-4 h-4" /> : <ArrowRightIcon className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </section>
                            )}
                            
                            {currentStep === 3 && (
                                 <section className="animate-fadeIn space-y-6 flex-grow flex flex-col">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t_page.step3_title}</h2>
                                        <p className="text-gray-500">{t_page.step3_subtitle}</p>
                                    </div>

                                    <form onSubmit={handleSubmit(handleFinalSubmit)} className="space-y-8">
                                        <FormField label={t_page.companyLogo} id="logo">
                                            <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                {logoPreview ? (
                                                    <div className="relative">
                                                        <img src={logoPreview} alt="Logo Preview" className="w-32 h-32 object-contain rounded-md border bg-white" />
                                                        <button 
                                                            type="button" 
                                                            onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                        >
                                                            X
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                        <p className="text-sm text-gray-500">PNG, JPG (Max 5MB)</p>
                                                    </div>
                                                )}
                                                <div className="relative">
                                                     <input 
                                                        type="file" 
                                                        id="logo-upload" 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={handleLogoChange} 
                                                    />
                                                    <label 
                                                        htmlFor="logo-upload" 
                                                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-xs text-gray-700 dark:text-gray-200 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                                                    >
                                                        {logoPreview ? (language === 'ar' ? 'تغيير الشعار' : 'Change Logo') : (language === 'ar' ? 'رفع الشعار' : 'Upload Logo')}
                                                    </label>
                                                </div>
                                            </div>
                                        </FormField>
                                        
                                        <FormField label={t_page.officialDocs} id="documents">
                                            <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                                <div className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                                                    <ClipboardDocumentListIcon className="w-6 h-6 text-amber-500"/>
                                                </div>
                                                <div className="flex-grow">
                                                    <Input type="file" multiple onChange={(e) => setDocFiles(e.target.files)} className="border-0 bg-transparent shadow-none p-0 text-sm" />
                                                    <p className="text-xs text-gray-500 mt-1">{t_page.uploadDocs}</p>
                                                </div>
                                            </div>
                                        </FormField>

                                        {selectedPlan && companyType && PLAN_PRICES[companyType as string]?.[selectedPlan as string] > 0 && (
                                            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded">
                                                <p className="text-amber-800 dark:text-amber-200 text-sm font-bold">
                                                    {language === 'ar' ? 'ملاحظة:' : 'Note:'}
                                                </p>
                                                <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                                                    {language === 'ar' 
                                                        ? `سيتم توجيهك للدفع (${PLAN_PRICES[companyType as string][selectedPlan as string]} ج.م) بعد إرسال الطلب.` 
                                                        : `You will be redirected to pay (${PLAN_PRICES[companyType as string][selectedPlan as string]} EGP) after submission.`
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        <div className="mt-auto pt-8 flex justify-between border-t border-gray-100 dark:border-gray-700">
                                            <Button type="button" variant="secondary" onClick={prevStep}>{t_page.back}</Button>
                                            <Button type="submit" isLoading={mutation.isPending || isUploading} size="lg" className="shadow-lg shadow-amber-500/20">
                                                {t_page.submitRequest}
                                            </Button>
                                        </div>
                                    </form>
                                </section>
                            )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
