import { useCallback, useEffect, useRef, useState } from 'react';
import useScrollProgress from '../hooks/useScrollProgress';
import useMediaQuery from '../hooks/useMediaQuery';
import { easeInOut, range } from '../lib/motion';
import hongKong from '../assets/cities/hong-kong.jpg';
import lisbonne from '../assets/cities/lisbonne.webp';
import montreal from '../assets/cities/montreal.webp';
import paris from '../assets/cities/paris.webp';
import torontoNuit from '../assets/cities/toronto-nuit.webp';
import shenzhen from '../assets/cities/shenzhen.webp';

// [width in vw, height in svh, centre x in vw, centre y in svh], from the screen centre
type Box = [number, number, number, number];

type Slot = {
  id: string;
  src: string;
  alt: string;
  city?: string;
  // Which part of the photo to keep when the frame crops it
  focus?: string;
  desktop: Box;
  mobile: Box;
  // How fast it flies away while the camera zooms into Hong Kong
  depth: number;
};

const SLOTS: Slot[] = [
  {
    id: 'hk',
    src: hongKong,
    alt: 'Une rue de Hong Kong la nuit, modélisée en 3D',
    city: 'Hong Kong',
    desktop: [26, 24, 0, 1],
    mobile: [58, 26, 16, -1],
    depth: 0,
  },
  {
    id: 'lisbonne',
    src: lisbonne,
    alt: 'Le château Saint-Georges au-dessus des toits de Lisbonne',
    city: 'Lisbonne',
    desktop: [30, 20, 0, -29],
    mobile: [58, 17, -16, -29.5],
    depth: 0.4,
  },
  {
    id: 'paris',
    src: paris,
    alt: 'La tour Eiffel illuminée au-dessus de la Seine, à l’heure bleue',
    city: 'Paris',
    focus: '50% 40%',
    desktop: [17, 44, -28, -4],
    mobile: [28, 26, -31, -1],
    depth: 0.5,
  },
  {
    id: 'montreal',
    src: montreal,
    alt: 'Les tours du centre-ville de Montréal vues du mont Royal',
    city: 'Montréal',
    desktop: [24, 22, 29, -21],
    mobile: [30, 17, 30, -29.5],
    depth: 0.45,
  },
  {
    id: 'toronto-nuit',
    src: torontoNuit,
    alt: 'Toronto la nuit, reflétée dans le lac Ontario',
    city: 'Toronto',
    focus: '40% 50%',
    desktop: [26, 18, 30, 9],
    mobile: [44, 18, 23, 28],
    depth: 0.55,
  },
  {
    id: 'shenzhen',
    src: shenzhen,
    alt: 'Le centre de Shenzhen illuminé à la tombée de la nuit',
    city: 'Shenzhen',
    desktop: [24, 20, -2, 29.5],
    mobile: [44, 18, -23, 28],
    depth: 0.6,
  },
];

const HK = 0;

// A flight route wandering through the empty margins of the collage (vw, svh from the centre), behind
// the pictures, ending on Hong Kong. Desktop only: on phones the pictures fill the screen.
const ROUTE: [number, number][] = [
  [-56, 44],
  [-41, 32],
  [-45, -8],
  [-37, -36],
  [-14, -38],
  [0, -29],
  [20, -38],
  [43, -35],
  [29, -21],
  [46, -2],
  [30, 9],
  [42, 36],
  [16, 44],
  [-2, 29.5],
  [-24, 26],
  [-14, 14],
  [0, 1],
];

/** Smooth path through the points (Catmull-Rom), in pixels of a W × H box. */
function routePath(W: number, H: number) {
  const pts = ROUTE.map(([x, y]) => [W / 2 + (x * W) / 100, H / 2 + (y * H) / 100]);
  let d = `M${pts[0]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2}`;
  }
  return d;
}
// Scroll length of the pinned collage, and how it is spent: a short look at the collage, the zoom into
// Hong Kong, then the picture fades over the 3D scene, whose first frame it is. The fade lasts
// (260 - 100) × 0.2 = 32svh: HongKong.tsx overlaps this section by 100 + 32svh to sit under it.
const VOYAGES_SVH = 260;
const ZOOM: [number, number] = [0.15, 0.8];

