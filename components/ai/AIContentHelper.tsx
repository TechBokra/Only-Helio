
import React, { useEffect, useRef } from 'react';
import type { Property } from '../../types';
import { CloseIcon, SparklesIcon } from '../ui/Icons';
import { useLanguage } from '../shared/LanguageContext';

interface AIContentHelperProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (newText: string) => void;
  originalText: string;
  propertyData: Partial<Property>;
  context: {
    field: 'description.ar' | 'description.en';
  };
}

const AIContentHelper: React.FC<Omit<AIContentHelperProps, 'language'>> = ({
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 animate-fadeIn" onClick={onClose} role="dialog">
      <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-gray-400" />
            {language === 'ar' ? 'مساعد المحتوى الذكي' : 'AI Content Assistant'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><CloseIcon className="w-6 h-6" /></button>
        </div>

        <div className="p-8 text-center">
          <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 p-4 rounded-lg mb-4">
             <SparklesIcon className="w-10 h-10 mx-auto mb-2" />
             <p className="font-medium">AI Features Disabled</p>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {language === 'ar' 
                ? 'تم تعطيل ميزات الذكاء الاصطناعي حاليًا.' 
                : 'AI features are currently disabled.'}
          </p>
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold">{t.adminShared.close}</button>
        </div>
      </div>
    </div>
  );
};

export default AIContentHelper;
