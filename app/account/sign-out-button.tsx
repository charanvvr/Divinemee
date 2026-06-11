'use client';

import { useAuth } from '@/lib/auth-context';

export default function SignOutButton() {
  const { signOut } = useAuth();

  return (
    <button
      type="button"
      onClick={signOut}
      className="mt-8 rounded-full border border-ink/15 px-6 py-3 text-[11px] font-semibold tracking-[0.18em] text-ink"
    >
      SIGN OUT
    </button>
  );
}
