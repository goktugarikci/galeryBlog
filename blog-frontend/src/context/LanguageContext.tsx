// src/context/LanguageContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Language = 'tr' | 'en';

interface LanguageContextType {
  lang: Language;
  switchLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Varsayılan dil TR
  const [lang, setLang] = useState<Language>('tr');
  const router = useRouter();

  useEffect(() => {
    // Sayfa yüklendiğinde kayıtlı dili al
    const storedLang = localStorage.getItem('currentLang') as Language;
    if (storedLang) {
      setLang(storedLang);
    }
  }, []);

  const switchLanguage = (language: Language) => {
    setLang(language);
    
    // 1. LocalStorage'a kaydet (Client Componentler ve API için)
    localStorage.setItem('currentLang', language);
    
    // 2. Cookie'ye kaydet (Server Componentler - page.tsx için)
    document.cookie = `currentLang=${language}; path=/; max-age=31536000`; // 1 yıl sakla

    // 3. Sayfayı yenile (Verilerin yeni dile göre gelmesi için)
    router.refresh();
  };

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};