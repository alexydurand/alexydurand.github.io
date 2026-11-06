import { useEffect, useRef } from 'react';

// Monza, traced from Will Pittenger's map (Wikimedia Commons, CC BY-SA 3.0); start line on the main straight
const TRACK = 'M416.4 310.1L253.1 312.7L249.4 309.7L248.4 302.2L246.1 301.3L222.1 309.7L204.7 313.7L161.3 314.2L148.6 313.0L138.8 310.4L125.2 303.4L112.8 294.4L99.3 279.2L90.1 261.0L79.7 221.6L65.1 138.6L63.7 136.5L54.3 132.8L52.8 130.8L43.2 107.2L22.4 63.4L20.1 53.5L20.6 45.9L26.2 37.6L34.9 32.3L92.5 21.2L100.1 20.0L102.5 20.7L109.7 27.8L152.4 88.3L168.3 108.2L187.9 128.3L276.4 209.3L291.7 222.9L296.1 225.2L313.7 223.0L321.3 223.5L330.6 227.7L340.3 236.0L352.8 237.9L595.3 238.2L605.4 239.5L612.2 242.8L617.0 248.7L619.4 255.9L619.6 266.1L617.6 273.4L613.4 279.8L604.3 288.7L595.9 294.5L586.6 298.7L566.8 303.3L523.6 307.7L419.0 310.0Z';

const CARS = [
  { fill: 'fill-dot-red', dur: 7, delay: 0 },
  { fill: 'fill-flower', dur: 7.3, delay: -0.5 },
  { fill: 'fill-paper', dur: 7.6, delay: -1 },
];

/** The circuit, with cars lapping it while `playing` is true. */
export default function Circuit({ playing, still }: { playing: boolean; still: boolean }) {
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (playing && !still) svg.current?.unpauseAnimations();
    else svg.current?.pauseAnimations();
  }, [playing, still]);

  return (
    <svg ref={svg} aria-hidden viewBox="0 0 640 335" className="w-full max-w-xl">
      <path d={TRACK} fill="none" strokeWidth="16" strokeLinejoin="round" className="stroke-ink" />
      <path d={TRACK} fill="none" strokeWidth="1.5" strokeDasharray="6 10" className="stroke-white/40" />
      {/* Start and finish */}
      <rect x="412" y="300" width="4" height="20" className="fill-paper" />
      {CARS.map((c) => (
        <g key={c.fill}>
          <rect x="-7" y="-3.5" width="14" height="7" rx="2" className={c.fill} />
          <animateMotion dur={`${c.dur}s`} begin={`${c.delay}s`} repeatCount="indefinite" rotate="auto" path={TRACK} />
        </g>
      ))}
    </svg>
  );
}
