"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

export type CartItem = {
  slug: string
  name: string
  price: number
  image: string
  qty: number
}

type CartContextType = {
  items: CartItem[]
  open: boolean
  setOpen: (v: boolean) => void
  add: (item: Omit<CartItem, "qty">, qty?: number) => void
  remove: (slug: string) => void
  setQty: (slug: string, qty: number) => void
  count: number
  total: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)

  const add: CartContextType["add"] = (item, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === item.slug)
      if (existing) {
        return prev.map((i) =>
          i.slug === item.slug ? { ...i, qty: i.qty + qty } : i,
        )
      }
      return [...prev, { ...item, qty }]
    })
    setOpen(true)
  }

  const remove = (slug: string) =>
    setItems((prev) => prev.filter((i) => i.slug !== slug))

  const setQty = (slug: string, qty: number) =>
    setItems((prev) =>
      prev
        .map((i) => (i.slug === slug ? { ...i, qty: Math.max(0, qty) } : i))
        .filter((i) => i.qty > 0),
    )

  const count = items.reduce((a, i) => a + i.qty, 0)
  const total = items.reduce((a, i) => a + i.qty * i.price, 0)

  return (
    <CartContext.Provider
      value={{ items, open, setOpen, add, remove, setQty, count, total }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
