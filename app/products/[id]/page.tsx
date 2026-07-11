import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, type ProductId } from '@/lib/products';
import ProductDetail from '@/components/sections/ProductDetail';
import Footer from '@/components/experience/Footer';

export function generateStaticParams() {
  return Object.keys(PRODUCTS).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = PRODUCTS[id as ProductId];
  if (!product) return {};
  return {
    title: `${product.name} (${product.weight}) — Divine Mee Bath Soak`,
    description: product.description,
    alternates: { canonical: `/products/${product.id}` },
    openGraph: {
      type: 'website',
      title: `${product.name} — Divine Mee`,
      description: product.description,
      images: [product.cutout],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = PRODUCTS[id as ProductId];
  if (!product) notFound();

  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://www.divinemee.com';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.id,
    image: [product.cutout, ...product.gallery.map((image) => image.src)].map(
      (image) => `${base}${image}`
    ),
    brand: { '@type': 'Brand', name: 'Divine Mee' },
    weight: product.weight,
    offers: {
      '@type': 'Offer',
      url: `${base}/products/${product.id}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <ProductDetail id={product.id} />
      <Footer />
    </main>
  );
}
