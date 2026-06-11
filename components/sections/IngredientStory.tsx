'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';

const INGREDIENTS = [
  {
    name: 'Epsom Salt',
    eyebrow: 'MAGNESIUM',
    text: 'Pure magnesium sulphate that relaxes tired muscles, eases aches and supports deeper sleep.',
    image: '/images/macro-lavender-salt.jpg',
  },
  {
    name: 'Pink Himalayan Salt',
    eyebrow: '84 TRACE MINERALS',
    text: 'Mineral-rich crystals gently cleanse the skin while supporting circulation and a restorative soak.',
    image: '/images/ritual-rose-soak.jpg',
  },
  {
    name: 'Natural Sea Salt',
    eyebrow: 'CALCIUM + POTASSIUM',
    text: 'Naturally occurring minerals soothe irritated skin, soften hard water and make every soak feel silkier.',
    image: '/images/ritual-bath.jpg',
  },
  {
    name: 'Sodium Bicarbonate',
    eyebrow: 'SKIN SOFTENING',
    text: 'A familiar, gentle ingredient that softens skin and calms the dry, tight feeling left by a long day.',
    image: '/images/jar-lavender-open.jpg',
  },
  {
    name: 'Pure Essential Oils',
    eyebrow: 'ROSE OR LAVENDER',
    text: 'True botanical aroma carried by warm steam, never an overpowering cloud of synthetic perfume.',
    image: '/images/lifestyle-rose-garden.jpg',
  },
];

export default function IngredientStory() {
  const [active, setActive] = useState(0);
  const ingredient = INGREDIENTS[active];

  return (
    <section id="ingredients" className="bg-ivory py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="lg:sticky lg:top-24">
            <div className="relative h-[510px] overflow-hidden rounded-[2.5rem] shadow-lift md:h-[680px]">
              <AnimatePresence mode="sync">
                <motion.div
                  key={ingredient.image}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image src={ingredient.image} alt={ingredient.name} fill sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 text-white md:p-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={ingredient.name}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.42 }}
                  >
                    <p className="text-[9px] font-semibold tracking-[0.32em] text-white/65">{ingredient.eyebrow}</p>
                    <p className="mt-2 font-display text-4xl font-light italic">{ingredient.name}</p>
                    <p className="mt-3 max-w-md text-[13px] font-light leading-relaxed text-white/75">{ingredient.text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <span className="absolute left-7 top-7 rounded-full border border-white/35 bg-black/10 px-4 py-2 text-[9px] tracking-[0.24em] text-white backdrop-blur-md">
                0{active + 1} / 05
              </span>
            </div>
          </div>

          <div className="pt-2 lg:pt-8">
            <p className="text-[11px] font-semibold tracking-[0.34em] text-gold">THE FORMULA</p>
            <h2 className="mt-4 font-display font-light leading-tight text-ink" style={{ fontSize: 'clamp(2rem, 3.6vw, 3.2rem)' }}>
              Read the label.
              <br />
              <em className="italic text-gold">You&apos;ll recognise everything.</em>
            </h2>
            <p className="mt-5 max-w-lg text-[14px] font-light leading-relaxed text-ink-soft">
              Select each element to see the texture, origin and purpose behind
              a formula made to feel sensorial, not complicated.
            </p>

            <div className="mt-10">
              {INGREDIENTS.map((item, index) => {
                const selected = active === index;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActive(index)}
                    onMouseEnter={() => setActive(index)}
                    className="group relative block w-full border-t border-ink/10 py-6 text-left last:border-b"
                  >
                    <motion.span
                      className="absolute inset-y-2 left-0 rounded-r-2xl"
                      animate={{ width: selected ? '100%' : '0%', opacity: selected ? 1 : 0 }}
                      style={{ background: 'linear-gradient(90deg, rgba(236,223,195,0.7), rgba(253,251,247,0))' }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <span className="relative flex items-center gap-5 px-1 md:px-4">
                      <span className={`font-display text-sm italic transition-colors ${selected ? 'text-gold' : 'text-ink-faint'}`}>0{index + 1}</span>
                      <span className="flex-1">
                        <span className={`block font-display text-2xl font-light transition-transform duration-500 ease-silk ${selected ? 'translate-x-2 text-ink' : 'text-ink-soft'}`}>{item.name}</span>
                        <span className={`mt-1 block text-[10px] tracking-[0.2em] transition-all duration-500 ${selected ? 'translate-x-2 opacity-100' : 'opacity-0'}`}>{item.eyebrow}</span>
                      </span>
                      <span className={`text-xl transition-all duration-500 ${selected ? 'rotate-45 text-gold' : 'text-ink-faint'}`}>+</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-8 text-[12px] font-light tracking-wide text-ink-faint">
              No parabens · No sulphates · No artificial dyes · Cruelty-free
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
