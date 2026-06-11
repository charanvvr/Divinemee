'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { atmosphere } from '@/lib/atmosphere';
import PremiumImage from '@/components/media/PremiumImage';

/**
 * Scene III — travelling through crystal space. The atmosphere accelerates
 * past the visitor while "Escape begins within." assembles letter by letter,
 * and a real macro of the salt drifts through like a passing moon.
 */
export default function CrystalFlow() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLHeadingElement>(null);
  const macroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (self.isActive) atmosphere.set({ mode: 'flow', light: 0 });
        },
        onUpdate: (self) => atmosphere.set({ progress: self.progress }),
      });

      // character assembly with scroll scrub
      const chars = lineRef.current?.querySelectorAll('[data-char]');
      if (chars) {
        gsap.fromTo(
          chars,
          {
            opacity: 0,
            yPercent: () => gsap.utils.random(-160, 160),
            xPercent: () => gsap.utils.random(-60, 60),
            rotate: () => gsap.utils.random(-24, 24),
            filter: 'blur(10px)',
          },
          {
            opacity: 1,
            yPercent: 0,
            xPercent: 0,
            rotate: 0,
            filter: 'blur(0px)',
            stagger: { each: 0.03, from: 'random' },
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              end: 'center center',
              scrub: 1.1,
            },
          }
        );
      }

      // macro drifts past like a slow moon
      gsap.fromTo(
        macroRef.current,
        { yPercent: 60, xPercent: 14, rotate: 6 },
        {
          yPercent: -60,
          xPercent: -8,
          rotate: -4,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const line = 'Escape begins within.';

  return (
    <section ref={sectionRef} className="relative flex h-[170vh] items-center justify-center overflow-hidden">
      {/* drifting real macro — crystals & lavender buds */}
      <div
        ref={macroRef}
        className="absolute right-[6vw] top-1/2 z-0 h-[34vmin] w-[34vmin] overflow-hidden rounded-full opacity-70 md:h-[40vmin] md:w-[40vmin]"
        style={{ boxShadow: '0 60px 120px rgba(0,0,0,0.5), 0 0 80px rgba(211,199,239,0.12)' }}
      >
        <PremiumImage
          src="/images/macro-lavender-salt.jpg"
          alt="Macro of Divine Mee salt crystals with real lavender buds"
          fill
          sizes="40vmin"
          parallax={14}
          zoom={1.18}
        />
      </div>

      <h2
        ref={lineRef}
        aria-label={line}
        className="relative z-10 max-w-5xl px-6 text-center font-display font-light leading-[1.05] text-ivory"
        style={{ fontSize: 'clamp(2.6rem, 8vw, 7.5rem)' }}
      >
        {line.split('').map((ch, i) =>
          ch === ' ' ? (
            <span key={i}> </span>
          ) : (
            <span
              key={i}
              data-char
              className={`inline-block will-change-transform ${
                i >= line.indexOf('within') ? 'italic text-gold-bright' : ''
              }`}
            >
              {ch}
            </span>
          )
        )}
      </h2>
    </section>
  );
}
