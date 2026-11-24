import type { Point } from './ridge';

/*
 * The crests of the home page hills, measured on their picture (2400 × 1361): the far hill's top, the
 * middle hill on both sides of it, the near hill. Drawn as white lines (Hero.tsx); the winter scene
 * hides what lies behind each one (WinterScene.tsx).
 */
export const TOP: Point[] = [
  [0, 1006],
  [80, 1017],
  [160, 1028],
  [240, 1034],
  [320, 1036],
  [400, 1032],
  [480, 1028],
  [560, 1024],
  [640, 1024],
  [720, 1030],
  [760, 1033],
  [800, 1030],
  [840, 1029],
  [880, 1039],
  [960, 1044],
  [1040, 1045],
  [1120, 1042],
  [1200, 1038],
  [1280, 1022],
  [1360, 1009],
  [1440, 1002],
  [1520, 1000],
  [1560, 1006],
  [1600, 1015],
  [1680, 1019],
  [1760, 1018],
  [1840, 1009],
  [1920, 987],
  [2000, 963],
  [2080, 940],
  [2160, 919],
  [2240, 900],
  [2280, 895],
  [2400, 895],
];

export const MIDDLE_LEFT: Point[] = [
  [0, 1143],
  [120, 1150],
  [240, 1136],
  [300, 1124],
  [420, 1098],
  [480, 1088],
  [540, 1072],
  [600, 1060],
  [660, 1048],
  [740, 1034],
];

export const MIDDLE_RIGHT: Point[] = [
  [1580, 1012],
  [1680, 1036],
  [1800, 1042],
  [1920, 1045],
  [2040, 1041],
  [2160, 1042],
  [2280, 1047],
  [2400, 1056],
];

export const NEAR: Point[] = [
  [0, 1268],
  [240, 1282],
  [450, 1250],
  [700, 1274],
  [1000, 1268],
  [1300, 1230],
  [1550, 1250],
  [1800, 1236],
  [1950, 1188],
  [2100, 1140],
  [2220, 1116],
  [2400, 1160],
];

// The middle hill's whole top: where it does not show on both sides, the far hill's crest is its own
export const MIDDLE: Point[] = [
  ...MIDDLE_LEFT,
  ...TOP.filter(([x]) => x > 760 && x < 1560),
  ...MIDDLE_RIGHT,
];
