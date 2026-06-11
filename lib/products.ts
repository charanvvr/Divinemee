export type Product = {
  slug: string
  name: string
  tagline: string
  scent: string
  price: number
  compareAt: number
  weight: string
  image: string
  altImage: string
  macro: string
  theme: "rose" | "lavender"
  accent: string
  accentSoft: string
  accentDeep: string
  description: string
  mood: string
  notes: string[]
  benefits: { title: string; copy: string }[]
}

export const products: Product[] = [
  {
    slug: "rose-magic",
    name: "Rose Magic",
    tagline: "A warm, romantic bloom",
    scent: "Damask Rose & Pink Mineral Salt",
    price: 899,
    compareAt: 1199,
    weight: "400 g",
    image: "/images/rose-jar.png",
    altImage: "/images/rose-macro.png",
    macro: "/images/rose-macro.png",
    theme: "rose",
    accent: "var(--rose)",
    accentSoft: "var(--blush)",
    accentDeep: "var(--rose-deep)",
    description:
      "Crafted with mineral-rich pink salts, real rose botanicals and a soft champagne aroma — Rose Magic turns an ordinary bath into a slow, romantic ritual.",
    mood: "Warm. Romantic. Glowing.",
    notes: ["Damask Rose", "Pink Himalayan Salt", "Geranium", "Soft Musk"],
    benefits: [
      { title: "Skin Softening", copy: "Mineral salts leave skin velvet-soft and dewy." },
      { title: "Stress Relief", copy: "Rose aroma melts tension from the very first breath." },
      { title: "Mood Glow", copy: "A warm, romantic atmosphere that lifts the spirit." },
      { title: "Deep Relaxation", copy: "Sink in and let the day quietly dissolve." },
    ],
  },
  {
    slug: "lavender-bliss",
    name: "Lavender Bliss",
    tagline: "A calm, nighttime escape",
    scent: "French Lavender & Epsom Salt",
    price: 849,
    compareAt: 1149,
    weight: "400 g",
    image: "/images/lavender-jar-studio.png",
    altImage: "/images/lavender-macro.png",
    macro: "/images/lavender-macro.png",
    theme: "lavender",
    accent: "var(--lavender)",
    accentSoft: "var(--lavender)",
    accentDeep: "var(--purple-royal)",
    description:
      "Blended with calming French lavender, soothing Epsom salt and botanical essentials — Lavender Bliss prepares your body and mind for the deepest, most restful sleep.",
    mood: "Calm. Quiet. Restful.",
    notes: ["French Lavender", "Epsom Salt", "Chamomile", "Cedar"],
    benefits: [
      { title: "Better Sleep", copy: "Lavender gently guides you toward deep, restful sleep." },
      { title: "Muscle Recovery", copy: "Epsom salt soothes tired, aching muscles." },
      { title: "Stress Relief", copy: "A quiet, calming aroma that slows the mind." },
      { title: "Body Detox", copy: "A purifying soak that leaves you renewed." },
    ],
  },
]

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug)
}
