'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { atmosphere, pointer } from '@/lib/atmosphere';

/**
 * Scene II — the formula separates from the product. Five ingredients orbit
 * the jar in 3D; scroll pulls them outward, the cursor tilts the orbital
 * plane, and clicking one brings it forward with its story.
 */

interface Ingredient {
  id: string;
  name: string;
  role: string;
  story: string;
  tint: string;
}

const INGREDIENTS: Ingredient[] = [
  {
    id: 'epsom',
    name: 'Epsom Salt',
    role: 'The muscle whisperer',
    story:
      'Pure magnesium sulphate crystals that melt into the water and loosen every knot the day tied. Eases aches, calms cramps, invites deeper sleep.',
    tint: '#ecd3a3',
  },
  {
    id: 'himalayan',
    name: 'Pink Himalayan Salt',
    role: 'The ancient detoxifier',
    story:
      'Mined from primordial seabeds. Eighty-four trace minerals deep-cleanse the skin, stir circulation and polish away what no longer serves you.',
    tint: '#e8aebc',
  },
  {
    id: 'sea',
    name: 'Natural Sea Salt',
    role: 'The mineral bath',
    story:
      'Rich in magnesium, calcium and potassium. It soothes irritated skin, steadies circulation and turns a tub into a tide pool.',
    tint: '#d3c7ef',
  },
  {
    id: 'soda',
    name: 'Sodium Bicarbonate',
    role: 'The silk maker',
    story:
      'Softens the water until it feels like silk against the skin. Calms itching, clears pores, leaves you weightless.',
    tint: '#f4eee4',
  },
  {
    id: 'oils',
    name: 'Essential Oils',
    role: 'The soul of the scent',
    story:
      'Steam carries rose or lavender upward as the salt dissolves. Mood lifts, redness fades, the bathroom becomes a spa.',
    tint: '#b3a1dd',
  },
];

