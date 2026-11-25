export type Point = [number, number];

/** A ridge through the points (smooth, or straight for rock), closed down to the bottom edge of a w × h box. */
export function ridgePath(pts: Point[], w: number, h: number, jagged = false) {
  let d = `M0 ${h} L${pts[0]}`;
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
  return `${d} L${w} ${h} Z`;
}
