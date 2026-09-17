import type { Project } from '../content/en';
import { useContent } from '../i18n';
import { PixelButton, PixelPanel } from './PixelUI';

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { t } = useContent();
  return <article className="project-card">
    <PixelPanel>
      <span className="project-index" aria-hidden="true">0{index + 1}</span>
      <div className="project-copy">
      <div className="project-meta"><p>{project.category}</p></div>
      <h3>{project.name}</h3>
      {project.image && <img className="project-shot" src={project.image} alt="" loading="lazy" />}
      <p className="project-description">{project.description}</p>
      <ul className="stack" aria-label={t.projects.stackLabel}>
        {project.stack.map(technology => <li key={technology}>{technology}</li>)}
      </ul>
      </div>
      {(project.url || project.sourceUrl) && <div className="project-actions">
        {project.url && <PixelButton href={project.url} target="_blank" rel="noreferrer" aria-label={`${t.projects.view}: ${project.name}`}>{t.projects.view}</PixelButton>}
        {project.sourceUrl && <PixelButton className="secondary" href={project.sourceUrl} target="_blank" rel="noreferrer" aria-label={`${t.projects.source}: ${project.name}`}>{t.projects.source}</PixelButton>}
      </div>}
    </PixelPanel>
  </article>;
}
