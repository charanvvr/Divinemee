'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

export default function ScrollProgress() {
  const lineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      gsap.set(line, { scaleX: max > 0 ? window.scrollY / max : 0 });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[210] h-[2px]">
      <span
        ref={lineRef}
        className="block h-full origin-left scale-x-0 bg-gradient-to-r from-rose via-gold-bright to-lavender"
      />
    </div>
  );
}
