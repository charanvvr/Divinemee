'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Footer from '@/components/experience/Footer';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedRedirect = searchParams.get('redirect') || '/account';
  const redirect = requestedRedirect.startsWith('/') && !requestedRedirect.startsWith('//')
    ? requestedRedirect
    : '/account';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setMessage('Check your email to confirm your account, then sign in.');
      setLoading(false);
      return;
    }

    router.push(redirect);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <main>
      <section className="flex min-h-[85vh] items-center justify-center bg-ivory px-5 pt-24">
        <div className="w-full max-w-md">
          <div className="rounded-[2rem] border border-ink/[0.07] bg-paper p-8 shadow-card md:p-10">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-gold">
              BEGIN YOUR RITUAL
            </p>
            <h1 className="mt-2 font-display text-4xl font-light italic text-ink">
              Create account
            </h1>
            <p className="mt-2 text-[14px] font-light text-ink-soft">
              Join the Divine Mee community.
            </p>

            {error && (
              <div className="mt-4 rounded-xl bg-rose-soft px-4 py-3 text-[13px] text-rose-deep">
                {error}
              </div>
            )}
            {message && (
              <div className="mt-4 rounded-xl bg-gold-soft px-4 py-3 text-[13px] text-ink">
                {message}
              </div>
            )}

            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <input
                type="text"
                required
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-2xl border border-ink/10 bg-ivory px-5 py-4 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-gold"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-ink/10 bg-ivory px-5 py-4 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-gold"
              />
              <input
                type="password"
                required
                placeholder="Password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-ink/10 bg-ivory px-5 py-4 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-gold"
              />
              <input
                type="password"
                required
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full rounded-2xl border border-ink/10 bg-ivory px-5 py-4 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-gold"
              />

              <button
                type="submit"
                disabled={loading}
                data-cursor="magnetic"
                className="w-full rounded-full bg-ink py-4 text-[12px] font-semibold tracking-[0.22em] text-ivory transition-all duration-500 ease-silk hover:bg-gold disabled:opacity-50"
              >
                {loading ? 'CREATING ACCOUNT…' : 'CREATE ACCOUNT'}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <span className="h-px flex-1 bg-ink/[0.08]" />
              <span className="text-[11px] tracking-wide text-ink-faint">OR</span>
              <span className="h-px flex-1 bg-ink/[0.08]" />
            </div>

            <button
              onClick={handleGoogleLogin}
              data-cursor="magnetic"
              className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/10 bg-ivory py-4 text-[12px] font-semibold tracking-[0.14em] text-ink transition-all duration-500 ease-silk hover:border-ink/25 hover:shadow-card"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              CONTINUE WITH GOOGLE
            </button>

            <p className="mt-6 text-center text-[13px] font-light text-ink-soft">
              Already have an account?{' '}
              <Link
                href={`/login${redirect !== '/account' ? `?redirect=${redirect}` : ''}`}
                className="font-medium text-gold transition-colors hover:text-ink"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  );
}
