'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { pointer, atmosphere } from '@/lib/atmosphere';
import { PRODUCTS, type ProductId } from '@/lib/cart';

/**
 * The jar as a physical object: it follows the cursor with weight and delay,
 * breathes when idle, and dissolves between worlds. Lighting is emulated in
 * the shader so the flat cutout still reads as lit from the cursor side.
 */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  uniform vec2 uLight;     // light position in uv space
  uniform float uReveal;   // 0 hidden -> 1 fully materialised
  uniform float uTime;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec4 tex = texture2D(uMap, vUv);

    // cursor-side lighting: subtle brightness gradient across the jar
    float d = distance(vUv, uLight);
    float lighting = 1.08 - d * 0.28;

    // materialise: grainy dissolve from bottom to top with a gold edge
    float n = hash(floor(vUv * 90.0));
    float edge = smoothstep(uReveal - 0.12, uReveal, vUv.y + n * 0.08);
    float visible = 1.0 - edge;
    vec3 goldEdge = vec3(0.92, 0.74, 0.42);
    float rim = smoothstep(uReveal - 0.16, uReveal - 0.04, vUv.y + n * 0.08) * visible;

    vec3 col = tex.rgb * lighting;
    col = mix(col, goldEdge, rim * 0.85);

    gl_FragColor = vec4(col, tex.a * uOpacity * visible);
    if (gl_FragColor.a < 0.01) discard;
  }
`;

function JarPlane({
  id,
  active,
  reveal,
}: {
  id: ProductId;
  active: boolean;
  reveal: React.MutableRefObject<number>;
}) {
  const texture = useLoader(THREE.TextureLoader, PRODUCTS[id].cutout);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  const matRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uMap: { value: texture },
      uOpacity: { value: active ? 1 : 0 },
      uLight: { value: new THREE.Vector2(0.5, 0.4) },
      uReveal: { value: 0 },
      uTime: { value: 0 },
    }),
    [texture] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const aspect = texture.image
    ? texture.image.width / texture.image.height
    : 0.5;
  const height = 1.9;
  const width = height * aspect;

  useFrame((_, dt) => {
    const m = matRef.current;
    if (!m) return;
    const target = active ? 1 : 0;
    m.uniforms.uOpacity.value +=
      (target - m.uniforms.uOpacity.value) * Math.min(1, dt * 3.2);
    m.uniforms.uReveal.value = reveal.current;
    m.uniforms.uTime.value += dt;
    m.uniforms.uLight.value.x +=
      (0.5 + pointer.x * 0.45 - m.uniforms.uLight.value.x) * Math.min(1, dt * 4);
    m.uniforms.uLight.value.y +=
      (0.45 - pointer.y * 0.3 - m.uniforms.uLight.value.y) * Math.min(1, dt * 4);
  });

  return (
    <mesh renderOrder={2}>
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function ProductPhysics({
  world,
  revealed,
}: {
  world: ProductId;
  revealed: boolean;
}) {
  const jarRef = useRef<THREE.Group>(null);
  const envRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const reveal = useRef(0);
  const t = useRef(0);

  const glowTexture = useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const c = cv.getContext('2d')!;
    const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.28)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g;
    c.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(cv);
    return tex;
  }, []);

  useFrame((_, dt) => {
    t.current += dt;
    const jar = jarRef.current;
    const env = envRef.current;
    if (!jar || !env) return;

    // materialise progress
    reveal.current += ((revealed ? 1.2 : 0) - reveal.current) * Math.min(1, dt * 1.1);

    // environment leads (fast), jar follows with weight (slow) — real inertia
    const ex = pointer.x * 0.3;
    const ey = pointer.y * 0.2;
    env.rotation.y += (ex * 0.5 - env.rotation.y) * Math.min(1, dt * 6);
    env.rotation.x += (-ey * 0.3 - env.rotation.x) * Math.min(1, dt * 6);

    const breatheY = Math.sin(t.current * 0.7) * 0.05;
    const breatheR = Math.sin(t.current * 0.45) * 0.02;

    jar.rotation.y += (pointer.x * 0.34 - jar.rotation.y) * Math.min(1, dt * 2.2);
    jar.rotation.x += (-pointer.y * 0.16 + breatheR - jar.rotation.x) * Math.min(1, dt * 2.2);
    jar.position.x += (pointer.x * 0.35 - jar.position.x) * Math.min(1, dt * 1.8);
    jar.position.y += (breatheY - pointer.y * 0.18 - jar.position.y) * Math.min(1, dt * 1.8);

    // glow breathes, tinted by world
    const tint = world === 'rose-magic' ? [0.93, 0.62, 0.71] : [0.66, 0.6, 0.91];
    if (glowMat.current) {
      glowMat.current.color.setRGB(tint[0], tint[1], tint[2]);
      glowMat.current.opacity =
        (0.17 + Math.sin(t.current * 0.8) * 0.05) * Math.min(1, reveal.current);
    }
    if (glowRef.current) {
      glowRef.current.position.x = jar.position.x * 0.55;
      glowRef.current.position.y = jar.position.y * 0.55;
      const s = 2.7 + Math.sin(t.current * 0.8) * 0.12;
      glowRef.current.scale.setScalar(s);
    }

    // contact shadow slides opposite the light, squashes as jar lifts
    if (shadowRef.current) {
      shadowRef.current.position.x = jar.position.x - pointer.x * 0.4;
      const lift = jar.position.y - breatheY;
      shadowRef.current.scale.set(2.1 - lift * 0.4, 0.55 - lift * 0.12, 1);
      (shadowRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.5 * Math.min(1, reveal.current);
    }
  });

  return (
    <group ref={envRef}>
      {/* aura glow behind jar */}
      <mesh ref={glowRef} position={[0, 0, -1.2]} renderOrder={0}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          ref={glowMat}
          map={glowTexture}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* contact shadow */}
      <mesh ref={shadowRef} position={[0, -1.42, -0.4]} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          color="#000000"
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <group ref={jarRef} position={[0, -0.28, 0]}>
        <JarPlane id="rose-magic" active={world === 'rose-magic'} reveal={reveal} />
        <JarPlane id="lavender-bliss" active={world === 'lavender-bliss'} reveal={reveal} />
      </group>
    </group>
  );
}
