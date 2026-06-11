'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Apple-style sticky scroll: the open jar stays pinned while the five
 * ingredients reveal one by one beside it. Subtle rotation, no spectacle.
 */

const INGREDIENTS = [
  {
    name: 'Epsom Salt',
    text: 'Pure magnesium sulphate that relaxes tired muscles, eases aches and supports deeper sleep.',
  },
  {
    name: 'Pink Himalayan Salt',
    text: '84 trace minerals deep-cleanse and detoxify the skin while improving circulation.',
  },
  {
    name: 'Natural Sea Salt',
    text: 'Magnesium, calcium and potassium soothe irritated skin and soften hard water.',
  },
  {
    name: 'Sodium Bicarbonate',
    text: 'Softens skin, relieves itching and leaves the water feeling like silk.',
  },
  {
    name: 'Pure Essential Oils',
    text: 'Real rose or French lavender — the steam carries the aroma as the salt dissolves.',
  },
];

export default function IngredientStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>('[data-ingredient]');
      items.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0.18, x: 14 },
          {
            opacity: 1,
            x: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top 72%',
              end: 'top 45%',
              scrub: true,
            },
          }
        );
      });

      gsap.fromTo(
        imgRef.current,
        { rotate: -2.5, scale: 1.02 },
        {
          rotate: 2,
          scale: 1,
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

  return (
    <section ref={sectionRef} id="ingredients" className="bg-ivory py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-14 md:grid-cols-2 md:gap-10">
          {/* sticky product */}
          <div className="md:sticky md:top-24 md:h-[calc(100vh-8rem)]">
            <div className="relative h-[420px] overflow-hidden rounded-[2rem] shadow-card md:h-full">
              <div ref={imgRef} className="absolute inset-[-4%] will-change-transform">
                <Image
                  src="/images/jar-lavender-open.jpg"
                  alt="Open Lavender Bliss jar with a wooden scoop of salt and fresh lavender"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-paper/85 p-5 backdrop-blur-md">
                <p className="text-[10px] font-semibold tracking-[0.3em] text-gold">
                  WHAT&apos;S INSIDE
                </p>
                <p className="mt-1.5 font-display text-xl font-light italic text-ink">
                  Five elements. Nothing else.
                </p>
              </div>
            </div>
          </div>

          {/* scrolling ingredients */}
          <div className="flex flex-col justify-center">
            <p className="text-[11px] font-semibold tracking-[0.34em] text-gold">
              THE FORMULA
            </p>
            <h2
              className="mt-4 font-display font-light leading-tight text-ink"
              style={{ fontSize: 'clamp(2rem, 3.6vw, 3.2rem)' }}
            >
              Read the label.
              <br />
              <em className="italic text-gold">You&apos;ll recognise everything.</em>
            </h2>

            <div className="mt-12 space-y-0">
              {INGREDIENTS.map((ing, i) => (
                <div
                  key={ing.name}
                  data-ingredient
                  className="border-t border-ink/10 py-7 last:border-b"
                >
                  <div className="flex items-baseline gap-5">
                    <span className="font-display text-sm italic text-ink-faint">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-2xl font-light text-ink">
                        {ing.name}
                      </h3>
                      <p className="mt-2 max-w-md text-[14px] font-light leading-relaxed text-ink-soft">
                        {ing.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-8 text-[13px] font-light text-ink-faint">
              No parabens · No sulphates · No artificial dyes · Cruelty-free
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
