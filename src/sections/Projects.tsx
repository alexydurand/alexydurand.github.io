import { useRef } from 'react';
import { person } from '../data/content';
import useReveal from '../hooks/useReveal';
import ProjectStack from '../components/ProjectStack';

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section id="projets" ref={root} tabIndex={-1} aria-labelledby="projets-title" className="bg-bg pb-section outline-none">
      <div className="frame">
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
          <h2 id="projets-title" data-reveal="0" className="display title-xl">
            Projets
          </h2>
          <a
            data-reveal="1"
            href={person.github}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 py-2 text-body underline decoration-1 underline-offset-4 hover:decoration-2 md:mb-[0.8em]"
          >
            Mon GitHub
          </a>
        </div>
      </div>
      <div data-reveal="2" className="mt-8 md:mt-12">
        <ProjectStack />
      </div>
    </section>
  );
}
