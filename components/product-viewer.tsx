"use client"

import { useRef } from "react"
import Image from "next/image"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion"
import { cn } from "@/lib/utils"

type Props = {
  src: string
  alt: string
  glow?: string
  className?: string
  priority?: boolean
}

/**
 * Premium interactive product viewer.
 * - Hover = natural 3D tilt + moving light reflection (depth effect)
 * - Drag left/right = rotates the product with smooth spring inertia
 */
export function ProductViewer({ src, alt, glow = "var(--rose)", className, priority }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // pointer-based tilt
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  // drag-based rotation accumulates here
  const dragRot = useMotionValue(0)

  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [12, -12]), {
    stiffness: 150,
    damping: 18,
  })
  const tiltY = useSpring(useTransform(px, [-0.5, 0.5], [-16, 16]), {
    stiffness: 150,
    damping: 18,
  })
  const spinY = useSpring(dragRot, { stiffness: 60, damping: 14, mass: 0.6 })
  const rotateY = useTransform([tiltY, spinY], ([t, s]: number[]) => t + s)

  // moving light reflection
  const glareX = useTransform(px, [-0.5, 0.5], ["20%", "80%"])
  const glareY = useTransform(py, [-0.5, 0.5], ["20%", "80%"])

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const reset = () => {
    px.set(0)
    py.set(0)
  }

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ perspective: 1200 }}
    >
      {/* ambient glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: glow, opacity: 0.4 }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.32, 0.48, 0.32] }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDrag={(_, info) => dragRot.set(dragRot.get() + info.delta.x * 0.4)}
        whileTap={{ cursor: "grabbing" }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative aspect-square w-full max-w-lg cursor-grab touch-none select-none"
        data-cursor="hover"
      >
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 80vw, 500px"
          className="object-contain drop-shadow-[0_40px_60px_rgba(43,37,48,0.28)]"
          style={{ transform: "translateZ(40px)" }}
          draggable={false}
        />
        {/* moving light reflection */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full mix-blend-overlay"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([x, y]: string[]) =>
                `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.55), transparent 55%)`,
            ),
          }}
        />
      </motion.div>
    </div>
  )
}
