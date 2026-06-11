'use client';

import { useEffect, useRef } from 'react';

/**
 * Quiet premium cursor. Desktop only.
 * Elements opt in via data-cursor="explore | drag | magnetic"
 * and optional data-cursor-label.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    document.body.classList.add('cursor-active');

    let mx = innerWidth / 2;
    let my = innerHeight / 2;
    let rx = mx;
    let ry = my;
    let scale = 1;
    let targetScale = 1;
    let down = false;
    let magnetEl: HTMLElement | null = null;
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;

      const t = (e.target as HTMLElement)?.closest?.('[data-cursor]') as HTMLElement | null;
      const kind = t?.dataset.cursor ?? '';
      magnetEl = kind === 'magnetic' ? t : null;

      const text =
        t?.dataset.cursorLabel ??
        (kind === 'explore' ? 'VIEW' : kind === 'drag' ? 'DRAG' : '');

      if (text) {
        label.textContent = text;
        targetScale = 2.9;
        ring.classList.add('cursor-labelled');
      } else if (kind === 'magnetic') {
        targetScale = 1.7;
        label.textContent = '';
        ring.classList.remove('cursor-labelled');
      } else {
        targetScale = 1;
        label.textContent = '';
        ring.classList.remove('cursor-labelled');
      }
    };

    const onDown = () => { down = true; };
    const onUp = () => { down = false; };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      rx += (mx - rx) * 0.17;
      ry += (my - ry) * 0.17;
      scale += ((down ? targetScale * 0.84 : targetScale) - scale) * 0.18;

      let ox = 0;
      let oy = 0;
      if (magnetEl) {
        const r = magnetEl.getBoundingClientRect();
        ox = (r.left + r.width / 2 - rx) * 0.3;
        oy = (r.top + r.height / 2 - ry) * 0.3;
      }

      dot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
      ring.style.transform = `translate3d(${rx - 20 + ox}px, ${ry - 20 + oy}px, 0) scale(${scale})`;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    raf = requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove('cursor-active');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] hidden lg:block" aria-hidden>
      <div
        ref={dotRef}
        className="absolute h-1.5 w-1.5 rounded-full bg-ink will-change-transform"
      />
      <div
        ref={ringRef}
        className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-ink/30 transition-colors duration-300 will-change-transform [&.cursor-labelled]:border-transparent [&.cursor-labelled]:bg-ink/90"
      >
        <span
          ref={labelRef}
          className="select-none text-[5px] font-semibold tracking-[0.26em] text-ivory"
        />
      </div>
    </div>
  );
}
