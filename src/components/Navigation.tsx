import { useEffect, useState } from 'react';
import { NineSliceSurface } from './NineSliceSurface';
import { siteConfig } from '../data/siteConfig';
import { useContent } from '../i18n';
export function Navigation() {
  const [active, setActive] = useState('home');
  const { lang, setLang, t } = useContent();
  useEffect(() => {
    const sections = siteConfig.sections.map(id => document.getElementById(id)!);
    let scheduled = 0;
    const updateActiveSection = () => {
      scheduled = 0;
      const readingLine = Math.max(150, window.innerHeight * 0.35);
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= readingLine) current = section.id;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1].id;
      }
      setActive(current);
    };
    const scheduleUpdate = () => {
      if (!scheduled) scheduled = requestAnimationFrame(updateActiveSection);
    };
    updateActiveSection();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      cancelAnimationFrame(scheduled);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
    };
  }, []);
  return <header className="navigation-wrap">
    <nav className="navigation" aria-label={t.nav.main}>
      <NineSliceSurface skin="wood" />
      <div className="nav-rail"><NineSliceSurface skin="paper" />
      <a className="brand" href="#home" aria-label={`${siteConfig.brand}: ${t.nav.home}`}>{siteConfig.brand}</a>
      <div className="nav-links">
        {siteConfig.sections.map(id => <a key={id} href={`#${id}`}
          aria-current={active === id ? 'location' : undefined}>{t.nav[id]}</a>)}
      </div>
      <div className="language" role="group" aria-label={t.nav.language}>
        {(['es', 'en'] as const).map(code => <button key={code} type="button" lang={code} aria-pressed={lang === code}
          onClick={() => setLang(code)}>{code.toUpperCase()}</button>)}
      </div>
      </div>
    </nav>
  </header>;
}
