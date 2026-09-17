import { siteConfig } from '../data/siteConfig';
import { PixelButton, PixelPanel } from '../components/PixelUI';
import { SocialLinks } from '../components/SocialLinks';
import { SceneRegion } from '../components/MapScene';

export function Home({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return <section id="home" className="home section" aria-labelledby="home-title">
    <SceneRegion region="home" />
    <div className="home-content">
      <PixelPanel className="hero-paper" skin="scroll">
        <h1 id="home-title">{siteConfig.name}</h1>
        <p className="hero-role">
          {siteConfig.role.split(' · ')[0]}<br />
          <span>{siteConfig.role.split(' · ').slice(1).join(' · ')}</span>
        </p>
        <p className="hero-description">{siteConfig.description}</p>
        <div className="hero-actions">
          <PixelButton href="#projects">View Projects <span aria-hidden="true">↓</span></PixelButton>
          <PixelButton href="#contact" className="secondary">Contact Me <span aria-hidden="true">↗</span></PixelButton>
          {siteConfig.cvUrl && <a href={siteConfig.cvUrl} download>Download CV</a>}
        </div>
        <SocialLinks />
      </PixelPanel>
    </div>
    <PixelPanel className="world-controls">
    <a className="scroll-prompt" href="#projects">Explore <span aria-hidden="true">↓</span></a>
    <button className="motion-button" onClick={onToggle} aria-pressed={paused}
      aria-label={paused ? 'Resume decorative animations' : 'Pause decorative animations'}>
      <span aria-hidden="true">{paused ? '▶' : 'Ⅱ'}</span>
      {paused ? 'Resume motion' : 'Pause motion'}
    </button>
    </PixelPanel>
  </section>;
}
