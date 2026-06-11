'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';

export default function CinematicRitual() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
        },
      })
        .fromTo(
          imageRef.current,
          { scale: 0.56, borderRadius: '3rem', filter: 'saturate(0.75)' },
          { scale: 1, borderRadius: '0rem', filter: 'saturate(1)', ease: 'none' },
          0
        )
        .fromTo(firstRef.current, { xPercent: -35, yPercent: 35, rotate: -9 }, { xPercent: -82, yPercent: -48, rotate: -16, ease: 'none' }, 0)
        .fromTo(secondRef.current, { xPercent: 35, yPercent: -25, rotate: 8 }, { xPercent: 76, yPercent: 52, rotate: 14, ease: 'none' }, 0)
        .fromTo(copyRef.current, { opacity: 0, y: 70 }, { opacity: 1, y: 0, ease: 'none' }, 0.48);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[220vh] bg-ink">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div ref={imageRef} className="absolute inset-0 origin-center overflow-hidden will-change-transform">
          <Image
            src="/images/ritual-bath.jpg"
            alt="A quiet candlelit Divine Mee bath ritual"
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,12,17,0.18),rgba(20,12,17,0.6))]" />
        </div>

        <div ref={firstRef} className="absolute left-[14%] top-[20%] hidden h-52 w-40 overflow-hidden rounded-[1.5rem] border border-white/25 shadow-2xl will-change-transform md:block lg:h-72 lg:w-56">
          <Image src="/images/macro-lavender-salt.jpg" alt="" fill sizes="14rem" className="object-cover" />
        </div>
        <div ref={secondRef} className="absolute bottom-[18%] right-[14%] hidden h-48 w-36 overflow-hidden rounded-[1.5rem] border border-white/25 shadow-2xl will-change-transform md:block lg:h-64 lg:w-48">
          <Image src="/images/lifestyle-roses.jpg" alt="" fill sizes="12rem" className="object-cover" />
        </div>

        <div ref={copyRef} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white opacity-0 will-change-transform">
          <p className="text-[10px] font-semibold tracking-[0.48em] text-gold-bright">THE SPACE BETWEEN DAYS</p>
          <h2 className="mt-5 max-w-5xl font-display font-light leading-[0.94]" style={{ fontSize: 'clamp(3.5rem, 9vw, 8.5rem)' }}>
            Let the world
            <br />
            <em className="italic text-[#ead9aa]">wait outside.</em>
          </h2>
          <p className="mt-7 max-w-md text-[14px] font-light leading-relaxed text-white/70 md:text-[15px]">
            Mineral crystals dissolve. Botanicals bloom. Ten quiet minutes become a ritual that changes the rest of your evening.
          </p>
          <Link
            href="/#ritual"
            data-cursor="magnetic"
            className="mt-9 rounded-full border border-white/35 bg-white/10 px-7 py-4 text-[10px] font-semibold tracking-[0.24em] text-white backdrop-blur-md transition-all duration-500 hover:bg-white hover:text-ink"
          >
            DISCOVER THE RITUAL
          </Link>
        </div>

        <p className="absolute bottom-7 left-7 text-[8px] font-semibold tracking-[0.32em] text-white/45 md:left-10">
          DIVINE MEE / AN EVENING PRACTICE
        </p>
      </div>
    </section>
  );
}
