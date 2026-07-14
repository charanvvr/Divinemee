import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import SmoothScroll from '@/components/experience/SmoothScroll';
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.divinemee.com'),
  title: 'Divine Mee — Rose, Lavender & Epsom Bath Salts',
  description:
    'Divine Mee handcrafted self-care rituals — Rose and Lavender luxury bath salts and pure Epsom salt bath soak, with pink Himalayan salt and real botanicals.',
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Divine Mee — Self Care Ritual',
    description: 'Rose & Lavender bath salts and pure Epsom salt. A daily luxury escape.',
    images: ['/images/jar-pair.jpg'],
  },
  alternates: { canonical: '/' },
  icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
  twitter: {
    card: 'summary_large_image',
    title: 'Divine Mee — Self Care Ritual',
    description: 'Rose & Lavender bath salts and pure Epsom salt. A daily luxury escape.',
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
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
