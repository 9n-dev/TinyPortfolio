import { SceneRegion } from '../components/MapScene';
import { skills } from '../data/skills';
import { siteConfig } from '../data/siteConfig';
import { PixelPanel, SectionTitle } from '../components/PixelUI';

export function Skills() {
  return <section id="skills" className="section skills" aria-labelledby="skills-title">
    <SceneRegion region="skills" />
    <SectionTitle id="skills-title" title={siteConfig.skills.title} />
    <PixelPanel skin="wood" className="inventory-frame">
      <PixelPanel className="inventory">
        <p className="inventory-intro">{siteConfig.skills.description}</p>
        <span className="asset-divider" aria-hidden="true" />
        <div className="skill-grid">
          {skills.map(skill => <article className="skill-group" key={skill.name}>
            <div className="skill-heading"><span className="inventory-slot"><img src={`/assets/ui/Icon_${skill.icon}.png`} alt="" width="32" height="32" loading="lazy" /></span><h3>{skill.name}</h3></div>
            <p>{skill.description}</p>
            <ul>{skill.technologies.map(technology => <li key={technology}>{technology}</li>)}</ul>
          </article>)}
        </div>
      </PixelPanel>
    </PixelPanel>
  </section>;
}
