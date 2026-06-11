'use client';

import { useEffect, useRef } from 'react';
import { atmosphere, pointer, WORLD_TINTS, type AtmosphereMode } from '@/lib/atmosphere';

/**
 * The one continuous particle universe. A fixed full-screen canvas whose
 * particles never die — they change behaviour as the visitor travels.
 * Salt crystals are always present; petals (rose) and buds (lavender)
 * morph into each other when the world changes.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number;        // 0 far – 1 near (depth, drives size + blur + speed)
  seed: number;     // stable random per particle
  angle: number;    // current rotation
  spin: number;
  kind: number;     // 0 crystal, 1 botanical (petal/bud)
  morph: number;    // 0 rose form – 1 lavender form (lerped on world switch)
  tw: number;       // twinkle phase
}

const TAU = Math.PI * 2;

function makeSprite(draw: (c: CanvasRenderingContext2D, s: number) => void, size = 64) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const c = cv.getContext('2d')!;
  c.translate(size / 2, size / 2);
  draw(c, size);
  return cv;
}

export default function ParticleAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    let W = 0;
    let H = 0;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // ---- sprites -----------------------------------------------------------
    const crystal = makeSprite((c, s) => {
      const g = c.createRadialGradient(0, 0, 0, 0, 0, s / 2);
      g.addColorStop(0, 'rgba(255,250,240,1)');
      g.addColorStop(0.35, 'rgba(255,244,220,0.85)');
      g.addColorStop(1, 'rgba(255,240,210,0)');
      c.fillStyle = g;
      c.fillRect(-s / 2, -s / 2, s, s);
    });

    const petal = makeSprite((c, s) => {
      const r = s * 0.34;
      const g = c.createRadialGradient(0, -r * 0.2, 0, 0, 0, r * 1.4);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.7)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.beginPath();
      // teardrop petal
      c.moveTo(0, -r * 1.15);
      c.bezierCurveTo(r, -r * 0.9, r * 0.95, r * 0.7, 0, r);
      c.bezierCurveTo(-r * 0.95, r * 0.7, -r, -r * 0.9, 0, -r * 1.15);
      c.fill();
    });

    const bud = makeSprite((c, s) => {
      const r = s * 0.3;
      const g = c.createRadialGradient(0, 0, 0, 0, 0, r * 1.3);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.6, 'rgba(255,255,255,0.6)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = g;
      c.save();
      c.scale(0.62, 1);
      c.beginPath();
      c.arc(0, 0, r, 0, TAU);
      c.fill();
      c.restore();
    });

    // ---- particles ---------------------------------------------------------
    const COUNT = reduced ? 90 : isTouch ? 200 : 460;
    const parts: Particle[] = [];
    for (let i = 0; i < COUNT; i++) {
      parts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0,
        vy: 0,
        z: Math.random(),
        seed: Math.random(),
        angle: Math.random() * TAU,
        spin: (Math.random() - 0.5) * 0.02,
        kind: Math.random() < 0.68 ? 0 : 1,
        morph: 1,
        tw: Math.random() * TAU,
      });
    }

    // smooth state the canvas eases toward
    let modeBlend: Record<AtmosphereMode, number> = {
      void: 1, gather: 0, drift: 0, orbit: 0, flow: 0,
      pour: 0, dissolve: 0, relax: 0, calm: 0,
    };
    let tintR = 179, tintG = 161, tintB = 221; // lavender start
    let worldTarget = 1; // 1 lavender, 0 rose
    let light = 0;

    let raf = 0;
    let last = performance.now();
    let t = 0;

    const hexToRgb = (hex: string) => {
      const n = parseInt(hex.slice(1), 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      const s = atmosphere.get();

      // ease mode blends — behaviours crossfade instead of switching
      for (const key of Object.keys(modeBlend) as AtmosphereMode[]) {
        const target = s.mode === key ? 1 : 0;
        modeBlend[key] += (target - modeBlend[key]) * Math.min(1, dt * 2.4);
      }
      // world tint morph
      worldTarget += ((s.world === 'lavender-bliss' ? 1 : 0) - worldTarget) * Math.min(1, dt * 1.6);
      const rosePetal = hexToRgb(WORLD_TINTS['rose-magic'].petal);
      const lavPetal = hexToRgb(WORLD_TINTS['lavender-bliss'].petal);
      tintR = rosePetal[0] + (lavPetal[0] - rosePetal[0]) * worldTarget;
      tintG = rosePetal[1] + (lavPetal[1] - rosePetal[1]) * worldTarget;
      tintB = rosePetal[2] + (lavPetal[2] - rosePetal[2]) * worldTarget;
      light += (s.light - light) * Math.min(1, dt * 2);

      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const mx = (pointer.x * W) / 2 + cx;
      const my = (pointer.y * H) / 2 + cy;
      const p = s.progress;

      const mb = modeBlend;

      for (let i = 0; i < parts.length; i++) {
        const pt = parts[i];
        const depth = 0.35 + pt.z * 0.65;
        let fx = 0;
        let fy = 0;

        // ---------- behaviours (blended forces) ----------
        // drift / void: slow organic float + gentle cursor magnetism
        const wDrift = mb.drift + mb.void * 0.5 + mb.relax * 0.4 + mb.calm * 0.5;
        if (wDrift > 0.01) {
          fx += (Math.sin(t * 0.35 + pt.seed * 9) * 4 - pt.vx * 2) * wDrift * depth;
          fy += (Math.cos(t * 0.3 + pt.seed * 7) * 3.4 - 6 - pt.vy * 2) * wDrift * depth;
          if (!isTouch) {
            const dx = pt.x - mx;
            const dy = pt.y - my;
            const d2 = dx * dx + dy * dy;
            const rad = 180 * depth;
            if (d2 < rad * rad && d2 > 1) {
              const d = Math.sqrt(d2);
              const push = ((rad - d) / rad) * 38 * wDrift;
              fx += (dx / d) * push;
              fy += (dy / d) * push;
            }
          }
        }

        // gather: converge into glowing aura ring at centre
        if (mb.gather > 0.01) {
          const ringR = Math.min(W, H) * 0.22;
          const ga = pt.seed * TAU + t * 0.12;
          const gx = cx + Math.cos(ga) * ringR * (0.92 + pt.z * 0.16);
          const gy = cy + Math.sin(ga) * ringR * (0.92 + pt.z * 0.16) * 0.94;
          fx += (gx - pt.x) * 3.2 * mb.gather * p;
          fy += (gy - pt.y) * 3.2 * mb.gather * p;
        }

        // orbit: slow 3D orbital field around centre, cursor tilts perspective
        if (mb.orbit > 0.01) {
          const oR = Math.min(W, H) * (0.18 + pt.seed * 0.34);
          const oa = pt.seed * TAU + t * (0.1 + pt.z * 0.12);
          const squash = 0.42 + pointer.y * 0.1;
          const ox = cx + Math.cos(oa) * oR * (1 + pointer.x * 0.12);
          const oy = cy + Math.sin(oa) * oR * squash;
          fx += (ox - pt.x) * 2.6 * mb.orbit;
          fy += (oy - pt.y) * 2.6 * mb.orbit;
        }

        // flow: travelling through space — radial streak outward from centre
        if (mb.flow > 0.01) {
          const dx = pt.x - cx || 0.001;
          const dy = pt.y - cy || 0.001;
          const d = Math.sqrt(dx * dx + dy * dy);
          const speed = (40 + 380 * p) * (0.3 + pt.z);
          fx += (dx / d) * speed * mb.flow;
          fy += (dy / d) * speed * mb.flow;
        }

        // pour: column of falling salt
        if (mb.pour > 0.01) {
          const inColumn = Math.abs(pt.x - cx) < W * 0.08 + pt.seed * 40;
          const g = inColumn ? 320 : 60;
          fy += g * mb.pour * (0.4 + pt.z);
          fx += (cx + (pt.seed - 0.5) * W * 0.14 - pt.x) * 1.4 * mb.pour;
        }

        // dissolve: horizontal wave currents
        if (mb.dissolve > 0.01) {
          const wave = Math.sin(pt.y * 0.008 + t * 1.4 + pt.seed * 4);
          fx += wave * 90 * mb.dissolve;
          fy += (Math.sin(t * 0.8 + pt.seed * 6) * 14 - pt.vy * 3) * mb.dissolve;
        }

        // integrate with damping = weight
        const damp = 1 - Math.min(0.92, 2.6 * dt);
        pt.vx = pt.vx * damp + fx * dt;
        pt.vy = pt.vy * damp + fy * dt;
        pt.x += pt.vx * dt * 60 * 0.16;
        pt.y += pt.vy * dt * 60 * 0.16;
        pt.angle += pt.spin * (1 + mb.flow * 3);
        pt.tw += dt * (0.6 + pt.seed);

        // wrap softly
        const m = 60;
        if (pt.x < -m) pt.x = W + m;
        if (pt.x > W + m) pt.x = -m;
        if (pt.y > H + m) { pt.y = -m; pt.vy = 0; }
        if (pt.y < -m) pt.y = H + m;

        // ---------- draw ----------
        const twinkle = 0.55 + 0.45 * Math.sin(pt.tw * 2);
        let alpha =
          (0.16 + pt.z * 0.5) * twinkle *
          (0.5 + mb.drift * 0.5 + mb.gather * 0.6 + mb.orbit * 0.45 +
            mb.flow * 0.5 + mb.pour * 0.6 + mb.dissolve * 0.4 +
            mb.relax * 0.3 + mb.calm * 0.28 + mb.void * 0.25);
        alpha = Math.min(0.85, alpha) * (1 - light * 0.45);
        if (alpha < 0.01) continue;

        const isBotanical = pt.kind === 1;
        const size = (isBotanical ? 7 : 5.5) * (0.4 + pt.z * 1.0) *
          (1 + mb.gather * 0.3) * (isTouch ? 0.85 : 1);

        ctx.globalAlpha = alpha;
        if (isBotanical) {
          // tinted petal/bud — morphs between worlds
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.rotate(pt.angle);
          const sprite = worldTarget > 0.5 ? bud : petal;
          // colour wash via globalCompositeOperation-free trick: draw sprite,
          // then tint with source-atop on tiny region is costly — instead use
          // pre-tinted shadow glow + sprite at low alpha layering:
          ctx.shadowColor = `rgb(${tintR | 0},${tintG | 0},${tintB | 0})`;
          ctx.shadowBlur = size * 1.1;
          ctx.drawImage(sprite, -size, -size, size * 2, size * 2);
          ctx.restore();
        } else {
          // salt crystal — warm white with champagne shadow
          ctx.save();
          ctx.translate(pt.x, pt.y);
          ctx.shadowColor = 'rgba(217,176,106,0.9)';
          ctx.shadowBlur = size * (1.2 + mb.gather * 1.8);
          ctx.drawImage(crystal, -size / 2, -size / 2, size, size);
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[5]"
      aria-hidden
    />
  );
}
