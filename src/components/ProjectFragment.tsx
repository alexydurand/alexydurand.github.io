import type { Project } from '../data/content';

/**
 * Each project drawn as a cropped piece of its own interface (HTML/CSS, no screenshots).
 * Team names, rows and stories are sample content.
 */
export default function ProjectFragment({ id }: { id: Project['id'] }) {
  switch (id) {
    case 'tournoi':
      return <Tournament />;
    case 'bdd':
      return <Database />;
    case 'portfolio':
      return <Session />;
  }
}

function Window({ title, children, dark }: { title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div
      data-ui
      className={`flex h-full flex-col overflow-hidden border text-[13px] ${
        dark ? 'border-white/10 bg-code text-code-ink' : 'border-ink/15 bg-paper text-ink'
      }`}
    >
      <div className={`flex items-center gap-2 px-3 py-2 ${dark ? 'bg-code-bar' : 'bg-surface'}`}>
        <span className="size-2.5 rounded-full bg-dot-red" />
        <span className="size-2.5 rounded-full bg-dot-amber" />
        <span className="size-2.5 rounded-full bg-dot-green" />
        <span className="ml-2 truncate opacity-70">{title}</span>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

// Lines below live inside data-ui fragments (a bracket and a real table), where borders are allowed.
const DIVIDER = 'border-b border-ink/10'; // taste-skill-ignore
const TABLE_RULE = 'border-t border-white/10'; // taste-skill-ignore
const ROW_RULE = 'border-t border-white/5'; // taste-skill-ignore

const TEAMS = ['Nova', 'Kraken', 'Orion', 'Vortex', 'Atlas', 'Phénix', 'Titan', 'Zéphyr'];

function Match({ a, b, win }: { a: string; b: string; win: 0 | 1 }) {
  return (
    <div className="w-full border border-ink/15 bg-paper">
      {[a, b].map((t, i) => (
        <div
          key={t}
          className={`flex justify-between px-2 py-1 ${i === win ? 'bg-accent text-accent-ink' : ''} ${i === 0 ? DIVIDER : ''}`}
        >
          <span className="truncate">{t}</span>
          <span className="tabular">{i === win ? 2 : (TEAMS.indexOf(t) % 2)}</span>
        </div>
      ))}
    </div>
  );
}

function Tournament() {
  return (
    <Window title="Tournoi e-sport · Gestion des matchs">
      <div className="flex h-full">
        <aside className="hidden w-32 shrink-0 bg-surface p-3 sm:block">
          <p className="font-medium">Équipes</p>
          <ul className="mt-2 space-y-1">
            {TEAMS.map((t, i) => (
              <li key={t} className={`px-2 py-0.5 ${i === 0 ? 'bg-ink text-bg' : ''}`}>
                {t}
              </li>
            ))}
          </ul>
        </aside>
        <div className="grid flex-1 grid-cols-3 items-center gap-3 p-3">
          <div className="space-y-3">
            <Match a="Nova" b="Kraken" win={0} />
            <Match a="Orion" b="Vortex" win={1} />
            <Match a="Atlas" b="Phénix" win={0} />
            <Match a="Titan" b="Zéphyr" win={1} />
          </div>
          <div className="space-y-12">
            <Match a="Nova" b="Vortex" win={0} />
            <Match a="Atlas" b="Zéphyr" win={1} />
          </div>
          <div>
            <Match a="Nova" b="Zéphyr" win={0} />
            <p className="mt-2 text-center font-medium text-accent">Vainqueur&nbsp;: Nova</p>
          </div>
        </div>
      </div>
    </Window>
  );
}

function Database() {
  return (
    <Window title="Oracle SQL Developer · requete.sql" dark>
      <div className="flex h-full flex-col">
        <pre className="flex-1 overflow-hidden p-4 font-mono text-[12.5px] leading-relaxed">
          <code>
            <span className="text-code-key">SELECT</span> e.nom, <span className="text-code-key">COUNT</span>(m.id){' '}
            <span className="text-code-key">AS</span> matchs{'\n'}
            <span className="text-code-key">FROM</span> equipe e{'\n'}
            <span className="text-code-key">JOIN</span> participation m <span className="text-code-key">ON</span>{' '}
            m.id_equipe = e.id{'\n'}
            <span className="text-code-key">GROUP BY</span> e.nom{'\n'}
            <span className="text-code-key">ORDER BY</span> matchs <span className="text-code-key">DESC</span>;
          </code>
        </pre>
        <table className={`w-full ${TABLE_RULE} text-left text-[12.5px]`}>
          <thead className="bg-code-bar">
            <tr>
              <th className="px-4 py-1.5 font-medium">NOM</th>
              <th className="px-4 py-1.5 font-medium">MATCHS</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {[
              ['Nova', 7],
              ['Zéphyr', 6],
              ['Atlas', 5],
            ].map(([n, c]) => (
              <tr key={n} className={ROW_RULE}>
                <td className="px-4 py-1.5">{n}</td>
                <td className="px-4 py-1.5">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Window>
  );
}

const TERMINAL = 'font-mono'; // taste-skill-ignore: a terminal transcript, literal commands

// A Claude Code session, as the portfolio was built: prompts, skills, then corrections.
function Session() {
  const prompt = (text: string) => (
    <p className="mt-3 first:mt-0">
      <span className="text-code-key">&gt;</span> {text}
    </p>
  );
  const step = (text: string, done = true) => (
    <p className="pl-4 opacity-75">
      <span className={`mr-2 inline-block size-1.5 rounded-full align-middle ${done ? 'bg-dot-green' : 'bg-dot-amber'}`} />
      {text}
    </p>
  );
  return (
    <Window title="Terminal · claude" dark>
      <div className={`h-full overflow-hidden p-4 ${TERMINAL} text-[12.5px] leading-relaxed`}>
        {prompt('Portfolio one-page en React + TypeScript, Tailwind v4, parallax GSAP et scène 3D Three.js.')}
        {step('Skill(taste-skill) · direction artistique et design system')}
        {step('Skill(ui-ux-pro-max) · accessibilité WCAG AA, prefers-reduced-motion')}
        {step('Write(src/sections/Hero.tsx)')}
        {prompt('Header transparent, texte adapté au fond via data-theme. Accent à revoir.')}
        {step('Skill(impeccable) · palette en tokens @theme')}
        {step('Update(src/index.css)')}
        {prompt('Scroll Hong Kong trop long, supprime la zone morte et ne rends la 3D qu’à l’écran.')}
        {step('Update(src/sections/Voyages.tsx)', false)}
      </div>
    </Window>
  );
}
