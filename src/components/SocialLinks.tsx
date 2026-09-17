import { siteConfig } from '../data/siteConfig';
export function SocialLinks() {
  return <div className="social-links">{siteConfig.socials.map(s => <a key={s.label} href={s.url} {...(s.url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>{s.label}<span aria-hidden="true"> ↗</span></a>)}</div>;
}
