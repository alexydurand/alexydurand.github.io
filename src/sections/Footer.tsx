import { useEffect, useRef, type MouseEvent } from 'react';
import { gsap } from '../lib/gsap';
import { footer, nav, person } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { scrollToHash } from '../lib/scroll';

type Point = [number, number];
const W = 1440;
const H = 520;

/** A ridge through the points (smooth, or straight for rock), closed down to the bottom edge. */
function ridge(pts: Point[], jagged = false) {
  let d = `M0 ${H} L${pts[0]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    if (jagged) {
      d += ` L${pts[i + 1]}`;
      continue;
    }
    // Catmull-Rom to Bézier
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1} ${c2} ${p2}`;
  }
  return `${d} L${W} ${H} Z`;
}

// Far to near. The second one is the Pic du Midi d'Ossau, the mountain of the home page.
const HILLS = [
  { fill: 'fill-hill-1', d: ridge([[0, 250], [200, 212], [420, 236], [640, 196], [900, 226], [1150, 184], [W, 214]]) },
  {
    fill: 'fill-hill-2',
    d: ridge(
      [[0, 300], [260, 278], [470, 262], [560, 214], [610, 150], [640, 118], [668, 160], [700, 104], [736, 146], [790, 214], [900, 252], [1120, 268], [1300, 246], [W, 270]],
      true,
    ),
  },
  { fill: 'fill-hill-3', d: ridge([[0, 330], [260, 302], [520, 336], [800, 296], [1080, 330], [1300, 302], [W, 322]]) },
  { fill: 'fill-hill-4', d: ridge([[0, 382], [300, 352], [600, 386], [900, 346], [1200, 376], [W, 352]]) },
  { fill: 'fill-hill-5', d: ridge([[0, 428], [250, 406], [560, 440], [860, 402], [1150, 432], [W, 406]]) },
  { fill: 'fill-hill-6', d: ridge([[0, 482], [360, 456], [720, 476], [1080, 452], [W, 470]]) },
];

// The winding road on the near hills: a centreline from the far valley to the bottom edge
const ROAD: Point[] = [[700, 335], [745, 368], [675, 405], [770, 450], [720, H + 40]];
const bez = (t: number) => {
  // Catmull-Rom through ROAD, sampled
  const n = ROAD.length - 1;
  const k = Math.min(n - 1, Math.floor(t * n));
  const u = t * n - k;
  const [p0, p1, p2, p3] = [ROAD[k - 1] ?? ROAD[k], ROAD[k], ROAD[k + 1], ROAD[k + 2] ?? ROAD[k + 1]];
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (c - a) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (3 * b - a - 3 * c + d) * u * u * u);
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])] as Point;
};
const SAMPLES = Array.from({ length: 41 }, (_, i) => i / 40);
const CENTRE = SAMPLES.map(bez);
// A ribbon that widens towards the viewer
const ROAD_D = (() => {
  const side = (sign: number) =>
    CENTRE.map(([x, y], i) => {
      const [nx, ny] = CENTRE[Math.min(i + 1, CENTRE.length - 1)];
      const [px, py] = CENTRE[Math.max(i - 1, 0)];
      const len = Math.hypot(nx - px, ny - py) || 1;
      const w = (2 + SAMPLES[i] ** 1.6 * 55) * sign;
      return `${(x - ((ny - py) / len) * w).toFixed(1)},${(y + ((nx - px) / len) * w).toFixed(1)}`;
    });
  return `M${side(1).join(' L')} L${side(-1).reverse().join(' L')} Z`;
})();
const CENTRE_D = `M${CENTRE.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L')}`;

// Wildflowers on the near slopes
const FLOWERS: Point[] = [[120, 470], [210, 492], [330, 478], [460, 500], [980, 488], [1090, 470], [1210, 496], [1330, 480], [60, 505], [1390, 505], [520, 462], [900, 468]];

const LINK = 'py-1 underline-offset-4 transition-colors hover:text-accent hover:underline';

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  // The hills rise into place as the page ends, the nearest ones the most
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<SVGElement>('[data-hill]').forEach((hill, i) => {
        gsap.fromTo(
          hill,
          { y: 24 + i * 26 },
          { y: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 } },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToHash(href);
  };

  const columns = [
    { title: 'Le site', links: nav.map((n) => ({ label: n.label, href: n.href, onClick: (e: MouseEvent<HTMLAnchorElement>) => go(e, n.href) })) },
    {
      title: 'Me trouver',
      links: [
        { label: 'E-mail', href: `mailto:${person.email}` },
        { label: 'LinkedIn', href: person.linkedin, external: true },
        { label: 'GitHub', href: person.github, external: true },
      ],
    },
    {
      title: 'Infos',
      links: [
        { label: 'Mentions légales et crédits', href: 'mentions-legales.html' },
        { label: 'Retour en haut', href: '#top', onClick: (e: MouseEvent<HTMLAnchorElement>) => go(e, '#top') },
      ],
    },
  ];

  return (
    <footer ref={root} data-theme="light" className="overflow-hidden bg-sky text-ink">
      <svg aria-hidden viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-24 block h-[clamp(260px,38vw,560px)] w-full md:mt-32">
        {HILLS.slice(0, -1).map((h) => (
          <path key={h.fill} data-hill d={h.d} className={h.fill} />
        ))}
        {/* Near hill with its road and flowers, rising together */}
        <g data-hill>
          <path d={HILLS[HILLS.length - 1].d} className="fill-hill-6" />
          <path d={ROAD_D} className="fill-road" />
          <path d={CENTRE_D} fill="none" strokeWidth="2" strokeDasharray="10 14" className="stroke-paper/70" />
          {FLOWERS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 ? 4 : 6} className={i % 2 ? 'fill-flower' : 'fill-paper'} />
          ))}
        </g>
      </svg>

      <div className="-mt-px bg-hill-6 pb-8">
        <div className="frame relative z-10 pt-2">
          <div className="grid gap-10 rounded-2xl bg-paper p-6 md:grid-cols-12 md:p-10">
            <div className="md:col-span-5">
              <p className="display text-[clamp(2.5rem,1rem+4vw,4.5rem)] leading-[0.95]">
                {person.firstName} {person.lastName}
              </p>
              <p className="mt-4 max-w-[36ch] text-body text-pretty">{footer.line}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={person.cv}
                  download
                  className="inline-flex min-h-12 items-center rounded-full bg-accent px-6 text-body font-medium text-accent-ink transition-colors hover:bg-accent-deep"
                >
                  Télécharger mon CV
                </a>
                <a href={`mailto:${person.email}`} className="py-3 text-body underline decoration-1 underline-offset-4 hover:decoration-2">
                  M’écrire
                </a>
              </div>
            </div>
            <nav aria-label="Pied de page" className="grid gap-8 sm:grid-cols-3 md:col-span-7">
              {columns.map((c) => (
                <div key={c.title}>
                  <p className="text-small text-muted">{c.title}</p>
                  <ul className="mt-3 flex flex-col items-start text-body">
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
        <p data-theme="dark" className="frame mt-6 text-small text-white/70">
          © 2026 {person.firstName} {person.lastName} · Toulouse
        </p>
      </div>
    </footer>
  );
}
