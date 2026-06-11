'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { atmosphere } from '@/lib/atmosphere';

/**
 * Scene IV — the ritual itself. POUR → DISSOLVE → RELAX.
 * The atmosphere performs each verb; the world transitions from
 * deep night shadow to warm ivory calm as the visitor relaxes.
 */

const MOMENTS = [
  {
    word: 'POUR',
    sub: 'A handful of crystals. The sound of a beginning.',
    mode: 'pour' as const,
  },
  {
    word: 'DISSOLVE',
    sub: 'Salt becomes silk. The water takes the weight.',
    mode: 'dissolve' as const,
  },
  {
    word: 'RELAX',
    sub: 'Twenty minutes that belong to no one else.',
    mode: 'relax' as const,
  },
];

export default function RitualExperience() {
  const sectionRef = useRef<HTMLElement>(null);
  const ivoryRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          const p = self.progress;
          const idx = Math.min(2, Math.floor(p * 3));
          const local = (p * 3) % 1;
          atmosphere.set({
            mode: MOMENTS[idx].mode,
            progress: local,
            // light floods in through RELAX
            light: idx === 2 ? Math.min(1, local * 1.6) : 0,
          });

          // ivory dawn
          if (ivoryRef.current) {
            const lightAmt = idx === 2 ? Math.min(1, local * 1.5) : 0;
            ivoryRef.current.style.opacity = `${lightAmt}`;
          }

          // word visibility — huge cinematic crossfades
          wordRefs.current.forEach((el, i) => {
            if (!el) return;
            const center = (i + 0.5) / 3;
            const d = Math.abs(p - center) * 3;
            const vis = Math.max(0, 1 - d * 1.65);
            el.style.opacity = `${vis}`;
            const drift = (p - center) * 3 * -34;
            el.style.transform = `translateY(${drift}vh) scale(${0.92 + vis * 0.08})`;
          });
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="ritual" className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* dawn layer — dark ritual melts into ivory calm */}
        <div
          ref={ivoryRef}
          className="absolute inset-0 opacity-0"
          style={{
            background:
              'linear-gradient(180deg, #efe7da 0%, #f5efe6 55%, #ece2d2 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 60%, rgba(56,43,85,0.25), transparent 70%)',
          }}
        />

        {MOMENTS.map((m, i) => (
          <div
            key={m.word}
            ref={(el) => {
              wordRefs.current[i] = el;
            }}
            className="absolute flex flex-col items-center px-6 text-center opacity-0 will-change-transform"
          >
            <span
              className={`font-display font-light tracking-[0.08em] ${
                i === 2 ? 'text-ink-soft' : 'text-ivory'
              }`}
              style={{
                fontSize: 'clamp(4rem, 16vw, 16rem)',
                textShadow:
                  i === 2
                    ? '0 10px 60px rgba(217,176,106,0.25)'
                    : '0 10px 80px rgba(0,0,0,0.45)',
              }}
            >
              {m.word}
            </span>
            <span
              className={`mt-2 max-w-sm text-sm font-light tracking-wide ${
                i === 2 ? 'text-ink-soft/70' : 'text-ivory/55'
              }`}
            >
              {m.sub}
            </span>
          </div>
        ))}

        {/* ritual progress beads */}
        <div className="absolute bottom-10 flex items-center gap-3">
          {MOMENTS.map((m) => (
            <span key={m.word} className="h-1 w-1 rounded-full bg-ivory/30" />
          ))}
        </div>
      </div>
    </section>
  );
}