export default function IngredientOrbit() {
  const sectionRef = useRef<HTMLElement>(null);
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const jarRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const progress = useRef(0);
  const [selected, setSelected] = useState<Ingredient | null>(null);
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selected?.id ?? null;

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        onToggle: (self) => {
          if (self.isActive) atmosphere.set({ mode: 'orbit', light: 0 });
        },
        onUpdate: (self) => {
          progress.current = self.progress;
          atmosphere.set({ progress: self.progress });
        },
      });

      const words = titleRef.current?.querySelectorAll('span > span');
      if (words) {
        gsap.fromTo(
          words,
          { yPercent: 110 },
          {
            yPercent: 0,
            stagger: 0.08,
            ease: 'power4.out',
            duration: 1.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
            },
          }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // orbital positioning loop
  useEffect(() => {
    let raf = 0;
    let t = 0;
    let last = performance.now();
    const lerped = INGREDIENTS.map(() => ({ s: 0 })); // forward emphasis

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      const p = progress.current;
      const W = window.innerWidth;
      const isMobile = W < 768;
      const baseR = Math.min(W, window.innerHeight) * (isMobile ? 0.36 : 0.3);
      // scroll separates the formula from the jar
      const spread = 0.25 + Math.min(1, p * 1.6) * 0.85;
      const tilt = 0.36 - pointer.y * 0.12;

      INGREDIENTS.forEach((ing, i) => {
        const el = nodeRefs.current[i];
        if (!el) return;
        const isSel = selectedRef.current === ing.id;
        lerped[i].s += ((isSel ? 1 : 0) - lerped[i].s) * Math.min(1, dt * 5);
        const f = lerped[i].s;

        const a = (i / INGREDIENTS.length) * Math.PI * 2 + t * 0.14 + p * 1.2;
        const r = baseR * spread * (1 - f * 0.78);
        const x = Math.cos(a) * r * (1 + pointer.x * 0.1) * (1 - f);
        const y = Math.sin(a) * r * tilt * (1 - f) + f * 0;
        const depth = (Math.sin(a) + 1) / 2; // 0 behind – 1 front
        const z = 0.55 + depth * 0.65;
        const scale = (z * (0.8 + Math.min(1, p * 2.2) * 0.25)) * (1 + f * 0.9);
        const blur = (1 - depth) * 2.4 * (1 - f);

        el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        el.style.zIndex = isSel ? '40' : `${10 + Math.round(depth * 10)}`;
        el.style.filter = `blur(${blur}px)`;
        el.style.opacity = `${Math.min(1, p * 3) * (0.5 + depth * 0.5 + f)}`;
      });

      // jar parallax — heavy, slow
      if (jarRef.current) {
        const jx = pointer.x * 14;
        const jy = pointer.y * 10 + Math.sin(t * 0.7) * 6;
        jarRef.current.style.transform = `translate3d(${jx}px, ${jy}px, 0) rotate(${pointer.x * 2}deg) scale(${1 - Math.min(1, p * 1.4) * 0.06})`;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="ingredients"
      className="relative h-[320vh]"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* title */}
        <h2
          ref={titleRef}
          className="pointer-events-none absolute top-[12vh] z-30 text-center font-display font-light italic leading-tight text-ivory"
          style={{ fontSize: 'clamp(2rem, 5.5vw, 5rem)' }}
        >
          <span className="mask-line">
            <span>A ritual of</span>
          </span>
          <span className="mask-line">
            <span className="text-shimmer not-italic">five elements.</span>
          </span>
        </h2>

        {/* centre jar */}
        <div
          ref={jarRef}
          className="relative z-20 h-[42vh] will-change-transform md:h-[48vh]"
        >
          <Image
            src="/images/cutouts/lavender-bliss.png"
            alt="Divine Mee Lavender Bliss luxury bath salt"
            width={454}
            height={947}
            className="h-full w-auto drop-shadow-[0_40px_60px_rgba(0,0,0,0.55)]"
          />
          <div
            className="absolute inset-0 -z-10 scale-150 rounded-full opacity-60"
            style={{
              background:
                'radial-gradient(circle, rgba(179,161,221,0.18), transparent 65%)',
            }}
          />
        </div>

        {/* orbiting ingredients */}
        {INGREDIENTS.map((ing, i) => (
          <button
            key={ing.id}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            data-cursor="discover"
            onClick={() => setSelected(selected?.id === ing.id ? null : ing)}
            className="group absolute left-1/2 top-1/2 z-10 flex flex-col items-center gap-2 opacity-0 will-change-transform"
            aria-label={`Discover ${ing.name}`}
          >
            <span
              className="glass-bright flex h-16 w-16 items-center justify-center rounded-full transition-shadow duration-500 md:h-20 md:w-20"
              style={{ boxShadow: `0 0 34px ${ing.tint}26` }}
            >
              <span
                className="h-5 w-5 rounded-full md:h-6 md:w-6"
                style={{
                  background: `radial-gradient(circle at 35% 30%, #fff, ${ing.tint} 55%, transparent 90%)`,
                  boxShadow: `0 0 18px ${ing.tint}aa`,
                }}
              />
            </span>
            <span className="text-[9px] font-medium tracking-[0.26em] text-ivory/55 transition-colors duration-300 group-hover:text-ivory">
              {ing.name.toUpperCase()}
            </span>
          </button>
        ))}

        {/* glass info panel */}
        <div
          className={`glass-bright absolute z-50 mx-5 max-w-sm rounded-3xl p-8 transition-all duration-700 ease-silk md:right-[8vw] md:mx-0 ${
            selected
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-6 opacity-0'
          }`}
        >
          {selected && (
            <>
              <p
                className="text-[9px] font-semibold tracking-[0.3em]"
                style={{ color: selected.tint }}
              >
                {selected.role.toUpperCase()}
              </p>
              <h3 className="mt-2 font-display text-3xl font-light italic text-ivory">
                {selected.name}
              </h3>
              <p className="mt-4 text-sm font-light leading-relaxed text-ivory/65">
                {selected.story}
              </p>
              <button
                data-cursor="magnetic"
                onClick={() => setSelected(null)}
                className="mt-6 text-[10px] tracking-[0.3em] text-ivory/40 transition-colors hover:text-ivory"
              >
                CLOSE ✕
              </button>
            </>
          )}
        </div>

        <p className="absolute bottom-8 z-30 text-[9px] tracking-[0.4em] text-ivory/25">
          TOUCH AN ELEMENT TO DISCOVER
        </p>
      </div>
    </section>
  );
}
