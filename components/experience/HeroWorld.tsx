'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { atmosphere, type WorldId } from '@/lib/atmosphere';
import { useIsTouch } from '@/lib/hooks';

const WebGLProductStage = dynamic(() => import('./WebGLProductStage'), {
  ssr: false,
});

const WORLD_COPY: Record<WorldId, { word: string; line: string }> = {
  'lavender-bliss': {
    word: 'Stillness',
    line: 'French lavender, folded into salt. The evening exhales.',
  },
  'rose-magic': {
    word: 'Warmth',
    line: 'Damask rose, suspended in crystal. The water blushes.',
  },
};

export default function HeroWorld() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [world, setWorldState] = useState<WorldId>('lavender-bliss');
  const isTouch = useIsTouch();

  const setWorld = (w: WorldId) => {
    setWorldState(w);
    atmosphere.set({ world: w });
  };

  // intro choreography once the preloader hands over
  useEffect(() => {
    const onReady = () => {
      setRevealed(true);
      const words = headlineRef.current?.querySelectorAll('[data-word]');
      if (!words) return;
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo(
        words,
        { yPercent: 120, opacity: 0, rotate: 3 },
        {
          yPercent: 0,
          opacity: 1,
          rotate: 0,
          duration: 1.3,
          stagger: 0.42, // Not… Just… Bath Salt. — premium pauses
        },
        0.55
      )
        .fromTo(
          sublineRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 1.2 },
          '-=0.5'
        )
        .fromTo(
          uiRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 1 },
          '-=0.7'
        );
    };
    window.addEventListener('dm:experience-ready', onReady);
    return () => window.removeEventListener('dm:experience-ready', onReady);
  }, []);

  // leaving the hero = the journey begins
  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          if (stageRef.current) {
            stageRef.current.style.transform = `translateY(${p * -16}vh) scale(${1 - p * 0.16})`;
            stageRef.current.style.opacity = `${1 - p * 1.15}`;
          }
        },
        onEnterBack: () => atmosphere.set({ mode: 'drift', light: 0 }),
      });

      gsap.to(headlineRef.current, {
        yPercent: -60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '55% top',
          scrub: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const copy = WORLD_COPY[world];

  return (
    <section
      ref={sectionRef}
      id="top"
      className="relative flex h-[130vh] flex-col items-center justify-start"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        {/* deep vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 48%, rgba(51,34,58,0.55), transparent 70%)',
          }}
        />

        {/* WebGL product world */}
        <div
          ref={stageRef}
          className="absolute inset-0 z-10 will-change-transform"
          data-cursor="explore"
        >
          <WebGLProductStage
            world={world}
            revealed={revealed}
            particleCount={isTouch ? 120 : 260}
          />
        </div>

        {/* headline — editorial scale, the jar rises into it */}
        <h1
          ref={headlineRef}
          className="pointer-events-none absolute top-[13vh] z-0 select-none text-center font-display font-light leading-[0.98] tracking-tight text-ivory"
          style={{ fontSize: 'clamp(2.8rem, 9vw, 9rem)' }}
        >
          <span className="mask-line">
            <span data-word className="opacity-0">Not</span>{' '}
            <span data-word className="italic text-gold-bright opacity-0">just</span>
          </span>
          <span className="mask-line">
            <span data-word className="opacity-0">bath salt.</span>
          </span>
        </h1>

        {/* subline */}
        <p
          ref={sublineRef}
          className="pointer-events-none absolute bottom-[21vh] z-20 max-w-md px-6 text-center text-sm font-light leading-relaxed tracking-wide text-ivory/60 opacity-0"
        >
          {copy.line}
        </p>

        {/* world switch + scroll cue */}
        <div
          ref={uiRef}
          className="absolute bottom-10 z-20 flex w-full flex-col items-center gap-7 opacity-0"
        >
          <div className="glass flex items-center gap-1 rounded-full p-1">
            {(['lavender-bliss', 'rose-magic'] as WorldId[]).map((w) => (
              <button
                key={w}
                data-cursor="magnetic"
                onClick={() => setWorld(w)}
                className={`rounded-full px-5 py-2 text-[10px] font-semibold tracking-[0.22em] transition-all duration-700 ease-silk ${
                  world === w
                    ? w === 'rose-magic'
                      ? 'bg-rose/20 text-rose-bright'
                      : 'bg-lavender/20 text-lavender-bright'
                    : 'text-ivory/40 hover:text-ivory/70'
                }`}
              >
                {w === 'rose-magic' ? 'ROSE MAGIC' : 'LAVENDER BLISS'}
              </button>
            ))}
          </div>
          <div className="flex flex-col items-center gap-2 text-[9px] tracking-[0.4em] text-ivory/30">
            <span>BEGIN THE RITUAL</span>
            <span className="block h-9 w-px animate-pulse bg-gradient-to-b from-gold/60 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
