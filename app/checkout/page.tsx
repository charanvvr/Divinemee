'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PRODUCTS, useCart } from '@/lib/cart';
import { useAuth } from '@/lib/auth-context';
import Footer from '@/components/experience/Footer';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

type PaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

const inputClass = 'rounded-2xl border border-ink/10 bg-paper px-5 py-4 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-gold';

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const shipping = total >= 399 || total === 0 ? 0 : 49;

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const customer = {
      fullName: String(form.get('fullName') || ''),
      phone: String(form.get('phone') || ''),
      email: String(form.get('email') || ''),
      address: String(form.get('address') || ''),
      city: String(form.get('city') || ''),
      state: String(form.get('state') || ''),
      pinCode: String(form.get('pinCode') || ''),
    };

    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error('Unable to load the secure payment window.');
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Unable to start payment.');

      const razorpay = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Divine Mee',
        description: 'Luxury bath salt ritual',
        order_id: order.id,
        prefill: { name: customer.fullName, email: customer.email, contact: customer.phone },
        theme: { color: '#0b0712' },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (payment: PaymentResponse) => {
          const verification = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...payment, items, customer }),
          });
          const result = await verification.json();
          if (!verification.ok) {
            setError(result.error || 'Payment verification failed.');
            setLoading(false);
            return;
          }
          clear();
          router.push(`/order/success?token=${encodeURIComponent(result.token)}`);
        },
      });
      razorpay.on('payment.failed', (response) => {
        setError(response.error?.description || 'Payment failed. Please try again.');
        setLoading(false);
      });
      razorpay.open();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to complete checkout.');
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="bg-ivory pb-24 pt-24 md:pt-28">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <nav className="text-[12px] text-ink-faint" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-ink">Home</Link>
            <span className="mx-2">/</span><span className="text-ink">Checkout</span>
          </nav>
          <h1 className="mt-4 font-display text-4xl font-light italic text-ink md:text-5xl">Checkout</h1>
          {items.length === 0 ? (
            <div className="mt-16 max-w-md">
              <p className="text-[15px] font-light text-ink-soft">Your cart is empty. The ritual starts with a jar.</p>
              <Link href="/#shop" className="mt-6 inline-block rounded-full bg-ink px-8 py-4 text-[12px] font-semibold tracking-[0.18em] text-ivory">SHOP THE COLLECTION</Link>
            </div>
          ) : (
            <form onSubmit={placeOrder} className="mt-10 grid gap-10 lg:grid-cols-5">
              <div className="lg:col-span-3">
                <h2 className="text-[12px] font-semibold tracking-[0.26em] text-ink-faint">CUSTOMER INFORMATION</h2>
                {!user && <p className="mt-3 text-[13px] text-ink-soft">Checking out as a guest. <Link href="/login?redirect=/checkout" className="text-gold">Sign in</Link> to keep this order in your account.</p>}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <input name="fullName" required placeholder="Full name" className={inputClass} />
                  <input name="phone" required type="tel" pattern="[0-9+ -]{10,15}" placeholder="Phone" className={inputClass} />
                  <input name="email" defaultValue={user?.email || ''} required type="email" placeholder="Email" className={`${inputClass} sm:col-span-2`} />
                </div>
                <h2 className="mt-10 text-[12px] font-semibold tracking-[0.26em] text-ink-faint">SHIPPING ADDRESS</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <input name="address" required placeholder="House, street and area" className={`${inputClass} sm:col-span-2`} />
                  <input name="city" required placeholder="City" className={inputClass} />
                  <input name="state" required placeholder="State" className={inputClass} />
                  <input name="pinCode" required pattern="[0-9]{6}" placeholder="PIN code" className={inputClass} />
                </div>
                <h2 className="mt-10 text-[12px] font-semibold tracking-[0.26em] text-ink-faint">PAYMENT</h2>
                <div className="mt-5 rounded-2xl border border-gold bg-paper px-5 py-4">
                  <span className="block text-[14px] font-medium text-ink">Razorpay secure checkout</span>
                  <span className="text-[12px] text-ink-faint">UPI, cards, net banking and wallets</span>
                </div>
                {error && <p className="mt-4 rounded-xl bg-rose-soft px-4 py-3 text-[13px] text-rose-deep">{error}</p>}
              </div>
              <aside className="h-fit rounded-[2rem] border border-ink/[0.07] bg-paper p-7 lg:col-span-2">
                <h2 className="text-[12px] font-semibold tracking-[0.26em] text-ink-faint">ORDER SUMMARY</h2>
                <ul className="mt-5 space-y-4">
                  {items.map((item) => {
                    const product = PRODUCTS[item.id];
                    return (
                      <li key={item.id} className="flex items-center gap-4">
                        <span className="flex h-16 w-12 shrink-0 items-center justify-center rounded-xl" style={{ background: product.accentSoft }}>
                          <Image src={product.cutout} alt="" width={34} height={70} className="h-12 w-auto" />
                        </span>
                        <span className="flex-1"><span className="block font-display text-[16px] italic text-ink">{product.name}</span><span className="text-[12px] text-ink-faint">Qty {item.qty}</span></span>
                        <span className="text-[14px] font-medium text-ink">₹{product.price * item.qty}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-6 space-y-2 border-t border-ink/[0.07] pt-5 text-[13.5px]">
                  <p className="flex justify-between text-ink-soft"><span>Subtotal</span><span>₹{total}</span></p>
                  <p className="flex justify-between text-ink-soft"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span></p>
                  <p className="flex justify-between pt-2 font-display text-2xl font-light text-ink"><span>Total</span><span>₹{total + shipping}</span></p>
                </div>
                <button type="submit" disabled={loading} className="mt-6 w-full rounded-full bg-ink py-4 text-[12px] font-semibold tracking-[0.22em] text-ivory transition-all hover:bg-gold disabled:opacity-50">
                  {loading ? 'OPENING PAYMENT...' : 'PAY SECURELY'}
                </button>
                <p className="mt-3 text-center text-[11px] font-light text-ink-faint">Your payment is verified before an order is created.</p>
              </aside>
            </form>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
