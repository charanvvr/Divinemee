import type { MetadataRoute } from 'next';
import { VISIBLE_PRODUCTS } from '@/lib/products';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://www.divinemee.com';
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    ...VISIBLE_PRODUCTS.map((product) => ({
      url: `${base}/products/${product.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    })),
  ];
}