export default function Voyages() {
  const wrapper = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const collage = useRef<HTMLDivElement>(null);
  const slots = useRef<(HTMLDivElement | null)[]>([]);
  const route = useRef<SVGSVGElement>(null);
  const plane = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState<[number, number]>([0, 0]);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mobile = useMediaQuery('(max-width: 767px)');

  // The route is drawn in pixels so the plane keeps its shape: follow the stage size
  useEffect(() => {
    const st = stage.current;
    if (!st) return;
    const ro = new ResizeObserver(() => setBox([st.clientWidth, st.clientHeight]));
    ro.observe(st);
    return () => ro.disconnect();
  }, []);

  const onProgress = useCallback((p: number) => {
    const st = stage.current;
    const col = collage.current;
    const target = slots.current[HK];
    if (!st || !col || !target) return;
    const e = easeInOut(range(p, ZOOM[0], ZOOM[1]));
    const fade = range(p, ZOOM[1], 1);
    st.style.opacity = String(1 - fade);
    for (const el of [route.current, plane.current]) if (el) el.style.opacity = String(1 - range(e, 0, 0.35));
    const W = st.clientWidth;
    const H = st.clientHeight;
    const centre = (el: HTMLDivElement) => [
      el.offsetLeft + el.offsetWidth / 2 - W / 2,
      el.offsetTop + el.offsetHeight / 2 - H / 2,
    ];
    const [cx, cy] = centre(target);
    // Zoom so Hong Kong covers the screen, its centre moving to the screen centre; keep pushing in a
    // little while it fades, as the 3D camera starts to move
    const s = Math.max(W / target.offsetWidth, H / target.offsetHeight) * 1.002;
    const S = Math.pow(s, e) * (1 + fade * 0.05);
    col.style.transform = `translate3d(${cx * (1 - e) - cx * S}px, ${cy * (1 - e) - cy * S}px, 0) scale(${S})`;
    // The other pictures fly away from it, each at its own speed
    slots.current.forEach((el, i) => {
      if (!el || i === HK) return;
      const [x, y] = centre(el);
      const k = SLOTS[i].depth * e;
      el.style.transform = `translate3d(${(x - cx) * k}px, ${(y - cy) * k}px, 0)`;
    });
    // Tell the header once the dark picture is behind it
    const theme = e > 0.5 ? 'dark' : 'light';
    if (st.dataset.theme !== theme) {
      st.dataset.theme = theme;
      window.dispatchEvent(new Event('header-theme'));
    }
  }, []);
  useScrollProgress(wrapper, onProgress, !reducedMotion);

  return (
    // Its title and sentence are the last row of Loisirs, just above
    <section aria-label="Photos de voyage" className="relative z-10">
      <div ref={wrapper} style={reducedMotion ? undefined : { height: `${VOYAGES_SVH}svh` }}>
        <div ref={stage} data-theme="light" className="bg-bg sticky top-0 h-svh overflow-hidden">
          {!mobile && box[0] > 0 && (
            <svg
              ref={route}
              aria-hidden
              viewBox={`0 0 ${box[0]} ${box[1]}`}
              className="absolute inset-0 size-full"
            >
              <path
                id="voyages-route"
                d={routePath(box[0], box[1])}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="1 11"
                className="stroke-ink/35 animate-[march_1.2s_linear_infinite] motion-reduce:animate-none"
              />
            </svg>
          )}
          <div ref={collage} className="absolute inset-0 origin-center">
            {SLOTS.map((s, i) => {
              const [w, h, x, y] = mobile ? s.mobile : s.desktop;
              return (
                <div
                  key={s.id}
                  ref={(el) => {
                    slots.current[i] = el;
                  }}
                  className="absolute"
                  style={{
                    width: `${w}vw`,
                    height: `${h}svh`,
                    left: `${50 + x - w / 2}vw`,
                    top: `calc(50% + ${y - h / 2}svh)`,
                  }}
                >
                  <img
                    src={s.src}
                    alt={s.alt}
                    width={1200}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    className="bg-surface-2 size-full rounded-md object-cover"
                    style={s.focus ? { objectPosition: s.focus } : undefined}
                  />
                  {s.city && (
                    <p className="text-small md:text-body absolute top-full left-0 mt-1.5">
                      {s.city}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {/* The plane flies over the pictures, along the route drawn under them */}
          {!mobile && !reducedMotion && box[0] > 0 && (
            <svg
              ref={plane}
              aria-hidden
              viewBox={`0 0 ${box[0]} ${box[1]}`}
              className="pointer-events-none absolute inset-0 size-full"
            >
              <path
                d="M13 0 4-1.6-1-9.5h-3.2L-1-1.6h-7.5L-10.5-5.5h-2L-11 0l-1.5 5.5h2L-8 1.6h7L-4 9.5h3.2L4 1.6Z"
                className="fill-ink"
              >
                <animateMotion dur="18s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#voyages-route" />
                </animateMotion>
              </path>
            </svg>
          )}
        </div>
      </div>
    </section>
  );
}
