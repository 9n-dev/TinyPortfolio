import { PixelPanel, SectionTitle } from '../components/PixelUI';
import { ProjectCard } from '../components/ProjectCard';
import { useContent } from '../i18n';

export function Projects() {
  const { t } = useContent();
  return <section id="projects" className="section projects" aria-labelledby="projects-title">
    <SectionTitle id="projects-title" title={t.projects.title} />
    <PixelPanel skin="wood" className="project-board">
      <PixelPanel className="board-intro"><p>{t.projects.intro}</p></PixelPanel>
      <ol className="project-list">{t.projects.list.map((project, index) => <li key={project.name}><ProjectCard project={project} index={index} /></li>)}</ol>
    </PixelPanel>
  </section>;
}
