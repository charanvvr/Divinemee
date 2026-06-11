'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCT_LIST, useCart } from '@/lib/cart';
import ImageReveal from '@/components/media/ImageReveal';
import { flyToBag } from '@/lib/flyToBag';

export default function FeaturedProducts() {
  const { add, open } = useCart();
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  return (
    <section id="products" className="bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ImageReveal>
          <p className="text-[11px] font-semibold tracking-[0.34em] text-gold">
            THE COLLECTION
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <h2
              className="font-display font-light leading-tight text-ink"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}
            >
              Two rituals. <em className="italic text-gold">One promise.</em>
            </h2>
            <p className="max-w-sm text-[14px] font-light leading-relaxed text-ink-faint">
              Every jar is hand-blended with Epsom salt, pink Himalayan salt
              and pure essential oils.
            </p>
          </div>
        </ImageReveal>

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {PRODUCT_LIST.map((p, idx) => (
            <ImageReveal key={p.id} delay={idx * 0.12}>
              <article className="group relative overflow-hidden rounded-[2rem] border border-ink/[0.06] bg-ivory transition-shadow duration-700 ease-silk hover:shadow-lift">
                {/* image stage */}
                <Link
                  href={`/products/${p.id}`}
                  data-cursor="explore"
                  className="relative block h-[380px] overflow-hidden md:h-[440px]"
                  aria-label={`View ${p.name}`}
                >
                  <div
                    className="absolute inset-0 transition-transform duration-700 ease-silk group-hover:scale-[1.04]"
                    style={{
                      background: `linear-gradient(160deg, ${p.accentSoft} 0%, #fdfbf7 80%)`,
                    }}
                  />
                  <Image
                    src={p.gallery[0].src}
                    alt={p.gallery[0].alt}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover opacity-90 transition-all duration-700 ease-silk group-hover:scale-[1.05] group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  {/* floating jar */}
                  <div className="absolute bottom-0 left-1/2 h-[82%] -translate-x-1/2 drop-shadow-[0_24px_30px_rgba(40,25,15,0.35)] transition-transform duration-700 ease-silk group-hover:-translate-y-3">
                    <Image
                      src={p.cutout}
                      alt={`${p.name} jar`}
                      width={400}
                      height={840}
                      className="h-full w-auto"
                    />
                  </div>
                  <span className="absolute left-5 top-5 rounded-full bg-paper/90 px-4 py-1.5 text-[10px] font-bold tracking-[0.18em] text-ink backdrop-blur">
                    50% LAUNCH OFFER
                  </span>
                </Link>

                {/* details */}
                <div className="p-7 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-3xl font-light italic text-ink">
                        {p.name}
                      </h3>
                      <p className="mt-1 text-[13px] font-light text-ink-faint">
                        {p.tagline} · {p.weight}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl text-ink">₹{p.price}</p>
                      <p className="text-[13px] text-ink-faint line-through">₹{p.mrp}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-[13px]">
                    <span className="text-gold">★★★★★</span>
                    <span className="font-medium text-ink-soft">{p.rating}</span>
                    <span className="text-ink-faint">({p.reviewCount} reviews)</span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.benefits.slice(0, 3).map((b) => (
                      <span
                        key={b}
                        className="rounded-full border border-ink/10 px-3 py-1 text-[11px] font-medium text-ink-soft"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <button
                      ref={(el) => {
                        btnRefs.current[p.id] = el;
                      }}
                      data-cursor="magnetic"
                      onClick={() => {
                        add(p.id);
                        flyToBag(btnRefs.current[p.id], p.accent);
                        setTimeout(open, 900);
                      }}
                      className="group/btn relative flex-1 overflow-hidden rounded-full bg-ink py-3.5 text-center text-[11px] font-semibold tracking-[0.18em] text-ivory transition-transform duration-500 ease-silk hover:scale-[1.02] active:scale-95"
                    >
                      <span className="relative z-10">ADD TO CART</span>
                      <span
                        className="absolute inset-0 translate-y-full transition-transform duration-500 ease-silk group-hover/btn:translate-y-0"
                        style={{ background: p.accent }}
                      />
                    </button>
                    <Link
                      href={`/products/${p.id}`}
                      data-cursor="magnetic"
                      className="rounded-full border border-ink/15 px-6 py-3.5 text-[11px] font-semibold tracking-[0.18em] text-ink transition-colors duration-300 hover:border-ink/40"
                    >
                      DETAILS
                    </Link>
                  </div>
                </div>
              </article>
            </ImageReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
