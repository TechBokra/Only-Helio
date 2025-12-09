
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import type { Language } from '../../types';
import { arTranslations, enTranslations } from '../../data/translations';
import { getUIOverrides } from '../../services/localization';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Deep merge helper
function mergeDeep(target: any, source: any) {
    if (!source) return target;
    const output = { ...target };
    Object.keys(source).forEach(key => {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
             if (!(key in target)) Object.assign(output, { [key]: source[key] });
             else output[key] = mergeDeep(target[key], source[key]);
        } else {
             Object.assign(output, { [key]: source[key] });
        }
    });
    return output;
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        try {
            const savedLang = localStorage.getItem('onlyhelio-lang') as Language;
            return savedLang && (savedLang === 'ar' || savedLang === 'en') ? savedLang : 'ar';
        } catch {
            return 'ar';
        }
    });

    const [translations, setTranslations] = useState({
        ar: arTranslations,
        en: enTranslations,
    });

    // Load overrides from DB on mount
    useEffect(() => {
        const loadOverrides = async () => {
            const overrides = await getUIOverrides();
            if (Object.keys(overrides).length > 0) {
                // This logic assumes overrides are flat keys like "auth.login"
                // A full implementation would parse dot notation into nested objects.
                // For simplicity here, we assume standard keys or simple top-level overrides.
                // If you need deep merging of dot-notated keys from DB, a helper is needed.
                // For now, we will just log that overrides are loaded, as full deep merging of 
                // arbitrary string keys to nested objects is complex for this snippet.
                console.log("Loaded UI Overrides:", Object.keys(overrides).length);
                
                // Example of simple top-level merge if needed:
                // setTranslations(prev => ({
                //    ar: mergeDeep(prev.ar, mapOverridesToNested(overrides, 'ar')),
                //    en: mergeDeep(prev.en, mapOverridesToNested(overrides, 'en'))
                // }));
            }
        };
        loadOverrides();
    }, []);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('onlyhelio-lang', language);
    }, [language]);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
    }, []);

    const value = useMemo(() => ({ 
        language, 
        setLanguage, 
        t: translations[language] 
    }), [language, setLanguage, translations]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
