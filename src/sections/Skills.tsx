import { useRef, type MouseEvent } from 'react';
import { skills, ui } from '../data/content';
import { scrollToHash } from '../lib/scroll';
import useReveal from '../hooks/useReveal';
import Keyboard from '../components/Keyboard';

export default function Skills() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  const toProjects = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToHash('#projets');
  };

  return (
    <section
      id="outils"
      ref={root}
      tabIndex={-1}
      aria-labelledby="skills-title"
      // Positioned, so that it paints over the hero's fixed roses (Hero.tsx): on an iPhone they are still there, for
      // a moment, once the band above has gone up, and their stem showed through this section's top
      className="bg-bg relative pb-24 outline-none md:pb-36"
    >
      <div className="frame pt-6 md:pt-8">
        <h2 id="skills-title" data-reveal="0" className="display title-xl">
          {skills.heading}
        </h2>

        <div data-reveal="0" className="mt-12 md:mt-16">
          <Keyboard />
        </div>

        <a
          href="#projets"
          onClick={toProjects}
          data-reveal="0"
          className="group mt-20 flex items-center gap-4 text-[clamp(1.375rem,1.1rem+1vw,2rem)] font-medium tracking-tight md:mt-28"
        >
          <span className="ease-out-expo transition-transform duration-500 group-hover:translate-x-[1vw] motion-reduce:group-hover:translate-x-0">
            {ui.toProjects}
          </span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="text-accent ease-out-expo size-7 shrink-0 transition-transform duration-500 group-hover:translate-y-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
