'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import ProductTilt from '@/components/experience/ProductTilt';
import { PRODUCTS, type ProductId } from '@/lib/cart';

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<ProductId>('lavender-bliss');

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
      tl.fromTo(
        '[data-hero-line] > span',
        { yPercent: 110 },
        { yPercent: 0, duration: 1.2, stagger: 0.12 },
        0.15
      )
        .fromTo(
          '[data-hero-fade]',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.1 },
          0.6
        )
        .fromTo(
          '[data-hero-product]',
          { opacity: 0, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power3.out' },
          0.45
        );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const p = PRODUCTS[active];

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden"
      style={{
        background:
          'linear-gradient(170deg, #fdfbf7 0%, #f7f3ec 55%, #f3ecdf 100%)',
      }}
    >
      {/* faint architectural arc — quiet, not decorative noise */}
      <div
        className="pointer-events-none absolute -right-[20%] top-[8%] hidden h-[120%] w-[60%] rounded-full border border-ink/[0.05] lg:block"
        aria-hidden
      />

      <div className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-5 pb-16 pt-28 md:grid-cols-2 md:px-8 md:pt-32 lg:gap-6">
        {/* left — copy */}
        <div className="relative z-10 max-w-xl">
          <p
            data-hero-fade
            className="text-[11px] font-semibold tracking-[0.34em] text-gold"
          >
            MINERAL BATH RITUALS
          </p>
          <h1
            className="mt-5 font-display font-light leading-[1.04] text-ink"
            style={{ fontSize: 'clamp(2.6rem, 5.2vw, 4.6rem)' }}
          >
            <span className="mask-line" data-hero-line>
              <span>Luxury bath rituals,</span>
            </span>
            <span className="mask-line" data-hero-line>
              <span>
                crafted for <em className="font-display italic text-gold">calm</em>.
              </span>
            </span>
          </h1>
          <p
            data-hero-fade
            className="mt-6 max-w-md text-[15.5px] font-light leading-relaxed text-ink-soft"
          >
            Premium mineral bath salts blended with real botanicals and
            relaxing aromas. Handmade in small batches — no harsh chemicals.
          </p>

          <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/products/rose-magic"
              data-cursor="magnetic"
              className="group relative overflow-hidden rounded-full bg-ink px-7 py-4 text-[12px] font-semibold tracking-[0.16em] text-ivory transition-transform duration-500 ease-silk hover:scale-[1.03] active:scale-95"
            >
              <span className="relative z-10">SHOP ROSE MAGIC</span>
              <span className="absolute inset-0 translate-y-full bg-rose-deep transition-transform duration-500 ease-silk group-hover:translate-y-0" />
            </Link>
            <Link
              href="/products/lavender-bliss"
              data-cursor="magnetic"
              className="group relative overflow-hidden rounded-full border border-ink/15 px-7 py-4 text-[12px] font-semibold tracking-[0.16em] text-ink transition-all duration-500 ease-silk hover:border-transparent"
            >
              <span className="relative z-10 transition-colors duration-500 group-hover:text-ivory">
                SHOP LAVENDER BLISS
              </span>
              <span className="absolute inset-0 translate-y-full bg-lavender-deep transition-transform duration-500 ease-silk group-hover:translate-y-0" />
            </Link>
          </div>

          <div data-hero-fade className="mt-10 flex items-center gap-3 text-[13px] text-ink-faint">
            <span className="flex text-gold">
              {'★★★★★'.split('').map((s, i) => (
                <span key={i}>{s}</span>
              ))}
            </span>
            <span className="font-medium text-ink-soft">4.9</span>
            <span>· 320+ five-star rituals</span>
          </div>
        </div>

        {/* right — interactive product */}
        <div data-hero-product className="relative mx-auto w-full max-w-md opacity-0">
          <div
            className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-1000"
            style={{ background: `radial-gradient(circle, ${p.accentSoft} 0%, transparent 68%)` }}
          />
          <ProductTilt
            id={active}
            className="relative h-[54vh] min-h-[380px] md:h-[62vh]"
          />

          {/* variant switch — quiet, tactile */}
          <div className="relative mt-12 flex justify-center gap-3">
            {(Object.keys(PRODUCTS) as ProductId[]).map((id) => {
              const prod = PRODUCTS[id];
              const isActive = active === id;
              return (
                <button
                  key={id}
                  data-cursor="magnetic"
                  onClick={() => setActive(id)}
                  className={`flex items-center gap-2.5 rounded-full border px-4 py-2 transition-all duration-500 ease-silk ${
                    isActive
                      ? 'border-ink/20 bg-paper shadow-card'
                      : 'border-transparent opacity-55 hover:opacity-90'
                  }`}
                  aria-pressed={isActive}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: prod.accent }}
                  />
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-ink">
                    {prod.name.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
