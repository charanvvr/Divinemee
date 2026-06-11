import { notFound, redirect } from 'next/navigation';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) notFound();

  const service = await createServiceClient();
  const [{ data: orders }, { data: customers }] = await Promise.all([
    service
      .from('orders')
      .select('id, order_number, guest_name, guest_email, total, status, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    service
      .from('profiles')
      .select('id, full_name, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  return (
    <main className="min-h-screen bg-ivory px-5 pb-24 pt-28">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-gold">ADMIN</p>
        <h1 className="mt-2 font-display text-4xl font-light italic text-ink">Store overview</h1>
        <section className="mt-8 rounded-[2rem] border border-ink/[0.07] bg-paper p-6">
          <h2 className="font-display text-2xl italic text-ink">Orders</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-[13px]">
              <thead className="text-ink-faint"><tr><th className="py-3">Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
              <tbody>
                {orders?.map((order) => (
                  <tr key={order.id} className="border-t border-ink/[0.07]">
                    <td className="py-4">{order.order_number}</td>
                    <td>{order.guest_name}<br /><span className="text-ink-faint">{order.guest_email}</span></td>
                    <td>₹{order.total}</td><td>{order.payment_status}</td><td>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="mt-6 rounded-[2rem] border border-ink/[0.07] bg-paper p-6">
          <h2 className="font-display text-2xl italic text-ink">Customers</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customers?.map((customer) => (
              <article key={customer.id} className="rounded-2xl bg-ivory p-4 text-[13px]">
                <strong className="text-ink">{customer.full_name || 'Customer'}</strong>
                <p className="mt-1 text-ink-soft">{customer.phone || 'No phone saved'}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
