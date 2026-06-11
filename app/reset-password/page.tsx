'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function update(event: React.FormEvent) {
    event.preventDefault();
    const { error } = await createClient().auth.updateUser({ password });
    if (error) setMessage(error.message);
    else router.replace('/account');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ivory px-5 pt-24">
      <form onSubmit={update} className="w-full max-w-md rounded-[2rem] border border-ink/[0.07] bg-paper p-8">
        <h1 className="font-display text-4xl font-light italic text-ink">Choose a new password</h1>
        <input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" className="mt-6 w-full rounded-2xl border border-ink/10 bg-ivory px-5 py-4 outline-none focus:border-gold" />
        {message && <p className="mt-3 text-[13px] text-rose-deep">{message}</p>}
        <button className="mt-5 w-full rounded-full bg-ink py-4 text-[11px] font-semibold tracking-[0.18em] text-ivory">UPDATE PASSWORD</button>
      </form>
    </main>
  );
}
