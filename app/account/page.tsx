import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import SignOutButton from './sign-out-button';

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .maybeSingle();
  const { count } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user!.id);

  return (
    <section className="rounded-[2rem] border border-ink/[0.07] bg-paper p-7 md:p-10">
      <h2 className="font-display text-3xl font-light italic text-ink">
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}.
      </h2>
      <p className="mt-2 text-[14px] font-light text-ink-soft">{user!.email}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/account/profile" className="rounded-2xl bg-ivory p-5 text-sm text-ink">
          Edit profile
        </Link>
        <Link href="/account/addresses" className="rounded-2xl bg-ivory p-5 text-sm text-ink">
          Manage addresses
        </Link>
        <Link href="/account/orders" className="rounded-2xl bg-ivory p-5 text-sm text-ink">
          {count || 0} orders
        </Link>
      </div>
      <SignOutButton />
    </section>
  );
}
