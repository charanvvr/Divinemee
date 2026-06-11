"use client"

import type { ReactNode } from "react"
import { CartProvider } from "./cart-context"
import { CustomCursor } from "./custom-cursor"
import { Loader } from "./loader"
import { Navigation } from "./navigation"
import { CartDrawer } from "./cart-drawer"
import { Footer } from "./footer"

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Loader />
      <CustomCursor />
      <Navigation />
      <CartDrawer />
      <main>{children}</main>
      <Footer />
    </CartProvider>
  )
}
