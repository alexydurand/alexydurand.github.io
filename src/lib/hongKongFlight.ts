import { lerp } from './motion';
import type { SceneHandle, SceneOptions } from '../hooks/useLazyScene';

export interface HongKongFlight extends SceneHandle {
  look(x: number, y: number): void;
}

// Images cut from two Pexels clips (content.ts → credits), with a portrait crop for phones: public/hong-kong/
const FRAMES = { desktop: 120, mobile: 90 };
// Their size in pixels: a canvas sharper than them would only cost drawing time
const SIZE = { desktop: [1440, 810], mobile: [630, 1120] };
// Frames decoded around the current one (the first images to arrive are 8 apart), and kept up to this
// distance: at most 13 decoded at once, ≈ 4.7 MB each
const AHEAD = 4;
const KEEP = 6;
// Drawn slightly larger than the screen, so the pointer can pan without showing an edge
const OVERSCAN = 1.03;
const PAN = 0.012;

/** Plays the image sequence on a canvas, following the scroll progress. */
export default function createHongKongFlight(
  canvas: HTMLCanvasElement,
  { mobile, reducedMotion }: SceneOptions,
): HongKongFlight {
  const ctx = canvas.getContext('2d')!;
  const folder = mobile ? 'mobile' : 'desktop';
  const count = mobile ? FRAMES.mobile : FRAMES.desktop;
  // The files stay compressed; only the frames around the current one are decoded, off the main thread.
  // Drawn straight from an <img>, each new frame was decoded during the paint: ~50 ms stalls while scrolling.
  const files: (Blob | undefined)[] = [];
  const frames = new Map<number, ImageBitmap>();
  const decoding = new Set<number>();
  const loading = new AbortController();
  let disposed = false;
  let target = 0;
  let now = 0;
  let pointerX = 0;
  let pointerY = 0;
  let panX = 0;
  let panY = 0;
  let stale = true;
  let raf = 0;

  const nearest = (i: number) => {
    for (let d = 0; d < count; d++) {
      const img = frames.get(i - d) ?? frames.get(i + d);
      if (img) return img;
    }
  };

  // Decodes the frames close to i, lets go of those far from it
  const prepare = (i: number) => {
    for (const [k, frame] of frames) {
      if (Math.abs(k - i) > KEEP) {
        frame.close();
        frames.delete(k);
      }
    }
    for (let k = Math.max(0, i - AHEAD); k <= Math.min(count - 1, i + AHEAD); k++) {
      const file = files[k];
      if (!file || frames.has(k) || decoding.has(k)) continue;
      decoding.add(k);
      createImageBitmap(file).then(
        (frame) => {
          decoding.delete(k);
          if (disposed || Math.abs(k - Math.round(now * (count - 1))) > KEEP) return frame.close();
          frames.set(k, frame);
          stale = true;
          // Nothing scrolls then, and the section may not count as active yet
          if (reducedMotion) draw();
        },
        () => decoding.delete(k),
      );
    }
  };

  const paint = (img: ImageBitmap, alpha: number) => {
    const { width: W, height: H } = canvas;
    const scale = Math.max(W / img.width, H / img.height) * OVERSCAN;
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (W - w) / 2 - panX * W * PAN, (H - h) / 2 + panY * H * PAN, w, h);
  };

  const draw = () => {
    const position = now * (count - 1);
    const i = Math.floor(position);
    prepare(i);
    const base = nearest(i);
    if (!base) return;
    paint(base, 1);
    // Blend into the next image: the motion stays smooth between two frames
    const next = frames.get(i + 1);
    if (next && base === frames.get(i)) paint(next, position - i);
  };

  // Coarse to fine: any scroll position has an image close by, long before they have all arrived.
  // Reduced motion only ever shows the arrival on the bay.
  const order = new Set(reducedMotion ? [count - 1] : [0, count - 1]);
  if (!reducedMotion) {
    for (let step = 8; step >= 1; step /= 2) {
      for (let i = 0; i < count; i += step) order.add(i);
    }
  }
  for (const i of order) {
    // Behind the collage photos, which load at the same moment and show first
    fetch(`hong-kong/${folder}/${String(i).padStart(3, '0')}.webp`, {
      priority: 'low',
      signal: loading.signal,
    })
      .then((response) => response.blob())
      .then((file) => {
        files[i] = file;
        prepare(Math.floor(now * (count - 1)));
      })
      .catch(() => {});
  }

  const loop = () => {
    raf = requestAnimationFrame(loop);
    const moving =
      Math.abs(target - now) > 1e-4 ||
      Math.abs(pointerX - panX) > 1e-3 ||
      Math.abs(pointerY - panY) > 1e-3;
    if (!moving && !stale) return;
    now = lerp(now, target, 0.08);
    panX = lerp(panX, pointerX, 0.05);
    panY = lerp(panY, pointerY, 0.05);
    stale = false;
    draw();
  };

  const resize = () => {
    const [fw, fh] = SIZE[folder];
    const sharpest = Math.max(fw / canvas.clientWidth, fh / canvas.clientHeight, 1);
    const ratio = Math.min(window.devicePixelRatio, 1.5, sharpest);
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    draw();
  };
  resize();

  return {
    setProgress(p) {
      target = p;
      if (reducedMotion) now = p;
    },
    setActive(active) {
      cancelAnimationFrame(raf);
      if (active) raf = requestAnimationFrame(loop);
    },
    resize,
    look(x, y) {
      pointerX = x;
      pointerY = y;
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      loading.abort();
      for (const frame of frames.values()) frame.close();
      frames.clear();
    },
  };
}
