"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const [hovering, setHovering] = useState(false)
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { stiffness: 500, damping: 40, mass: 0.4 })
  const springY = useSpring(cursorY, { stiffness: 500, damping: 40, mass: 0.4 })
  const ringX = useSpring(cursorX, { stiffness: 140, damping: 18, mass: 0.6 })
  const ringY = useSpring(cursorY, { stiffness: 140, damping: 18, mass: 0.6 })
  const raf = useRef<number>(0)

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    if (!fine) return
    setEnabled(true)
    document.documentElement.classList.add("custom-cursor-active")

    const move = (e: MouseEvent) => {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        cursorX.set(e.clientX)
        cursorY.set(e.clientY)
        const el = e.target as HTMLElement
        setHovering(
          !!el.closest("a, button, [data-cursor='hover'], input, textarea"),
        )
      })
    }
    window.addEventListener("mousemove", move)
    return () => {
      window.removeEventListener("mousemove", move)
      document.documentElement.classList.remove("custom-cursor-active")
    }
  }, [cursorX, cursorY])

  if (!enabled) return null

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[100] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ x: springX, y: springY, backgroundColor: "var(--gold)" }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[100] -translate-x-1/2 -translate-y-1/2 rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          borderColor: "var(--gold)",
        }}
        animate={{
          width: hovering ? 56 : 30,
          height: hovering ? 56 : 30,
          opacity: hovering ? 0.9 : 0.45,
        }}
        transition={{ type: "spring", stiffness: 250, damping: 22 }}
      />
    </>
  )
}
