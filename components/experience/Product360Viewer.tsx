'use client';

import { useEffect, useRef } from 'react';
import ProductCutout from '@/components/media/ProductCutout';
import type { ProductId } from '@/lib/cart';

/**
 * Drag the jar like a physical object: weighted rotation, momentum after
 * release, a soft spring home, and a travelling sheen across the glass.
 */
export default function Product360Viewer({
  id,
  className = '',
}: {
  id: ProductId;
  className?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const objRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const stage = stageRef.current!;
    const obj = objRef.current!;
    const sheen = sheenRef.current!;
    const shadow = shadowRef.current!;

    let rotY = 0;
    let rotX = 0;
    let velY = 0;
    let velX = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let idleT = Math.random() * 10;
    let interacted = false;
    let raf = 0;
    let last = performance.now();

    const onDown = (e: PointerEvent) => {
      dragging = true;
      interacted = true;
      lastX = e.clientX;
      lastY = e.clientY;
      stage.setPointerCapture(e.pointerId);
      if (hintRef.current) hintRef.current.style.opacity = '0';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      velY = dx * 0.32;
      velX = -dy * 0.16;
      rotY += velY;
      rotX += velX;
    };
    const onUp = () => {
      dragging = false;
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      idleT += dt;

      if (!dragging) {
        // momentum with friction, then a gentle spring home
        velY *= 0.94;
        velX *= 0.9;
        rotY += velY;
        rotX += velX;
        rotY += (0 - rotY) * Math.min(1, dt * 1.4);
        rotX += (0 - rotX) * Math.min(1, dt * 1.8);
      }

      // rubber-band limits — feels physical, never flips
      rotY = Math.max(-44, Math.min(44, rotY));
      rotX = Math.max(-16, Math.min(16, rotX));

      // idle breathing
      const floatY = interacted && (dragging || Math.abs(velY) > 0.05)
        ? 0
        : Math.sin(idleT * 0.8) * 8;
      const breatheR = Math.sin(idleT * 0.5) * 1.4;

      obj.style.transform = `translateY(${floatY}px) rotateX(${rotX}deg) rotateY(${rotY + breatheR}deg)`;
      sheen.style.opacity = `${Math.min(0.5, Math.abs(rotY) / 70 + 0.12)}`;
      sheen.style.transform = `translateX(${rotY * 1.4}%) skewX(-12deg)`;
      shadow.style.transform = `translateX(${-rotY * 0.5}px) scaleX(${1 - Math.abs(rotY) / 220})`;
      shadow.style.opacity = `${0.45 - Math.abs(floatY) * 0.012}`;
    };

    stage.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp);
    raf = requestAnimationFrame(tick);

    return () => {
      stage.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      data-cursor="drag"
      className={`relative flex touch-pan-y items-center justify-center ${className}`}
      style={{ perspective: '1200px' }}
    >
      <div ref={objRef} className="relative h-full will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
        <ProductCutout id={id} className="h-full" />
        {/* travelling sheen */}
        <div
          ref={sheenRef}
          className="pointer-events-none absolute inset-y-[8%] left-[12%] w-[22%] rounded-full opacity-0"
          style={{
            background:
              'linear-gradient(105deg, transparent, rgba(255,250,240,0.4), transparent)',
            filter: 'blur(6px)',
            mixBlendMode: 'soft-light',
          }}
        />
      </div>
      {/* grounded shadow */}
      <div
        ref={shadowRef}
        className="absolute bottom-[2%] left-1/2 h-5 w-[52%] -translate-x-1/2 rounded-full bg-black/45 blur-xl"
      />
      <p
        ref={hintRef}
        className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] tracking-[0.38em] opacity-60 transition-opacity duration-500"
      >
        DRAG TO EXPLORE
      </p>
    </div>
  );
}
