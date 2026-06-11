'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Footer from '@/components/experience/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <main>
      <section className="flex min-h-[85vh] items-center justify-center bg-ivory px-5 pt-24">
        <div className="w-full max-w-md">
          <div className="rounded-[2rem] border border-ink/[0.07] bg-paper p-8 shadow-card md:p-10">
            {sent ? (
              <div className="text-center">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-soft text-2xl">
                  ✉
                </span>
                <h1 className="mt-6 font-display text-3xl font-light italic text-ink">
                  Check your email
                </h1>
                <p className="mt-4 text-[14px] font-light leading-relaxed text-ink-soft">
                  We&apos;ve sent a password reset link to{' '}
                  <strong className="font-medium text-ink">{email}</strong>.
                  Click the link in the email to reset your password.
                </p>
                <Link
                  href="/login"
                  data-cursor="magnetic"
                  className="mt-8 inline-block rounded-full bg-ink px-8 py-4 text-[12px] font-semibold tracking-[0.18em] text-ivory transition-transform duration-500 ease-silk hover:scale-[1.03]"
                >
                  BACK TO SIGN IN
                </Link>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-gold">
                  PASSWORD RECOVERY
                </p>
                <h1 className="mt-2 font-display text-4xl font-light italic text-ink">
                  Forgot password?
                </h1>
                <p className="mt-2 text-[14px] font-light text-ink-soft">
                  Enter your email and we&apos;ll send you a reset link.
                </p>

                {error && (
                  <div className="mt-4 rounded-xl bg-rose-soft px-4 py-3 text-[13px] text-rose-deep">
                    {error}
                  </div>
                )}

                <form onSubmit={handleReset} className="mt-6 space-y-4">
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-ink/10 bg-ivory px-5 py-4 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-gold"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    data-cursor="magnetic"
                    className="w-full rounded-full bg-ink py-4 text-[12px] font-semibold tracking-[0.22em] text-ivory transition-all duration-500 ease-silk hover:bg-gold disabled:opacity-50"
                  >
                    {loading ? 'SENDING…' : 'SEND RESET LINK'}
                  </button>
                </form>

                <p className="mt-6 text-center text-[13px] font-light text-ink-soft">
                  Remember your password?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-gold transition-colors hover:text-ink"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
