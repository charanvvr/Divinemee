'use client';

import PremiumImage from '@/components/media/PremiumImage';
import ImageReveal from '@/components/media/ImageReveal';

const STEPS = [
  {
    n: '01',
    word: 'Pour',
    text: 'Add 2–3 tablespoons of crystals to a warm bath or foot soak. Watch the colour bloom.',
    img: '/images/ritual-lavender-soak.jpg',
    alt: 'Lavender salt foot soak being prepared',
  },
  {
    n: '02',
    word: 'Dissolve',
    text: 'Give it a minute. The minerals release, the botanicals rise, the aroma fills the room.',
    img: '/images/ritual-bath.jpg',
    alt: 'A candlelit bathtub with dissolved bath salts',
  },
  {
    n: '03',
    word: 'Relax',
    text: 'Soak for 15–20 minutes. This is your time — no one else&apos;s.',
    img: '/images/ritual-rose-soak.jpg',
    alt: 'Feet resting in a rose petal soak',
  },
];

export default function RitualSteps() {
  return (
    <section id="ritual" className="bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ImageReveal className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.34em] text-gold">
            HOW TO USE
          </p>
          <h2
            className="mx-auto mt-4 max-w-2xl font-display font-light leading-tight text-ink"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}
          >
            Three steps to <em className="italic text-gold">stillness</em>.
          </h2>
        </ImageReveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <ImageReveal key={s.n} delay={i * 0.12}>
              <article className="group">
                <div className="relative h-[340px] overflow-hidden rounded-[1.8rem] shadow-card md:h-[400px]">
                  <PremiumImage
                    src={s.img}
                    alt={s.alt}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="h-full"
                    parallax={6}
                    zoom={1.08}
                  />
                  <span className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-paper/90 font-display text-sm italic text-ink backdrop-blur">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-6 font-display text-3xl font-light italic text-ink">
                  {s.word}
                </h3>
                <p
                  className="mt-2 max-w-xs text-[14px] font-light leading-relaxed text-ink-soft"
                  dangerouslySetInnerHTML={{ __html: s.text }}
                />
              </article>
            </ImageReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
