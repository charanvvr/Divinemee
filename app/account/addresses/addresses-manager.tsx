'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  house: string;
  street: string | null;
  city: string;
  state: string;
  pin_code: string;
  is_default: boolean;
};

const fields = ['label', 'full_name', 'phone', 'house', 'street', 'city', 'state', 'pin_code'] as const;
const inputClass = 'rounded-2xl border border-ink/10 bg-ivory px-4 py-3 text-[13px] outline-none focus:border-gold';

export default function AddressesManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [message, setMessage] = useState('');

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const values = Object.fromEntries(fields.map((field) => [field, String(form.get(field) || '').trim()]));
    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...values, user_id: user.id, is_default: addresses.length === 0 })
      .select()
      .single();
    if (error) setMessage(error.message);
    else {
      setAddresses((current) => [...current, data]);
      event.currentTarget.reset();
      setMessage('Address added.');
    }
  }

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (error) setMessage(error.message);
    else setAddresses((current) => current.filter((address) => address.id !== id));
  }

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <article key={address.id} className="rounded-2xl bg-ivory p-5 text-[13px] text-ink-soft">
            <strong className="text-ink">{address.label}{address.is_default ? ' · Default' : ''}</strong>
            <p className="mt-2">{address.full_name}, {address.phone}</p>
            <p>{address.house}{address.street ? `, ${address.street}` : ''}, {address.city}, {address.state} {address.pin_code}</p>
            <button onClick={() => remove(address.id)} className="mt-3 text-[10px] font-semibold tracking-wider text-rose-deep">REMOVE</button>
          </article>
        ))}
      </div>
      <form onSubmit={add} className="mt-8 grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <input key={field} name={field} required={field !== 'street'} pattern={field === 'pin_code' ? '[0-9]{6}' : undefined} placeholder={field.replace('_', ' ')} className={inputClass} />
        ))}
        {message && <p className="text-[13px] text-ink-soft sm:col-span-2">{message}</p>}
        <button className="rounded-full bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-ivory sm:col-span-2 sm:w-fit">ADD ADDRESS</button>
      </form>
    </>
  );
}
