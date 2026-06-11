"use client"

import { useRef, type ReactNode } from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

type Props = {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  variant?: "solid" | "outline" | "ghost"
  strength?: number
}

export function MagneticButton({
  children,
  href,
  onClick,
  className,
  variant = "solid",
  strength = 0.4,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 250, damping: 18 })
  const sy = useSpring(y, { stiffness: 250, damping: 18 })

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300"
  const variants = {
    solid: "bg-foreground text-ivory hover:bg-[#1f1a24]",
    outline: "border border-foreground/30 text-foreground hover:border-foreground/60 hover:bg-foreground/5",
    ghost: "text-foreground hover:bg-foreground/5",
  }

  const inner = (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex"
    >
      <span className={cn(base, variants[variant], className)}>{children}</span>
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex">
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" onClick={onClick} className="inline-flex">
      {inner}
    </button>
  )
}
