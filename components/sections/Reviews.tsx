'use client';

import { REVIEWS } from '@/lib/reviews';
import ImageReveal from '@/components/media/ImageReveal';

export default function Reviews() {
  return (
    <section id="reviews" className="bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ImageReveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.34em] text-gold">
                REVIEWS
              </p>
              <h2
                className="mt-4 font-display font-light leading-tight text-ink"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}
              >
                Loved at <em className="italic text-gold">first soak</em>.
              </h2>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-ink/[0.07] bg-ivory px-6 py-4">
              <span className="font-display text-4xl font-light text-ink">4.9</span>
              <span>
                <span className="block text-gold">★★★★★</span>
                <span className="text-[12px] text-ink-faint">328 verified reviews</span>
              </span>
            </div>
          </div>
        </ImageReveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((r, i) => (
            <ImageReveal key={r.name} delay={(i % 4) * 0.08}>
              <figure className="flex h-full flex-col rounded-[1.6rem] border border-ink/[0.06] bg-ivory p-6 transition-all duration-500 ease-silk hover:-translate-y-1 hover:shadow-card">
                <span className="text-[13px] tracking-wide text-gold">
                  {'★'.repeat(r.rating)}
                  <span className="text-ink/15">{'★'.repeat(5 - r.rating)}</span>
                </span>
                <p className="mt-3 font-display text-lg font-light italic leading-snug text-ink">
                  “{r.title}”
                </p>
                <blockquote className="mt-3 flex-1 text-[13.5px] font-light leading-relaxed text-ink-soft">
                  {r.body}
                </blockquote>
                <figcaption className="mt-5 border-t border-ink/[0.07] pt-4">
                  <p className="text-[13px] font-semibold text-ink">{r.name}</p>
                  <p className="text-[11.5px] text-ink-faint">
                    {r.city} · {r.product}
                  </p>
                </figcaption>
              </figure>
            </ImageReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
