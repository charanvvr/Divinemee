'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, useCart, type ProductId } from '@/lib/cart';
import { REVIEWS } from '@/lib/reviews';
import ProductTilt from '@/components/experience/ProductTilt';
import ImageReveal from '@/components/media/ImageReveal';
import { flyToBag } from '@/lib/flyToBag';

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-ink/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-[13px] font-semibold tracking-[0.16em] text-ink">
          {title}
        </span>
        <span
          className={`text-ink-faint transition-transform duration-500 ease-silk ${
            open ? 'rotate-45' : ''
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-all duration-500 ease-silk ${
          open ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden text-[14px] font-light leading-relaxed text-ink-soft">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ProductDetail({ id }: { id: ProductId }) {
  const p = PRODUCTS[id];
  const { add, open } = useCart();
  const [qty, setQty] = useState(1);
  const [photo, setPhoto] = useState(0);
  const buyRef = useRef<HTMLButtonElement>(null);
  const productReviews = REVIEWS.filter((r) => r.product === p.name);

  return (
    <section className="bg-ivory pb-24 pt-24 md:pt-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* breadcrumb */}
        <ImageReveal>
          <nav className="text-[12px] text-ink-faint" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-ink">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/#products" className="transition-colors hover:text-ink">Collection</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{p.name}</span>
          </nav>
        </ImageReveal>

        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          {/* gallery */}
          <ImageReveal>
            <div className="relative overflow-hidden rounded-[2rem] shadow-card">
              <div
                className="relative h-[440px] md:h-[540px]"
                style={{ background: `linear-gradient(160deg, ${p.accentSoft}, #fdfbf7)` }}
              >
                {photo === 0 ? (
                  <ProductTilt id={id} maxTilt={6} className="h-full py-10" />
                ) : (
                  <Image
                    key={photo}
                    src={p.gallery[photo - 1].src}
                    alt={p.gallery[photo - 1].alt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                )}
              </div>
            </div>
            {/* thumbs */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setPhoto(0)}
                data-cursor="magnetic"
                className={`flex h-20 w-16 items-center justify-center overflow-hidden rounded-xl border transition-all duration-300 ${
                  photo === 0 ? 'border-ink/40 shadow-card' : 'border-ink/10 opacity-60 hover:opacity-100'
                }`}
                style={{ background: p.accentSoft }}
                aria-label="Product view"
              >
                <Image src={p.cutout} alt="" width={36} height={74} className="h-14 w-auto" />
              </button>
              {p.gallery.map((g, i) => (
                <button
                  key={g.src}
                  onClick={() => setPhoto(i + 1)}
                  data-cursor="magnetic"
                  className={`relative h-20 w-16 overflow-hidden rounded-xl border transition-all duration-300 ${
                    photo === i + 1 ? 'border-ink/40 shadow-card' : 'border-ink/10 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={g.alt}
                >
                  <Image src={g.src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          </ImageReveal>

          {/* details */}
          <ImageReveal delay={0.1}>
            <p className="text-[11px] font-semibold tracking-[0.34em] text-gold">
              LUXURY BATH SALT · {p.weight}
            </p>
            <h1 className="mt-3 font-display text-5xl font-light italic text-ink md:text-6xl">
              {p.name}
            </h1>
            <div className="mt-4 flex items-center gap-2 text-[14px]">
              <span className="text-gold">★★★★★</span>
              <span className="font-medium text-ink-soft">{p.rating}</span>
              <span className="text-ink-faint">({p.reviewCount} reviews)</span>
            </div>

            <p className="mt-6 max-w-lg text-[15px] font-light leading-relaxed text-ink-soft">
              {p.description}
            </p>
            <p className="mt-3 text-[13.5px] font-light italic text-ink-faint">
              {p.scent}
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              {p.benefits.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-ink/10 bg-paper px-3.5 py-1.5 text-[11.5px] font-medium text-ink-soft"
                >
                  {b}
                </span>
              ))}
            </div>

            <div className="mt-8 flex items-end gap-4">
              <span className="font-display text-5xl font-light text-ink">₹{p.price}</span>
              <span className="mb-1.5 text-lg text-ink-faint line-through">₹{p.mrp}</span>
              <span
                className="mb-2 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide"
                style={{ background: p.accentSoft, color: p.accent }}
              >
                SAVE 50%
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center overflow-hidden rounded-full border border-ink/15 bg-paper">
                <button
                  data-cursor="magnetic"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-5 py-3.5 text-lg text-ink transition-colors hover:bg-ink/5"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-8 text-center font-medium text-ink">{qty}</span>
                <button
                  data-cursor="magnetic"
                  onClick={() => setQty(qty + 1)}
                  className="px-5 py-3.5 text-lg text-ink transition-colors hover:bg-ink/5"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              <button
                ref={buyRef}
                data-cursor="magnetic"
                onClick={() => {
                  add(id, qty);
                  flyToBag(buyRef.current, p.accent);
                  setTimeout(open, 900);
                }}
                className="group relative flex-1 overflow-hidden rounded-full bg-ink px-8 py-4 text-center text-[12px] font-semibold tracking-[0.18em] text-ivory transition-transform duration-500 ease-silk hover:scale-[1.02] active:scale-95 sm:min-w-[240px] sm:flex-none"
              >
                <span className="relative z-10">ADD TO CART — ₹{p.price * qty}</span>
                <span
                  className="absolute inset-0 translate-y-full transition-transform duration-500 ease-silk group-hover:translate-y-0"
                  style={{ background: p.accent }}
                />
              </button>
            </div>

            <p className="mt-5 text-[12.5px] font-light text-ink-faint">
              Free shipping over ₹399 · UPI, cards & wallets · Ships in 24–48h
            </p>

            <div className="mt-9">
              <Accordion title="HOW TO USE">{p.howTo}</Accordion>
              <Accordion title="FULL INGREDIENTS">
                Epsom salt (magnesium sulphate), pink Himalayan salt, natural
                sea salt, sodium bicarbonate, pure essential oils, dried
                botanicals. No parabens, no sulphates, no artificial dyes.
              </Accordion>
              <Accordion title="SHIPPING & RETURNS">
                Dispatched within 24–48 hours, delivered across India in 3–7
                days. Damaged in transit? We replace it free — just send a
                photo within 48 hours of delivery.
              </Accordion>
            </div>
          </ImageReveal>
        </div>

        {/* reviews for this product */}
        {productReviews.length > 0 && (
          <div className="mt-24">
            <ImageReveal>
              <h2 className="font-display text-3xl font-light text-ink">
                What people say about <em className="italic text-gold">{p.name}</em>
              </h2>
            </ImageReveal>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {productReviews.map((r, i) => (
                <ImageReveal key={r.name} delay={i * 0.1}>
                  <figure className="rounded-[1.6rem] border border-ink/[0.06] bg-paper p-7">
                    <span className="text-[13px] text-gold">
                      {'★'.repeat(r.rating)}
                      <span className="text-ink/15">{'★'.repeat(5 - r.rating)}</span>
                    </span>
                    <p className="mt-3 font-display text-xl font-light italic text-ink">
                      “{r.title}”
                    </p>
                    <blockquote className="mt-3 text-[14px] font-light leading-relaxed text-ink-soft">
                      {r.body}
                    </blockquote>
                    <figcaption className="mt-4 text-[13px] text-ink-faint">
                      <strong className="font-semibold text-ink">{r.name}</strong> · {r.city}
                    </figcaption>
                  </figure>
                </ImageReveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
