import { useId } from 'react';
import clsx from '../lib/clsx';

/** A record that slides out of its sleeve when `out`, and keeps spinning. Sized by its container. */
export default function Vinyl({ cover, out, delay = 0 }: { cover: string; out: boolean; delay?: number }) {
  const clip = useId();
  return (
    <div aria-hidden className="relative aspect-[1.6/1] w-full">
      <div
        style={{ transitionDelay: out ? `${delay}ms` : '0ms' }}
        className={clsx(
          'ease-out-expo absolute top-0 left-0 aspect-square h-full transition-transform duration-700 motion-reduce:transition-none',
          out ? 'translate-x-[55%]' : 'translate-x-[6%]',
        )}
      >
        <svg
          aria-hidden
          viewBox="0 0 200 200"
          className="size-full animate-spin [animation-duration:3.2s] motion-reduce:animate-none"
        >
          <circle cx="100" cy="100" r="100" className="fill-night" />
          {[92, 84, 76, 68, 60, 52, 44].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} fill="none" strokeWidth="0.8" className="stroke-white/10" />
          ))}
          {/* Label: the cover artwork, so the spin reads */}
          <clipPath id={clip}>
            <circle cx="100" cy="100" r="34" />
          </clipPath>
          <image
            href={cover}
            x="66"
            y="66"
            width="68"
            height="68"
            clipPath={`url(#${clip})`}
            preserveAspectRatio="xMidYMid slice"
          />
          <circle cx="100" cy="100" r="4" className="fill-bg" />
        </svg>
        {/* Light on the grooves stays still while the record turns */}
        <svg aria-hidden viewBox="0 0 200 200" className="absolute inset-0 size-full">
          <path d="M40 52 A78 78 0 0 1 82 26" fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-white/15" />
          <path d="M160 148 A78 78 0 0 1 118 174" fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-white/10" />
        </svg>
      </div>
      {/* Sleeve */}
      <img
        src={cover}
        alt=""
        width={400}
        height={400}
        loading="lazy"
        className="absolute top-0 left-0 aspect-square h-full w-auto object-cover"
      />
    </div>
  );
}
