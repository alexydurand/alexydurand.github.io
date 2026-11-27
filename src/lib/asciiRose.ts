import { easeInOut, range } from './motion';

/*
 * The roses of the home page, drawn in characters like a terminal (after a video Alexy filmed): 3D flowers of petals
 * set in a spiral, turning, lit and written cell by cell, the brightest parts with the word "alexy", the others with
 * denser and denser signs. A pink rose on top, a smaller red one on a branch lower down, on one green stem with two
 * leaves that runs down out of the canvas. `grow` (0 to 1) plays the arrival: the word alone, a bud that grows,
 * whitish then pink, opens and pushes out its stem, on which the red rose then blooms.
 */

const WORD = 'alexy ';
/** The word's letters, then the shades from faint to dense */
export const GLYPHS = 'alexy.:ioX';
const SHADE = 5;
const SHADES = GLYPHS.length - SHADE;

// Lit above this, a cell is written with the word
const LETTERS = 0.84;

// Petals of a flower, few and big as in the video: their width (half) and length, from the heart's to the outer
// ones'; how far the outer ones lean out once open (radians, before rolling back), how much their edges curl in
const PETALS = 15;
const WIDTH = [0.2, 0.6];
const LENGTH = [0.3, 0.75];
const OPEN = 0.9;
const CUP = 0.3;

/** Colour levels per material */
export const TONES = 12;
/** Materials, in the order of the tones */
export const PETAL = 0;
export const GREEN = 1;
export const HEART = 2;
export const RED = 3;
export const EMPTY = 255;

// World units, the pink flower's foot at 0 (it is about 1.8 wide). The stem, long enough to leave any canvas even
// shortened by the perspective (it leans away at its foot); where the branch leaves it (down the stem), and where the
// red flower sits on it, at this size: low, out of the screen until the page scrolls. The red one on the left, or on
// the right when the model is built with `side` -1 (phones)
const STEM = 14;
const FORK = 2.1;
const RED_AT = [-0.6, -1.8, 0.15];
const RED_SIZE = 0.85;
// How far the stem bows away from the red flower, then back past its line lower down
const BOW = 0.3;
// The leaves down the stem: how far down, which way (1 away from the red flower), how far above the horizontal they
// point, their length and half width. Away from it while it is beside the stem, then from one side to the other
const LEAVES = [
  [0.75, 1, 0.55, 0.62, 0.19],
  [1.5, 1, 0.45, 0.5, 0.16],
  [2.6, -1, 0.5, 0.56, 0.17],
  [3.3, 1, 0.4, 0.56, 0.17],
  [4.1, -1, 0.45, 0.52, 0.16],
  [4.9, 1, 0.45, 0.5, 0.15],
];
// Height of the bud's centre, which the camera follows until the stem grows
const HEAD_Y = 0.25;
// Camera distance, for a light perspective; how far above it looks down (radians), and how far an open flower
// leans its face towards it
const EYE = 6;
const TILT = 0.2;
const LEAN = 0.75;

// Light: ambient, direct, highlight. A petal gets BASE of it at its foot, all of it at its edge
const AMBIENT = 0.5;
const DIRECT = 0.5;
const GLOSS = 0.35;
const BASE = 0.35;
// Shadow under nearer petals: how much nearer (world units) a neighbour within RADIUS cells must be, how dark
const GAP = 0.05;
const RADIUS = 2;
const SHADOW = 1.3;
// The halo round the bright signs, like the glow of the filmed screen
const GLOW = 0.7;

// Light from the top left, in view space (x right, y up, z towards the viewer)
const LIGHT = norm([-0.3, 0.6, 0.75]);
const HALF = norm([LIGHT[0], LIGHT[1], LIGHT[2] + 1]);

