import { useEffect, useState } from 'react';
import { NineSliceSurface } from './NineSliceSurface';
import { siteConfig } from '../data/siteConfig';
export function Navigation() {
  const [active, setActive] = useState('home');
  useEffect(() => {
    const sections = siteConfig.navigation.map(n => document.getElementById(n.id)!);
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
    <nav className="navigation" aria-label="Main navigation">
      <NineSliceSurface skin="wood" />
      <div className="nav-rail"><NineSliceSurface skin="paper" />
      <a className="brand" href="#home" aria-label={`${siteConfig.name} — Home`}>{siteConfig.name}</a>
      <div className="nav-links">
        {siteConfig.navigation.map(n => <a key={n.id} href={`#${n.id}`}
          aria-current={active === n.id ? 'location' : undefined}>{n.label}</a>)}
      </div>
      </div>
    </nav>
  </header>;
}
