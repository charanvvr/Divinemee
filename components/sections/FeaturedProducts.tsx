'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { PRODUCTS, type ProductId, useCart } from '@/lib/cart';
import ImageReveal from '@/components/media/ImageReveal';
import { flyToBag } from '@/lib/flyToBag';

const PRODUCT_IDS = Object.keys(PRODUCTS) as ProductId[];

export default function FeaturedProducts() {
  const { add, open } = useCart();
  const [active, setActive] = useState<ProductId>('rose-magic');
  const addRef = useRef<HTMLButtonElement>(null);
  const product = PRODUCTS[active];

  function addActiveProduct() {
    add(active);
    flyToBag(addRef.current, product.accent);
    setTimeout(open, 900);
  }

  return (
    <section id="products" className="overflow-hidden bg-paper py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <ImageReveal>
          <p className="text-[11px] font-semibold tracking-[0.34em] text-gold">
            THE COLLECTION
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <h2
              className="font-display font-light leading-tight text-ink"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.4rem)' }}
            >
              Two rituals. <em className="italic text-gold">One promise.</em>
            </h2>
            <p className="max-w-sm text-[14px] font-light leading-relaxed text-ink-faint">
              Move between rose warmth and lavender stillness. Every detail
              responds to the ritual you choose.
            </p>
          </div>
        </ImageReveal>

        <div
          className="relative mt-14 min-h-[690px] overflow-hidden rounded-[2.6rem] border border-ink/[0.06] md:min-h-[650px]"
          style={{
            background: `radial-gradient(circle at 72% 42%, ${product.accent}35, transparent 34%), linear-gradient(135deg, ${product.accentSoft}, #fdfbf7 68%)`,
          }}
        >
          <motion.div
            className="absolute -right-24 -top-28 h-[34rem] w-[34rem] rounded-full border border-white/50"
            animate={{ rotate: active === 'rose-magic' ? 0 : 45, scale: active === 'rose-magic' ? 1 : 1.12 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="absolute right-20 top-16 h-72 w-72 rounded-full border border-white/40"
            animate={{ rotate: active === 'rose-magic' ? 20 : -30, x: active === 'rose-magic' ? 0 : 30 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />

          <div className="relative z-10 grid min-h-[690px] items-center gap-8 p-6 md:min-h-[650px] md:grid-cols-[0.9fr_1.1fr] md:p-12 lg:p-16">
            <div className="order-2 md:order-1">
              <div className="inline-flex rounded-full border border-ink/10 bg-paper/55 p-1.5 backdrop-blur-xl">
                {PRODUCT_IDS.map((id) => {
                  const item = PRODUCTS[id];
                  return (
                    <button
                      key={id}
                      onClick={() => setActive(id)}
                      className={`relative rounded-full px-5 py-3 text-[10px] font-semibold tracking-[0.18em] transition-colors ${
                        active === id ? 'text-ivory' : 'text-ink-soft'
                      }`}
                    >
                      {active === id && (
                        <motion.span
                          layoutId="product-pill"
                          className="absolute inset-0 rounded-full bg-ink"
                          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                        />
                      )}
                      <span className="relative">{item.name.toUpperCase()}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="mt-10 text-[10px] font-semibold tracking-[0.34em]" style={{ color: product.accent }}>
                    {product.tagline.toUpperCase()}
                  </p>
                  <h3 className="mt-3 font-display text-5xl font-light italic text-ink md:text-6xl">
                    {product.name}
                  </h3>
                  <p className="mt-5 max-w-md text-[15px] font-light leading-relaxed text-ink-soft">
                    {product.description}
                  </p>
                  <p className="mt-4 max-w-md text-[12px] tracking-wide text-ink-faint">
                    {product.scent}
                  </p>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {product.benefits.map((benefit) => (
                      <span key={benefit} className="rounded-full border border-ink/10 bg-paper/45 px-3.5 py-1.5 text-[11px] text-ink-soft backdrop-blur">
                        {benefit}
                      </span>
                    ))}
                  </div>

                  <div className="mt-9 flex flex-wrap items-center gap-3">
                    <button
                      ref={addRef}
                      onClick={addActiveProduct}
                      className="rounded-full bg-ink px-8 py-4 text-[11px] font-semibold tracking-[0.2em] text-ivory transition-transform duration-500 ease-silk hover:scale-[1.03]"
                    >
                      ADD TO CART · ₹{product.price}
                    </button>
                    <Link href={`/products/${active}`} className="rounded-full border border-ink/15 bg-paper/30 px-7 py-4 text-[11px] font-semibold tracking-[0.18em] text-ink backdrop-blur transition-colors hover:bg-paper/70">
                      EXPLORE RITUAL
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative order-1 flex h-[310px] items-center justify-center md:order-2 md:h-[560px]">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 0.88, x: 60, rotate: 4 }}
                  animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.92, x: -50, rotate: -3 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="absolute h-[68%] w-[68%] rounded-full bg-white/30 blur-2xl" />
                  <Image
                    src={product.cutout}
                    alt={`${product.name} bath salt jar`}
                    width={430}
                    height={850}
                    priority
                    className="relative z-10 h-[94%] w-auto object-contain drop-shadow-[0_42px_35px_rgba(45,25,25,0.28)]"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute bottom-2 right-2 rounded-2xl border border-white/50 bg-paper/45 px-5 py-4 text-right backdrop-blur-xl md:bottom-8 md:right-4">
                <p className="text-[9px] tracking-[0.24em] text-ink-faint">LAUNCH EDITION · {product.weight}</p>
                <p className="mt-1 font-display text-3xl text-ink">₹{product.price}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
