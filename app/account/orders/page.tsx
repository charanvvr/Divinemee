import { createClient } from '@/lib/supabase/server';

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, total, status, payment_status, created_at, order_items(product_name, quantity)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <section className="rounded-[2rem] border border-ink/[0.07] bg-paper p-7 md:p-10">
      <h2 className="font-display text-3xl font-light italic text-ink">Orders</h2>
      {!orders?.length ? (
        <p className="mt-6 text-[14px] text-ink-soft">You have not placed an order yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl bg-ivory p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm text-ink">{order.order_number}</strong>
                <span className="text-[11px] uppercase tracking-wider text-gold">{order.status}</span>
              </div>
              <p className="mt-2 text-[13px] text-ink-soft">
                {order.order_items.map((item) => `${item.product_name} x ${item.quantity}`).join(', ')}
              </p>
              <p className="mt-2 text-sm text-ink">₹{order.total} · {order.payment_status}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