function norm(v: number[]) {
  // A stem not grown yet has no direction
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

export interface RoseGrid {
  cols: number;
  rows: number;
  /** Cells per world unit, across and down */
  unitX: number;
  unitY: number;
  /** Where the middle of the grid is once all has grown, in world units (see measure()) */
  centerX: number;
  centerY: number;
  /** Per cell: index in GLYPHS and material * TONES + level, or EMPTY */
  glyph: Uint8Array;
  tone: Uint8Array;
  depth: Float32Array;
  light: Float32Array;
  mat: Uint8Array;
}

export function createRoseGrid(
  cols: number,
  rows: number,
  unitX: number,
  unitY: number,
  centerX = 0,
  centerY = 0,
): RoseGrid {
  const n = cols * rows;
  return {
    cols,
    rows,
    unitX,
    unitY,
    centerX,
    centerY,
    glyph: new Uint8Array(n),
    tone: new Uint8Array(n),
    depth: new Float32Array(n),
    light: new Float32Array(n),
    mat: new Uint8Array(n),
  };
}

interface Patch {
  at: number;
  nu: number;
  nv: number;
}

/** A fixed number from 0 to 1 for each cell, scattered */
/** The cell (column, row) where the bud grows: the pink flower's heart, kept in place while it grows (render()) */
const budCell = (g: RoseGrid) => [
  g.cols / 2 - g.centerX * g.unitX,
  g.rows / 2 + (g.centerY - HEAD_Y) * g.unitY,
];

const scatter = (c: number) => {
  const x = Math.sin(c * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * The roses as points, `density` of them per world unit along a surface: about two per cell of the grid, so that a
 * cell rarely stays empty
 */
export function createRoseModel(density: number, side = 1) {
  let at = 0;
  const patch = (nu: number, nv: number): Patch => {
    const p = { at, nu, nv };
    at += nu * nv;
    return p;
  };
  // One flower, drawn twice: the petals from the heart outwards, the bigger the farther out
  const flower: Patch[] = [];
  for (let k = 0; k < PETALS; k++) {
    const s = k / (PETALS - 1);
    flower.push(
      patch(
        Math.round(density * (LENGTH[0] + (LENGTH[1] - LENGTH[0]) * s) * 1.3),
        Math.round(density * (WIDTH[0] + (WIDTH[1] - WIDTH[0]) * s) * 2.6),
      ),
    );
  }
  // Still: the stem, the branch, the leaves
  const stem = patch(Math.round(STEM * 110), 10);
  const branch = patch(Math.round(density * 1.6), 10);
  const leaves = LEAVES.map(() => patch(Math.round(density * 0.8), Math.round(density * 0.45)));
  // Turning with each flower: five sepals under it, its heart
  const sepals = Array.from({ length: 5 }, () => patch(Math.round(density * 0.45), 6));
  const heart = patch(12, 12);
  const count = at;
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const mat = new Uint8Array(count).fill(GREEN);
  mat.fill(PETAL, 0, stem.at);
  mat.fill(HEART, heart.at);
  // Light reaching each point: a petal is dark at its base, deep in the flower, and bright at its edge
  const reach = new Float32Array(count).fill(1);
  for (const { at, nu, nv } of flower)
    for (let u = 0; u < nu; u++)
      reach.fill(BASE + (1 - BASE) * (u / (nu - 1)) ** 0.7, at + u * nv, at + (u + 1) * nv);
  let built = '';

  const set = (i: number, x: number, y: number, z: number) => {
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
  };

  /** Normals from the neighbours in a patch's grid of points */
  function normals({ at, nu, nv }: Patch) {
    for (let u = 0; u < nu; u++) {
      for (let v = 0; v < nv; v++) {
        const a = (at + Math.max(u - 1, 0) * nv + v) * 3;
        const b = (at + Math.min(u + 1, nu - 1) * nv + v) * 3;
        const c = (at + u * nv + Math.max(v - 1, 0)) * 3;
        const d = (at + u * nv + Math.min(v + 1, nv - 1)) * 3;
        const ux = pos[b] - pos[a];
        const uy = pos[b + 1] - pos[a + 1];
        const uz = pos[b + 2] - pos[a + 2];
        const vx = pos[d] - pos[c];
        const vy = pos[d + 1] - pos[c + 1];
        const vz = pos[d + 2] - pos[c + 2];
        let x = uy * vz - uz * vy;
        let y = uz * vx - ux * vz;
        let z = ux * vy - uy * vx;
        const l = Math.hypot(x, y, z) || 1;
        x /= l;
        y /= l;
        z /= l;
        const i = (at + u * nv + v) * 3;
        nor[i] = x;
        nor[i + 1] = y;
        nor[i + 2] = z;
      }
    }
  }

  /**
   * The petals, set round the heart at the golden angle, each a cupped spoon: `bloom` 0 is a closed bud, its petals
   * upright and curled in; at 1 the outer ones lie open and roll back at their edge, the inner ones stay closed
   */
  function petals(bloom: number) {
    flower.forEach(({ at, nu, nv }, k) => {
      const s = k / (PETALS - 1);
      // The outer petals open first
      const b = easeInOut(range(bloom, 0.45 * (1 - s), 0.45 * (1 - s) + 0.55));
      const theta = k * 2.39996;
      const ct = Math.cos(theta);
      const st = Math.sin(theta);
      const length = LENGTH[0] + (LENGTH[1] - LENGTH[0]) * s;
      const width = WIDTH[0] + (WIDTH[1] - WIDTH[0]) * s;
      // Leaning out from upright, then bending further (rolling back) or curling in towards the tip
      const lean = 0.04 + 0.12 * s + b * OPEN * s ** 1.2;
      const bend = b * (0.3 + 0.9 * s) - (1 - b) * (0.25 + 0.2 * s);
      const cup = CUP * (1 - 0.5 * b * s);
      let rho = 0.015 + 0.1 * s;
      let h = 0.04 * (1 - s);
      for (let u = 0; u < nu; u++) {
        const a = u / (nu - 1);
        const phi = lean + bend * a * a;
        const sp = Math.sin(phi);
        const cp = Math.cos(phi);
        // Widest two thirds of the way, rounded at the tip
        const w =
          width *
          (0.2 + 0.8 * Math.sin((Math.PI / 2) * Math.min(a / 0.68, 1))) *
          (a > 0.68 ? Math.sqrt(1 - 0.85 * ((a - 0.68) / 0.32) ** 2) : 1);
        for (let v = 0; v < nv; v++) {
          const c = (v / (nv - 1)) * 2 - 1;
          // Across the petal, round the heart; its edges come in towards it (the cup)
          const across = c * w;
          const inward = cup * c * c * w;
          const r = rho - inward * cp;
          set(at + u * nv + v, r * ct - across * st, h + inward * sp, r * st + across * ct);
        }
        rho += (length / (nu - 1)) * sp;
        h += (length / (nu - 1)) * cp;
      }
      normals({ at, nu, nv });
    });
  }

  /** A leaf from `base`, pointing at `angle` round the stem and `pitch` above the horizontal */
  function leaf(
    { at, nu, nv }: Patch,
    base: number[],
    angle: number,
    pitch: number,
    length: number,
    width: number,
  ) {
    const ca = Math.cos(angle);
    const sa = Math.sin(angle);
    const d = [ca * Math.cos(pitch), Math.sin(pitch), sa * Math.cos(pitch)];
    const e = [-sa, 0, ca];
    // Its face, for the fold along the midrib
    const f = [e[1] * d[2] - e[2] * d[1], e[2] * d[0] - e[0] * d[2], e[0] * d[1] - e[1] * d[0]];
    for (let u = 0; u < nu; u++) {
      const a = u / (nu - 1);
      const w = width * Math.sin(Math.PI * a ** 0.7);
      const droop = -0.35 * a * a * length;
      for (let v = 0; v < nv; v++) {
        const b = (v / (nv - 1)) * 2 - 1;
        const fold = 0.18 * b * b * w;
        set(
          at + u * nv + v,
          base[0] + d[0] * a * length + e[0] * b * w + f[0] * fold,
          base[1] + d[1] * a * length + e[1] * b * w + f[1] * fold + droop,
          base[2] + d[2] * a * length + e[2] * b * w + f[2] * fold,
        );
      }
    }
    normals({ at, nu, nv });
  }

  /** A tube along `path` (t 0 to 1), its rings square to the path */
  function tube(
    { at, nu, nv }: Patch,
    path: (t: number) => number[],
    radius: (t: number) => number,
  ) {
    for (let u = 0; u < nu; u++) {
      const t = u / (nu - 1);
      const c = path(t);
      const a = path(Math.max(0, t - 0.01));
      const b = path(Math.min(1, t + 0.01));
      const dir = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]);
      // Two directions square to the path: across it in the picture's plane, and towards the viewer
      const side = norm([-dir[1], dir[0], 0]);
      const out = [
        dir[1] * side[2] - dir[2] * side[1],
        dir[2] * side[0] - dir[0] * side[2],
        dir[0] * side[1] - dir[1] * side[0],
      ];
      const r = radius(t);
      for (let v = 0; v < nv; v++) {
        const q = (v / nv) * 2 * Math.PI;
        const k = r * Math.cos(q);
        const l = r * Math.sin(q);
        set(
          at + u * nv + v,
          c[0] + k * side[0] + l * out[0],
          c[1] + k * side[1] + l * out[1],
          c[2] + k * side[2] + l * out[2],
        );
      }
    }
    normals({ at, nu, nv });
  }

  /** Where the stem is, `d` world units down from the pink flower */
  const spine = (d: number) => [
    side * (BOW * Math.sin(1.1 * d) + 0.04 * Math.sin(2.6 * d)),
    -d,
    0.03 * Math.sin(2.3 * d),
  ];
  // The branch, from the stem to the red flower: up and towards it
  const redAt = [side * RED_AT[0], RED_AT[1], RED_AT[2]];
  const fork = spine(FORK);
  const elbow = [fork[0] - side * 0.15, fork[1] + 0.4, 0.08];
  const twig = (t: number) =>
    [0, 1, 2].map((i) => (1 - t) ** 2 * fork[i] + 2 * (1 - t) * t * elbow[i] + t * t * redAt[i]);

  /**
   * The green parts: `grown` 0 to 1 is how far the stem has grown, `out` how far the branch has, `bloom` how far
   * the sepals fold down under the flowers
   */
  function green(grown: number, out: number, bloom: number) {
    const length = STEM * grown;
    // Swollen just under the flower, where the sepals start
    tube(
      stem,
      (t) => spine(t * length),
      (t) => 0.032 + 0.045 * Math.exp(-(t * length) / 0.07),
    );
    tube(
      branch,
      (t) => twig(t * out),
      () => 0.024,
    );
    const unfold = easeInOut(range(grown, 0.35, 1));
    LEAVES.forEach(([d, away, pitch, length, width], i) =>
      // Pointing a little towards the viewer, on the side away from the red flower or towards it
      leaf(
        leaves[i],
        spine(d),
        side * away > 0 ? 0.3 : Math.PI - 0.3,
        pitch,
        length * unfold,
        width * unfold,
      ),
    );
    sepals.forEach((p, i) =>
      // Hugging the bud, then folding down under the open flower
      leaf(p, [0, 0.02, 0], (i * 2 * Math.PI) / 5 + 0.4, 1.15 - 1.75 * bloom, 0.34, 0.06),
    );
  }

  /** A small yellow heart at the top of the flower's core, hidden while it is a bud */
  function center(bloom: number) {
    const r = 0.05 * bloom;
    for (let u = 0; u < heart.nu; u++) {
      const a = (u / (heart.nu - 1)) * Math.PI;
      for (let v = 0; v < heart.nv; v++) {
        const b = (v / heart.nv) * 2 * Math.PI;
        set(
          heart.at + u * heart.nv + v,
          r * Math.sin(a) * Math.cos(b),
          0.3 + r * Math.cos(a),
          r * Math.sin(a) * Math.sin(b),
        );
      }
    }
    normals(heart);
  }

  function build(bloom: number, grown: number, out: number) {
    const key = `${bloom.toFixed(3)} ${grown.toFixed(3)} ${out.toFixed(3)}`;
    if (key === built) return;
    if (built.split(' ')[0] !== key.split(' ')[0]) {
      petals(bloom);
      center(bloom);
    }
    green(grown, out, bloom);
    built = key;
  }

  /**
   * Draws the roses into the grid at `grow` (their arrival, 0 to 1), the flowers turned by `angle` (radians). With
   * `head`, only the pink flower, and only its depth: where it is (measure())
   */
  function render(grid: RoseGrid, grow: number, angle: number, head = false) {
    const { cols, rows, unitX, unitY, glyph, tone, depth, light } = grid;
    glyph.fill(EMPTY);
    if (grow <= 0) return;
    const cx = cols / 2;
    const cy = rows / 2;
    // The word where the bud will be, typed, then fading while the bud shows round it
    const word = () => {
      const typed = Math.ceil(range(grow, 0.02, 0.1) * 5);
      const level = Math.round((TONES - 1) * (1 - range(grow, 0.18, 0.32)));
      const [hx, hy] = budCell(grid);
      const row = Math.floor(hy) * cols;
      for (let i = 0; i < typed && level > 0; i++) {
        const c = row + Math.floor(hx - 2.5) + i;
        glyph[c] = i;
        tone[c] = PETAL * TONES + level;
      }
    };
    if (grow < 0.15) return word();

    const bloom = easeInOut(range(grow, 0.3, 0.95));
    const grown = easeInOut(range(grow, 0.4, 0.97));
    // Once the stem is past the fork: the branch, then the red flower on it
    const out = easeInOut(range(grow, 0.6, 0.8));
    const red = RED_SIZE * easeInOut(range(grow, 0.78, 0.98));
    build(bloom, grown, out);
    // From a bud about as wide as the word to the whole rose filling the grid
    const tiny = 5 / (0.6 * unitX);
    const scale = tiny ** (1 - easeInOut(range(grow, 0.15, 0.82)));
    // The camera, a little above, frames the whole from the start: the bud grows where the flower ends up (budCell),
    // and only the canvas moves it from the middle of the screen (Hero.tsx) — the camera moving as well sent it up
    // out of the screen and back. Each flower turns on its own axis, which leans towards the viewer as it opens: its
    // face shows, as in the video; the stem stays upright
    const tx = grid.centerX;
    const ty = grid.centerY - HEAD_Y * (1 - scale);
    const lean = TILT + LEAN * bloom;
    // Whitish while small, pink as it grows
    const white = 0.75 * (1 - range(grow, 0.28, 0.55));
    const ct = Math.cos(TILT);
    const st = Math.sin(TILT);
    depth.fill(-Infinity);

    /**
     * Projects points [from, to), `size` times their size, turned by `spin` round their upright axis and leant by
     * `lean` towards the viewer, set at `place` on the stem; petals take the material `petal`
     */
    const project = (
      from: number,
      to: number,
      lean: number,
      spin: number,
      size: number,
      place: number[] | null = null,
      petal = PETAL,
    ) => {
      const ca = Math.cos(spin);
      const sa = Math.sin(spin);
      const ce = Math.cos(lean);
      const se = Math.sin(lean);
      // The place, seen like the stem
      const ox = place ? place[0] * scale : 0;
      const oy = place ? (place[1] * ct - place[2] * st) * scale : 0;
      const oz = place ? (place[1] * st + place[2] * ct) * scale : 0;
      // Light, half vector and view direction in the points' own space
      const local = (v: number[]) => {
        const y = v[1] * ce + v[2] * se;
        const z = -v[1] * se + v[2] * ce;
        return [v[0] * ca - z * sa, y, v[0] * sa + z * ca];
      };
      const [lx, ly, lz] = local(LIGHT);
      const [hx, hy, hz] = local(HALF);
      const [vx, vy, vz] = local([0, 0, 1]);
      for (let i = from; i < to; i++) {
        const k = i * 3;
        const x = pos[k] * size;
        const y = pos[k + 1] * size;
        const z = pos[k + 2] * size;
        const x1 = x * ca + z * sa;
        const z1 = -x * sa + z * ca;
        const x2 = x1 + ox;
        const y2 = y * ce - z1 * se + oy;
        const z2 = y * se + z1 * ce + oz;
        const f = EYE / (EYE - z2);
        const col = Math.floor(cx + (x2 * f - tx) * unitX);
        const row = Math.floor(cy - (y2 * f - ty) * unitY);
        if (col < 0 || col >= cols || row < 0 || row >= rows) continue;
        const c = row * cols + col;
        if (z2 <= depth[c]) continue;
        depth[c] = z2;
        const ax = nor[k];
        const ay = nor[k + 1];
        const az = nor[k + 2];
        // Both sides of a petal are lit: turn the normal towards the viewer
        const side = ax * vx + ay * vy + az * vz < 0 ? -1 : 1;
        const diffuse = Math.max(0, side * (ax * lx + ay * ly + az * lz));
        const spec = Math.max(0, side * (ax * hx + ay * hy + az * hz)) ** 24;
        light[c] = Math.min(1, reach[i] * (AMBIENT + DIRECT * diffuse) + GLOSS * spec);
        grid.mat[c] = mat[i] === PETAL ? petal : mat[i];
      }
    };
    // The pink flower, with its heart and sepals
    project(0, stem.at, lean, angle, scale);
    project(sepals[0].at, count, lean, angle, scale);
    if (head) return;
    // The red one on its branch, turning its own way
    if (red > 0) {
      const spin = -1.15 * angle + 2;
      project(0, stem.at, lean, spin, scale * red, redAt, RED);
      project(sepals[0].at, count, lean, spin, scale * red, redAt, RED);
    }
    // The stem, the branch once it grows, the leaves once they unfold
    project(stem.at, branch.at, TILT, 0, scale);
    if (out > 0) project(branch.at, leaves[0].at, TILT, 0, scale);
    if (grown > 0.35) project(leaves[0].at, sepals[0].at, TILT, 0, scale);

    // What makes the petals read, as in the video: a cell with nearer petals round it lies in their shadow
    const gap = GAP * scale;
    // The bud shows little by little round the word, cell after cell in a scattered order
    const shown = range(grow, 0.15, 0.32);
    for (let c = 0; c < cols * rows; c++) {
      const d = depth[c];
      if (d === -Infinity) continue;
      const col = c % cols;
      const row = Math.floor(c / cols);
      let near = 0;
      let all = 0;
      for (let dy = -RADIUS; dy <= RADIUS; dy++) {
        const r = row + dy;
        if (r < 0 || r >= rows) continue;
        for (let dx = -RADIUS; dx <= RADIUS; dx++) {
          const q = col + dx;
          if (q < 0 || q >= cols || (!dx && !dy)) continue;
          all++;
          if (depth[r * cols + q] > d + gap) near++;
        }
      }
      light[c] *= Math.max(0, 1 - (SHADOW * near) / all);
    }
    for (let c = 0; c < cols * rows; c++) {
      const d = depth[c];
      if (d === -Infinity || (shown < 1 && scatter(c) > shown)) continue;
      const m = grid.mat[c];
      const col = c % cols;
      // Smoothed along the row over the same surface: runs of one sign, as in the video, not a speckle
      let sum = 0;
      let weight = 0;
      for (let dx = -2; dx <= 2; dx++) {
        const q = c + dx;
        if (col + dx < 0 || col + dx >= cols || grid.mat[q] !== m) continue;
        if (Math.abs(depth[q] - d) > 2 * gap) continue;
        const w = 3 - Math.abs(dx);
        sum += w * light[q];
        weight += w;
      }
      let l = sum / weight;
      if (m === PETAL) l += (1 - l) * white;
      if (l >= LETTERS && m !== HEART) {
        // The word runs along the rows, shifted from one row to the next; GLYPHS starts with its letters
        const letter = ((c % cols) + Math.floor(c / cols) * 2) % WORD.length;
        if (WORD[letter] === ' ') continue;
        glyph[c] = letter;
      } else glyph[c] = SHADE + Math.min(SHADES - 1, Math.floor((l / LETTERS) * SHADES));
      tone[c] = m * TONES + Math.min(TONES - 1, Math.floor(l * TONES));
    }
    if (shown < 1) word();
  }

  /**
   * Bounds of the open pink flower on screen, turned all the way round, in world units, y up: to size and place it
   * (the red one and the stem go where they fall)
   */
  function measure() {
    const size = 640;
    const per = 100;
    const probe = createRoseGrid(size, size, per, per);
    let left = size;
    let right = 0;
    let top = size;
    let bottom = 0;
    for (let a = 0; a < 8; a++) {
      render(probe, 1, (a * Math.PI) / 4, true);
      probe.depth.forEach((d, c) => {
        if (d === -Infinity) return;
        left = Math.min(left, c % size);
        right = Math.max(right, (c % size) + 1);
        top = Math.min(top, Math.floor(c / size));
        bottom = Math.max(bottom, Math.floor(c / size) + 1);
      });
    }
    const half = size / 2;
    return {
      left: (left - half) / per,
      right: (right - half) / per,
      top: (half - top) / per,
      bottom: (half - bottom) / per,
    };
  }

  return { render, measure };
}

type Rgb = [number, number, number];
const mix = (a: Rgb, b: Rgb, t: number): Rgb =>
  [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t) as Rgb;

/**
 * Draws the roses on a canvas, each cell copied from an atlas of every glyph in every tone (one fillText per cell
 * was too slow). Colours from the theme's tokens. Call resize() once laid out, then draw() for each frame.
 */
export function createAsciiRose(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const css = getComputedStyle(document.documentElement);
  // Hex tokens of index.css
  const token = (name: string): Rgb => {
    const n = parseInt(css.getPropertyValue(`--color-${name}`).trim().slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const black = token('coal');
  const white: Rgb = [255, 255, 255];
  // In the order of the materials
  const materials = [token('rose'), token('aurora'), token('rose-heart'), token('rose-red')];
  // Dark to the material's colour, then towards white for the brightest
  const shade = (c: Rgb, l: number) =>
    l < 0.45 ? mix(mix(black, c, 0.5), c, l / 0.45) : mix(c, white, ((l - 0.45) / 0.55) * 0.65);
  const atlas = document.createElement('canvas');
  // The halo: the drawing shrunk, then laid back over it blown up, blurred by the stretch
  const halo = document.createElement('canvas');
  const haloCtx = halo.getContext('2d');
  let grid: RoseGrid | null = null;
  let model: ReturnType<typeof createRoseModel>;
  let gw = 0;
  let gh = 0;

  /**
   * Lays the grid out at the canvas's size: the pink flower 60% of the screen's height wide (no more than 80% of the
   * canvas), centred across, its top just under the canvas's; the red one and the stem run out below. On a tall
   * screen (Hero.tsx sets the name under the flowers then) 56% of the width, its middle at 40% of it, and the red one
   * on the right: the name on the left hides less of it
   */
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    // About 130 cells across, the density of the video, but not finer than a texture of glyphs (phones)
    const cell = Math.min(6, Math.max(3, w / 130));
    gw = Math.round(cell * dpr);
    gh = Math.round((cell / 0.6) * dpr);
    const cols = Math.floor((w * dpr) / gw);
    const rows = Math.floor((h * dpr) / gh);
    const width = cols * gw;
    const height = rows * gh;
    canvas.width = width;
    canvas.height = height;
    halo.width = Math.ceil(width / 12);
    halo.height = Math.ceil(height / 12);
    // Where the flower is does not depend on how finely it is sampled: a coarse one to measure
    const box = createRoseModel(20).measure();
    const tall = matchMedia('(max-aspect-ratio: 5/4)').matches;
    const span = tall ? 0.56 * w : Math.min(0.6 * innerHeight, 0.8 * w);
    const unit = (span * dpr) / (box.right - box.left);
    // 1.5 points per cell, at most 80 per unit: more filled no hole and cost too much on a phone (~3 ms an image)
    model = createRoseModel(Math.min(80, (1.5 * unit) / Math.min(gw, gh)), tall ? -1 : 1);
    const pad = 0.02 * height;
    grid = createRoseGrid(
      cols,
      rows,
      unit / gw,
      unit / gh,
      (box.left + box.right) / 2 + (tall ? (0.1 * width) / unit : 0),
      box.top - (height / 2 - pad) / unit,
    );

    atlas.width = GLYPHS.length * gw;
    atlas.height = materials.length * TONES * gh;
    const a = atlas.getContext('2d')!;
    a.font = `700 ${Math.round(gh * 0.86)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    a.textAlign = 'center';
    a.textBaseline = 'middle';
    materials.forEach((c, m) => {
      for (let k = 0; k < TONES; k++) {
        a.fillStyle = `rgb(${shade(c, (k + 0.5) / TONES)
          .map(Math.round)
          .join()})`;
        for (let g = 0; g < GLYPHS.length; g++)
          a.fillText(GLYPHS[g], (g + 0.5) * gw, (m * TONES + k + 0.5) * gh);
      }
    });
  }

  function draw(grow: number, angle: number) {
    if (!grid || !ctx) return;
    model.render(grid, grow, angle);
    const { cols, glyph, tone } = grid;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let c = 0; c < glyph.length; c++) {
      if (glyph[c] === EMPTY) continue;
      ctx.drawImage(
        atlas,
        glyph[c] * gw,
        tone[c] * gh,
        gw,
        gh,
        (c % cols) * gw,
        Math.floor(c / cols) * gh,
        gw,
        gh,
      );
    }
    if (!haloCtx || !GLOW) return;
    haloCtx.clearRect(0, 0, halo.width, halo.height);
    haloCtx.imageSmoothingQuality = 'high';
    haloCtx.drawImage(canvas, 0, 0, halo.width, halo.height);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = GLOW;
    ctx.drawImage(halo, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  /** Where the bud grows, in CSS pixels from the canvas's top left: Hero.tsx starts it in the middle of the screen */
  function bud() {
    if (!grid) return null;
    const [col, row] = budCell(grid);
    return {
      x: (col * gw * canvas.clientWidth) / canvas.width,
      y: (row * gh * canvas.clientHeight) / canvas.height,
    };
  }

  return { resize, draw, bud };
}
