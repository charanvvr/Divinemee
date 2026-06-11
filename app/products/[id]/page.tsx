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
    title: `${product.name} — Divine Mee Luxury Bath Salt`,
    description: product.description,
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

  return (
    <main>
      <ProductDetail id={product.id} />
      <Footer />
    </main>
  );
}
