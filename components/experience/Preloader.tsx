'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { atmosphere } from '@/lib/atmosphere';

/**
 * Cinematic opening: dark void → salt crystals gather into the Divine Mee
 * aura → a beam of light → the experience reveals. Click to skip.
 */
export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const lenis = window.__lenis;
    lenis?.stop();
    window.scrollTo(0, 0);

    const progress = { v: 0 };
    atmosphere.set({ mode: 'gather', progress: 0, light: 0 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        setGone(true);
        atmosphere.set({ mode: 'drift', progress: 1 });
        window.dispatchEvent(new Event('dm:experience-ready'));
        lenis?.start();
      },
    });

    tl.to(progress, {
      v: 1,
      duration: 1.5,
      ease: 'power2.out',
      onUpdate: () => atmosphere.set({ progress: progress.v }),
    })
      .fromTo(
        auraRef.current,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1, duration: 1.4, ease: 'power2.out' },
        0.35
      )
      .fromTo(
        wordRef.current,
        { opacity: 0, letterSpacing: '0.6em', filter: 'blur(8px)' },
        { opacity: 1, letterSpacing: '0.18em', filter: 'blur(0px)', duration: 1.3 },
        0.8
      )
      .fromTo(
        beamRef.current,
        { scaleY: 0, opacity: 0 },
        { scaleY: 1, opacity: 1, duration: 0.9, ease: 'power4.inOut' },
        1.7
      )
      .to(
        [wordRef.current, auraRef.current],
        { opacity: 0, scale: 1.12, duration: 0.7, ease: 'power2.in' },
        2.35
      )
      .to(
        rootRef.current,
        { opacity: 0, duration: 1.1, ease: 'power2.inOut' },
        2.6
      );

    const skip = () => tl.progress(1);
    rootRef.current?.addEventListener('pointerdown', skip);

    return () => {
      tl.kill();
      lenis?.start();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-ink-deep"
    >
      {/* aura ring */}
      <div
        ref={auraRef}
        className="absolute h-[46vmin] w-[46vmin] rounded-full opacity-0"
        style={{
          background:
            'radial-gradient(circle, transparent 52%, rgba(217,176,106,0.22) 64%, rgba(217,176,106,0.05) 74%, transparent 82%)',
          boxShadow: '0 0 120px 10px rgba(217,176,106,0.08) inset',
        }}
      />
      {/* light beam */}
      <div
        ref={beamRef}
        className="absolute top-0 h-full w-px origin-top opacity-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent, rgba(244,238,228,0.65) 30%, rgba(217,176,106,0.5) 60%, transparent)',
          boxShadow: '0 0 60px 14px rgba(236,211,158,0.14)',
        }}
      />
      {/* wordmark */}
      <div ref={wordRef} className="relative text-center opacity-0">
        <p className="font-display text-3xl italic text-ivory md:text-4xl">
          divine mee
        </p>
        <p className="mt-3 text-[9px] font-medium tracking-[0.5em] text-gold/80">
          SELF CARE RITUAL
        </p>
      </div>
      <p className="absolute bottom-10 text-[9px] tracking-[0.4em] text-ivory/25">
        ENTERING THE RITUAL
      </p>
    </div>
  );
}
