import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import i18n from '../i18n';

type Lang = 'en' | 'fr';
type LanguageContextValue = { lang: Lang; setLang: (l: Lang) => void };

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const s = localStorage.getItem('lang') as Lang | null;
      return s ?? 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    i18n.changeLanguage(lang);
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
