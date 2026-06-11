'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import ProductPhysics from './ProductPhysics';
import ParticleUniverse from './ParticleUniverse';
import type { ProductId } from '@/lib/cart';

export default function WebGLProductStage({
  world,
  revealed,
  particleCount,
}: {
  world: ProductId;
  revealed: boolean;
  particleCount?: number;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 35 }}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ProductPhysics world={world} revealed={revealed} />
        <ParticleUniverse world={world} revealed={revealed} count={particleCount} />
      </Suspense>
    </Canvas>
  );
}
