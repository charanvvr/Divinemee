import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const links = [
  { href: '/account', label: 'Overview' },
  { href: '/account/profile', label: 'Profile' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/orders', label: 'Orders' },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/account');

  return (
    <main className="min-h-screen bg-ivory pb-24 pt-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <p className="text-[10px] font-semibold tracking-[0.3em] text-gold">
          MY DIVINE MEE
        </p>
        <h1 className="mt-2 font-display text-4xl font-light italic text-ink">
          Your account
        </h1>
        <div className="mt-8 grid gap-8 md:grid-cols-[13rem_1fr]">
          <aside className="h-fit rounded-3xl border border-ink/[0.07] bg-paper p-4">
            <nav className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-2xl px-4 py-3 text-[13px] text-ink-soft transition-colors hover:bg-ivory hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
          {children}
        </div>
      </div>
    </main>
  );
}
