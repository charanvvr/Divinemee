"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowDown } from "lucide-react"
import { ProductViewer } from "./product-viewer"
import { FloatingParticles } from "./floating-particles"
import { MagneticButton } from "./magnetic-button"

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [0, 140])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-24"
    >
      {/* moving gradient background */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ scale }}
        animate={{
          background: [
            "radial-gradient(120% 90% at 50% 0%, #f7 e9ec 0%, #faf7f2 45%, #f3edf7 100%)",
            "radial-gradient(120% 90% at 50% 10%, #f3edf7 0%, #faf7f2 50%, #f7e9ec 100%)",
          ],
        }}
        transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(244,223,225,0.6)_0%,rgba(250,247,242,0)_50%,rgba(216,205,236,0.5)_100%)]" />
      </motion.div>

      <FloatingParticles count={10} color="var(--rose)" variant="petal" />
      <FloatingParticles count={8} color="var(--champagne)" variant="crystal" />

      <motion.div style={{ y, opacity }} className="flex w-full max-w-6xl flex-col items-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/40 px-4 py-1.5 text-xs uppercase tracking-[0.28em] text-gold backdrop-blur"
        >
          Self Care Ritual · Made in India
        </motion.span>

        <h1 className="text-center font-display text-[clamp(2.6rem,8vw,6rem)] leading-[0.98] tracking-tight text-balance">
          <Line delay={2.5}>Not Just Bath Salt.</Line>
          <Line delay={2.7}>
            <span className="italic text-rose-deep">A Self Care Ritual.</span>
          </Line>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.9 }}
          className="mt-6 max-w-md text-center font-serif text-xl leading-relaxed text-muted text-pretty"
        >
          Crafted with mineral-rich salts, real botanicals and calming aromas.
        </motion.p>

        {/* interactive product */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 2.8, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative my-2 w-full"
        >
          <ProductViewer
            src="/images/rose-jar.png"
            alt="Divine Mee Rose Magic luxury bath salt jar"
            glow="var(--blush)"
            priority
            className="mx-auto h-[44vh] min-h-80"
          />
          <p className="mx-auto -mt-4 w-fit rounded-full bg-white/50 px-4 py-1 text-xs tracking-wide text-muted backdrop-blur">
            Drag to rotate · hover to feel the light
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.2, duration: 0.9 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-3"
        >
          <MagneticButton href="/#collection">Begin Your Ritual</MagneticButton>
          <MagneticButton href="/#story" variant="outline">
            Explore Collection
          </MagneticButton>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.6 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 text-muted"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <ArrowDown className="h-4 w-4" />
        </motion.span>
      </motion.div>
    </section>
  )
}

function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.span>
    </span>
  )
}
