'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * No static images. Every photograph breathes: scroll parallax, cinematic
 * zoom, and an optional mask reveal as it enters.
 */
export default function PremiumImage({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes,
  className = '',
  parallax = 10,
  zoom = 1.12,
  reveal = false,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  /** percent of vertical drift while scrolling through the viewport */
  parallax?: number;
  /** scale the image starts at, easing to 1 */
  zoom?: number;
  reveal?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (parallax > 0 || zoom > 1) {
        gsap.fromTo(
          innerRef.current,
          { yPercent: parallax, scale: zoom },
          {
            yPercent: -parallax,
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: frameRef.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
      if (reveal) {
        gsap.fromTo(
          frameRef.current,
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.4,
            ease: 'power4.inOut',
            scrollTrigger: {
              trigger: frameRef.current,
              start: 'top 82%',
            },
          }
        );
      }
    }, frameRef);
    return () => ctx.revert();
  }, [parallax, zoom, reveal]);

  return (
    <div
      ref={frameRef}
      className={`relative overflow-hidden ${className}`}
    >
      <div ref={innerRef} className="absolute inset-[-12%] will-change-transform">
        {fill || !width ? (
          <Image src={src} alt={alt} fill sizes={sizes ?? '100vw'} className="object-cover" />
        ) : (
          <Image src={src} alt={alt} width={width} height={height} sizes={sizes} className="h-full w-full object-cover" />
        )}
      </div>
    </div>
  );
}
