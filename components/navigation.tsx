"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, ShoppingBag, X } from "lucide-react"
import { Logo } from "./logo"
import { useCart } from "./cart-context"
import { cn } from "@/lib/utils"

const links = [
  { label: "Shop", href: "/#collection" },
  { label: "Ritual", href: "/#ritual" },
  { label: "Ingredients", href: "/#ingredients" },
  { label: "Story", href: "/#story" },
  { label: "Reviews", href: "/#reviews" },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const { count, setOpen } = useCart()

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40))

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
  }, [menuOpen])

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-[80]"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={cn(
            "mx-auto flex items-center justify-between px-5 transition-all duration-500 md:px-10",
            scrolled
              ? "glass mt-0 max-w-none py-3 shadow-[0_10px_40px_-20px_rgba(43,37,48,0.4)]"
              : "mt-0 max-w-none bg-transparent py-5",
          )}
        >
          <Link href="/" aria-label="Divine Mee home">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="group relative text-sm tracking-wide text-foreground/80 transition-colors hover:text-foreground"
              >
                {l.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open shopping bag"
              className="relative rounded-full p-2.5 transition-colors hover:bg-foreground/5"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-ivory"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="rounded-full p-2.5 transition-colors hover:bg-foreground/5 lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[110] flex flex-col bg-cream px-6 py-6 lg:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="rounded-full p-2.5 hover:bg-foreground/5"
              >
                <X className="h-6 w-6" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="mt-16 flex flex-col gap-2">
              {links.map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-border py-5 font-display text-3xl"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
