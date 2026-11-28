import type { Project } from '../data/content';
import bomberman from '../assets/projects/bomberman.webp';

/**
 * Each project shown by a real screenshot, or drawn as a cropped piece of its own interface (HTML/CSS) when there is
 * none: teams and stories are sample content.
 */
export default function ProjectFragment({ id }: { id: Project['id'] }) {
  switch (id) {
    case 'killkeny':
    case 'pokevaleur':
    case 'bdd':
      return <Shot name={id} />;
    case 'bomberman':
      return <GodotLevel />;
    case 'tournoi':
      return <Tournament />;
    case 'portfolio':
      return <Session />;
  }
}

function Window({
  title,
  children,
  dark,
}: {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      data-ui
      className={`flex h-full flex-col overflow-hidden border text-[13px] ${
        dark
          ? 'bg-code text-code-ink border-white/10'
          : 'keep-light border-ink/15 bg-paper text-ink'
      }`}
    >
      <div className={`flex items-center gap-2 px-3 py-2 ${dark ? 'bg-code-bar' : 'bg-surface'}`}>
        <span className="bg-dot-red size-2.5 rounded-full" />
        <span className="bg-dot-amber size-2.5 rounded-full" />
        <span className="bg-dot-green size-2.5 rounded-full" />
        <span className="ml-2 truncate opacity-70">{title}</span>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

// The line below lives inside a data-ui fragment (a bracket), where borders are allowed.
const DIVIDER = 'border-b border-ink/10'; // taste-skill-ignore

// The real screenshots, three per project: name-desktop, -tablet and -phone.webp
const SHOTS = import.meta.glob<string>('../assets/projects/*.webp', {
  eager: true,
  import: 'default',
});
const shot = (file: string) => SHOTS[`../assets/projects/${file}.webp`];

// Each shot has the shape of the card on that screen (computer, tablet, phone), so nothing of it is cut off
function Shot({ name }: { name: Project['id'] }) {
  return (
    <picture className="block size-full">
      <source media="(min-width: 64rem)" srcSet={shot(`${name}-desktop`)} />
      <source media="(min-width: 48rem)" srcSet={shot(`${name}-tablet`)} />
      <img
        src={shot(`${name}-phone`)}
        alt=""
        width={900}
        height={708}
        loading="lazy"
        decoding="async"
        className="size-full object-cover object-top"
      />
    </picture>
  );
}

// The real level in the Godot editor, the only picture left of it: each card crops it to its own shape
function GodotLevel() {
  return (
    <img
      src={bomberman}
      alt=""
      width={1202}
      height={537}
      loading="lazy"
      decoding="async"
      className="size-full object-cover"
    />
  );
}

const TEAMS = ['Nova', 'Kraken', 'Orion', 'Vortex', 'Atlas', 'Phénix', 'Titan', 'Zéphyr'];

function Match({ a, b, win }: { a: string; b: string; win: 0 | 1 }) {
  return (
    <div className="keep-light border-ink/15 bg-paper w-full border">
      {[a, b].map((t, i) => (
        <div
          key={t}
          className={`flex justify-between px-2 py-1 ${i === win ? 'bg-accent text-accent-ink' : ''} ${i === 0 ? DIVIDER : ''}`}
        >
          <span className="truncate">{t}</span>
          <span className="tabular">{i === win ? 2 : TEAMS.indexOf(t) % 2}</span>
        </div>
      ))}
    </div>
  );
}

function Tournament() {
  return (
    <Window title="Tournoi e-sport · Gestion des matchs">
      <div className="flex h-full">
        <aside className="bg-surface hidden w-32 shrink-0 p-3 sm:block">
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
            <p className="text-accent mt-2 text-center font-medium">Vainqueur&nbsp;: Nova</p>
          </div>
        </div>
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
      <span
        className={`mr-2 inline-block size-1.5 rounded-full align-middle ${done ? 'bg-dot-green' : 'bg-dot-amber'}`}
      />
      {text}
    </p>
  );
  return (
    <Window title="Terminal · claude" dark>
      <div className={`h-full overflow-hidden p-4 ${TERMINAL} text-[12.5px] leading-relaxed`}>
        {prompt(
          'Portfolio one-page en React + TypeScript, Tailwind v4, parallax GSAP et scène 3D Three.js.',
        )}
        {step('Skill(taste-skill) · direction artistique et design system')}
        {step('Skill(ui-ux-pro-max) · accessibilité WCAG AA, prefers-reduced-motion')}
        {step('Write(src/sections/Hero.tsx)')}
        {prompt('Header transparent, texte adapté au fond via data-theme. Accent à revoir.')}
        {step('Skill(impeccable) · palette en tokens @theme')}
        {step('Update(src/index.css)')}
        {prompt(
          'Scroll Hong Kong trop long, supprime la zone morte et ne rends la 3D qu’à l’écran.',
        )}
        {step('Update(src/sections/Voyages.tsx)', false)}
      </div>
    </Window>
  );
}
