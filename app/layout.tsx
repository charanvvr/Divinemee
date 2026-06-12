import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import SmoothScroll from '@/components/experience/SmoothScroll';
import CustomCursor from '@/components/experience/CustomCursor';
import LuxuryNavigation from '@/components/experience/LuxuryNavigation';
import CartDrawer from '@/components/experience/CartDrawer';
import { AuthProvider } from '@/lib/auth-context';
import AmbientSound from '@/components/experience/AmbientSound';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: 'Divine Mee — A Daily Luxury Escape',
  description:
    'Divine Mee luxury bath salts. Rose Magic & Lavender Bliss — handcrafted self-care rituals with Epsom salt, pink Himalayan salt and pure essential oils.',
  openGraph: {
    title: 'Divine Mee — Self Care Ritual',
    description: 'Not a bath product. A daily luxury escape.',
    images: ['/images/jar-pair.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0712',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="grain font-sans">
        <AmbientSound />
        <AuthProvider>
          <CartProvider>
            <SmoothScroll>
              <LuxuryNavigation />
              {children}
              <CartDrawer />
            </SmoothScroll>
            <CustomCursor />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
