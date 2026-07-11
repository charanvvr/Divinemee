import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AddressesManager from './addresses-manager';

export default async function AddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/account/addresses');
  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });

  return (
    <section className="rounded-[2rem] border border-ink/[0.07] bg-paper p-7 md:p-10">
      <h2 className="font-display text-3xl font-light italic text-ink">Addresses</h2>
      <AddressesManager initialAddresses={data || []} />
    </section>
  );
}
