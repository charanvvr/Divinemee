import type { Metadata } from "next"
import { Playfair_Display, Cormorant_Garamond, Inter } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Divine Mee — Turn Bathing Into A Ritual",
  description:
    "Divine Mee luxury bath salts. Mineral-rich salts, real botanicals and calming aromas crafted into a daily self-care ritual. Rose Magic & Lavender Bliss.",
  keywords: [
    "luxury bath salt",
    "Divine Mee",
    "self care ritual",
    "rose bath salt",
    "lavender bath salt",
    "premium wellness India",
  ],
  openGraph: {
    title: "Divine Mee — Turn Bathing Into A Ritual",
    description: "Luxury bath salts crafted into a daily self-care ritual.",
    type: "website",
  },
}

export const viewport = {
  themeColor: "#faf7f2",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${cormorant.variable} ${inter.variable} bg-background`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
