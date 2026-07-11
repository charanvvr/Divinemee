import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Prelaunch audit status | Divine Mee',
  robots: { index: false, follow: false },
};

type AuditStatus = 'Passed' | 'Fixed and passed' | 'Blocked' | 'Owner action';

const checks: Array<{ area: string; check: string; status: AuditStatus; evidence: string }> = [
  { area: 'Git', check: 'Remote baseline and isolated audit branch verified', status: 'Passed', evidence: 'origin/main 4fa3b7e' },
  { area: 'Build', check: 'Install, lint, typecheck and production build', status: 'Passed', evidence: 'All commands exit 0' },
  { area: 'Tests', check: 'Commerce, payment and request-security unit tests', status: 'Passed', evidence: '52/52 passed' },
  { area: 'Desktop', check: 'Chromium storefront and accessibility', status: 'Fixed and passed', evidence: '7/7 passed' },
  { area: 'Desktop', check: 'WebKit / Safari storefront', status: 'Fixed and passed', evidence: '6/6 passed' },
  { area: 'Mobile', check: 'Tablet, 320px mobile and standard iPhone', status: 'Fixed and passed', evidence: '18/18 passed' },
  { area: 'Desktop', check: 'Firefox storefront', status: 'Blocked', evidence: 'Audit PC headless framebuffer failure before page creation' },
  { area: 'Catalog', check: 'Exactly two Epsom Salt products at INR 279', status: 'Passed', evidence: 'Production Supabase read-only query: 2/2' },
  { area: 'Checkout', check: 'India-only phone, state, country and PIN validation', status: 'Fixed and passed', evidence: 'Unit, API, Chromium, WebKit and mobile tests passed' },
  { area: 'Privacy', check: 'Anonymous access to private Supabase tables', status: 'Passed', evidence: 'Six private tables returned no rows' },
  { area: 'RLS', check: 'Cross-user access with isolated User A and User B', status: 'Blocked', evidence: 'No separate Preview Supabase project configured' },
  { area: 'Payments', check: 'Server trust boundary, signatures and replay controls', status: 'Fixed and passed', evidence: 'Static, unit and API rejection tests passed' },
  { area: 'Payments', check: 'Razorpay Test Mode payment and webhook execution', status: 'Owner action', evidence: 'Test credentials and Preview webhook are not configured' },
  { area: 'Auth', check: 'Google OAuth end-to-end execution', status: 'Owner action', evidence: 'Provider dashboard configuration unavailable to audit' },
  { area: 'Email', check: 'Resend order email end-to-end delivery', status: 'Owner action', evidence: 'Preview API key and verified sender are not configured' },
  { area: 'Database', check: 'Payment reconciliation migration applied in Preview', status: 'Owner action', evidence: 'Preview database is not configured; production remains untouched' },
];

const styles: Record<AuditStatus, string> = {
  Passed: 'border-emerald-700/20 bg-emerald-50 text-emerald-800',
  'Fixed and passed': 'border-sky-700/20 bg-sky-50 text-sky-800',
  Blocked: 'border-amber-700/20 bg-amber-50 text-amber-900',
  'Owner action': 'border-rose-700/20 bg-rose-50 text-rose-900',
};

export default function AuditStatusPage() {
  if (process.env.VERCEL_ENV === 'production') notFound();

  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || 'local audit build';
  const passed = checks.filter((check) => check.status === 'Passed' || check.status === 'Fixed and passed').length;

  return (
    <main className="min-h-screen bg-[#f4f0e8] px-4 pb-20 pt-28 text-[#211a14] sm:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-black/10 bg-white/90 p-6 shadow-[0_24px_80px_rgba(33,26,20,0.10)] sm:p-10">
          <div className="flex flex-col gap-6 border-b border-black/10 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.28em] text-[#7d5a20]">PREVIEW ONLY</p>
              <h1 className="mt-3 font-display text-4xl font-light italic sm:text-6xl">Prelaunch audit</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#5d5147]">
                Live verification status for the isolated Codex audit branch. A green row means the test actually ran; blocked work is never counted as passed.
              </p>
            </div>
            <div className="rounded-2xl bg-[#211a14] px-5 py-4 text-white">
              <p className="text-[10px] tracking-[0.2em] text-white/60">VERIFIED</p>
              <p className="mt-1 text-2xl font-semibold">{passed} / {checks.length}</p>
              <p className="mt-1 font-mono text-[10px] text-white/60">{commit}</p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-black/10">
            <div className="hidden grid-cols-[120px_1fr_170px_280px] gap-4 bg-[#211a14] px-5 py-3 text-[11px] font-bold tracking-[0.12em] text-white md:grid">
              <span>AREA</span><span>WHAT WAS TESTED</span><span>RESULT</span><span>EVIDENCE</span>
            </div>
            {checks.map((check, index) => (
              <article key={`${check.area}-${check.check}`} className={`grid gap-3 px-5 py-5 md:grid-cols-[120px_1fr_170px_280px] md:items-center ${index ? 'border-t border-black/10' : ''}`}>
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#7d5a20]">{check.area.toUpperCase()}</p>
                <h2 className="text-sm font-semibold leading-5">{check.check}</h2>
                <span className={`w-fit rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] ${styles[check.status]}`}>
                  {check.status}
                </span>
                <p className="text-xs leading-5 text-[#6b5f54]">{check.evidence}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-rose-900/15 bg-rose-50 p-5">
            <h2 className="text-sm font-bold text-rose-950">Launch approval is intentionally withheld</h2>
            <p className="mt-2 text-xs leading-5 text-rose-900/80">
              No live payment or production database write will be attempted during this audit. Razorpay Test Mode, Preview Supabase, Google OAuth and Resend must be configured and exercised before accepting customers.
            </p>
          </div>
          <p className="mt-6 text-[11px] leading-5 text-[#6b5f54]">
            Full evidence, findings, owner actions and rollback steps are recorded in <strong>audit/CODEX_COMPLETE_WEBSITE_AUDIT.md</strong> on this branch.
          </p>
        </div>
      </section>
    </main>
  );
}
