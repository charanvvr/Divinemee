'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';

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
  /** real photography for detail pages & cards */
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

interface CartItem {
  id: ProductId;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (id: ProductId, qty?: number) => void;
  remove: (id: ProductId) => void;
  setQty: (id: ProductId, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const lastUserId = useRef<string | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('divinemee-cart');
      if (saved) {
        const parsed = JSON.parse(saved) as CartItem[];
        setItems(
          parsed.filter(
            (item) =>
              item.id in PRODUCTS &&
              Number.isInteger(item.qty) &&
              item.qty > 0 &&
              item.qty <= 20
          )
        );
      }
    } catch {
      window.localStorage.removeItem('divinemee-cart');
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem('divinemee-cart', JSON.stringify(items));
    }
  }, [hydrated, items]);

  useEffect(() => {
    if (!hydrated || authLoading) return;
    if (!user) {
      lastUserId.current = null;
      setRemoteReady(false);
      return;
    }
    if (lastUserId.current === user.id) return;

    lastUserId.current = user.id;
    const supabase = createClient();
    supabase
      .from('cart_items')
      .select('product_id, quantity')
      .eq('user_id', user.id)
      .then((result: { data: { product_id: string; quantity: number }[] | null }) => {
        const { data } = result;
        setItems((guestItems) => {
          const merged = new Map<ProductId, number>();
          data?.forEach((item) => {
            if (item.product_id in PRODUCTS) {
              merged.set(item.product_id as ProductId, Math.min(20, item.quantity));
            }
          });
          guestItems.forEach((item) => {
            merged.set(item.id, Math.max(merged.get(item.id) || 0, item.qty));
          });
          return Array.from(merged, ([id, qty]) => ({ id, qty }));
        });
        setRemoteReady(true);
      });
  }, [authLoading, hydrated, user]);

  useEffect(() => {
    if (!user || !remoteReady) return;
    const timer = window.setTimeout(async () => {
      const supabase = createClient();
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      if (items.length) {
        await supabase.from('cart_items').insert(
          items.map((item) => ({
            user_id: user.id,
            product_id: item.id,
            quantity: item.qty,
          }))
        );
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [items, remoteReady, user]);

  const add = useCallback((id: ProductId, qty = 1) => {
    setItems((prev) => {
      const safeQty = Math.max(1, Math.min(20, Math.floor(qty)));
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) =>
          i.id === id ? { ...i, qty: Math.min(20, i.qty + safeQty) } : i
        );
      }
      return [...prev, { id, qty: safeQty }];
    });
  }, []);

  const remove = useCallback((id: ProductId) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQty = useCallback((id: ProductId, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    } else {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, qty: Math.min(20, Math.floor(qty)) } : i))
      );
    }
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const total = items.reduce((n, i) => n + i.qty * PRODUCTS[i.id].price, 0);
    return {
      items,
      count,
      total,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      remove,
      setQty,
      clear,
    };
  }, [items, isOpen, add, remove, setQty, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
