import { useRef, type CSSProperties } from 'react';
import { contact, person, ui } from '../data/content';
import Keycap from '../components/Keycap';
import useNear from '../hooks/useNear';
import useReveal from '../hooks/useReveal';
import clsx from '../lib/clsx';

// On a phone the address may take two lines: only ever before the @
const [user, domain] = person.email.split('@');
const rows = () => [
  {
    label: (
      <>
        {user}
        <wbr />@{domain}
      </>
    ),
    href: `mailto:${person.email}`,
    note: ui.email,
  },
  { label: 'LinkedIn', href: person.linkedin, note: person.linkedinLabel, external: true },
  { label: 'GitHub', href: person.github, note: person.githubLabel, external: true },
];

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M5 19 19 5M8 5h11v11" />
    </svg>
  );
}

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);
  // The key's walls only near the screen, like every key
  const near = useNear(root);

  return (
    <section
      id="contact"
      ref={root}
      tabIndex={-1}
      aria-labelledby="contact-title"
      className="bg-bg outline-none"
    >
      {/* A row like the ones below: hovering it shifts the words, presses the key and turns its arrow right */}
      <h2 id="contact-title" data-theme="dark" className="bg-coal text-white">
        <a
          href={`mailto:${person.email}`}
          className="group frame flex min-h-[150px] items-end justify-between gap-6 pt-10 pb-5 max-md:min-h-[96px]"
        >
          <span data-reveal="0" className="block min-w-0">
            <span className="display ease-out-expo block text-[2.75rem] leading-none transition-transform duration-500 group-hover:translate-x-[2vw] motion-reduce:group-hover:translate-x-0 md:text-[clamp(2.75rem,6vw,5.5rem)]">
              {contact.greeting}
            </span>
          </span>
          {/* A light key of the keyboard (Mes outils), turned a little, like those of Mes loisirs */}
          <span
            aria-hidden
            style={{ '--key': 'var(--color-ink)' } as CSSProperties}
            className="pointer-events-none relative mb-1 size-(--k) shrink-0 [transform:perspective(40rem)_rotateX(28deg)] [--k:3.5rem] transform-3d md:[--k:clamp(3.5rem,5vw,5rem)]"
          >
            <Keycap
              light
              walls={near}
              label={
                <Arrow className="ease-out-expo size-[46%] transition-transform duration-300 group-hover:rotate-45 motion-reduce:transition-none" />
              }
            />
          </span>
        </a>
      </h2>

      <ul>
        {rows().map((row, i) => (
          <li key={row.href} className={clsx(i % 2 ? 'bg-bg' : 'bg-surface')}>
            <a
              href={row.href}
              {...(row.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              className="group frame flex min-h-[96px] items-end justify-between gap-6 pt-8 pb-5 md:min-h-[150px]"
            >
              {/* The reveal animates the wrapper; the hover shift moves the text inside it */}
              <span data-reveal={i} className="block min-w-0">
                <span className="display ease-out-expo block text-[2.75rem] leading-none transition-transform duration-500 group-hover:translate-x-[2vw] motion-reduce:group-hover:translate-x-0 md:text-[clamp(2.75rem,6vw,5.5rem)]">
                  {row.label}
                </span>
              </span>
              <span className="text-small mb-2 flex shrink-0 items-center gap-3">
                <span className="hidden sm:inline">{row.note}</span>
                <Arrow className="ease-out-expo size-6 -translate-x-2 opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100 max-md:translate-x-0 max-md:opacity-100" />
              </span>
            </a>
          </li>
        ))}
        {/* Black like LinkedIn: after GitHub's grey row the colours keep alternating */}
        <li className="bg-bg">
          <a
            href="https://www.openstreetmap.org/search?query=Blagnac"
            target="_blank"
            rel="noreferrer"
            className="group frame flex min-h-[96px] items-end justify-between gap-6 pt-8 pb-5 md:min-h-[150px]"
          >
            {/* Revealed with the rows above: shown alone, it appeared before them */}
            <span data-reveal={rows().length} className="block min-w-0">
              <span className="display ease-out-expo block text-[2.75rem] leading-none transition-transform duration-500 group-hover:translate-x-[2vw] motion-reduce:group-hover:translate-x-0 md:text-[clamp(2.75rem,6vw,5.5rem)]">
                {contact.place}
              </span>
            </span>
            <span className="text-small mb-2 flex shrink-0 items-center gap-3">
              <span className="hidden sm:inline">{ui.map}</span>
              <Arrow className="ease-out-expo size-6 -translate-x-2 opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100 max-md:translate-x-0 max-md:opacity-100" />
            </span>
          </a>
        </li>
      </ul>
    </section>
  );
}
