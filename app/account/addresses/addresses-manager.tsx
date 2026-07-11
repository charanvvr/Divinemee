'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { INDIAN_MOBILE_HTML_PATTERN, INDIAN_PIN_HTML_PATTERN, INDIAN_STATES, normalizeIndianMobile } from '@/lib/india-address';

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

function valuesFrom(form: FormData) {
  const values = Object.fromEntries(fields.map((field) => [field, String(form.get(field) || '').trim()]));
  values.phone = normalizeIndianMobile(values.phone);
  return values;
}

export default function AddressesManager({ initialAddresses }: { initialAddresses: Address[] }) {
  const [addresses, setAddresses] = useState(initialAddresses);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  async function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingAction) return;
    setPendingAction('add');
    try {
      const form = new FormData(event.currentTarget);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage('Your session has expired. Please sign in again.');
        return;
      }
      const values = valuesFrom(form);
      const { data, error } = await supabase
        .from('addresses')
        .insert({ ...values, country: 'IN', user_id: user.id, is_default: addresses.length === 0 })
        .select()
        .single();
      if (error) setMessage(error.message);
      else {
        setAddresses((current) => [...current, data]);
        event.currentTarget.reset();
        setMessage('Address added.');
      }
    } finally {
      setPendingAction(null);
    }
  }

  async function remove(id: string) {
    if (pendingAction) return;
    setPendingAction(`remove:${id}`);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('addresses').delete().eq('id', id);
      if (error) setMessage(error.message);
      else {
        const removed = addresses.find((address) => address.id === id);
        const remaining = addresses.filter((address) => address.id !== id);
        if (removed?.is_default && remaining.length) {
          const fallback = await supabase.rpc('set_default_address', { p_address_id: remaining[0].id });
          if (fallback.error) setMessage('Address removed, but a new default could not be selected.');
          else remaining[0] = { ...remaining[0], is_default: true };
        }
        setAddresses(remaining);
      }
    } finally {
      setPendingAction(null);
    }
  }

  async function makeDefault(id: string) {
    if (pendingAction) return;
    setPendingAction(`default:${id}`);
    try {
      const { error } = await createClient().rpc('set_default_address', { p_address_id: id });
      if (error) setMessage(error.message);
      else {
        setAddresses((current) => current.map((address) => ({
          ...address,
          is_default: address.id === id,
        })));
        setMessage('Default address updated.');
      }
    } finally {
      setPendingAction(null);
    }
  }

  async function update(event: React.FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    if (pendingAction) return;
    setPendingAction(`update:${id}`);
    try {
      const form = new FormData(event.currentTarget);
      const values = valuesFrom(form);
      const { data, error } = await createClient()
        .from('addresses')
        .update({ ...values, country: 'IN' })
        .eq('id', id)
        .select()
        .single();
      if (error) setMessage(error.message);
      else {
        setAddresses((current) => current.map((address) => address.id === id ? data : address));
        setEditingId(null);
        setMessage('Address updated.');
      }
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <article key={address.id} className="rounded-2xl bg-ivory p-5 text-[13px] text-ink-soft">
            <strong className="text-ink">{address.label}{address.is_default ? ' · Default' : ''}</strong>
            <p className="mt-2">{address.full_name}, {address.phone}</p>
            <p>{address.house}{address.street ? `, ${address.street}` : ''}, {address.city}, {address.state} {address.pin_code}</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {!address.is_default && <button disabled={Boolean(pendingAction)} onClick={() => makeDefault(address.id)} className="text-[10px] font-semibold tracking-wider text-gold disabled:opacity-50">MAKE DEFAULT</button>}
              <button disabled={Boolean(pendingAction)} onClick={() => setEditingId(editingId === address.id ? null : address.id)} className="text-[10px] font-semibold tracking-wider text-ink-soft disabled:opacity-50">EDIT</button>
              <button disabled={Boolean(pendingAction)} onClick={() => remove(address.id)} className="text-[10px] font-semibold tracking-wider text-rose-deep disabled:opacity-50">REMOVE</button>
            </div>
            {editingId === address.id && (
              <form onSubmit={(event) => update(event, address.id)} className="mt-4 grid gap-3 sm:grid-cols-2">
                {fields.map((field) => (
                  <label key={field} className="text-[11px] text-ink-faint">
                    {field.replace('_', ' ')}
                    {field === 'state' ? (
                      <select name={field} defaultValue={address.state} required className={`${inputClass} mt-1 w-full`}>
                        <option value="" disabled>Select state / union territory</option>
                        {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                      </select>
                    ) : (
                      <input
                        name={field}
                        type={field === 'phone' ? 'tel' : 'text'}
                        defaultValue={String(address[field] || '')}
                        required={field !== 'street'}
                        pattern={field === 'pin_code' ? INDIAN_PIN_HTML_PATTERN : field === 'phone' ? INDIAN_MOBILE_HTML_PATTERN : undefined}
                        maxLength={field === 'pin_code' ? 6 : field === 'phone' ? 15 : field === 'label' ? 40 : 150}
                        className={`${inputClass} mt-1 w-full`}
                      />
                    )}
                  </label>
                ))}
                <button disabled={Boolean(pendingAction)} className="rounded-full bg-ink px-5 py-3 text-[10px] font-semibold tracking-wider text-ivory disabled:opacity-50 sm:col-span-2 sm:w-fit">SAVE ADDRESS</button>
              </form>
            )}
          </article>
        ))}
      </div>
      <form onSubmit={add} className="mt-8 grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field} className="contents">
            <span className="sr-only">{field.replace('_', ' ')}</span>
            {field === 'state' ? (
              <select name={field} required defaultValue="" className={inputClass}>
                <option value="" disabled>State / union territory</option>
                {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
              </select>
            ) : (
              <input
                name={field}
                type={field === 'phone' ? 'tel' : 'text'}
                required={field !== 'street'}
                pattern={field === 'pin_code' ? INDIAN_PIN_HTML_PATTERN : field === 'phone' ? INDIAN_MOBILE_HTML_PATTERN : undefined}
                maxLength={field === 'pin_code' ? 6 : field === 'phone' ? 15 : field === 'label' ? 40 : 150}
                placeholder={field === 'phone' ? 'Indian mobile number' : field === 'pin_code' ? 'Indian PIN code' : field.replace('_', ' ')}
                className={inputClass}
              />
            )}
          </label>
        ))}
        <p className="text-[12px] text-ink-faint sm:col-span-2">Addresses must be within India.</p>
        {message && <p className="text-[13px] text-ink-soft sm:col-span-2">{message}</p>}
        <button disabled={Boolean(pendingAction)} className="rounded-full bg-ink px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-ivory disabled:opacity-50 sm:col-span-2 sm:w-fit">{pendingAction === 'add' ? 'ADDING...' : 'ADD ADDRESS'}</button>
      </form>
    </>
  );
}
