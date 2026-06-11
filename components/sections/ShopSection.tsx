'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { PRODUCTS, useCart, type ProductId } from '@/lib/cart';
import ProductTilt from '@/components/experience/ProductTilt';
import ImageReveal from '@/components/media/ImageReveal';
import { flyToBag } from '@/lib/flyToBag';

export default function ShopSection() {
  const { add, open } = useCart();
  const [active, setActive] = useState<ProductId>('rose-magic');
  const [qty, setQty] = useState(1);
  const buyRef = useRef<HTMLButtonElement>(null);

  const p = PRODUCTS[active];

  const choose = (id: ProductId) => {
    setActive(id);
    setQty(1);
  };

  return (
    <section id="shop" className="overflow-hidden bg-ivory-warm py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* product stage */}
          <ImageReveal>
            <div className="relative">
              <div
                className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-1000"
                style={{
                  background: `radial-gradient(circle, ${p.accentSoft} 0%, transparent 70%)`,
                }}
              />
              <ProductTilt
                id={active}
                maxTilt={6}
                className="relative h-[46vh] min-h-[360px] md:h-[56vh]"
              />
            </div>
          </ImageReveal>

          {/* purchase module */}
          <ImageReveal delay={0.1}>
            <p className="text-[11px] font-semibold tracking-[0.34em] text-gold">
              COMPLETE YOUR RITUAL
            </p>
            <h2
              className="mt-4 font-display font-light leading-tight text-ink"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 3.2rem)' }}
            >
              Choose your <em className="italic text-gold">escape</em>.
            </h2>

            {/* variant selector */}
            <div className="mt-8 flex gap-3">
              {(Object.keys(PRODUCTS) as ProductId[]).map((id) => {
                const prod = PRODUCTS[id];
                const isActive = active === id;
                return (
                  <button
                    key={id}
                    data-cursor="magnetic"
                    onClick={() => choose(id)}
                    className={`flex flex-1 items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-500 ease-silk ${
                      isActive
                        ? 'border-ink/20 bg-paper shadow-card'
                        : 'border-ink/[0.07] bg-transparent opacity-65 hover:opacity-100'
                    }`}
                    aria-pressed={isActive}
                  >
                    <span
                      className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: prod.accentSoft }}
                    >
                      <Image src={prod.cutout} alt="" width={28} height={58} className="h-11 w-auto" />
                    </span>
                    <span>
                      <span className="block font-display text-[17px] italic leading-tight text-ink">
                        {prod.name}
                      </span>
                      <span className="text-[11px] text-ink-faint">{prod.weight}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-6 max-w-md text-[14.5px] font-light leading-relaxed text-ink-soft">
              {p.description}
            </p>

            <div className="mt-7 flex items-end gap-4">
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
                  add(active, qty);
                  flyToBag(buyRef.current, p.accent);
                  setTimeout(open, 900);
                }}
                className="group relative flex-1 overflow-hidden rounded-full bg-ink px-8 py-4 text-center text-[12px] font-semibold tracking-[0.18em] text-ivory transition-transform duration-500 ease-silk hover:scale-[1.02] active:scale-95 sm:flex-none"
              >
                <span className="relative z-10">ADD TO CART — ₹{p.price * qty}</span>
                <span
                  className="absolute inset-0 translate-y-full transition-transform duration-500 ease-silk group-hover:translate-y-0"
                  style={{ background: p.accent }}
                />
              </button>
            </div>

            <p className="mt-6 text-[12.5px] font-light text-ink-faint">
              Free shipping over ₹399 · UPI, cards, net banking & wallets · Ships across India
            </p>
          </ImageReveal>
        </div>
      </div>
    </section>
  );
}
