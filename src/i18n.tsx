import { createContext, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { en } from './content/en';
import type { Content } from './content/en';
import { es } from './content/es';
import { siteConfig } from './data/siteConfig';

export type Lang = 'en' | 'es';
const content: Record<Lang, Content> = { en, es };

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'es') return saved;
  } catch { /* storage blocked: fall through to the browser language */ }
  return navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
}

const LanguageContext = createContext<{ lang: Lang; setLang(lang: Lang): void; t: Content }>({ lang: 'en', setLang() {}, t: en });
export const useContent = () => useContext(LanguageContext);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [lang, setLang] = useState(initialLang);
  const t = content[lang];
  useEffect(() => {
    try { localStorage.setItem('lang', lang); } catch { /* not persisted; still works for this visit */ }
    document.documentElement.lang = lang;
    document.title = `${siteConfig.name} — ${t.role}`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', t.description);
  }, [lang, t]);
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}
