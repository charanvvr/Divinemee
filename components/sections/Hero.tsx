'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { gsap } from '@/lib/gsap';
import { PRODUCTS, type ProductId, useCart } from '@/lib/cart';
import { flyToBag } from '@/lib/flyToBag';

// Frame counts must match scripts/generate-hero-frames.mjs
const VARIANTS = {
  desktop: { frames: 64, width: 2400 },
  mobile: { frames: 36, width: 1080 },
} as const;

// Act timeline (fractions of scrub progress, mirrors the generator)
const ACT = {
  splitStart: 0.06,
  splitEnd: 0.34,
  introFade: 0.38,
  finalStart: 0.78,
};

function frameSource(index: number, kind: 'desktop' | 'mobile') {
  return `/images/hero-sequence/${kind}/${String(index + 1).padStart(3, '0')}.webp`;
}

function drawCover(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number
) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  context.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

export default function Hero() {
  const { add, open } = useCart();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const pourRef = useRef<HTMLSpanElement>(null);
  const dissolveRef = useRef<HTMLSpanElement>(null);
  const exhaleRef = useRef<HTMLSpanElement>(null);
  const pourLineRef = useRef<HTMLSpanElement>(null);
  const dissolveLineRef = useRef<HTMLSpanElement>(null);
  const exhaleLineRef = useRef<HTMLSpanElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const finishRef = useRef<HTMLDivElement>(null);
  const quickBuyRef = useRef<HTMLDivElement>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [staticMode, setStaticMode] = useState<boolean | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductId>('lavender-bliss');
  const product = PRODUCTS[selectedProduct];

  const addSelectedProduct = () => {
    add(selectedProduct);
    flyToBag(addButtonRef.current, product.accent);
    window.setTimeout(open, 850);
  };

  useEffect(() => {
    setStaticMode(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (staticMode !== false) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const kind = isMobile ? 'mobile' : 'desktop';
    const { frames: FRAME_COUNT, width: FRAME_WIDTH } = VARIANTS[kind];

    const images: HTMLImageElement[] = Array.from({ length: FRAME_COUNT }, () => new Image());
    const loadedSet = new Set<number>();
    let currentFrame = -1;
    let cancelled = false;

    const nearestLoaded = (target: number) => {
      if (loadedSet.has(target)) return target;
      for (let offset = 1; offset < FRAME_COUNT; offset += 1) {
        if (loadedSet.has(target - offset)) return target - offset;
        if (loadedSet.has(target + offset)) return target + offset;
      }
      return -1;
    };

    const paint = (index: number) => {
      const image = images[index];
      if (!image?.complete || !image.naturalWidth) return;
      context.fillStyle = '#fbf8f2';
      context.fillRect(0, 0, window.innerWidth, window.innerHeight);
      drawCover(context, image, window.innerWidth, window.innerHeight);
      currentFrame = index;
    };

    const playhead = { frame: 0 };
    const render = () => {
      const target = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(playhead.frame)));
      const index = nearestLoaded(target);
      if (index >= 0 && index !== currentFrame) paint(index);
    };

    const resize = () => {
      // cap canvas density at the frame's native width — anything above only
      // upscales and blurs
      const dpr = Math.min(window.devicePixelRatio || 1, FRAME_WIDTH / window.innerWidth, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      currentFrame = -1;
      render();
    };

    // progressive loading: poster frame, then spaced keyframes so early
    // scrubbing works, then fill the gaps — never block the page
    const queue: number[] = [0];
    for (let step = 6; step >= 2; step = Math.floor(step / 2)) {
      for (let i = 0; i < FRAME_COUNT; i += step) {
        if (!queue.includes(i)) queue.push(i);
      }
    }
    for (let i = 0; i < FRAME_COUNT; i += 1) {
      if (!queue.includes(i)) queue.push(i);
    }
    let cursor = 0;
    const CONCURRENCY = 6;
    const loadNext = () => {
      if (cancelled || cursor >= queue.length) return;
      const index = queue[cursor];
      cursor += 1;
      const image = images[index];
      image.decoding = 'async';
      const done = () => {
        if (cancelled) return;
        if (image.naturalWidth) {
          loadedSet.add(index);
          if (index === 0 && currentFrame === -1) paint(0);
          else render();
        }
        loadNext();
      };
      image.onload = done;
      image.onerror = done;
      image.src = frameSource(index, kind);
    };
    for (let i = 0; i < CONCURRENCY; i += 1) loadNext();

    window.addEventListener('resize', resize);
    resize();

    const ctx = gsap.context(() => {
      // masked word-by-word arrival
      gsap.fromTo(
        [pourRef.current, dissolveRef.current, exhaleRef.current],
        { yPercent: 115 },
        { yPercent: 0, duration: 1.1, stagger: 0.14, delay: 0.25, ease: 'power3.out' }
      );
      gsap.fromTo(
        taglineRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 1, delay: 0.85, ease: 'power2.out' }
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: isMobile ? 0.3 : 0.7,
          invalidateOnRefresh: true,
        },
      });

      tl.to(playhead, { frame: FRAME_COUNT - 1, ease: 'none', duration: 1, onUpdate: render }, 0)
        .to(progressRef.current, { scaleX: 1, ease: 'none', duration: 1 }, 0)
        // the words drift gently apart as the jar approaches — calm, not busy
        .to(
          pourLineRef.current,
          { x: isMobile ? '-2vw' : '-3vw', ease: 'none', duration: ACT.splitEnd - ACT.splitStart },
          ACT.splitStart
        )
        .to(
          dissolveLineRef.current,
          { x: isMobile ? '6vw' : '7vw', ease: 'none', duration: ACT.splitEnd - ACT.splitStart },
          ACT.splitStart
        )
        .to(
          exhaleLineRef.current,
          {
            x: isMobile ? '2vw' : '3vw',
            y: isMobile ? '4vh' : '7vh',
            ease: 'none',
            duration: ACT.splitEnd - ACT.splitStart,
          },
          ACT.splitStart
        )
        .to(taglineRef.current, { opacity: 0, y: -24, ease: 'none', duration: 0.1 }, ACT.splitStart + 0.05)
        .to(introRef.current, { opacity: 0, ease: 'none', duration: 0.09 }, ACT.introFade)
        .to(quickBuyRef.current, { opacity: 0, y: 24, ease: 'none', duration: 0.08 }, ACT.finalStart)
        // finale — the collection and its CTAs
        .fromTo(
          finishRef.current,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, ease: 'none', duration: 0.12 },
          ACT.finalStart + 0.08
        );
    }, section);

    return () => {
      cancelled = true;
      ctx.revert();
      window.removeEventListener('resize', resize);
      images.forEach((image) => {
        image.onload = null;
        image.onerror = null;
      });
    };
  }, [staticMode]);

  // Reduced motion — a finished, static composition. No scrub, no loader.
  if (staticMode) {
    return (
      <section id="top" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-ivory">
        <NextImage
          src="/images/jars-candlelight.jpg"
          alt="Lavender Bliss and Rose Magic luxury bath salts by candlelight"
          fill
          priority
          className="object-cover opacity-90"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,247,241,0.85),rgba(250,247,241,0.45)_40%,rgba(250,247,241,0.88))]" />
        <div className="relative z-10 mx-auto max-w-3xl px-6 py-28 text-center">
          <p className="text-[10px] font-semibold tracking-[0.42em] text-gold">A DAILY LUXURY ESCAPE</p>
          <h1 className="mt-5 font-display font-light leading-[0.98] text-ink" style={{ fontSize: 'clamp(3rem, 6vw, 5.6rem)' }}>
            Pour. Dissolve. <em className="italic text-gold">Exhale.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-[15px] font-light leading-relaxed text-ink-soft">
            Two moods. One ritual. Real botanicals, mineral-rich salts and twenty quiet minutes that belong only to you.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/products/lavender-bliss"
              className="rounded-full border border-ink/15 bg-paper/80 px-8 py-4 text-[10px] font-semibold tracking-[0.18em] text-ink transition-colors hover:bg-lavender-soft"
            >
              SHOP LAVENDER BLISS
            </Link>
            <Link
              href="/products/rose-magic"
              className="rounded-full bg-ink px-8 py-4 text-[10px] font-semibold tracking-[0.18em] text-ivory transition-colors hover:bg-rose-deep"
            >
              SHOP ROSE MAGIC
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="top" className="relative h-[210vh] bg-ivory md:h-[220vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full bg-ivory"
          role="img"
          aria-label="A jar of Divine Mee Lavender Bliss bath salt pours its salts and becomes Rose Magic as you scroll"
        />

        {/* arrival typography */}
        <div
          ref={introRef}
          className="absolute inset-x-0 top-0 z-10 flex h-full items-start px-6 pt-28 md:items-center md:px-12 md:pt-0 lg:px-20"
        >
          <div className="w-full max-w-7xl md:mx-auto">
            <p className="text-[10px] font-semibold tracking-[0.42em] text-gold">A DAILY LUXURY ESCAPE</p>
            <h1
              className="mt-5 font-display font-light leading-[0.96] text-ink"
              style={{ fontSize: 'clamp(2.8rem, 5.6vw, 5.8rem)' }}
            >
              <span ref={pourLineRef} className="block overflow-hidden pb-1 will-change-transform">
                <span ref={pourRef} className="inline-block will-change-transform">
                  Pour.
                </span>
              </span>
              <span ref={dissolveLineRef} className="block overflow-hidden pb-1 will-change-transform">
                <span ref={dissolveRef} className="inline-block will-change-transform">
                  Dissolve.
                </span>
              </span>
              <span ref={exhaleLineRef} className="block overflow-hidden pb-1 will-change-transform">
                <span ref={exhaleRef} className="inline-block italic text-gold will-change-transform">
                  Exhale.
                </span>
              </span>
            </h1>
            <p ref={taglineRef} className="mt-6 max-w-sm text-[14px] font-light leading-relaxed text-ink-soft md:text-[15px]">
              Real botanicals, mineral-rich salts and twenty quiet minutes that belong only to you.
            </p>
          </div>
        </div>

        <div
          ref={quickBuyRef}
          className="absolute bottom-12 left-4 right-4 z-20 md:bottom-auto md:left-auto md:right-8 md:top-1/2 md:w-[25rem] md:-translate-y-1/2 lg:right-14 lg:w-[27rem]"
        >
          <div className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-paper/[0.88] p-4 shadow-lift backdrop-blur-2xl md:rounded-[2rem] md:p-6">
            <div className="flex items-center gap-4 md:items-start md:gap-5">
              <div
                className="hidden h-20 w-16 shrink-0 items-center justify-center rounded-[1.1rem] sm:flex md:h-32 md:w-24 md:rounded-[1.4rem]"
                style={{ background: product.accentSoft }}
              >
                <NextImage
                  src={product.cutout}
                  alt=""
                  width={72}
                  height={144}
                  className="h-[88%] w-auto object-contain drop-shadow-[0_12px_14px_rgba(50,35,25,0.16)]"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[8px] font-semibold tracking-[0.28em] text-gold md:text-[9px]">SHOP THE RITUAL</p>
                  <span className="hidden rounded-full bg-gold-soft px-2.5 py-1 text-[8px] font-semibold tracking-[0.12em] text-ink-soft md:inline">
                    400 G
                  </span>
                </div>
                <div className="mt-1.5 flex items-end justify-between gap-2 md:mt-3 md:block">
                  <p className="truncate font-display text-xl font-light italic text-ink md:text-3xl">
                    {product.name}
                  </p>
                  <div className="flex items-end gap-2 md:mt-2">
                    <p className="font-display text-2xl font-light text-ink md:text-3xl">₹{product.price}</p>
                    <p className="mb-1 text-[11px] text-ink-faint line-through">₹{product.mrp}</p>
                  </div>
                </div>
                <p className="mt-2 hidden text-[12px] font-light leading-relaxed text-ink-soft md:block">
                  {product.tagline}
                </p>
                <div className="mt-3 flex gap-2">
                  {(Object.keys(PRODUCTS) as ProductId[]).map((id) => (
                    <button
                      key={id}
                      onClick={() => setSelectedProduct(id)}
                      aria-label={`Select ${PRODUCTS[id].name}`}
                      aria-pressed={selectedProduct === id}
                      className={`rounded-full border px-3 py-1.5 text-[8px] font-semibold tracking-[0.12em] transition-all ${
                        selectedProduct === id
                          ? 'border-ink/20 bg-ink text-ivory'
                          : 'border-ink/10 bg-paper/70 text-ink-soft'
                      }`}
                    >
                      {id === 'lavender-bliss' ? 'LAVENDER' : 'ROSE'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              ref={addButtonRef}
              onClick={addSelectedProduct}
              data-cursor="magnetic"
              className="mt-4 flex min-h-[50px] w-full items-center justify-between rounded-full bg-ink px-6 text-[9px] font-semibold tracking-[0.18em] text-ivory transition-all duration-500 hover:bg-gold active:scale-[0.98] md:mt-5 md:min-h-[54px] md:text-[10px]"
            >
              <span>ADD TO BAG</span>
              <span aria-hidden="true">₹{product.price} →</span>
            </button>
            <div className="mt-3 hidden items-center justify-center gap-4 text-[9px] tracking-[0.08em] text-ink-faint md:flex">
              <span>UPI & CARDS</span>
              <span className="h-1 w-1 rounded-full bg-gold" />
              <span>FREE SHIPPING ON 2</span>
            </div>
          </div>
        </div>

        {/* finale — the collection */}
        <div
          ref={finishRef}
          className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-5 pb-14 opacity-0 md:pb-16"
        >
          <div className="w-full max-w-lg rounded-[2rem] border border-white/55 bg-paper/80 p-6 text-center shadow-lift backdrop-blur-xl md:p-8">
            <p className="text-[9px] font-semibold tracking-[0.34em] text-gold">THE DIVINE MEE COLLECTION</p>
            <h2 className="mt-3 font-display text-3xl font-light text-ink md:text-4xl">
              Two moods. <em className="italic text-gold">One ritual.</em>
            </h2>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/products/lavender-bliss"
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-ink/15 bg-paper/70 px-5 text-[10px] font-semibold tracking-[0.16em] text-ink transition-colors hover:bg-lavender-soft"
              >
                SHOP LAVENDER BLISS
              </Link>
              <Link
                href="/products/rose-magic"
                className="flex min-h-[48px] flex-1 items-center justify-center rounded-full bg-ink px-5 text-[10px] font-semibold tracking-[0.16em] text-ivory transition-colors hover:bg-rose-deep"
              >
                SHOP ROSE MAGIC
              </Link>
            </div>
          </div>
        </div>

        <div aria-hidden="true" className="absolute bottom-5 left-5 right-5 z-10 md:bottom-7 md:left-8 md:right-8">
          <div className="flex items-center gap-4">
            <span className="text-[8px] font-semibold tracking-[0.3em] text-ink-faint">SCROLL TO BEGIN</span>
            <span className="h-px flex-1 overflow-hidden bg-ink/10">
              <span ref={progressRef} className="block h-full origin-left scale-x-0 bg-gold" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
