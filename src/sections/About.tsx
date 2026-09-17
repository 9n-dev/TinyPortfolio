import { asset } from '../data/siteConfig';
import { PixelPanel, SectionTitle } from '../components/PixelUI';
import { useContent } from '../i18n';

export function About() {
  const { t } = useContent();
  return <section id="about" className="section about" aria-labelledby="about-title">
    <SectionTitle id="about-title" title={t.about.title} />
    <PixelPanel skin="scroll" className="about-paper">
      <span className="inventory-slot about-avatar"><img src={asset('assets/ui/avatar.png')} alt="" width="96" height="96" /></span>
      <div className="about-copy">{t.about.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      <dl className="about-facts">{t.about.facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>
    </PixelPanel>
  </section>;
}
