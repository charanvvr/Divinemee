"use client"

import Image from "next/image"
import { AnimatePresence, motion } from "framer-motion"
import { Minus, Plus, ShoppingBag, X } from "lucide-react"
import { useCart } from "./cart-context"
import { formatINR } from "@/lib/utils"
import { MagneticButton } from "./magnetic-button"

export function CartDrawer() {
  const { items, open, setOpen, setQty, remove, total } = useCart()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[90] bg-foreground/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[95] flex h-full w-full max-w-md flex-col bg-cream shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            role="dialog"
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <h2 className="flex items-center gap-2 font-display text-xl">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                Your Ritual Bag
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close bag"
                className="rounded-full p-2 transition-colors hover:bg-foreground/5"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <p className="font-serif text-2xl text-muted">
                    Your bag is quiet.
                  </p>
                  <p className="text-sm text-muted">
                    Add a ritual and begin your escape.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-5">
                  {items.map((item) => (
                    <motion.li
                      key={item.slug}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className="flex gap-4"
                    >
                      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-ivory">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-display text-base">{item.name}</p>
                            <p className="text-sm text-muted">
                              {formatINR(item.price)}
                            </p>
                          </div>
                          <button
                            onClick={() => remove(item.slug)}
                            aria-label={`Remove ${item.name}`}
                            className="text-muted transition-colors hover:text-rose-deep"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setQty(item.slug, item.qty - 1)}
                            aria-label="Decrease quantity"
                            className="rounded-full border border-border p-1.5 transition-colors hover:bg-foreground/5"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-5 text-center text-sm tabular-nums">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => setQty(item.slug, item.qty + 1)}
                            aria-label="Increase quantity"
                            className="rounded-full border border-border p-1.5 transition-colors hover:bg-foreground/5"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-6 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm uppercase tracking-widest text-muted">
                    Subtotal
                  </span>
                  <span className="font-display text-xl">{formatINR(total)}</span>
                </div>
                <MagneticButton className="w-full" strength={0.25}>
                  Checkout
                </MagneticButton>
                <p className="mt-3 text-center text-xs text-muted">
                  Free shipping across India · Taxes at checkout
                </p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
