import clsx from '../lib/clsx';
import type { Skill } from '../data/content';

const LOGOS = import.meta.glob<string>('../assets/logos/*.svg', { eager: true, import: 'default' });
// Black-only logos, drawn white on dark cards
const INK = new Set(['express']);

/** The tools of a card as a row of bare logos (their names are listed with them). */
export default function LogoStack({
  items,
  dark = false,
  className,
}: {
  items: Skill[];
  dark?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden className={clsx('flex flex-wrap gap-3', className)}>
      {items.map((s) => (
        <img
          key={s.name}
          src={LOGOS[`../assets/logos/${s.logo}.svg`]}
          alt=""
          width={44}
          height={44}
          loading="lazy"
          className={clsx('size-10 shrink-0 object-contain lg:size-11', dark && INK.has(s.logo) && 'invert')}
        />
      ))}
    </div>
  );
}
