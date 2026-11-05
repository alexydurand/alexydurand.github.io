import { useRef } from 'react';
import { loisirs } from '../data/content';
import useReveal from '../hooks/useReveal';

export default function Loisirs() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section id="loisirs" ref={root} tabIndex={-1} aria-labelledby="loisirs-title" className="bg-bg pt-section outline-none">
      <div className="frame">
        <h2 id="loisirs-title" data-reveal="0" className="display title-xl">
          {loisirs.heading}
        </h2>
      </div>

      <ul className="mt-12 md:mt-20">
        {loisirs.hobbies.map((h, i) => (
          <li key={h.id} className={i % 2 ? 'bg-bg' : 'bg-surface'}>
            <div className="group frame grid min-h-[120px] items-end gap-4 pt-8 pb-6 md:min-h-[170px] md:grid-cols-12 md:gap-6">
              <div data-reveal={0} className="md:col-span-7">
                <h3 className="display text-accent text-[clamp(2.75rem,7vw,6.5rem)] leading-none transition-transform duration-500 ease-out-expo group-hover:translate-x-[2vw] motion-reduce:group-hover:translate-x-0">
                  {h.title}
                </h3>
              </div>
              <p data-reveal={1} className="max-w-[38ch] text-body text-pretty md:col-span-5">
                {h.text}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
