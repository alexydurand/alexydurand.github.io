import { useRef } from 'react';
import { contact, person } from '../data/content';
import useReveal from '../hooks/useReveal';
import clsx from '../lib/clsx';

const ROWS = [
  { label: person.email, href: `mailto:${person.email}`, note: 'E-mail' },
  { label: 'LinkedIn', href: person.linkedin, note: person.linkedinLabel, external: true },
  { label: 'GitHub', href: person.github, note: person.githubLabel, external: true },
];

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  );
}

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section id="contact" ref={root} tabIndex={-1} aria-labelledby="contact-title" className="bg-bg outline-none">
      <div data-theme="dark" className="frame flex min-h-[150px] items-end justify-between gap-6 bg-accent pt-10 pb-5 text-accent-ink max-md:min-h-[96px]">
        <h2 id="contact-title" data-reveal="0" className="display text-[11vw] leading-none md:text-[clamp(2.75rem,6vw,5.5rem)]">
          {contact.greeting}
        </h2>
        <a
          href={`mailto:${person.email}`}
          aria-label={`Écrire à ${person.email}`}
          className="group mb-1 grid size-14 shrink-0 place-items-center rounded-full bg-accent-ink text-accent transition-transform duration-300 ease-out-expo hover:scale-110 md:size-[clamp(3.5rem,5vw,5rem)]"
        >
          <Arrow className="size-1/2 transition-transform duration-300 ease-out-expo group-hover:rotate-45" />
        </a>
      </div>

      <ul>
        {ROWS.map((row, i) => (
          <li key={row.href} className={clsx(i % 2 ? 'bg-bg' : 'bg-surface')}>
            <a
              href={row.href}
              {...(row.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="group frame flex min-h-[96px] items-end justify-between gap-6 pt-8 pb-5 md:min-h-[150px]"
            >
              {/* The reveal animates the wrapper; the hover shift moves the text inside it */}
              <span data-reveal={i} className="block min-w-0">
                <span className="display block text-[7vw] leading-none whitespace-nowrap transition-transform duration-500 ease-out-expo group-hover:translate-x-[2vw] motion-reduce:group-hover:translate-x-0 md:text-[clamp(2.75rem,6vw,5.5rem)]">
                  {row.label}
                </span>
              </span>
              <span className="mb-2 flex shrink-0 items-center gap-3 text-small">
                <span className="hidden sm:inline">{row.note}</span>
                <Arrow className="size-6 -translate-x-2 opacity-0 transition-[opacity,translate] duration-300 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 max-md:translate-x-0 max-md:opacity-100" />
              </span>
            </a>
          </li>
        ))}
        <li className="bg-surface">
          <a
            href="https://www.openstreetmap.org/search?query=Blagnac"
            target="_blank"
            rel="noreferrer"
            className="group frame flex min-h-[96px] items-end justify-between gap-6 pt-8 pb-5 md:min-h-[150px]"
          >
            <span className="display text-[7vw] leading-none transition-transform duration-500 ease-out-expo group-hover:translate-x-[2vw] motion-reduce:group-hover:translate-x-0 md:text-[clamp(2.75rem,6vw,5.5rem)]">
              {contact.place}
            </span>
            <span className="mb-2 flex shrink-0 items-center gap-3 text-small">
              <span className="hidden sm:inline">Carte</span>
              <Arrow className="size-6 -translate-x-2 opacity-0 transition-[opacity,translate] duration-300 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100 max-md:translate-x-0 max-md:opacity-100" />
            </span>
          </a>
        </li>
      </ul>
    </section>
  );
}
