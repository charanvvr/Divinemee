export type ProductId = 'rose-magic' | 'lavender-bliss' | 'epsom-salt';

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
   *  They remain reachable by direct URL and resolvable by the cart/checkout. */
  hidden?: boolean;
}

export const PRODUCTS: Record<ProductId, Product> = {
  'rose-magic': {
    id: 'rose-magic',
    name: 'Rose Bath Salt',
    tagline: 'Luxury bath salt · Rose Magic',
    scent: 'Damask rose · pink Himalayan salt · soft amber steam',
    description:
      'Pink Himalayan bath salt folded with real rose petals. The water turns warm and blushing, the air fills with damask rose, and twenty minutes disappear.',
    price: 349,
    mrp: 499,
    weight: '400 g',
    cutout: '/images/cutouts/rose-magic.png',
    gallery: [
      { src: '/images/lifestyle-rose-garden.jpg', alt: 'Rose Bath Salt jar nestled in a rose garden' },
      { src: '/images/lifestyle-roses.jpg', alt: 'Rose Bath Salt surrounded by fresh roses' },
      { src: '/images/ritual-rose-soak.jpg', alt: 'A rose petal bath salt foot soak' },
      { src: '/images/hand-rose.jpg', alt: 'Rose Bath Salt jar held in hands' },
    ],
    accent: '#c97c92',
    accentSoft: '#f6e7eb',
    benefits: ['Body detox', 'Stress relief', 'Muscle relief', 'Gentle exfoliation'],
    howTo:
      'Pour 2–3 tablespoons into a warm bath or foot soak. Let the crystals dissolve fully, then soak for 15–20 minutes. Breathe.',
  },
  'lavender-bliss': {
    id: 'lavender-bliss',
    name: 'Lavender Bath Salt',
    tagline: 'Luxury bath salt · Lavender Bliss',
    scent: 'French lavender · pink Himalayan salt · midnight calm',
    description:
      'Pink Himalayan bath salt scented with French lavender and scattered with real buds. The evening slows down, warm steam rises, and the ritual feels unhurried.',
    price: 349,
    mrp: 499,
    weight: '400 g',
    cutout: '/images/cutouts/lavender-bliss.png',
    gallery: [
      { src: '/images/lifestyle-lavender-field.jpg', alt: 'Lavender Bath Salt jar standing in a lavender field' },
      { src: '/images/jar-lavender-open.jpg', alt: 'Open Lavender Bath Salt jar with wooden scoop' },
      { src: '/images/macro-lavender-salt.jpg', alt: 'Macro of Lavender Bath Salt crystals with real buds' },
      { src: '/images/ritual-lavender-soak.jpg', alt: 'A lavender bath salt foot soak' },
    ],
    accent: '#8a72c0',
    accentSoft: '#ece7f6',
    benefits: ['Body detox', 'Stress relief', 'Better sleep', 'Exfoliating'],
    howTo:
      'Pour 2–3 tablespoons into a warm bath or foot soak. Let the crystals dissolve fully, then soak for 15–20 minutes. Exhale.',
  },
  'epsom-salt': {
    id: 'epsom-salt',
    name: 'Epsom Salt',
    tagline: 'Relaxing & soothing bath soak · Lavender',
    scent: 'Pure Epsom salt · calming lavender · clean warm steam',
    description:
      'A generous 1 kg pouch of pure Epsom salt (magnesium sulphate), gently scented with lavender. The simplest ritual there is — warm water, twenty minutes, and tired muscles finally let go. For external use only.',
    price: 279,
    mrp: 499,
    weight: '1 kg',
    cutout: '/images/cutouts/epsom-salt.png',
    gallery: [
      { src: '/images/pouch-epsom-lavender.jpg', alt: 'Divine Mee Epsom Salt pouch beside a bowl of crystals' },
      { src: '/images/pouch-epsom-foot.jpg', alt: 'Epsom Salt pouch ready for a foot soak' },
      { src: '/images/pouch-epsom-pair.jpg', alt: 'Two Divine Mee Epsom Salt pouches side by side' },
      { src: '/images/guide-epsom-how-to.jpg', alt: 'How to use Divine Mee Epsom Salt in four steps' },
      { src: '/images/guide-epsom-benefits.jpg', alt: 'The benefits of Divine Mee Epsom Salt' },
    ],
    accent: '#6f5fa8',
    accentSoft: '#edeaf6',
    benefits: ['Soothes tired muscles', 'Better sleep', 'Body detox', 'Relaxes body & mind'],
    howTo:
      'Add 2 cups of Epsom salt to warm water. Soak your feet or body for 20 minutes, rinse with a normal shower, then apply moisturiser. Use 2–3 times a week for best results.',
  },
};

export const PRODUCT_LIST = Object.values(PRODUCTS);
/** Public-facing catalog — excludes any hidden items. */
export const VISIBLE_PRODUCTS = PRODUCT_LIST.filter((product) => !product.hidden);
export const VISIBLE_PRODUCT_IDS = VISIBLE_PRODUCTS.map((product) => product.id);
