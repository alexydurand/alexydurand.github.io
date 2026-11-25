import { useEffect, useState, type RefObject } from 'react';

/** Whether the element is on screen or within half a screen of it: 3D layers cost even out of sight. */
export default function useNear(ref: RefObject<Element | null>) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const seen = new IntersectionObserver(([e]) => setNear(e.isIntersecting), {
      rootMargin: '50% 0px',
    });
    seen.observe(el);
    return () => seen.disconnect();
  }, [ref]);
  return near;
}
