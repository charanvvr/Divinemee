import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://www.divinemee.com';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/account/', '/admin/', '/api/', '/order/'] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
