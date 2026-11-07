import * as THREE from 'three';
import type { SceneFactory, SceneHandle } from '../hooks/useLazyScene';

/**
 * The three pieces of Morphy's final position (white rook and bishop, black king), turned in code from
 * Staunton-like profiles and floating slowly beside the board. Colours come from the theme tokens.
 */

type Profile = [radius: number, height: number][];

// A ball on top of a profile, from `fromDeg` below its equator up to its pole
const ball = (r: number, cy: number, fromDeg = -60): Profile =>
  Array.from({ length: 9 }, (_, i) => {
    const a = THREE.MathUtils.degToRad(fromDeg + ((90 - fromDeg) * i) / 8);
    return [Math.max(0, r * Math.cos(a)), cy + r * Math.sin(a)];
  });

const BASE: Profile = [
  [0, 0],
  [0.62, 0],
  [0.62, 0.08],
  [0.54, 0.13],
  [0.56, 0.2],
  [0.4, 0.27],
];

const KING: Profile = [
  ...BASE,
  [0.3, 0.45],
  [0.22, 1.25],
  [0.36, 1.32],
  [0.36, 1.38],
  [0.24, 1.44],
  [0.26, 1.5],
  [0.38, 1.82],
  [0.32, 1.88],
  [0, 1.92],
];

const ROOK: Profile = [...BASE, [0.34, 0.45], [0.3, 0.95], [0.42, 1.02], [0.42, 1.2], [0, 1.2]];

const BISHOP: Profile = [
  ...BASE,
  [0.28, 0.45],
  [0.18, 1.02],
  [0.32, 1.08],
  [0.32, 1.13],
  [0.2, 1.18],
  [0.26, 1.3],
  [0.29, 1.42],
  [0.24, 1.56],
  [0.12, 1.66],
  [0.06, 1.69],
  ...ball(0.07, 1.74, -40),
];

const lathe = (p: Profile) =>
  new THREE.LatheGeometry(
    p.map(([r, y]) => new THREE.Vector2(r, y)),
    48,
  );

export type ChessScene = SceneHandle;

const createChessScene: SceneFactory<ChessScene> = (canvas, { reducedMotion }) => {
  const token = (name: string) => new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue(name).trim());

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
  camera.position.set(0, 2.6, 9.8);
  camera.lookAt(0, 0.95, 0);

  scene.add(new THREE.HemisphereLight(0xffffff, token('--color-surface-2'), 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(3, 6, 4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.radius = 6;
  Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 });
  scene.add(sun);

  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(d: T) => {
    disposables.push(d);
    return d;
  };

  const light = keep(new THREE.MeshPhysicalMaterial({ color: token('--color-paper'), roughness: 0.35, clearcoat: 0.6 }));
  const dark = keep(new THREE.MeshPhysicalMaterial({ color: token('--color-ink'), roughness: 0.3, clearcoat: 0.8 }));

  const piece = (profile: Profile, material: THREE.Material, extras: THREE.BufferGeometry[] = []) => {
    const group = new THREE.Group();
    for (const g of [lathe(profile), ...extras]) {
      const mesh = new THREE.Mesh(keep(g), material);
      mesh.castShadow = true;
      group.add(mesh);
    }
    return group;
  };

  // The king's cross
  const cross = [
    new THREE.BoxGeometry(0.1, 0.42, 0.1).translate(0, 2.1, 0),
    new THREE.BoxGeometry(0.3, 0.1, 0.1).translate(0, 2.14, 0),
  ];
  // The rook's battlements: four blocks around the top rim
  const merlons = [0, 1, 2, 3].map((i) => {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    return new THREE.BoxGeometry(0.26, 0.16, 0.22).rotateY(-a).translate(Math.cos(a) * 0.3, 1.28, Math.sin(a) * 0.3);
  });

  const pieces = [
    { obj: piece(ROOK, light, merlons), x: -1.3, z: 0.35, spin: 0.25, phase: 0 },
    { obj: piece(KING, dark, cross), x: 0, z: -0.35, spin: -0.18, phase: 2.1 },
    { obj: piece(BISHOP, light), x: 1.3, z: 0.35, spin: 0.3, phase: 4.2 },
  ];
  pieces.forEach((p) => {
    p.obj.position.set(p.x, 0, p.z);
    p.obj.rotation.y = p.phase;
    scene.add(p.obj);
  });

  // Soft shadows on an invisible floor
  const floor = new THREE.Mesh(keep(new THREE.PlaneGeometry(12, 12)), keep(new THREE.ShadowMaterial({ opacity: 0.14 })));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.25;
  floor.receiveShadow = true;
  scene.add(floor);

  let raf = 0;
  let active = false;
  const timer = new THREE.Timer();

  function frame() {
    timer.update();
    const t = reducedMotion ? 0 : timer.getElapsed();
    pieces.forEach((p, i) => {
      p.obj.rotation.y = p.phase + t * p.spin;
      p.obj.position.y = 0.12 + Math.sin(t * 0.9 + i * 1.7) * 0.1;
    });
    renderer.render(scene, camera);
  }

  function loop() {
    frame();
    raf = requestAnimationFrame(loop);
  }

  function layout() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  layout();
  frame();

  return {
    setProgress() {},
    setActive(next) {
      if (next === active) return;
      active = next;
      cancelAnimationFrame(raf);
      // Reduced motion: one still frame, no loop
      if (active && !reducedMotion) loop();
    },
    resize() {
      layout();
      frame();
    },
    dispose() {
      cancelAnimationFrame(raf);
      timer.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
};

export default createChessScene;
