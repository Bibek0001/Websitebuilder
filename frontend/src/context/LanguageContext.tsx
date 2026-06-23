import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'np';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (en: string, np: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  toggleLanguage: () => {},
  t: (en) => en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  const toggleLanguage = () => {
    const next: Language = language === 'en' ? 'np' : 'en';
    setLanguage(next);
    localStorage.setItem('language', next);
  };

  const t = (en: string, np: string) => language === 'np' ? np : en;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
