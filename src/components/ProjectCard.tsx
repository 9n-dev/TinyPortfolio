import type { Project } from '../data/projects';
import { PixelButton, PixelPanel } from './PixelUI';

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return <article className="project-card">
    <PixelPanel>
      <span className="project-index" aria-hidden="true">0{index + 1}</span>
      <div className="project-copy">
      <div className="project-meta"><p>{project.category}</p></div>
      <h3>{project.name}</h3>
      <p className="project-description">{project.description}</p>
      <ul className="stack" aria-label="Technology stack">
        {project.stack.map(technology => <li key={technology}>{technology}</li>)}
      </ul>
      </div>
      <div className="project-actions">
        <PixelButton href={project.url} target="_blank" rel="noreferrer" aria-label={`View ${project.name} (placeholder link)`}>View Project <span aria-hidden="true">↗</span></PixelButton>
        <PixelButton className="secondary" href={project.sourceUrl} target="_blank" rel="noreferrer" aria-label={`Source code for ${project.name} (placeholder link)`}>Source Code <span aria-hidden="true">↗</span></PixelButton>
      </div>
    </PixelPanel>
  </article>;
}
