'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { INDIAN_MOBILE_HTML_PATTERN, normalizeIndianMobile } from '@/lib/india-address';

const inputClass =
  'w-full rounded-2xl border border-ink/10 bg-ivory px-5 py-4 text-[14px] text-ink outline-none focus:border-gold';

export default function ProfileForm({
  initialName,
  initialPhone,
  email,
}: {
  initialName: string;
  initialPhone: string;
  email: string;
}) {
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage('Your session has expired. Please sign in again.');
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName.trim(), phone: phone ? normalizeIndianMobile(phone) : null });
    setMessage(error ? error.message : 'Profile updated.');
    setSaving(false);
  }

  return (
    <form onSubmit={save} className="mt-6 max-w-xl space-y-4">
      <label className="sr-only" htmlFor="profile-full-name">Full name</label>
      <input id="profile-full-name" autoComplete="name" maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Full name" className={inputClass} />
      <label className="sr-only" htmlFor="profile-phone">Phone</label>
      <input id="profile-phone" type="tel" autoComplete="tel" maxLength={15} pattern={INDIAN_MOBILE_HTML_PATTERN} title="Enter a valid Indian mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Indian mobile number" className={inputClass} />
      <label className="sr-only" htmlFor="profile-email">Email</label>
      <input id="profile-email" type="email" autoComplete="email" value={email} disabled className={`${inputClass} opacity-60`} />
      {message && <p className="text-[13px] text-ink-soft">{message}</p>}
      <button disabled={saving} className="rounded-full bg-ink px-7 py-4 text-[11px] font-semibold tracking-[0.18em] text-ivory disabled:opacity-50">
        {saving ? 'SAVING...' : 'SAVE DETAILS'}
      </button>
    </form>
  );
}
