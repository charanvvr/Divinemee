'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { atmosphere, type WorldId } from '@/lib/atmosphere';
import { PRODUCTS, useCart, type ProductId } from '@/lib/cart';
import Product360Viewer from './Product360Viewer';
import ProductCutout from '@/components/media/ProductCutout';
import PremiumImage from '@/components/media/PremiumImage';
import ImageReveal from '@/components/media/ImageReveal';

const BENEFITS = [
  'BODY DETOX', 'STRESS RELIEF', 'MUSCLE RELIEF',
  'BETTER SLEEP', 'EXFOLIATING', 'REJUVENATING',
];

/** Champagne particles fly from the buy button into the ritual bag. */
function flyToBag(fromEl: HTMLElement, accent: string) {
  const bag = document.getElementById('dm-bag');
  if (!bag) return;
  const from = fromEl.getBoundingClientRect();
  const to = bag.getBoundingClientRect();
  const sx = from.left + from.width / 2;
  const sy = from.top + from.height / 2;
  const tx = to.left + to.width / 2;
  const ty = to.top + to.height / 2;

  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:300;';
  document.body.appendChild(host);

  for (let i = 0; i < 14; i++) {
    const p = document.createElement('span');
    const size = 3 + Math.random() * 5;
    p.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;left:0;top:0;background:${i % 3 === 0 ? accent : '#ecd3a3'};box-shadow:0 0 8px ${accent};`;
    host.appendChild(p);
    const midX = sx + (tx - sx) * 0.5 + (Math.random() - 0.5) * 220;
    const midY = sy + (ty - sy) * 0.4 - 80 - Math.random() * 120;
    p.animate(
      [
        { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 1 },
        { transform: `translate(${midX}px, ${midY}px) scale(1.15)`, opacity: 0.95, offset: 0.55 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.2)`, opacity: 0 },
      ],
      {
        duration: 750 + Math.random() * 350,
        easing: 'cubic-bezier(0.3, 0, 0.2, 1)',
        delay: Math.random() * 120,
        fill: 'forwards',
      }
    );
  }
  // bag pulse
  bag.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.22)' },
      { transform: 'scale(1)' },
    ],
    { duration: 480, delay: 700, easing: 'cubic-bezier(0.34,1.56,0.64,1)' }
  );
  setTimeout(() => host.remove(), 1600);
}

