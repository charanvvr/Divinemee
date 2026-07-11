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
import { PRODUCTS, PRODUCT_LIST, type Product, type ProductId } from '@/lib/products';

// Single source of truth for the catalog lives in lib/products.ts.
export { PRODUCTS, PRODUCT_LIST };
export type { Product, ProductId };

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
    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'divinemee-cart') return;
      try {
        const parsed = event.newValue ? (JSON.parse(event.newValue) as CartItem[]) : [];
        setItems(
          parsed.filter(
            (item) =>
              item.id in PRODUCTS &&
              Number.isInteger(item.qty) &&
              item.qty > 0 &&
              item.qty <= 20
          )
        );
      } catch {
        // Ignore malformed data written by another tab.
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
      .then((result: {
        data: { product_id: string; quantity: number }[] | null;
        error: { message: string } | null;
      }) => {
        const { data, error } = result;
        if (error) {
          lastUserId.current = null;
          setRemoteReady(false);
          return;
        }
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
      if (items.length) {
        await supabase.from('cart_items').upsert(
          items.map((item) => ({
            user_id: user.id,
            product_id: item.id,
            quantity: item.qty,
          })),
          { onConflict: 'user_id,product_id' }
        );
        const staleProductIds = PRODUCT_LIST
          .map((product) => product.id)
          .filter((productId) => !items.some((item) => item.id === productId));
        if (staleProductIds.length) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('user_id', user.id)
            .in('product_id', staleProductIds);
        }
      } else {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
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
    if (!Number.isFinite(qty)) return;
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
