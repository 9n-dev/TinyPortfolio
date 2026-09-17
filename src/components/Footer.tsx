import { PixelPanel } from './PixelUI';
import { siteConfig } from '../data/siteConfig';

export function Footer() {
  return <footer className="site-footer">
    <PixelPanel skin="wood" className="footer-frame">
      <PixelPanel className="footer-content">
        <div><p>© {new Date().getFullYear()} {siteConfig.name}</p><p className="attribution">Pixel art: Tiny Swords by Pixel Frog</p></div>
        <a href="#home">Back to top <span aria-hidden="true">↑</span></a>
      </PixelPanel>
    </PixelPanel>
  </footer>;
}
