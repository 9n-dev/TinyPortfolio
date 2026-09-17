import { SceneRegion } from '../components/MapScene';
import { projects } from '../data/projects';
import { siteConfig } from '../data/siteConfig';
import { PixelPanel, SectionTitle } from '../components/PixelUI';
import { ProjectCard } from '../components/ProjectCard';

export function Projects() {
  return <section id="projects" className="section projects" aria-labelledby="projects-title">
    <SceneRegion region="projects" />
    <SectionTitle id="projects-title" title={siteConfig.projects.title} />
    <PixelPanel skin="wood" className="project-board">
      <PixelPanel className="board-intro"><p>{siteConfig.projects.description}</p></PixelPanel>
      <ol className="project-list">{projects.map((project, index) => <li key={project.name}><ProjectCard project={project} index={index} /></li>)}</ol>
    </PixelPanel>
  </section>;
}
