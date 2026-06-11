"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"

type Props = {
  count?: number
  color?: string
  variant?: "petal" | "crystal"
}

export function FloatingParticles({
  count = 14,
  color = "var(--rose)",
  variant = "petal",
}: Props) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: variant === "petal" ? 8 + Math.random() * 14 : 3 + Math.random() * 5,
        delay: Math.random() * 8,
        duration: 9 + Math.random() * 10,
        drift: (Math.random() - 0.5) * 120,
        rotate: Math.random() * 360,
        opacity: 0.25 + Math.random() * 0.4,
      })),
    [count, variant],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-10%]"
          style={{ left: `${p.left}%` }}
          initial={{ y: "-10%", x: 0, rotate: p.rotate, opacity: 0 }}
          animate={{
            y: "115%",
            x: [0, p.drift, p.drift * 0.4],
            rotate: p.rotate + 220,
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {variant === "petal" ? (
            <span
              style={{
                width: p.size,
                height: p.size * 1.3,
                background: color,
                borderRadius: "0 100% 0 100%",
                display: "block",
                filter: "blur(0.3px)",
              }}
            />
          ) : (
            <span
              style={{
                width: p.size,
                height: p.size,
                background: color,
                borderRadius: "2px",
                display: "block",
                boxShadow: `0 0 ${p.size}px ${color}`,
              }}
            />
          )}
        </motion.span>
      ))}
    </div>
  )
}
