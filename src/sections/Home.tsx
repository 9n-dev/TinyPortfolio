import { siteConfig } from '../data/siteConfig';
import { PixelButton, PixelPanel } from '../components/PixelUI';
import { SocialLinks } from '../components/SocialLinks';
import { useContent } from '../i18n';

export function Home() {
  const { t } = useContent();
  return <section id="home" className="home section" aria-labelledby="home-title">
    <div className="home-content">
      <PixelPanel className="hero-paper" skin="scroll">
        <h1 id="home-title">{siteConfig.name}</h1>
        {/* Each side of the slash stays in one piece: the line may break after "/", never inside "Full-Stack". */}
        <p className="hero-role">{t.role.split('/').map((part, i, all) => <span key={part}>{part}{i < all.length - 1 && '/'}</span>)}</p>
        <p className="hero-description">{t.description}</p>
        <div className="hero-actions">
          <PixelButton href="#projects">{t.hero.projects} <span aria-hidden="true">↓</span></PixelButton>
          <PixelButton href="#contact" className="secondary">{t.hero.contact}</PixelButton>
        </div>
        <SocialLinks />
      </PixelPanel>
    </div>
  </section>;
}
