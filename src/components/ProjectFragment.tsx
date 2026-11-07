import type { Project } from '../data/content';

/**
 * Each project drawn as a cropped piece of its own interface (HTML/CSS, no screenshots).
 * Concert, rows and stories are sample content.
 */
export default function ProjectFragment({ id }: { id: Project['id'] }) {
  switch (id) {
    case 'killkeny':
      return <BandManager />;
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

// Lines below live inside a data-ui fragment (a real table), where borders are allowed.
const TABLE_RULE = 'border-t border-white/10'; // taste-skill-ignore
const ROW_RULE = 'border-t border-white/5'; // taste-skill-ignore

// The home screen of the band's app, as built so far: next concert, shortcuts, tab bar (phone layout)
function BandManager() {
  return (
    <Window title="Band Manager · Accueil" dark>
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-3 px-4 pt-4">
          <p className="text-[15px] font-medium">Kill Keny</p>
          <span className="flex items-center gap-1.5 text-[11.5px] opacity-75">
            <span className="size-1.5 rounded-full bg-dot-green" />
            API et base en ligne
          </span>
        </div>
        <div className="m-4 bg-code-bar p-4">
          <p className="text-[11.5px] opacity-60">Prochain concert</p>
          <p className="mt-1 text-[17px] font-medium">Samedi · 21&nbsp;h</p>
          <p className="opacity-75">Fête de village · Agen</p>
        </div>
        <div className="grid grid-cols-2 gap-2 px-4">
          {['Agenda', 'Setlists', 'Contrats', 'Matériel'].map((t) => (
            <p key={t} className="bg-code-bar px-3 py-2.5">
              {t}
            </p>
          ))}
        </div>
        <div className="mt-auto grid grid-cols-4 bg-code-bar text-center text-[11.5px]">
          {['Accueil', 'Agenda', 'Setlists', 'Groupe'].map((t, i) => (
            <span key={t} className={`py-2.5 ${i === 0 ? 'text-code-key' : 'opacity-60'}`}>
              {t}
            </span>
          ))}
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
