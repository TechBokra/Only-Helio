import React from 'react';
import { Link } from 'react-router-dom';
import { SearchIcon, HomeIcon } from '../ui/Icons';
import { useLanguage } from './LanguageContext';
import { Button } from '../ui/Button';

const NotFoundPage: React.FC = () => {
  const { language, t } = useLanguage();
  const t_page = t.notFoundPage;

  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-20 bg-gray-50 dark:bg-gray-900" style={{ minHeight: '70vh' }}>
      <div className="max-w-lg w-full bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold">404</span>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">
          {t_page.title}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          {t_page.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/" className="w-full sm:w-auto">
            <Button size="lg" className="w-full flex items-center justify-center gap-2">
                <HomeIcon className="w-5 h-5" />
                {t_page.backButton}
            </Button>
          </Link>
          <Link to="/contact" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full flex items-center justify-center gap-2">
                <SearchIcon className="w-5 h-5" />
                {language === 'ar' ? 'تواصل معنا' : 'Contact Support'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;