export default function PurchaseAtelier() {
  const sectionRef = useRef<HTMLElement>(null);
  const { add, open } = useCart();
  const [active, setActive] = useState<ProductId>('lavender-bliss');
  const [qty, setQty] = useState(1);
  const buyRef = useRef<HTMLButtonElement>(null);
  const mobileBuyRef = useRef<HTMLButtonElement>(null);
  const [showBar, setShowBar] = useState(false);

  const product = PRODUCTS[active];

  const choose = (id: ProductId) => {
    setActive(id);
    setQty(1);
    atmosphere.set({ world: id as WorldId });
  };

  const addToRitual = (el: HTMLElement | null) => {
    add(active, qty);
    if (el) flyToBag(el, product.accent);
    setTimeout(open, 1100);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 60%',
        end: 'bottom bottom',
        onToggle: (self) => {
          if (self.isActive) atmosphere.set({ mode: 'calm', light: 1 });
          setShowBar(self.isActive && window.innerWidth < 768);
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="atelier"
      className="relative bg-ivory text-ink"
      style={{
        background:
          'linear-gradient(180deg, #ece2d2 0%, #f5efe6 18%, #f7f2ea 100%)',
      }}
    >
      {/* ---- choose your ritual ---- */}
      <div className="mx-auto max-w-7xl px-6 pt-28 md:px-10">
        <ImageReveal>
          <p className="text-center text-[10px] font-semibold tracking-[0.4em] text-gold-deep">
            THE COLLECTION
          </p>
          <h2
            className="mt-4 text-center font-display font-light leading-[1.02] text-ink"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 6.5rem)' }}
          >
            Rose. Lavender.{' '}
            <span className="italic text-gold-deep">Serenity.</span>
          </h2>
        </ImageReveal>

        {/* the two worlds */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {(Object.keys(PRODUCTS) as ProductId[]).map((id) => {
            const p = PRODUCTS[id];
            const isActive = active === id;
            return (
              <button
                key={id}
                data-cursor="explore"
                onClick={() => choose(id)}
                className={`group relative flex flex-col items-center overflow-hidden rounded-[2.5rem] px-8 pb-10 pt-14 transition-all duration-700 ease-silk ${
                  isActive
                    ? 'scale-[1.015] shadow-[0_50px_90px_-30px_rgba(60,40,30,0.35)]'
                    : 'opacity-80 hover:opacity-100'
                }`}
                style={{
                  background: isActive
                    ? `linear-gradient(165deg, ${p.accentSoft}, rgba(255,255,255,0.7) 60%)`
                    : 'rgba(255,255,255,0.45)',
                  border: `1px solid ${isActive ? p.accent + '55' : 'rgba(0,0,0,0.05)'}`,
                }}
              >
                <div
                  className="absolute -top-20 h-72 w-72 rounded-full opacity-0 blur-3xl transition-opacity duration-1000 group-hover:opacity-70"
                  style={{ background: p.accentSoft }}
                />
                <ProductCutout
                  id={id}
                  glow={false}
                  className={`h-[34vh] transition-transform duration-700 ease-silk md:h-[38vh] ${
                    isActive ? '-translate-y-2' : 'group-hover:-translate-y-2'
                  }`}
                />
                <p
                  className="mt-8 text-[9px] font-semibold tracking-[0.34em]"
                  style={{ color: p.accent }}
                >
                  {p.tagline.toUpperCase()}
                </p>
                <h3 className="mt-2 font-display text-3xl font-light italic">
                  {p.name}
                </h3>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- the atelier: inspect + buy ---- */}
      <div className="mx-auto mt-28 grid max-w-7xl items-center gap-16 px-6 md:grid-cols-2 md:px-10">
        <ImageReveal className="order-2 md:order-1">
          <Product360Viewer
            id={active}
            className="mx-auto h-[52vh] max-w-full text-ink-soft md:h-[62vh]"
          />
        </ImageReveal>

        <ImageReveal delay={0.15} className="order-1 md:order-2">
          <p className="text-[10px] font-semibold tracking-[0.4em] text-gold-deep">
            LUXURY BATH SALT · {product.weight}
          </p>
          <h3 className="mt-3 font-display text-5xl font-light italic md:text-6xl">
            {product.name}
          </h3>
          <p className="mt-5 max-w-md text-[15px] font-light leading-relaxed text-ink/65">
            {product.scent}
          </p>

          <div className="mt-8 flex items-end gap-4">
            <span className="font-display text-5xl font-light">₹{product.price}</span>
            <span className="mb-1.5 text-lg text-ink/35 line-through">₹{product.mrp}</span>
            <span
              className="mb-2 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider"
              style={{ background: product.accentSoft, color: product.accent }}
            >
              50% LAUNCH
            </span>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center overflow-hidden rounded-full border border-ink/15">
              <button
                data-cursor="magnetic"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-5 py-3.5 text-lg transition-colors hover:bg-ink/5"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button
                data-cursor="magnetic"
                onClick={() => setQty(qty + 1)}
                className="px-5 py-3.5 text-lg transition-colors hover:bg-ink/5"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              ref={buyRef}
              data-cursor="magnetic"
              onClick={() => addToRitual(buyRef.current)}
              className="group relative overflow-hidden rounded-full bg-ink px-10 py-4 text-[11px] font-semibold tracking-[0.26em] text-ivory transition-transform duration-500 ease-silk hover:scale-[1.04] active:scale-95"
            >
              <span className="relative z-10">ADD TO RITUAL</span>
              <span
                className="absolute inset-0 translate-y-full transition-transform duration-500 ease-silk group-hover:translate-y-0"
                style={{ background: `linear-gradient(120deg, ${product.accent}, #b08538)` }}
              />
            </button>
          </div>

          <p className="mt-6 text-xs font-light tracking-wide text-ink/40">
            Free shipping over ₹399 · UPI, cards & wallets via Razorpay
          </p>
        </ImageReveal>
      </div>

      {/* ---- benefits ticker ---- */}
      <div className="mt-24 overflow-hidden border-y border-ink/10 py-5">
        <div className="marquee-track flex w-max items-center gap-12 whitespace-nowrap">
          {[...BENEFITS, ...BENEFITS, ...BENEFITS, ...BENEFITS].map((b, i) => (
            <span key={i} className="flex items-center gap-12 text-[11px] font-medium tracking-[0.34em] text-ink/45">
              {b}
              <span className="h-1 w-1 rounded-full bg-gold" />
            </span>
          ))}
        </div>
      </div>

      {/* ---- the ritual, lived — gallery ---- */}
      <div className="mx-auto max-w-7xl px-6 py-28 md:px-10">
        <ImageReveal>
          <h3
            className="font-display font-light italic leading-tight"
            style={{ fontSize: 'clamp(2rem, 4.5vw, 4rem)' }}
          >
            The ritual, <span className="text-gold-deep">lived.</span>
          </h3>
        </ImageReveal>
        <div className="mt-12 grid gap-5 md:grid-cols-12">
          <PremiumImage
            src="/images/lifestyle-lavender-field.jpg"
            alt="Lavender Bliss jar standing in a lavender field"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="h-[52vh] rounded-[2rem] md:col-span-5"
            parallax={12}
            zoom={1.16}
            reveal
          />
          <PremiumImage
            src="/images/ritual-rose-soak.jpg"
            alt="A rose petal foot soak with the Rose Magic jar"
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="h-[52vh] rounded-[2rem] md:col-span-7"
            parallax={9}
            zoom={1.14}
            reveal
          />
          <PremiumImage
            src="/images/jars-candlelight.jpg"
            alt="Both Divine Mee jars by candlelight"
            fill
            sizes="(min-width: 768px) 60vw, 100vw"
            className="h-[52vh] rounded-[2rem] md:col-span-7"
            parallax={9}
            zoom={1.14}
            reveal
          />
          <PremiumImage
            src="/images/lifestyle-rose-garden.jpg"
            alt="Rose Magic jar nestled among fresh roses"
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="h-[52vh] rounded-[2rem] md:col-span-5"
            parallax={12}
            zoom={1.16}
            reveal
          />
        </div>
      </div>

      {/* ---- mobile sticky purchase bar ---- */}
      <div
        className={`fixed inset-x-3 bottom-3 z-[90] transition-all duration-700 ease-silk md:hidden ${
          showBar ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-20 opacity-0'
        }`}
      >
        <div className="glass-bright flex items-center justify-between gap-3 rounded-2xl bg-ink/85 p-3 pl-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-ivory/60">
              {product.name.toUpperCase()}
            </p>
            <p className="font-display text-xl text-ivory">₹{product.price}</p>
          </div>
          <button
            ref={mobileBuyRef}
            onClick={() => addToRitual(mobileBuyRef.current)}
            className="rounded-xl bg-gold px-6 py-3.5 text-[10px] font-bold tracking-[0.2em] text-ink"
          >
            ADD TO RITUAL
          </button>
        </div>
      </div>
    </section>
  );
}
