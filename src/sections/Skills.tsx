import { PixelPanel, SectionTitle } from '../components/PixelUI';
import { useContent } from '../i18n';

export function Skills() {
  const { t } = useContent();
  return <section id="skills" className="section skills" aria-labelledby="skills-title">
    <SectionTitle id="skills-title" title={t.skills.title} />
    <PixelPanel skin="wood" className="inventory-frame">
      <PixelPanel className="inventory">
        <p className="inventory-intro">{t.skills.intro}</p>
        <span className="asset-divider" aria-hidden="true" />
        <div className="skill-grid">
          {t.skills.groups.map(skill => <article className="skill-group" key={skill.name}>
            <div className="skill-heading"><span className="inventory-slot"><img src={`/assets/ui/Icon_${skill.icon}.png`} alt="" width="32" height="32" loading="lazy" /></span><h3>{skill.name}</h3></div>
            <p>{skill.description}</p>
            <ul>{skill.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>
          </article>)}
        </div>
      </PixelPanel>
    </PixelPanel>
  </section>;
}
