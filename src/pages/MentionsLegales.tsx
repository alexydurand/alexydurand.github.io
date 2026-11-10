import type { ReactNode } from 'react';
import { credits, legal, person } from '../data/content';

const LINK = 'underline decoration-1 underline-offset-4 hover:decoration-2';

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 py-10 md:grid-cols-12 md:gap-6 md:py-14">
      <h2 className="text-lead font-medium md:col-span-4">{title}</h2>
      <div className="max-w-[65ch] space-y-4 text-pretty md:col-span-8">{children}</div>
    </section>
  );
}

export default function MentionsLegales() {
  const mail = (
    <a href={`mailto:${person.email}`} className={LINK}>
      {person.email}
    </a>
  );

  return (
    <>
      <a
        href="#contenu"
        className="fixed top-3 left-3 z-[100] -translate-y-24 bg-ink px-4 py-3 text-bg focus-visible:translate-y-0"
      >
        Aller au contenu
      </a>
      <header className="frame flex h-16 items-center justify-between md:h-20">
        <a href="./" className="-mx-2 px-2 py-3 font-medium tracking-tight">
          {person.firstName} {person.lastName}
        </a>
        <a href="./" className={`py-3 ${LINK}`}>
          Retour au site
        </a>
      </header>

      <main id="contenu" className="frame pt-16 pb-section md:pt-24">
        <h1 className="display title-xl">{legal.title}</h1>
        <p className="mt-6 text-muted">{legal.updated}</p>

        <div className="mt-12 md:mt-20">
          <Block title="Éditeur">
            <p>
              {person.firstName} {person.lastName}, étudiant. Site personnel, sans activité commerciale.
            </p>
            <p>Contact&nbsp;: {mail}</p>
            <p>
              Directeur de la publication&nbsp;: {person.firstName} {person.lastName}
            </p>
          </Block>

          <Block title="Hébergement">
            <p>{legal.host.name}</p>
            <p>{legal.host.address}</p>
            <p>
              <a href={legal.host.url} target="_blank" rel="noreferrer" className={LINK}>
                {legal.host.urlLabel}
              </a>
            </p>
          </Block>

          <Block title="Propriété intellectuelle">
            <p>{legal.ip}</p>
          </Block>

          <Block title="Crédits">
            {credits.map((c) => (
              <p key={c.url}>
                <a href={c.url} target="_blank" rel="noreferrer" className={LINK}>
                  {c.what}
                </a>{' '}
                par {c.who}, {c.licence}.
              </p>
            ))}
            {legal.extra.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p>{legal.logos}</p>
            <p>{legal.font}</p>
          </Block>

          <Block title="Données personnelles">
            <p>{legal.privacy}</p>
            <ul className="space-y-1">
              {legal.privacyLinks.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noreferrer" className={LINK}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </Block>

          <Block title="Liens externes">
            <p>{legal.links}</p>
          </Block>
        </div>
      </main>

      <footer className="bg-coal text-white">
        <div className="frame flex flex-col gap-3 py-10 text-small sm:flex-row sm:justify-between">
          <p>
            © 2026 {person.firstName} {person.lastName}
          </p>
          <a href="./" className={LINK}>
            Retour au site
          </a>
        </div>
      </footer>
    </>
  );
}
