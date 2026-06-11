'use client';

import ImageReveal from '@/components/media/ImageReveal';

const BENEFITS = [
  {
    title: 'Muscle Relief',
    text: 'Magnesium soaks straight into tired muscles, easing knots and post-workout aches.',
    icon: (
      <path d="M4 14c2-4 5-6 8-6s6 2 8 6M8 14v4m8-4v4" strokeLinecap="round" />
    ),
  },
  {
    title: 'Stress Relief',
    text: 'Warm water and real botanicals slow the breath and quiet a racing mind.',
    icon: (
      <path d="M12 4v3m5.7-.7-2.2 2.2M20 12h-3M4 12h3M6.3 6.3l2.2 2.2M12 21a6 6 0 0 0 6-6H6a6 6 0 0 0 6 6z" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Better Sleep',
    text: 'A lavender soak before bed is the oldest sleep ritual there is. It still works.',
    icon: (
      <path d="M20 13.5A8 8 0 1 1 10.5 4 6.5 6.5 0 0 0 20 13.5z" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Body Detox',
    text: 'Mineral salts draw out impurities while supporting natural circulation.',
    icon: (
      <path d="M12 3c3.5 4 6 7 6 10a6 6 0 1 1-12 0c0-3 2.5-6 6-10z" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Exfoliation',
    text: 'Fine crystals gently polish away dead skin, leaving it soft — never scratched.',
    icon: (
      <path d="M5 19 19 5M8 5h3v3M16 19h-3v-3" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Rejuvenation',
    text: 'Step out feeling lighter — skin refreshed, shoulders down, mood lifted.',
    icon: (
      <path d="M12 5v14m0-14 4 4m-4-4-4 4m4 10 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

export default function Benefits() {
  return (
    <section className="bg-ivory py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ImageReveal className="text-center">
          <p className="text-[11px] font-semibold tracking-[0.34em] text-gold">
            WHY DIVINE MEE
          </p>
          <h2
            className="mx-auto mt-4 max-w-2xl font-display font-light leading-tight text-ink"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}
          >
            One soak. <em className="italic text-gold">Six benefits.</em>
          </h2>
        </ImageReveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <ImageReveal key={b.title} delay={(i % 3) * 0.1}>
              <div className="group h-full rounded-[1.6rem] border border-ink/[0.06] bg-paper p-7 transition-all duration-500 ease-silk hover:-translate-y-1 hover:shadow-card">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold transition-transform duration-500 ease-silk group-hover:scale-110">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {b.icon}
                  </svg>
                </span>
                <h3 className="mt-5 font-display text-xl font-light text-ink">
                  {b.title}
                </h3>
                <p className="mt-2 text-[14px] font-light leading-relaxed text-ink-soft">
                  {b.text}
                </p>
              </div>
            </ImageReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
