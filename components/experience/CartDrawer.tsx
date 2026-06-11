'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS, useCart } from '@/lib/cart';

/** Light glass cart drawer with spring physics. */
export default function CartDrawer() {
  const { items, total, isOpen, close, setQty, remove } = useCart();
  const freeShipping = total >= 399 || total === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={close}
            className="fixed inset-0 z-[110] bg-ink/25 backdrop-blur-sm"
          />
          <motion.aside
            key="drawer"
            initial={{ x: '108%' }}
            animate={{ x: 0 }}
            exit={{ x: '108%' }}
            transition={{ type: 'spring', stiffness: 240, damping: 30 }}
            className="glass-panel fixed bottom-3 right-3 top-3 z-[120] flex w-[min(26rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-3xl shadow-lift"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-ink/[0.07] px-7 py-5">
              <div>
                <h3 className="font-display text-2xl font-light italic text-ink">
                  Your cart
                </h3>
                <p className="mt-0.5 text-[9px] tracking-[0.3em] text-ink-faint">
                  DIVINE MEE
                </p>
              </div>
              <button
                data-cursor="magnetic"
                onClick={close}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 text-ink-soft transition-colors hover:bg-ink/5"
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-6">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="font-display text-xl font-light italic text-ink-soft">
                    Your cart is empty.
                  </p>
                  <button
                    onClick={close}
                    data-cursor="magnetic"
                    className="rounded-full border border-ink/15 px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-ink transition-colors hover:border-ink/40"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => {
                    const p = PRODUCTS[item.id];
                    return (
                      <motion.li
                        layout
                        key={item.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 rounded-2xl border border-ink/[0.07] bg-paper p-4"
                      >
                        <div
                          className="flex h-20 w-14 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: p.accentSoft }}
                        >
                          <Image
                            src={p.cutout}
                            alt={p.name}
                            width={44}
                            height={90}
                            className="h-16 w-auto"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-display text-lg font-light italic text-ink">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-ink-faint">
                            {p.weight} · ₹{p.price}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              onClick={() => setQty(item.id, item.qty - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/10 text-ink-soft transition-colors hover:bg-ink/5"
                              aria-label="Decrease"
                            >
                              −
                            </button>
                            <span className="text-sm font-medium text-ink">{item.qty}</span>
                            <button
                              onClick={() => setQty(item.id, item.qty + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-full border border-ink/10 text-ink-soft transition-colors hover:bg-ink/5"
                              aria-label="Increase"
                            >
                              +
                            </button>
                            <button
                              onClick={() => remove(item.id)}
                              className="ml-auto text-[9px] tracking-[0.18em] text-ink-faint transition-colors hover:text-rose-deep"
                            >
                              REMOVE
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-ink/[0.07] px-7 py-6">
              {!freeShipping && (
                <p className="mb-3 rounded-xl bg-gold-soft px-4 py-2.5 text-center text-[12px] text-ink-soft">
                  Add ₹{399 - total} more for <strong>free shipping</strong>
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[10px] tracking-[0.3em] text-ink-faint">SUBTOTAL</span>
                <span className="font-display text-3xl font-light text-ink">₹{total}</span>
              </div>
              <Link
                href="/checkout"
                data-cursor="magnetic"
                onClick={(e) => {
                  if (items.length === 0) e.preventDefault();
                  else close();
                }}
                className={`mt-4 block w-full rounded-full py-4 text-center text-[12px] font-semibold tracking-[0.22em] transition-all duration-500 ease-silk ${
                  items.length === 0
                    ? 'cursor-not-allowed bg-ink/10 text-ink-faint'
                    : 'bg-ink text-ivory hover:bg-gold'
                }`}
              >
                CHECKOUT
              </Link>
              <p className="mt-3 text-center text-[11px] font-light text-ink-faint">
                UPI · Cards · Net banking · Wallets
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
