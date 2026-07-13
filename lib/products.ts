export type ProductId = 'rose-magic' | 'lavender-bliss' | 'test-1rupee';

export interface Product {
  id: ProductId;
  name: string;
  tagline: string;
  scent: string;
  description: string;
  price: number;
  mrp: number;
  weight: string;
  cutout: string;
  gallery: { src: string; alt: string }[];
  accent: string;
  accentSoft: string;
  benefits: string[];
  howTo: string;
  /** Hidden products are never shown in public listings, search or the sitemap.
   *  They remain reachable by direct URL and resolvable by the cart/checkout so
   *  the owner can run a live payment test without exposing it to customers. */
  hidden?: boolean;
}

export const PRODUCTS: Record<ProductId, Product> = {
  'rose-magic': {
    id: 'rose-magic',
    name: 'Rose Epsom Salt',
    tagline: 'Rose bath soak · warmth, wrapped in petals',
    scent: 'Damask rose · pink Himalayan salt · soft amber steam',
    description:
      'Pure Epsom salt folded with pink Himalayan crystals and real rose petals. The water turns warm and blushing, the air fills with damask rose, and twenty minutes disappear.',
    price: 279,
    mrp: 499,
    weight: '400 g',
    cutout: '/images/cutouts/rose-magic.png',
    // TODO: add the Rose pouch photo to this gallery as soon as it is shared —
    // only the Lavender pouch has been photographed so far.
    gallery: [
      { src: '/images/lifestyle-rose-garden.jpg', alt: 'Rose Epsom Salt jar nestled in a rose garden' },
      { src: '/images/lifestyle-roses.jpg', alt: 'Rose Epsom Salt bath soak surrounded by fresh roses' },
      { src: '/images/ritual-rose-soak.jpg', alt: 'A rose petal Epsom salt foot soak' },
      { src: '/images/hand-rose.jpg', alt: 'Rose Epsom Salt jar held in hands' },
    ],
    accent: '#c97c92',
    accentSoft: '#f6e7eb',
    benefits: ['Rose botanical aroma', 'Mineral-rich soak', 'Evening ritual', 'Gentle exfoliation'],
    howTo:
      'Pour 2–3 tablespoons into a warm bath or foot soak. Let the crystals dissolve fully, then soak for 15–20 minutes. Breathe.',
  },
  'lavender-bliss': {
    id: 'lavender-bliss',
    name: 'Lavender Epsom Salt',
    tagline: 'Lavender bath soak · stillness you can soak in',
    scent: 'French lavender buds · sea salt · midnight calm',
    description:
      'Pure Epsom salt scented with French lavender and scattered with real buds. The evening slows down, warm steam rises, and the ritual feels unhurried.',
    price: 279,
    mrp: 499,
    weight: '400 g',
    cutout: '/images/cutouts/lavender-bliss.png',
    gallery: [
      { src: '/images/lifestyle-lavender-field.jpg', alt: 'Lavender Epsom Salt jar standing in a lavender field' },
      { src: '/images/jar-lavender-open.jpg', alt: 'Open Lavender Epsom Salt jar with wooden scoop' },
      { src: '/images/pouch-epsom-front.jpg', alt: 'Lavender Epsom Salt 500 g pouch packaging' },
      { src: '/images/guide-epsom-how-to.jpg', alt: 'How to use Divine Mee Lavender Epsom Salt in four steps' },
      { src: '/images/guide-epsom-benefits.jpg', alt: 'The benefits of Divine Mee Lavender Epsom Salt' },
    ],
    accent: '#8a72c0',
    accentSoft: '#ece7f6',
    benefits: ['Lavender botanical aroma', 'Mineral-rich soak', 'Evening ritual', 'Skin-softening bath'],
    howTo:
      'Pour 2–3 tablespoons into a warm bath or foot soak. Let the crystals dissolve fully, then soak for 15–20 minutes. Exhale.',
  },
  // TEMPORARY: hidden ₹1 item used only to verify the live payment gateway.
  // Not shown in any public listing, search or sitemap; reachable only at
  // /products/test-1rupee. Remove this (and its products-table row) after the
  // live payment test is complete.
  'test-1rupee': {
    id: 'test-1rupee',
    name: 'Payment Test (₹1)',
    tagline: 'Internal live-payment test — not a real product',
    scent: 'Test item',
    description:
      'Internal ₹1 item used only to confirm the live payment gateway works. This is not for sale and is not shown anywhere on the store.',
    price: 1,
    mrp: 1,
    weight: 'n/a',
    cutout: '/images/cutouts/lavender-bliss.png',
    gallery: [{ src: '/images/jar-lavender-open.jpg', alt: 'Payment test item' }],
    accent: '#8a72c0',
    accentSoft: '#ece7f6',
    benefits: ['Live payment verification'],
    howTo: 'This item exists only to verify the payment gateway and will be removed.',
    hidden: true,
  },
};

export const PRODUCT_LIST = Object.values(PRODUCTS);
/** Public-facing catalog — excludes hidden items (e.g. the payment-test product). */
export const VISIBLE_PRODUCTS = PRODUCT_LIST.filter((product) => !product.hidden);
export const VISIBLE_PRODUCT_IDS = VISIBLE_PRODUCTS.map((product) => product.id);
