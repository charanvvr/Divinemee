import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createServiceClient } from '@/lib/supabase/server';

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token || !process.env.SUPABASE_SERVICE_ROLE_KEY) notFound();
  const service = await createServiceClient();
  const { data: order } = await service
    .from('orders')
    .select('order_number, total, payment_status, order_items(product_id, product_name, quantity, price)')
    .eq('confirmation_token', token)
    .maybeSingle();
  if (!order) notFound();

  return (
    <main className="min-h-screen bg-ivory px-5 pb-24 pt-32">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-ink/[0.07] bg-paper p-8 md:p-12">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft text-2xl">✓</span>
        <p className="mt-6 text-[10px] font-semibold tracking-[0.3em] text-gold">PAYMENT {order.payment_status.toUpperCase()}</p>
        <h1 className="mt-2 font-display text-4xl font-light italic text-ink">Your ritual is on its way.</h1>
        <p className="mt-3 text-[14px] text-ink-soft">Order {order.order_number}</p>
        <ul className="mt-8 space-y-4 border-y border-ink/[0.07] py-6">
          {order.order_items.map((item) => (
            <li key={item.product_id} className="flex items-center gap-4">
              <Image src={`/images/cutouts/${item.product_id}.png`} alt="" width={40} height={70} className="h-14 w-auto" />
              <span className="flex-1 text-sm text-ink">{item.product_name} × {item.quantity}</span>
              <span className="text-sm text-ink">₹{item.price * item.quantity}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 flex justify-between font-display text-2xl text-ink"><span>Total</span><span>₹{order.total}</span></p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-ink px-8 py-4 text-[11px] font-semibold tracking-[0.18em] text-ivory">BACK TO THE COLLECTION</Link>
      </section>
    </main>
  );
}
