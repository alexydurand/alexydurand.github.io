import { type MouseEvent } from 'react';
import { nav, person, ui } from '../data/content';
import { scrollToHash } from '../lib/scroll';
import Aurora from '../components/Aurora';

const LINK = 'py-1 underline-offset-4 transition-colors hover:text-accent hover:underline';

export default function Footer() {
  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToHash(href);
  };

  const columns = [
    {
      title: ui.footer.site,
      links: nav.map((n) => ({
        label: n.label,
        href: n.href,
        onClick: (e: MouseEvent<HTMLAnchorElement>) => go(e, n.href),
      })),
    },
    {
      title: ui.footer.find,
      links: [
        { label: ui.email, href: `mailto:${person.email}` },
        { label: 'LinkedIn', href: person.linkedin, external: true },
        { label: 'GitHub', href: person.github, external: true },
      ],
    },
    {
      title: ui.footer.info,
      links: [
        { label: ui.footer.legal, href: 'mentions-legales.html' },
        {
          label: ui.footer.top,
          href: '#top',
          onClick: (e: MouseEvent<HTMLAnchorElement>) => go(e, '#top'),
        },
      ],
    },
  ];

  return (
    <footer data-theme="dark" className="bg-coal text-ink relative overflow-hidden">
      {/* Northern lights, as on the home page, rising from behind the card; faded at the top, where the
          contact rows end */}
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_45%)]">
        {/* taste-skill-ignore: a mask, the sky must not stop on a hard line */}
        <Aurora />
      </div>
      <div className="relative pt-[clamp(160px,22vw,320px)] pb-8">
        <div className="frame">
          <div className="bg-paper dark:bg-surface grid gap-10 rounded-2xl p-6 md:grid-cols-12 md:p-10">
            <div className="md:col-span-5">
              <p className="display text-[clamp(2.5rem,1rem+4vw,4.5rem)] leading-[0.95]">
                {person.firstName} {person.lastName}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={person.cv}
                  download
                  className="bg-accent text-body text-accent-ink hover:bg-accent-deep inline-flex min-h-12 items-center rounded-full px-6 font-medium transition-colors"
                >
                  {ui.downloadCv}
                </a>
                <a
                  href={`mailto:${person.email}`}
                  className="text-body py-3 underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  {ui.footer.write}
                </a>
              </div>
            </div>
            <nav aria-label={ui.footer.label} className="grid gap-8 sm:grid-cols-3 md:col-span-7">
              {columns.map((c) => (
                <div key={c.title}>
                  <p className="text-small text-muted">{c.title}</p>
                  <ul className="text-body mt-3 flex flex-col items-start">
                    {c.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          onClick={'onClick' in l ? l.onClick : undefined}
                          {...('external' in l ? { target: '_blank', rel: 'noreferrer' } : {})}
                          className={LINK}
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
        <p className="frame text-small mt-6 text-white/70">
          © 2026 {person.firstName} {person.lastName} · Toulouse
        </p>
      </div>
    </footer>
  );
}
