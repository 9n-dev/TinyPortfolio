import { siteConfig } from '../data/siteConfig';
import { PixelButton, PixelPanel } from '../components/PixelUI';
import { SocialLinks } from '../components/SocialLinks';
import { useContent } from '../i18n';

export function Home({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  const { t } = useContent();
  return <section id="home" className="home section" aria-labelledby="home-title">
    <div className="home-content">
      <PixelPanel className="hero-paper" skin="scroll">
        <h1 id="home-title">{siteConfig.name}</h1>
        <p className="hero-role">
          {t.role.split(' · ')[0]}<br />
          <span>{t.role.split(' · ').slice(1).join(' · ')}</span>
        </p>
        <p className="hero-description">{t.description}</p>
        <div className="hero-actions">
          <PixelButton href="#projects">{t.hero.projects} <span aria-hidden="true">↓</span></PixelButton>
          <PixelButton href="#contact" className="secondary">{t.hero.contact} <span aria-hidden="true">↗</span></PixelButton>
        </div>
        <SocialLinks />
      </PixelPanel>
    </div>
    <PixelPanel className="world-controls">
    <a className="scroll-prompt" href="#about">{t.hero.explore} <span aria-hidden="true">↓</span></a>
    <button className="motion-button" onClick={onToggle} aria-pressed={paused}
      aria-label={paused ? t.hero.resumeLabel : t.hero.pauseLabel}>
      <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
      {paused ? t.hero.resume : t.hero.pause}
    </button>
    </PixelPanel>
  </section>;
}
