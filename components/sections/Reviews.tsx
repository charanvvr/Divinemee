'use client';

import { REVIEWS, type Review } from '@/lib/reviews';
import ImageReveal from '@/components/media/ImageReveal';

const extendedReviews: Review[] = [
  ...REVIEWS,
  {
    name: 'Meera K.',
    city: 'Chennai',
    rating: 5,
    title: 'The scent feels expensive',
    body: 'Soft, botanical and never overpowering. The whole bathroom feels calmer and the packaging is beautiful enough to gift without wrapping.',
    product: 'Rose Magic',
  },
  {
    name: 'Rhea D.',
    city: 'Delhi',
    rating: 5,
    title: 'A tiny evening reset',
    body: 'I use Lavender Bliss as a foot soak after work. It has become the fastest way to tell my brain the day is actually over.',
    product: 'Lavender Bliss',
  },
];

function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="flex h-[290px] w-[320px] shrink-0 flex-col rounded-[1.8rem] border border-ink/[0.07] bg-ivory p-7 shadow-[0_20px_45px_-35px_rgba(45,30,20,0.45)] md:w-[390px]">
      <div className="flex items-center justify-between">
        <span className="text-[12px] tracking-wide text-gold">{'★'.repeat(review.rating)}</span>
        <span className="rounded-full border border-ink/10 px-3 py-1 text-[9px] tracking-[0.16em] text-ink-faint">VERIFIED</span>
      </div>
      <p className="mt-5 font-display text-xl font-light italic leading-snug text-ink">“{review.title}”</p>
      <blockquote className="mt-3 flex-1 text-[13.5px] font-light leading-relaxed text-ink-soft">{review.body}</blockquote>
      <figcaption className="mt-5 border-t border-ink/[0.07] pt-4">
        <p className="text-[13px] font-semibold text-ink">{review.name}</p>
        <p className="text-[11px] text-ink-faint">{review.city} · {review.product}</p>
      </figcaption>
    </figure>
  );
}

export default function Reviews() {
  const firstLane = extendedReviews;
  const secondLane = [...extendedReviews].reverse();

  return (
    <section id="reviews" className="overflow-hidden bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ImageReveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.34em] text-gold">REVIEWS</p>
              <h2 className="mt-4 font-display font-light leading-tight text-ink" style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}>
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
      </div>

      <div className="reviews-mask mt-12 space-y-5">
        <div className="review-marquee flex w-max gap-5 hover:[animation-play-state:paused]">
          {[...firstLane, ...firstLane].map((review, index) => <ReviewCard key={`top-${review.name}-${index}`} review={review} />)}
        </div>
        <div className="review-marquee-reverse flex w-max gap-5 hover:[animation-play-state:paused]">
          {[...secondLane, ...secondLane].map((review, index) => <ReviewCard key={`bottom-${review.name}-${index}`} review={review} />)}
        </div>
      </div>
    </section>
  );
}
