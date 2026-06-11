export interface Review {
  name: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  product: 'Rose Magic' | 'Lavender Bliss';
}

export const REVIEWS: Review[] = [
  {
    name: 'Ananya S.',
    city: 'Bengaluru',
    rating: 5,
    title: 'My Sunday night non-negotiable',
    body: 'The lavender smells real — because it is. Twenty minutes in and I sleep like a different person. The jar looks beautiful on my shelf too.',
    product: 'Lavender Bliss',
  },
  {
    name: 'Priya M.',
    city: 'Mumbai',
    rating: 5,
    title: 'Feels like a spa, costs like a coffee run',
    body: 'I bought it for sore legs after running. The salt dissolves fully, no residue, and the rose fragrance is soft — not perfumey. Already reordered.',
    product: 'Rose Magic',
  },
  {
    name: 'Kavitha R.',
    city: 'Hyderabad',
    rating: 5,
    title: 'The foot soak ritual is everything',
    body: 'Warm water, three spoons, ten minutes. My swollen feet after hospital shifts finally have an answer. Packaging is genuinely premium.',
    product: 'Lavender Bliss',
  },
  {
    name: 'Neha & Arjun',
    city: 'Pune',
    rating: 4,
    title: 'Gifted it, then bought our own',
    body: 'Gave Rose Magic to my mother and she would not stop talking about it. The petals in the salt are a lovely touch. Wish the jar was bigger!',
    product: 'Rose Magic',
  },
];
