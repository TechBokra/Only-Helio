
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createTransaction } from '../../services/finance';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useLanguage } from '../shared/LanguageContext';
import { useToast } from '../shared/ToastContext';
import { CheckCircleIcon, CreditCardIcon, PhoneIcon } from '../ui/Icons';
import type { TransactionType, PaymentMethod } from '../../types';
import { uploadToCloudinary } from '../../lib/cloudinary';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    description: string;
    type: TransactionType;
    userId: string;
    userName: string;
    relatedEntityId?: string;
    onSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ 
    isOpen, onClose, amount, description, type, userId, userName, relatedEntityId, onSuccess 
}) => {
    const { language } = useLanguage();
    const { showToast } = useToast();
    const [method, setMethod] = useState<PaymentMethod>('instapay');
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const mutation = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            showToast(language === 'ar' ? 'تم استلام طلب الدفع بنجاح' : 'Payment request received successfully', 'success');
            if (onSuccess) onSuccess();
            onClose();
        },
        onError: () => {
            showToast('Payment failed. Please try again.', 'error');
        }
    });

    const handleSubmit = async () => {
        let receiptUrl = undefined;
        
        if (method === 'instapay') {
            if (!receiptFile) {
                showToast(language === 'ar' ? 'يرجى رفع صورة الإيصال' : 'Please upload receipt image', 'error');
                return;
            }
            try {
                setIsUploading(true);
                // Optimized: Upload to Cloudinary instead of Base64
                receiptUrl = await uploadToCloudinary(receiptFile);
            } catch (error) {
                console.error(error);
                showToast(language === 'ar' ? 'فشل رفع الإيصال' : 'Receipt upload failed', 'error');
                setIsUploading(false);
                return;
            }
        }

        mutation.mutate({
            userId,
            userName,
            amount,
            currency: 'EGP',
            type,
            description,
            method,
            relatedEntityId,
            receiptUrl
        });
        setIsUploading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} aria-labelledby="payment-modal-title">
            <ModalHeader id="payment-modal-title" onClose={onClose}>
                {language === 'ar' ? 'إتمام الدفع' : 'Complete Payment'}
            </ModalHeader>
            <ModalContent className="space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'ar' ? 'المبلغ المستحق' : 'Amount Due'}</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{amount.toLocaleString()} EGP</p>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        {language === 'ar' ? 'اختر طريقة الدفع' : 'Select Payment Method'}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setMethod('instapay')}
                            className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${method === 'instapay' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                <PhoneIcon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">InstaPay</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setMethod('card')}
                            className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${method === 'card' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <CreditCardIcon className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">Paymob (Card)</span>
                        </button>
                    </div>
                </div>

                {method === 'instapay' ? (
                    <div className="space-y-4 animate-fadeIn">
                        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <p className="text-sm font-semibold mb-1">{language === 'ar' ? 'حول المبلغ إلى:' : 'Transfer amount to:'}</p>
                            <p className="text-lg font-mono text-gray-800 dark:text-white select-all">username@instapay</p>
                            <p className="text-xs text-gray-500 mt-1">01012345678 (Vodafone Cash)</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{language === 'ar' ? 'صورة الإيصال' : 'Receipt Screenshot'}</label>
                            <Input type="file" accept="image/*" onChange={(e) => setReceiptFile(e.target.files ? e.target.files[0] : null)} className="bg-white dark:bg-gray-800" />
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 animate-fadeIn">
                        <p className="text-sm text-gray-500 mb-4">{language === 'ar' ? 'سيتم تحويلك إلى بوابة الدفع الآمنة.' : 'You will be redirected to secure payment gateway.'}</p>
                        <div className="flex justify-center gap-2 opacity-50">
                            <div className="w-10 h-6 bg-gray-300 rounded"></div>
                            <div className="w-10 h-6 bg-gray-300 rounded"></div>
                            <div className="w-10 h-6 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                )}

            </ModalContent>
            <ModalFooter>
                <Button variant="secondary" onClick={onClose} disabled={isUploading}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                <Button onClick={handleSubmit} isLoading={mutation.isPending || isUploading}>
                    {method === 'card' ? (language === 'ar' ? 'الدفع الآن' : 'Pay Now') : (language === 'ar' ? 'تأكيد التحويل' : 'Confirm Transfer')}
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default PaymentModal;
