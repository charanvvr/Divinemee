export type ProductId = 'rose-magic' | 'lavender-bliss';

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
  rating: number;
  reviewCount: number;
  benefits: string[];
  howTo: string;
}

export const PRODUCTS: Record<ProductId, Product> = {
  'rose-magic': {
    id: 'rose-magic',
    name: 'Rose Magic',
    tagline: 'Warmth, wrapped in petals',
    scent: 'Damask rose · pink Himalayan salt · soft amber steam',
    description:
      'Pink Himalayan crystals folded with real rose petals. The water turns warm and blushing, the air fills with damask rose, and twenty minutes disappear.',
    price: 249,
    mrp: 499,
    weight: '400 g',
    cutout: '/images/cutouts/rose-magic.png',
    gallery: [
      { src: '/images/lifestyle-rose-garden.jpg', alt: 'Rose Magic jar nestled in a rose garden' },
      { src: '/images/lifestyle-roses.jpg', alt: 'Rose Magic surrounded by fresh roses' },
      { src: '/images/ritual-rose-soak.jpg', alt: 'A rose petal foot soak with Rose Magic' },
      { src: '/images/hand-rose.jpg', alt: 'Rose Magic jar held in hands' },
    ],
    accent: '#c97c92',
    accentSoft: '#f6e7eb',
    rating: 4.9,
    reviewCount: 142,
    benefits: ['Stress relief', 'Muscle relief', 'Better sleep', 'Gentle exfoliation'],
    howTo:
      'Pour 2–3 tablespoons into a warm bath or foot soak. Let the crystals dissolve fully, then soak for 15–20 minutes. Breathe.',
  },
  'lavender-bliss': {
    id: 'lavender-bliss',
    name: 'Lavender Bliss',
    tagline: 'Stillness you can soak in',
    scent: 'French lavender buds · sea salt · midnight calm',
    description:
      'Epsom and sea salt crystals scented with French lavender and scattered with real buds. The evening slows down, shoulders drop, and sleep comes easier.',
    price: 249,
    mrp: 499,
    weight: '400 g',
    cutout: '/images/cutouts/lavender-bliss.png',
    gallery: [
      { src: '/images/lifestyle-lavender-field.jpg', alt: 'Lavender Bliss jar standing in a lavender field' },
      { src: '/images/jar-lavender-open.jpg', alt: 'Open Lavender Bliss jar with wooden scoop' },
      { src: '/images/macro-lavender-salt.jpg', alt: 'Macro of salt crystals with real lavender buds' },
      { src: '/images/ritual-lavender-soak.jpg', alt: 'A lavender foot soak with Lavender Bliss' },
    ],
    accent: '#8a72c0',
    accentSoft: '#ece7f6',
    rating: 4.9,
    reviewCount: 186,
    benefits: ['Deep relaxation', 'Better sleep', 'Body detox', 'Calms the mind'],
    howTo:
      'Pour 2–3 tablespoons into a warm bath or foot soak. Let the crystals dissolve fully, then soak for 15–20 minutes. Exhale.',
  },
};

export const PRODUCT_LIST = Object.values(PRODUCTS);
