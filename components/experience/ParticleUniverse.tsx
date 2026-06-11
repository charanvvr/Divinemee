'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { pointer } from '@/lib/atmosphere';
import type { ProductId } from '@/lib/cart';

/**
 * 3D motes orbiting the jar inside the WebGL stage — different depths,
 * speeds and sizes. The cursor bends their field like a magnet.
 */

const VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aDepth;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uReveal;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec3 p = position;
    float t = uTime * (0.18 + aDepth * 0.25);

    // slow personal orbit
    float r = 0.25 + fract(aSeed * 7.13) * 0.4;
    p.x += cos(t + aSeed * 40.0) * r;
    p.y += sin(t * 0.8 + aSeed * 30.0) * r * 0.7;
    p.z += sin(t * 0.5 + aSeed * 20.0) * 0.3;

    // cursor magnetism — nearer particles bend more
    p.x += uPointer.x * (0.4 + aDepth * 0.9);
    p.y -= uPointer.y * (0.3 + aDepth * 0.6);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = (1.8 + aDepth * 6.0) * uReveal;
    gl_PointSize = size * (34.0 / -mv.z);
    vAlpha = (0.25 + aDepth * 0.55) * uReveal;
    vSeed = aSeed;
  }
`;

const FRAG = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;
  varying float vAlpha;
  varying float vSeed;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float disc = smoothstep(0.5, 0.08, d);
    float tw = 0.6 + 0.4 * sin(uTime * (1.0 + vSeed * 3.0) + vSeed * 50.0);
    vec3 col = mix(uColorA, uColorB, fract(vSeed * 3.7));
    gl_FragColor = vec4(col, disc * vAlpha * tw);
    if (gl_FragColor.a < 0.01) discard;
  }
`;

export default function ParticleUniverse({
  world,
  revealed,
  count = 260,
}: {
  world: ProductId;
  revealed: boolean;
  count?: number;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, seeds, depths } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const depths = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // shell around the jar, biased to the sides so the product stays clear
      const a = Math.random() * Math.PI * 2;
      const r = 1.4 + Math.random() * 3.2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      positions[i * 3 + 2] = -1.5 + Math.random() * 2.6;
      seeds[i] = Math.random();
      depths[i] = Math.random();
    }
    return { positions, seeds, depths };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uReveal: { value: 0 },
      uColorA: { value: new THREE.Color('#ecd3a3') },
      uColorB: { value: new THREE.Color('#b3a1dd') },
    }),
    []
  );

  useFrame((_, dt) => {
    const m = matRef.current;
    if (!m) return;
    m.uniforms.uTime.value += dt;
    m.uniforms.uPointer.value.x +=
      (pointer.x - m.uniforms.uPointer.value.x) * Math.min(1, dt * 3);
    m.uniforms.uPointer.value.y +=
      (pointer.y - m.uniforms.uPointer.value.y) * Math.min(1, dt * 3);
    m.uniforms.uReveal.value +=
      ((revealed ? 1 : 0) - m.uniforms.uReveal.value) * Math.min(1, dt * 1.2);
    const target = new THREE.Color(
      world === 'rose-magic' ? '#e8aebc' : '#b3a1dd'
    );
    (m.uniforms.uColorB.value as THREE.Color).lerp(target, Math.min(1, dt * 1.5));
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        <bufferAttribute attach="attributes-aDepth" args={[depths, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
