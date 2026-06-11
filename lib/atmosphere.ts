'use client';

/**
 * Global atmosphere store — one particle universe travels the entire site.
 * Scenes write to it (mode + progress + world); the ParticleAtmosphere canvas
 * reads it every frame. No React re-renders involved.
 */

export type AtmosphereMode =
  | 'void'      // pre-load: barely-there drift
  | 'gather'    // particles converge into the Divine Mee aura ring
  | 'drift'     // hero: alive, cursor-reactive floating
  | 'orbit'     // ingredient universe: slow orbital field
  | 'flow'      // travelling through crystal space
  | 'pour'      // ritual: falling salt
  | 'dissolve'  // ritual: particles melt into waves
  | 'relax'     // ritual: calm, sparse, light
  | 'calm';     // purchase: champagne stillness

export type WorldId = 'rose-magic' | 'lavender-bliss';

export interface AtmosphereState {
  mode: AtmosphereMode;
  /** 0–1 progress within the current mode (scroll-scrubbed). */
  progress: number;
  world: WorldId;
  /** Global brightness of the scene behind particles, 0 dark – 1 ivory. */
  light: number;
  intensity: number;
}

const state: AtmosphereState = {
  mode: 'void',
  progress: 0,
  world: 'lavender-bliss',
  light: 0,
  intensity: 1,
};

type Listener = (s: AtmosphereState) => void;
const listeners = new Set<Listener>();

export const atmosphere = {
  get(): AtmosphereState {
    return state;
  },
  set(partial: Partial<AtmosphereState>) {
    Object.assign(state, partial);
    listeners.forEach((l) => l(state));
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};

/** Shared pointer state (normalised -1..1), written once, read by all scenes. */
export const pointer = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0 };

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.vx = nx - pointer.x;
      pointer.vy = ny - pointer.y;
      pointer.x = nx;
      pointer.y = ny;
      pointer.px = e.clientX;
      pointer.py = e.clientY;
    },
    { passive: true }
  );
}

export const WORLD_TINTS: Record<
  WorldId,
  { petal: string; glow: string; deep: string }
> = {
  'rose-magic': { petal: '#e8aebc', glow: '#f6cdd6', deep: '#c97c92' },
  'lavender-bliss': { petal: '#b3a1dd', glow: '#d3c7ef', deep: '#8a72c0' },
};
