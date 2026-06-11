'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import ImageReveal from '@/components/media/ImageReveal';

const STEPS = [
  {
    n: '01',
    word: 'Pour',
    kicker: 'BEGIN THE RITUAL',
    text: 'Add two or three tablespoons to warm water. Watch mineral crystals and real botanicals begin to bloom.',
    img: '/images/ritual-lavender-soak.jpg',
    alt: 'Lavender salt foot soak being prepared',
  },
  {
    n: '02',
    word: 'Dissolve',
    kicker: 'LET THE ROOM CHANGE',
    text: 'The minerals release, petals rise and essential oils travel with the steam. Give the water a quiet minute.',
    img: '/images/ritual-bath.jpg',
    alt: 'A candlelit bathtub with dissolved bath salts',
  },
  {
    n: '03',
    word: 'Relax',
    kicker: 'RETURN TO YOURSELF',
    text: 'Soak for fifteen to twenty minutes. Let your shoulders drop, your breathing slow and the rest of the day wait.',
    img: '/images/ritual-rose-soak.jpg',
    alt: 'Feet resting in a rose petal soak',
  },
];

export default function RitualSteps() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % STEPS.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const step = STEPS[active];

  return (
    <section id="ritual" className="overflow-hidden bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ImageReveal className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.34em] text-gold">HOW TO USE</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display font-light leading-tight text-ink" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>
            Three steps to <em className="italic text-gold">stillness</em>.
          </h2>
        </ImageReveal>

        <div className="mt-14 overflow-hidden rounded-[2.5rem] border border-ink/[0.07] bg-ivory shadow-card">
          <div className="grid min-h-[600px] md:grid-cols-[0.82fr_1.18fr]">
            <div className="relative flex flex-col justify-between p-8 md:p-12 lg:p-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="text-[10px] font-semibold tracking-[0.3em] text-gold">{step.kicker}</p>
                  <p className="mt-8 font-display text-sm italic text-ink-faint">{step.n} / 03</p>
                  <h3 className="mt-4 font-display text-6xl font-light italic text-ink md:text-7xl">{step.word}</h3>
                  <p className="mt-6 max-w-sm text-[15px] font-light leading-relaxed text-ink-soft">{step.text}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-12">
                <div className="flex gap-3">
                  {STEPS.map((item, index) => (
                    <button
                      key={item.n}
                      onClick={() => setActive(index)}
                      aria-label={`Show ${item.word}`}
                      className="group flex-1 text-left"
                    >
                      <span className="block h-px overflow-hidden bg-ink/10">
                        {index === active && (
                          <motion.span
                            key={`${active}-progress`}
                            className="block h-full bg-gold"
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 6.5, ease: 'linear' }}
                          />
                        )}
                      </span>
                      <span className={`mt-3 block text-[10px] font-semibold tracking-[0.18em] transition-colors ${index === active ? 'text-ink' : 'text-ink-faint'}`}>
                        {item.word.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden md:min-h-full">
              <AnimatePresence mode="sync">
                <motion.div
                  key={step.img}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ opacity: { duration: 0.7 }, scale: { duration: 7, ease: 'linear' } }}
                >
                  <Image src={step.img} alt={step.alt} fill sizes="(min-width: 768px) 60vw, 100vw" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/15 via-transparent to-transparent" />
                </motion.div>
              </AnimatePresence>
              <span className="absolute right-6 top-6 rounded-full border border-white/40 bg-black/15 px-4 py-2 text-[9px] font-semibold tracking-[0.22em] text-white backdrop-blur-md">
                DIVINE MEE RITUAL
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
