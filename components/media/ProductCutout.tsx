'use client';

import Image from 'next/image';
import { PRODUCTS, type ProductId } from '@/lib/cart';

/** The real jar as a floating object with its aura — never a flat image. */
export default function ProductCutout({
  id,
  className = '',
  priority = false,
  glow = true,
}: {
  id: ProductId;
  className?: string;
  priority?: boolean;
  glow?: boolean;
}) {
  const p = PRODUCTS[id];
  return (
    <div className={`relative ${className}`}>
      {glow && (
        <div
          className="absolute inset-0 -z-10 scale-[1.7] rounded-full"
          style={{
            background: `radial-gradient(circle, ${p.accentSoft}, transparent 65%)`,
          }}
        />
      )}
      <Image
        src={p.cutout}
        alt={`Divine Mee ${p.name} luxury bath salt jar`}
        width={500}
        height={1000}
        priority={priority}
        className="h-full w-auto select-none drop-shadow-[0_50px_70px_rgba(20,12,8,0.45)]"
        draggable={false}
      />
    </div>
  );
}
