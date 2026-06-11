"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Logo } from "./logo"

export function Loader() {
  const [done, setDone] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 2200)
    document.body.style.overflow = "hidden"
    return () => {
      clearTimeout(t)
      document.body.style.overflow = ""
    }
  }, [])

  useEffect(() => {
    if (done) document.body.style.overflow = ""
  }, [done])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
          exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
        >
          <div className="relative flex flex-col items-center">
            <svg viewBox="0 0 120 120" className="h-28 w-28">
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, rotate: -90 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "center" }}
              />
            </svg>
            <motion.div
              className="absolute"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <Logo textClassName="items-center text-center" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
