import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import type { SceneFactory, SceneHandle } from '../hooks/useLazyScene';
import { easeInOut, lerp, range } from '../lib/motion';

/**
 * A night street in Kowloon, drawn in code: tower canyons with lit windows, neon signs hanging
 * over the road, red taxis driving on the left, then the camera climbs out over Victoria Harbour.
 * Scroll progress 0→1 moves the camera along the path.
 */

const SKY = '#070b16';
const FOG = '#0b1226';
const STREET_END = -330;
const ROAD = 7; // facades start at x = ±ROAD
const CAR_NEAR = 0; // traffic stays this far up the street, never right under the starting camera

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- textures ---------- */

const COLS = 16;
const ROWS = 32;

function windowTexture(rand: () => number, litRatio: number) {
  const cell = 32;
  const canvas = document.createElement('canvas');
  canvas.width = COLS * cell;
  canvas.height = ROWS * cell;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1a2030';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const warm = ['#ffd9a0', '#ffe7c2', '#ffc77a', '#fff1d6'];
  const cool = ['#bfe6ff', '#d8f3ff', '#9fd8ff', '#c9ffe8'];
  for (let r = 0; r < ROWS; r++) {
    // Some floors are entirely dark or entirely lit, like real towers
    const floorBias = rand() < 0.12 ? -1 : rand() < 0.1 ? 1 : 0;
    for (let c = 0; c < COLS; c++) {
      const x = c * cell;
      const y = r * cell;
      const lit = floorBias === 1 || (floorBias === 0 && rand() < litRatio);
      if (lit) {
        const pool = rand() < 0.7 ? warm : cool;
        ctx.globalAlpha = 0.55 + rand() * 0.4;
        ctx.fillStyle = pool[Math.floor(rand() * pool.length)];
      } else {
        ctx.globalAlpha = 1;
        ctx.fillStyle = rand() < 0.5 ? '#0d1220' : '#121a2b';
      }
      ctx.fillRect(x + 5, y + 4, cell - 10, cell - 12);
      ctx.globalAlpha = 1;
      // Air-conditioning boxes under some windows
      if (rand() < 0.22) {
        ctx.fillStyle = '#3b4456';
        ctx.fillRect(x + 8 + rand() * 6, y + cell - 7, 9, 5);
      }
    }
  }
  // Plain wall texel at (0,0) for roofs
  ctx.fillStyle = '#121826';
  ctx.fillRect(0, canvas.height - 4, 4, 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const NEON = ['#ff3d8b', '#3ee8ff', '#ff3030', '#ffd23f', '#3dff9b', '#ff8a1f', '#ffffff'];
const VERTICAL = ['茶餐廳', '大押', '金行', '酒家', '藥房', '冰室', '海鮮', '麻雀館', '燒臘', '粥麵', '旅館', '錶行'];
const HORIZONTAL = ['彌敦道', '旺角', '油麻地', '九龍', 'HOTEL', '夜市', 'NOODLES', '尖沙咀'];

function signTexture(text: string, color: string, vertical: boolean) {
  const chars = vertical ? [...text] : [text];
  const unit = 128;
  const w = vertical ? unit : Math.max(2, text.length) * (/^[A-Z]+$/.test(text) ? 64 : 112) + 48;
  const h = vertical ? chars.length * 112 + 48 : unit;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(8,8,16,0.92)';
  ctx.fillRect(6, 6, w - 12, h - 12);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.fillStyle = color;
  ctx.shadowBlur = 22;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${vertical ? 86 : 80}px "PingFang HK", "PingFang TC", "Noto Sans CJK TC", "Microsoft JhengHei", sans-serif`;
  if (vertical) chars.forEach((ch, i) => ctx.fillText(ch, w / 2, 24 + 56 + i * 112));
  else ctx.fillText(text, w / 2, h / 2 + 4);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { tex, aspect: w / h };
}

function streakTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(4, 0, 8, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function skyTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, SKY);
  g.addColorStop(0.55, '#0a1430');
  g.addColorStop(0.8, '#1a1c3a');
  g.addColorStop(1, FOG);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Car: body + cabin, faces shaded through vertex colours (the material is unlit). */
function carGeometry() {
  const shade = [0.55, 0.55, 1, 0.3, 0.8, 0.7]; // +x, -x, +y, -y, +z, -z
  const part = (w: number, h: number, d: number, y: number, z: number) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate(0, y, z);
    const colors = new Float32Array(24 * 3);
    for (let i = 0; i < 24; i++) colors.fill(shade[Math.floor(i / 4)], i * 3, i * 3 + 3);
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  };
  return mergeGeometries([part(1.9, 0.75, 4.4, 0.65, 0), part(1.6, 0.6, 2.2, 1.32, -0.2)]);
}

/* ---------- geometry ---------- */

type Box = { x: number; z: number; w: number; d: number; h: number; tint: THREE.Color };

function towerGeometry(boxes: Box[], rand: () => number, cellW: number, cellH: number) {
  const parts = boxes.map((b) => {
    const g = new THREE.BoxGeometry(b.w, b.h, b.d);
    g.translate(b.x, b.h / 2, b.z);
    const uv = g.attributes.uv as THREE.BufferAttribute;
    const ou = Math.floor(rand() * COLS) / COLS;
    const ov = Math.floor(rand() * ROWS) / ROWS;
    // Face order: +x, -x, +y, -y, +z, -z (4 vertices each)
    for (let face = 0; face < 6; face++) {
      for (let v = 0; v < 4; v++) {
        const i = face * 4 + v;
        if (face === 2 || face === 3) {
          uv.setXY(i, 0.001, 0.999);
          continue;
        }
        const span = face < 2 ? b.d : b.w;
        uv.setXY(
          i,
          ou + (uv.getX(i) * Math.round(span / cellW)) / COLS,
          ov + (uv.getY(i) * Math.round(b.h / cellH)) / ROWS,
        );
      }
    }
    const colors = new Float32Array(24 * 3);
    for (let i = 0; i < 24; i++) colors.set([b.tint.r, b.tint.g, b.tint.b], i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  });
  return mergeGeometries(parts);
}

function tint(rand: () => number) {
  // Faded pastel concrete: mint, pink, sand, grey
  const tones = ['#ffffff', '#e6fff4', '#ffe9f0', '#fff4dc', '#e4ecff', '#f0f0f0'];
  const c = new THREE.Color(tones[Math.floor(rand() * tones.length)]);
  return c.multiplyScalar(0.72 + rand() * 0.28);
}

export interface HongKongScene extends SceneHandle {
  look(x: number, y: number): void;
}

export const createHongKongScene: SceneFactory<HongKongScene> = (canvas, { mobile, reducedMotion }) => {
  const rand = rng(852);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mobile, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.25 : 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = skyTexture();
  const fog = new THREE.FogExp2(FOG, 0.008);
  scene.fog = fog;

  const camera = new THREE.PerspectiveCamera(62, 1, 0.5, 1400);
  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(d: T) => {
    disposables.push(d);
    return d;
  };

  /* Towers along the street */
  const street: Box[] = [];
  const density = mobile ? 0.7 : 1;
  for (const side of [-1, 1]) {
    // Front row
    let z = 40;
    while (z > STREET_END + 10) {
      const d = 6 + rand() * 7;
      if (Math.abs(z % 70) < 9 && z < 0) {
        z -= 12; // cross street
        continue;
      }
      const w = 6 + rand() * 6;
      const tall = z < -150 ? 1.25 : 1;
      street.push({ x: side * (ROAD + w / 2), z: z - d / 2, w, d, h: (24 + rand() * 60) * tall, tint: tint(rand) });
      z -= d + 0.4;
    }
    // Second and third rows, for depth
    for (let row = 0; row < 2; row++) {
      z = 30;
      while (z > STREET_END - 20) {
        const d = 8 + rand() * 10;
        const w = 8 + rand() * 10;
        if (rand() < density) {
          const offset = row === 0 ? 20 + rand() * 6 : 38 + rand() * 25;
          const h = row === 0 ? 50 + rand() * 80 : 70 + rand() * 120;
          street.push({ x: side * (ROAD + offset), z: z - d / 2, w, d, h, tint: tint(rand) });
        }
        z -= d + 2 + rand() * 4;
      }
    }
  }

  /* The skyline across the harbour */
  const skyline: Box[] = [];
  for (let x = -260; x < 260; x += 10 + rand() * 12) {
    const centre = 1 - Math.min(1, Math.abs(x) / 260);
    const h = 30 + rand() * 90 + centre * 110;
    const w = 9 + rand() * 12;
    skyline.push({ x, z: -600 - rand() * 50, w, d: 10 + rand() * 10, h, tint: tint(rand) });
  }
  // Landmark towers
  skyline.push({ x: -40, z: -590, w: 18, d: 18, h: 300, tint: new THREE.Color('#e9f2ff') });
  skyline.push({ x: 55, z: -605, w: 14, d: 14, h: 240, tint: new THREE.Color('#f2f2f2') });
  skyline.push({ x: 15, z: -640, w: 12, d: 12, h: 200, tint: new THREE.Color('#dff7ff') });

  const texA = keep(windowTexture(rand, 0.34));
  const texB = keep(windowTexture(rand, 0.5));
  const streetMat = keep(new THREE.MeshBasicMaterial({ map: texA, vertexColors: true }));
  const skylineMat = keep(new THREE.MeshBasicMaterial({ map: texB, vertexColors: true }));
  const streetGeo = keep(towerGeometry(street, rand, 0.75, 0.95));
  const skylineGeo = keep(towerGeometry(skyline, rand, 2.2, 2.8));
  scene.add(new THREE.Mesh(streetGeo, streetMat), new THREE.Mesh(skylineGeo, skylineMat));

  /* Rooftop clutter: water tanks and antennas */
  const roofParts: THREE.BufferGeometry[] = [];
  const redLights: THREE.Vector3[] = [];
  [...street, ...skyline].forEach((b) => {
    if (rand() < 0.45) {
      const tank = new THREE.CylinderGeometry(1, 1, 2, 10);
      tank.translate(b.x + (rand() - 0.5) * b.w * 0.5, b.h + 1, b.z + (rand() - 0.5) * b.d * 0.5);
      roofParts.push(tank);
    }
    if (b.h > 90 || rand() < 0.2) {
      const mastH = 4 + rand() * 12;
      const mast = new THREE.BoxGeometry(0.3, mastH, 0.3);
      mast.translate(b.x, b.h + mastH / 2, b.z);
      roofParts.push(mast);
      redLights.push(new THREE.Vector3(b.x, b.h + mastH, b.z));
    }
  });
  // Spire on the tallest tower
  const spire = new THREE.ConeGeometry(3, 40, 8);
  spire.translate(-40, 320, -590);
  roofParts.push(spire);
  const roofGeo = keep(mergeGeometries(roofParts));
  const roofMat = keep(new THREE.MeshBasicMaterial({ color: '#0a0e18' }));
  scene.add(new THREE.Mesh(roofGeo, roofMat));

  const lightGeo = keep(new THREE.SphereGeometry(0.6, 8, 6));
  const redMat = keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 0.3, 0.3), toneMapped: false }));
  const reds = new THREE.InstancedMesh(lightGeo, redMat, redLights.length);
  const dummy = new THREE.Object3D();
  redLights.forEach((p, i) => {
    dummy.position.copy(p);
    dummy.updateMatrix();
    reds.setMatrixAt(i, dummy.matrix);
  });
  scene.add(reds);

  /* Light crowns and LED stripes on the skyline towers */
  const crownCols = ['#3ee8ff', '#ff3d8b', '#ffffff', '#ffd23f', '#3dff9b'];
  const glowMat = keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 2.4, 2.4), toneMapped: false }));
  const glowGeo = keep(new THREE.BoxGeometry(1, 1, 1));
  const lit = skyline.filter((b) => b.h > 150 || rand() < 0.3);
  const glows = new THREE.InstancedMesh(glowGeo, glowMat, lit.length * 4);
  let gi = 0;
  const colour = new THREE.Color();
  lit.forEach((b, i) => {
    colour.set(crownCols[i % crownCols.length]);
    // Band around the top
    dummy.position.set(b.x, b.h - 2.5, b.z);
    dummy.scale.set(b.w + 0.6, 1.6, b.d + 0.6);
    dummy.updateMatrix();
    glows.setMatrixAt(gi, dummy.matrix);
    glows.setColorAt(gi++, colour);
    // Vertical LED stripes on the tallest ones
    if (b.h > 180) {
      for (const k of [-1, 0, 1]) {
        dummy.position.set(b.x + k * (b.w / 3), b.h * 0.45, b.z + b.d / 2 + 0.2);
        dummy.scale.set(0.28, b.h * 0.85, 0.3);
        dummy.updateMatrix();
        glows.setMatrixAt(gi, dummy.matrix);
        glows.setColorAt(gi++, colour.clone().multiplyScalar(0.45));
      }
    }
  });
  glows.count = gi;
  dummy.scale.set(1, 1, 1);
  scene.add(glows);

  /* Ground, road markings, street lamps */
  const groundGeo = keep(new THREE.PlaneGeometry(2000, 2000));
  const groundMat = keep(new THREE.MeshBasicMaterial({ color: '#05070d' }));
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const markParts: THREE.BufferGeometry[] = [];
  for (let z = 30; z > STREET_END; z -= 8) {
    const dash = new THREE.PlaneGeometry(0.18, 3.2);
    dash.rotateX(-Math.PI / 2);
    dash.translate(0, 0.02, z);
    markParts.push(dash);
  }
  for (let z = -9; z > STREET_END; z -= 70) {
    for (let x = -5; x <= 5; x += 1.4) {
      const stripe = new THREE.PlaneGeometry(0.7, 4);
      stripe.rotateX(-Math.PI / 2);
      stripe.translate(x, 0.02, z + 4);
      markParts.push(stripe);
    }
  }
  const marksGeo = keep(mergeGeometries(markParts));
  const marksMat = keep(new THREE.MeshBasicMaterial({ color: '#59606e' }));
  scene.add(new THREE.Mesh(marksGeo, marksMat));

  const lampMat = keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.9, 0.9), toneMapped: false }));
  const lampCount = Math.floor((30 - STREET_END) / 18) * 2;
  const lamps = new THREE.InstancedMesh(keep(new THREE.SphereGeometry(0.35, 8, 6)), lampMat, lampCount);
  let li = 0;
  for (let z = 30; z > STREET_END && li < lampCount; z -= 18) {
    for (const side of [-1, 1]) {
      dummy.position.set(side * 5.6, 6.5, z);
      dummy.updateMatrix();
      lamps.setMatrixAt(li++, dummy.matrix);
    }
  }
  lamps.count = li;
  scene.add(lamps);

  /* Neon signs hanging over the street */
  const signs: { mat: THREE.MeshBasicMaterial; flicker: number }[] = [];
  const signGeo = keep(new THREE.PlaneGeometry(1, 1));
  const designs = [
    ...VERTICAL.map((text, i) => ({ ...signTexture(text, NEON[i % NEON.length], true), vertical: true })),
    ...HORIZONTAL.map((text, i) => ({ ...signTexture(text, NEON[(i + 3) % NEON.length], false), vertical: false })),
  ];
  designs.forEach((d) => keep(d.tex));
  const signMats = designs.map((d) =>
    keep(
      new THREE.MeshBasicMaterial({
        map: d.tex,
        color: new THREE.Color(2.1, 2.1, 2.1),
        toneMapped: false,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    ),
  );
  designs.forEach((_, i) => signs.push({ mat: signMats[i], flicker: rand() < 0.25 ? rand() * 10 : -1 }));

  const signCount = mobile ? 50 : 90;
  for (let i = 0; i < signCount; i++) {
    const di = Math.floor(rand() * designs.length);
    const d = designs[di];
    const side = rand() < 0.5 ? -1 : 1;
    const z = 25 - rand() * (25 - STREET_END + 30);
    const mesh = new THREE.Mesh(signGeo, signMats[di]);
    if (d.vertical) {
      const h = 5 + rand() * 6;
      const w = h * d.aspect;
      // Hangs off the facade, facing down the street
      mesh.scale.set(w, h, 1);
      mesh.position.set(side * (ROAD - w / 2 - 0.4 - rand() * 2.5), 5 + h / 2 + rand() * 18, z);
    } else {
      const w = 5 + rand() * 4;
      const h = w / d.aspect;
      if (rand() < 0.6) {
        // Big horizontal sign stretching over the road
        mesh.scale.set(w, h, 1);
        mesh.position.set(side * (ROAD - w / 2 - 0.3), 7 + rand() * 16, z);
      } else {
        // Flat against the facade
        mesh.scale.set(w, h, 1);
        mesh.rotation.y = -side * (Math.PI / 2);
        mesh.position.set(side * (ROAD - 0.05), 6 + rand() * 20, z);
      }
    }
    scene.add(mesh);
  }

  /* Traffic: drives on the left */
  const carCount = mobile ? 14 : 26;
  const carGeo = keep(carGeometry());
  const carMat = keep(new THREE.MeshBasicMaterial({ color: '#ffffff', vertexColors: true }));
  const cars = new THREE.InstancedMesh(carGeo, carMat, carCount);
  const lightsGeo = keep(new THREE.BoxGeometry(0.45, 0.22, 0.1));
  const carLightMat = keep(new THREE.MeshBasicMaterial({ color: new THREE.Color(3, 3, 3), toneMapped: false }));
  const carLights = new THREE.InstancedMesh(lightsGeo, carLightMat, carCount * 2);
  const traffic = Array.from({ length: carCount }, (_, i) => {
    const away = i % 2 === 0; // heading into the city, left lane
    const taxi = rand() < 0.45;
    const body = taxi ? new THREE.Color('#b8141b') : new THREE.Color(['#d9dde3', '#1d222b', '#6b7380'][i % 3]);
    cars.setColorAt(i, body.multiplyScalar(0.85));
    const light = away ? new THREE.Color('#ff2020') : new THREE.Color('#fff6e0');
    carLights.setColorAt(i * 2, light);
    carLights.setColorAt(i * 2 + 1, light);
    return { x: away ? -2.6 : 2.6, z: CAR_NEAR - rand() * (CAR_NEAR - STREET_END), v: (away ? -1 : 1) * (8 + rand() * 7) };
  });
  scene.add(cars, carLights);

  /* Harbour: dark water with light streaks under the skyline */
  const waterGeo = keep(new THREE.PlaneGeometry(1400, 260));
  const water = new THREE.Mesh(waterGeo, keep(new THREE.MeshBasicMaterial({ color: '#060d1c' })));
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, 0.05, -470);
  scene.add(water);
  const streakTex = keep(streakTexture());
  const streakColors = ['#ffd9a0', '#9fd8ff', '#ff3d8b', '#3ee8ff', '#ffffff'];
  const streakMats = streakColors.map((c) =>
    keep(
      new THREE.MeshBasicMaterial({
        map: streakTex,
        color: new THREE.Color(c).multiplyScalar(1.4),
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        toneMapped: false,
        blending: THREE.AdditiveBlending,
      }),
    ),
  );
  const streaks: THREE.Mesh[] = [];
  skyline.forEach((b, i) => {
    if (i % 2) return;
    const s = new THREE.Mesh(signGeo, streakMats[i % streakMats.length]);
    s.scale.set(b.w * 0.5, 140, 1);
    s.userData.w = b.w * 0.5;
    s.rotation.x = -Math.PI / 2;
    s.position.set(b.x, 0.2, b.z + 80);
    scene.add(s);
    streaks.push(s);
  });

  /* Mountains behind the island */
  const hills: THREE.BufferGeometry[] = [];
  for (let x = -600; x <= 600; x += 90 + rand() * 60) {
    const h = 120 + rand() * 120;
    const cone = new THREE.ConeGeometry(110 + rand() * 60, h, 7);
    cone.translate(x, h / 2 - 10, -820 - rand() * 80);
    hills.push(cone);
  }
  const hillGeo = keep(mergeGeometries(hills));
  scene.add(new THREE.Mesh(hillGeo, keep(new THREE.MeshBasicMaterial({ color: '#0a1124' }))));

  /* Camera path */
  const path = new THREE.CatmullRomCurve3(
    [
      [0, 2.4, 34],
      [0.4, 2.8, -20],
      [-0.9, 3.4, -75],
      [0.9, 4.6, -130],
      [-0.6, 8, -185],
      [0.5, 17, -235],
      [0, 34, -278],
      [0, 58, -316],
      [0, 74, -352],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  const aim = new THREE.CatmullRomCurve3(
    [
      [0, 6, -40],
      [0, 7, -95],
      [0, 9, -150],
      [0, 12, -205],
      [0, 22, -260],
      [0, 40, -310],
      [0, 70, -420],
      [0, 85, -560],
      [0, 90, -620],
    ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );

  /* Bloom on desktop only */
  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  if (!mobile) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.85, 0.55, 0.82);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  let target = 0;
  let progress = 0;
  let active = false;
  // Shaders compile in the background; until then frames update the camera but draw nothing
  let compiled = false;
  let disposed = false;
  let raf = 0;
  const pointer = new THREE.Vector2();
  const pointerNow = new THREE.Vector2();
  const clock = new THREE.Clock();
  const pos = new THREE.Vector3();
  const look = new THREE.Vector3();

  function layout() {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    composer?.setSize(w, h);
    bloom?.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    // Keep the street readable on portrait screens
    camera.fov = w / h < 0.8 ? 78 : 62;
    camera.updateProjectionMatrix();
  }

  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    progress += (target - progress) * (reducedMotion ? 1 : 1 - Math.exp(-dt * 9));

    // Thick haze in the street, clear air over the harbour
    fog.density = lerp(0.008, 0.0021, easeInOut(range(progress, 0.55, 0.92)));
    path.getPoint(progress, pos);
    aim.getPoint(Math.min(1, progress + 0.015), look);
    pointerNow.lerp(pointer, 0.05);
    pos.x += pointerNow.x * 1.2;
    pos.y += pointerNow.y * 0.6;
    camera.position.copy(pos);
    camera.lookAt(look.x + pointerNow.x * 4, look.y + pointerNow.y * 2, look.z);

    // Traffic
    traffic.forEach((c, i) => {
      c.z += c.v * dt;
      if (c.z < STREET_END) c.z = CAR_NEAR;
      if (c.z > CAR_NEAR) c.z = STREET_END;
      dummy.position.set(c.x, 0, c.z);
      dummy.updateMatrix();
      cars.setMatrixAt(i, dummy.matrix);
      // Lights on the face that points at the camera (+z)
      for (const s of [-1, 1]) {
        dummy.position.set(c.x + s * 0.65, 0.72, c.z + 2.22);
        dummy.updateMatrix();
        carLights.setMatrixAt(i * 2 + (s > 0 ? 1 : 0), dummy.matrix);
      }
    });
    cars.instanceMatrix.needsUpdate = true;
    carLights.instanceMatrix.needsUpdate = true;

    // Blinking aviation lights, flickering neon
    redMat.color.setRGB(Math.sin(t * 2.4) > 0 ? 4 : 0.4, 0.3, 0.3);
    signs.forEach((s) => {
      if (s.flicker < 0) return;
      const on = Math.sin(t * 7 + s.flicker) > -0.85 && Math.sin(t * 23 + s.flicker * 3) > -0.95;
      s.mat.color.setScalar(on ? 2.1 : 0.35);
    });
    streaks.forEach((s, i) => {
      s.scale.x = (s.userData.w as number) * (1 + Math.sin(t * 1.5 + i) * 0.25);
    });

    if (!compiled) return;
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  function loop() {
    frame();
    raf = requestAnimationFrame(loop);
  }

  layout();
  // Compiling every shader on the first frame froze the scroll for about 100 ms: compile them in
  // parallel (KHR_parallel_shader_compile where available), then draw
  renderer.compileAsync(scene, camera).then(() => {
    if (disposed) return;
    compiled = true;
    frame();
  });

  return {
    setProgress(p) {
      target = p;
      if (!active) frame();
    },
    setActive(next) {
      if (next === active) return;
      active = next;
      cancelAnimationFrame(raf);
      if (active) {
        clock.getDelta();
        loop();
      }
    },
    resize() {
      layout();
      frame();
    },
    look(x, y) {
      pointer.set(x, y);
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      disposables.forEach((d) => d.dispose());
      composer?.dispose();
      renderer.dispose();
    },
  };
};

export default createHongKongScene;
