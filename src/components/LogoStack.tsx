import clsx from '../lib/clsx';
import type { Skill } from '../data/content';

const LOGOS = import.meta.glob<string>('../assets/logos/*.svg', { eager: true, import: 'default' });
// Black-only logos, drawn white on dark cards
const INK = new Set(['express']);

/**
 * The tools of a card as bare logos: on large screens only the first shows, and the others come out
 * from behind it one by one when the card (`group`) is hovered, a thin bar standing for each until then.
 * Smaller screens show the row directly.
 */
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
    <div aria-hidden className={clsx('relative flex flex-wrap gap-3 lg:flex-nowrap lg:gap-0', className)}>
      {items.map((s, i) => (
        <img
          key={s.name}
          src={LOGOS[`../assets/logos/${s.logo}.svg`]}
          alt=""
          width={44}
          height={44}
          style={
            {
              '--i': i,
              zIndex: items.length - i,
              transitionDelay: `${i * 60}ms`,
            } as React.CSSProperties
          }
          className={clsx(
            'size-10 shrink-0 object-contain lg:size-11 lg:not-first:-ml-11',
            'ease-out-expo transition-[translate,scale,opacity] duration-500 motion-reduce:transition-none',
            'lg:not-first:scale-75 lg:not-first:opacity-0 lg:group-hover:translate-x-[calc(var(--i)*3.5rem)] lg:group-hover:scale-100 lg:group-hover:opacity-100',
            dark && INK.has(s.logo) && 'invert',
          )}
        />
      ))}
      {items.length > 1 && (
        <span className="absolute inset-y-0 left-13 hidden items-center gap-1 transition-opacity duration-200 lg:flex lg:group-hover:opacity-0">
          {items.slice(1).map((s, k) => (
            <span key={s.name} className="w-1 rounded-full bg-current opacity-40" style={{ height: `${80 - k * 8}%` }} />
          ))}
        </span>
      )}
    </div>
  );
}
