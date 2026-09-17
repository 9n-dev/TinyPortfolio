import { PixelPanel } from './PixelUI';
import { siteConfig } from '../data/siteConfig';
import { useContent } from '../i18n';

export function Footer() {
  const { t } = useContent();
  return <footer className="site-footer">
    <PixelPanel skin="wood" className="footer-frame">
      <PixelPanel className="footer-content">
        <div><p>© {new Date().getFullYear()} {siteConfig.name}</p><p className="attribution">{t.footer.attribution}</p></div>
        <a href="#home">{t.footer.top} <span aria-hidden="true">↑</span></a>
      </PixelPanel>
    </PixelPanel>
  </footer>;
}
