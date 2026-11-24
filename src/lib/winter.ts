import type { Point } from './ridge';

/*
 * Winter on the home page hills (WinterScene.tsx), in the coordinates of their picture (2400 × 1361):
 * spruces in small woods, light strings on them and from one to the next, snowy paths. Built once, with
 * a fixed seed: the same forest on every visit.
 */

// mulberry32
function random(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (a: Point, b: Point, t: number): Point => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
const down = ([x, y]: Point, dy: number): Point => [x, y + dy];
const poly = (pts: Point[]) =>
  `M${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}Z`;

export const BULBS = ['red', 'gold', 'blue', 'green', 'pink'] as const;

// x, ground y (just under a measured crest) and height, far to near: woods on the far crest, then the
// middle hill, then the front. None where the portrait or, on phones, the role line stand.
const TREES: [number, number, number][] = [
  [300, 1048, 70],
  [340, 1048, 56],
  [395, 1045, 82],
  [440, 1042, 60],
  [480, 1040, 50],
  [950, 1056, 66],
  [995, 1057, 86],
  [1040, 1057, 58],
  [110, 1162, 130],
  [190, 1155, 152],
  [255, 1146, 118],
  [545, 1083, 120],
  [600, 1073, 94],
  [330, 1284, 222],
  [705, 1287, 196],
  [850, 1285, 240],
  [1585, 1262, 210],
  [2010, 1182, 230],
  [2250, 1135, 190],
];

// Neighbours on the same hill that a light string joins
const STRINGS: [number, number][] = [
  [300, 395],
  [950, 995],
  [110, 190],
  [190, 255],
  [545, 600],
  [330, 705],
  [705, 850],
  [1585, 2010],
  [2010, 2250],
];

/*
 * A spruce 100 high standing on (0, 0), after the dense firs of a forest: from the bottom up, tiers of
 * drooping clumps of needles out to both sides and towards the viewer, lighter towards the moon (right,
 * top), snow lying on many. A few of them, each used for several trees of the hills.
 */
const TIERS = 24;
const halfWidth = (y: number) => 25 * Math.max(0, (y + 100) / 94) ** 0.9;
const SHADES = ['fill-fir-deep', 'fill-fir', 'fill-fir-light/75', 'fill-fir-light'];

export type Part = { d: string; className: string };

function spruce(seed: number) {
  const r = random(seed);
  const parts: Part[] = [];
  const right: Point[] = [];
  const left: Point[] = [];
  const shade = (x: number, hw: number, t: number) => {
    const light = 0.55 + (0.3 * x) / hw - 0.35 * t + (r() - 0.5) * 0.4;
    return SHADES[Math.min(3, Math.max(0, Math.floor(light * 4)))];
  };
  // A clump from root to tip: its upper edge arching a little, ragged; needles hanging in a fringe under it
  const clump = (root: Point, tip: Point, thick: number) => {
    const top = [0, 1, 2, 3, 4].map((k) =>
      down(
        lerp(root, tip, k / 4),
        -thick * 0.45 * Math.sin((Math.PI * k) / 4) - (k % 2) * r() * 0.6,
      ),
    );
    const fringe = [8, 7, 6, 5, 4, 3, 2, 1].map((k) =>
      down(lerp(root, tip, k / 9), thick * (1 - k / 9) ** 0.7 * (k % 2 ? 1 : 0.55 + 0.3 * r())),
    );
    return poly([...top, ...fringe]);
  };
  const layers: Part[][] = [];
  for (let i = 0; i < TIERS; i++) {
    const t = (i + 1) / TIERS;
    const y0 = -100 + t * 94;
    const hw = halfWidth(y0) + 1;
    const tier: Part[] = [];
    // Out to both sides, the longest first so that the shorter ones lie in front of it
    for (const dir of [1, -1]) {
      for (const long of [true, false]) {
        const len = (long ? 0.9 + 0.2 * r() : 0.5 + 0.3 * r()) * hw;
        const root: Point = [dir * (0.5 + r()), y0 - 2 - 2 * r()];
        const tip: Point = [dir * len, y0 + (1.5 + 4 * t) * (0.7 + 0.6 * r()) * (long ? 1 : 0.7)];
        const thick = (2 + 3.5 * t) * (0.7 + 0.6 * r());
        if (long) (dir > 0 ? right : left).push(tip);
        tier.push({ d: clump(root, tip, thick), className: shade(tip[0] / 2, hw, t) });
        if (r() < 0.55) {
          const a = 0.4 + 0.25 * r();
          const m = (a + 0.95) / 2;
          const lift = thick * 0.45 * Math.sin(Math.PI * m);
          tier.push({
            d: poly([
              down(lerp(root, tip, a), -lift * 0.8),
              down(lerp(root, tip, m), -lift - 0.7),
              down(lerp(root, tip, 0.95), -0.3),
              down(lerp(root, tip, m), -lift + 0.6),
            ]),
            className: 'fill-snow/70',
          });
        }
      }
    }
    // Branches coming towards the viewer: short mounds in front of the trunk
    for (let c = 0; c < (t > 0.15 ? 2 : 1); c++) {
      const cx = (r() * 2 - 1) * hw * 0.5;
      const half = hw * (0.22 + 0.2 * r()) + 1;
      const yb = y0 + 1 + 2 * t * r();
      const arch = 1.5 + 2 * t;
      const top = [0, 1, 2, 3, 4].map((k): Point => [
        cx - half + (half * k) / 2,
        yb - arch * Math.sin((Math.PI * k) / 4) - (k % 2) * r() * 0.5,
      ]);
      const fringe = [7, 6, 5, 4, 3, 2, 1].map((k): Point => [
        cx - half + (half * k) / 4,
        yb + (1 + 2.5 * t) * (0.5 + 0.5 * Math.sin((Math.PI * k) / 8)) * (k % 2 ? 1 : 0.5),
      ]);
      tier.push({ d: poly([...top, ...fringe]), className: shade(cx, hw, t) });
    }
    layers.push(tier);
  }
  // The shadow inside, then the tiers from the bottom up: each one's needles hang over the one below
  parts.push({
    d: poly([[0, -100], ...right, [2, 1], [-2, 1], ...left.reverse()]),
    className: 'fill-fir-deep',
  });
  parts.push(...layers.reverse().flat());
  return parts;
}

export const TEMPLATES = Array.from({ length: 6 }, (_, i) => spruce(i * 7919 + 17));

export type Bulb = { x: number; y: number; r: number; color: number; phase: number };

const bulbs: Bulb[] = [];
const wires: string[] = [];

// A string of lights hanging from a to b, a bulb every `step`
function hang(a: Point, b: Point, sag: number, step: number, r: number, wire: boolean) {
  const c: Point = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2 * sag];
  const n = Math.max(3, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const k = bulbs.length;
    bulbs.push({
      x: (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
      y: (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
      r,
      color: (k * 3 + (k >> 2)) % BULBS.length,
      phase: (k * 7) % 3,
    });
  }
  if (wire) wires.push(`M${a} Q${c} ${b}`);
}

export const SPRUCES = TREES.map(([x, y, h], i) => {
  const r = random(i * 31 + 5);
  const k = h / 100;
  const at = (u: number, v: number): Point => [x + u * k, y + v * k];
  // A light string wound around it, in front, from the top down
  const turns = h > 150 ? 4 : h > 90 ? 3 : 2;
  for (let j = 0; j < turns; j++) {
    const y1 = -86 + (j * 72) / turns;
    const y2 = y1 + (72 / turns) * 0.55;
    const a = at(-halfWidth(y1) * 0.9, y1);
    const b = at(halfWidth(y2) * 0.9, y2);
    hang(a, b, (4 + j * 1.5) * k, 8 * k, 1.2 + h / 240, false);
  }
  // Baubles among the branches of the bigger ones
  const baubles = Array.from({ length: h >= 180 ? 6 : h >= 110 ? 4 : 0 }, (_, j) => {
    const v = -78 + r() * 62;
    return [(r() * 2 - 1) * halfWidth(v) * 0.6, v, (i + j * 2) % BULBS.length] as const;
  });
  return { x, y, h, template: i % TEMPLATES.length, baubles };
});

STRINGS.forEach(([from, to]) => {
  const a = SPRUCES.find((s) => s.x === from)!;
  const b = SPRUCES.find((s) => s.x === to)!;
  const ends = [a, b].map((s, i) => {
    const k = s.h / 100;
    return [s.x + (i ? -1 : 1) * halfWidth(-42) * 0.8 * k, s.y - 42 * k] as Point;
  });
  const len = Math.hypot(ends[1][0] - ends[0][0], ends[1][1] - ends[0][1]);
  hang(ends[0], ends[1], len * 0.1 + 4, 16, 1.2 + (a.h + b.h) / 480, true);
});

export const LIGHTS = bulbs;
export const WIRES = wires.join(' ');

/*
 * Snowy paths winding up the hills, a piece on each hill they cross: wide in front, thin far away. Each
 * piece is cut by the crest in front of it (WinterScene.tsx), so a path that goes over a hill disappears
 * behind it and comes out again further on, higher up and narrower. Centre points with their width.
 */
export type Plane = 'near' | 'middle' | 'far';
const PATHS: { plane: Plane; pts: [number, number, number][] }[] = [
  // Up the middle of the near hill, over it, then up the middle one and over the far crest
  {
    plane: 'near',
    pts: [
      [470, 1385, 72],
      [540, 1335, 60],
      [575, 1295, 48],
      [600, 1262, 40],
      [612, 1235, 34],
    ],
  },
  {
    plane: 'middle',
    pts: [
      [690, 1300, 30],
      [730, 1250, 27],
      [760, 1205, 23],
      [720, 1160, 18],
      [770, 1112, 13],
      [860, 1070, 9],
      [910, 1040, 7],
    ],
  },
  // On the right: over the near hill, up the middle one, then out again on the far one
  {
    plane: 'near',
    pts: [
      [1990, 1385, 80],
      [1900, 1335, 64],
      [1830, 1290, 50],
      [1780, 1250, 42],
      [1755, 1222, 36],
    ],
  },
  {
    plane: 'middle',
    pts: [
      [1690, 1268, 30],
      [1700, 1215, 26],
      [1780, 1165, 19],
      [1870, 1112, 13],
      [1940, 1070, 9],
      [1990, 1040, 7],
    ],
  },
  {
    plane: 'far',
    pts: [
      [2035, 1075, 8],
      [2060, 1030, 7],
      [2120, 995, 5],
      [2100, 962, 4],
      [2160, 932, 3],
      [2210, 905, 2.5],
    ],
  },
  // Along the middle hill on the left, then over its crest
  {
    plane: 'middle',
    pts: [
      [-30, 1236, 32],
      [120, 1222, 26],
      [260, 1196, 20],
      [380, 1160, 14],
      [450, 1125, 10],
      [500, 1098, 7],
      [520, 1080, 6],
    ],
  },
];

const line = (p: Point[]) => `M${p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`;

// A path's ribbon around its smooth centre line: its surface, the banks along both edges, the trodden middle
// and two rows of footprints, sized to its mean width (`w`)
function ribbon(pts: [number, number, number][], seed: number) {
  const r = random(seed);
  const samples: [number, number, number][] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    for (let s = 0; s < 10; s++) {
      const t = s / 10;
      const cr = (k: 0 | 1) =>
        0.5 *
        (2 * p1[k] +
          (p2[k] - p0[k]) * t +
          (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t +
          (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t * t * t);
      samples.push([cr(0), cr(1), p1[2] + (p2[2] - p1[2]) * t]);
    }
  }
  samples.push(pts[pts.length - 1]);
  const offset = (f: number, ragged = true) =>
    samples.map(([x, y, w], i): Point => {
      const [ax, ay] = samples[i - 1] ?? samples[i];
      const [bx, by] = samples[i + 1] ?? samples[i];
      const len = Math.hypot(bx - ax, by - ay) || 1;
      // Ragged edges: fresh snow drifts, not a kerb
      const g = ragged
        ? w * f * (1 + 0.12 * Math.sin(i * 0.45 + f * 7) + 0.06 * Math.sin(i * 1.1 + f * 3))
        : w * f;
      return [x - ((by - ay) / len) * g, y + ((bx - ax) / len) * g];
    });
  return {
    area: poly([...offset(0.5), ...offset(-0.5).reverse()]),
    banks: `${line(offset(0.42))} ${line(offset(-0.42))}`,
    trodden: poly([...offset(0.18, false), ...offset(-0.18, false).reverse()]),
    steps: [line(offset(0.09, false)), line(offset(-0.09, false))],
    w: pts.reduce((sum, p) => sum + p[2], 0) / pts.length,
    // Snow crystals catching the moonlight here and there, bigger in front
    sparkles: samples.flatMap(([x, y, w], i) =>
      i % 2 || r() < 0.3
        ? []
        : [
            {
              x: x + (r() - 0.5) * w * 0.8,
              y: y + (r() - 0.5) * w * 0.3,
              r: 0.4 + w * 0.012,
              phase: i % 3,
            },
          ],
    ),
  };
}

export const SNOW_PATHS = PATHS.map(({ plane, pts }, i) => ({
  plane,
  ...ribbon(pts, i * 101 + 3),
}));

// A snowman on the near hill, in front, where it also shows on phones: x, ground y, height
export const SNOWMAN = { x: 1150, y: 1308, h: 72 };
