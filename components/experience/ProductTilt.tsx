'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { PRODUCTS, type ProductId } from '@/lib/cart';

/**
 * The hero product interaction: a real object on a clean stage.
 * Subtle 3D tilt toward the cursor, a soft reflection beneath,
 * and a grounded shadow that slides as the jar leans. Nothing showy —
 * it should feel like the jar is simply *there*, and alive.
 */
export default function ProductTilt({
  id,
  className = '',
  maxTilt = 7,
}: {
  id: ProductId;
  className?: string;
  maxTilt?: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const objRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current!;
    const obj = objRef.current!;
    const shadow = shadowRef.current!;
    const sheen = sheenRef.current!;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let tx = 0; // target
    let ty = 0;
    let cx = 0; // current (lerped — gives the object weight)
    let cy = 0;
    let hover = 0;
    let hoverTarget = 0;
    let raf = 0;
    let t = Math.random() * 10;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    const onEnter = () => { hoverTarget = 1; };
    const onLeave = () => { hoverTarget = 0; tx = 0; ty = 0; };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      cx += (tx - cx) * Math.min(1, dt * 4.5);
      cy += (ty - cy) * Math.min(1, dt * 4.5);
      hover += (hoverTarget - hover) * Math.min(1, dt * 5);

      const breathe = Math.sin(t * 0.7) * 4;
      const rotY = cx * maxTilt;
      const rotX = -cy * maxTilt * 0.55;

      obj.style.transform = `translateY(${breathe - hover * 6}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      shadow.style.transform = `translateX(${-cx * 16}px) scale(${1 - hover * 0.06 + Math.abs(breathe) * 0.002})`;
      shadow.style.opacity = `${0.32 - breathe * 0.008 + hover * 0.06}`;
      sheen.style.opacity = `${0.1 + Math.abs(rotY) / maxTilt * 0.22}`;
      sheen.style.transform = `translateX(${rotY * 3.2}%) skewX(-14deg)`;
    };

    stage.addEventListener('pointermove', onMove, { passive: true });
    stage.addEventListener('pointerenter', onEnter);
    stage.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerenter', onEnter);
      stage.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [maxTilt]);

  const p = PRODUCTS[id];

  return (
    <div
      ref={stageRef}
      className={`relative flex items-end justify-center ${className}`}
      style={{ perspective: '1400px' }}
    >
      <div
        ref={objRef}
        className="relative h-[88%] will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <Image
          src={p.cutout}
          alt={`Divine Mee ${p.name} luxury bath salt`}
          width={500}
          height={1000}
          priority
          className="h-full w-auto"
          style={{ filter: 'drop-shadow(0 18px 28px rgba(70,50,30,0.18))' }}
        />
        {/* travelling sheen */}
        <div
          ref={sheenRef}
          className="pointer-events-none absolute inset-y-[10%] left-[16%] w-[20%] rounded-full opacity-0"
          style={{
            background:
              'linear-gradient(105deg, transparent, rgba(255,255,255,0.55), transparent)',
            filter: 'blur(7px)',
            mixBlendMode: 'soft-light',
          }}
        />
        {/* reflection */}
        <div
          className="pointer-events-none absolute left-0 top-full h-[36%] w-full origin-top opacity-[0.14]"
          style={{
            transform: 'scaleY(-1)',
            maskImage: 'linear-gradient(to top, transparent 30%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to top, transparent 30%, black 100%)',
          }}
        >
          <Image src={p.cutout} alt="" width={500} height={1000} className="h-full w-auto" aria-hidden />
        </div>
      </div>
      {/* grounded shadow */}
      <div
        ref={shadowRef}
        className="absolute bottom-[-3%] left-1/2 h-6 w-[58%] -translate-x-1/2 rounded-[100%] bg-[#3a2c1c] opacity-30 blur-xl"
      />
    </div>
  );
}
