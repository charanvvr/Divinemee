# Divine Mee — Complete Pre‑Launch Website Audit

> This report supersedes the earlier draft. Every result below was **re‑executed**
> during this session (2026‑07‑11) against the real codebase, a local production
> build, and the live Supabase project. Claims from the previous Codex run were
> **not** trusted; where a prior claim could not be reproduced it is corrected here.
> Nothing is marked *Passed* unless it actually ran successfully.

---

## 1. Executive summary

The Codex pre‑launch work is **substantial and high quality** — server‑trusted
pricing, idempotent Razorpay reconciliation, India‑only checkout validation, strong
security headers, and a comprehensive automated test suite were all present in the
uncommitted working tree and have now been preserved.

This continuation added **independent verification** and found and fixed two genuine,
serious defects that the automated suite did not catch:

- **P0 — payment bypass (FIXED).** The `finalize_razorpay_checkout` RPC and its
  `claim_*` helpers were callable directly over PostgREST by the `anon` role, because
  Supabase grants `EXECUTE` to `anon`/`authenticated` via default privileges and
  migration 004 only did `REVOKE … FROM PUBLIC`. A client that knows its own
  `checkoutSessionId` (returned to the browser) could have minted a fully "paid" order
  **without paying**. Confirmed empirically, fixed in **migration 006**, re‑verified.
- **P1 — signup regression (FIXED).** Migration 005's `profiles_full_name_length`
  CHECK (2–100) rejected the empty‑string `full_name` that the `handle_new_user`
  trigger inserts for signups without a name, aborting the entire signup. Fixed in
  **migration 007**, re‑verified.

Also applied the previously‑unapplied **migrations 004–007** to the live database
(checkout was otherwise guaranteed to 500), fixed the disappearing‑cursor bug from the
prior session, and expanded the India‑validation unit tests (52 → 64, all pass).

**Verdict:** the storefront, catalog, cart, auth, database security, SEO and
accessibility are launch‑ready. The **only** remaining pre‑customer blockers are
owner‑supplied items — Razorpay credentials (tomorrow), Resend email, and the legal
policy pages — none of which are code defects.

---

## 2–5. Baseline, branch, and deployment

| Item | Value |
|---|---|
| Starting commit (baseline, `origin/main`) | `4fa3b7e` |
| Codex‑work checkpoint commit | `ebf873d` — `chore: checkpoint existing Codex prelaunch audit work` |
| Audit‑fix commit (P0/P1) | `2020f18` |
| Final commit | see §33 (updated at end of run) |
| Branch | `codex/full-prelaunch-audit` (never merged to `main`) |
| Preview deployment | `https://divinemee-git-codex-f-90a77f-saicharankatragadda-8798s-projects.vercel.app` — **protected by Vercel Authentication** (see §21) |
| Production (unchanged) | `https://www.divinemee.com` — still runs `main` @ `4fa3b7e` |
| Supabase project | `aefahctfinottmruwtid` (ap‑south‑1) |

**Recovery of Codex work:** at session start the working tree held 45 modified files
(+7,410 lines) plus ~30 new untracked files (audit/, tests/, `lib/payment-security.ts`,
`lib/request-security.ts`, `lib/india-address.ts`, `app/api/razorpay/webhook/`,
`robots.ts`, `sitemap.ts`, migrations 004/005, playwright/vitest configs). All were
secret‑scanned (clean) and committed as checkpoint `ebf873d`, then pushed to the remote
branch as a backup **before any other change**. No `git reset`/`clean`/rebase/force was
used. Nothing was recreated from screenshots.

---

## 6. Architecture and data flow (checkout)

1. **Browser** builds a cart (client) → posts `{items, customer, idempotencyKey}` to
   `POST /api/razorpay/create-order`.
2. **create‑order (server)**: same‑origin (CSRF) check → Zod validates cart + India
   address → **server recomputes price from `lib/products.ts`** (browser price ignored)
   → IP‑hash rate limit (10 / 10 min) → upserts a `checkout_sessions` row storing the
   **trusted** cart/total → `claim_checkout_order_creation` race‑guard → creates (or
   recovers by receipt) a Razorpay order for `total × 100` paise, INR → returns
   `{id, amount, currency, keyId, checkoutSessionId}`.
3. **Browser** opens Razorpay Checkout with the returned order id (public `keyId` only).
4. On success Razorpay returns `{order_id, payment_id, signature}` → browser posts these
   **plus only `checkoutSessionId`** (never a price) to `POST /api/razorpay/verify-payment`.
5. **verify‑payment (server)**: same‑origin → HMAC signature verify (`timingSafeEqual`)
   → re‑fetches order+payment from Razorpay → asserts amount/currency/order‑binding →
   `finalize_razorpay_checkout` (idempotent SECURITY DEFINER RPC) writes order + items +
   payment atomically and returns a random `confirmation_token` → confirmation email
   (claim‑once) → browser clears cart and routes to `/order/success?token=…`.
6. **webhook** `POST /api/razorpay/webhook`: raw‑body HMAC verify → `payment_webhook_events`
   idempotency → re‑fetch + validate → same `finalize_razorpay_checkout` → recovers any
   missed browser callback.

Trust boundary is correct: **the browser can never assert the amount, the product price,
or "paid" status.**

---

## 7. Every customer route (build output — 23 routes)

| Route | Type | Notes |
|---|---|---|
| `/` | Static | Homepage |
| `/products/rose-magic`, `/products/lavender-bliss` | SSG | Exactly two |
| `/checkout` | Static (client) | India‑only form |
| `/order/success` | Dynamic | Token‑gated, paid‑only, no PII |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Static | Auth |
| `/account`, `/account/profile`, `/account/addresses`, `/account/orders` | Dynamic | Auth‑gated, `no-store` |
| `/admin` | Dynamic | `is_admin`‑gated → `notFound` otherwise |
| `/auth/callback` | Dynamic | OAuth / email code exchange |
| `/audit-status` | Dynamic | **Preview‑only** (`notFound` in production), `noindex` |
| `/robots.txt`, `/sitemap.xml` | Static | Correct |
| `/_not-found` | Static | 404 |

## 8. API endpoints

| Endpoint | Guards |
|---|---|
| `POST /api/razorpay/create-order` | same‑origin, Zod, server pricing, rate‑limit, idempotency |
| `POST /api/razorpay/verify-payment` | same‑origin, signature, amount/currency, idempotent finalize |
| `POST /api/razorpay/webhook` | raw‑body HMAC, event idempotency, re‑fetch validation |

---

## 9–12. Supabase: tables, triggers, constraints, RLS

**Tables:** `profiles`, `addresses`, `products`, `orders`, `order_items`, `wishlist`,
`cart_items`, `payments`, `checkout_sessions`, `payment_webhook_events`.

**Migrations applied to the live project this session:** 004, 005, 006 (P0 fix),
007 (P1 fix). Previously only 001–003 were live — **without 004/005 the new checkout
code would have 500'd** (missing `checkout_sessions` + RPCs).

**Key triggers/functions:** `handle_new_user` (profile bootstrap, hardened in 007),
`update_updated_at`, `prevent_profile_privilege_escalation` (blocks non‑service
`is_admin` escalation), `finalize_razorpay_checkout` (idempotent order finalization,
payment‑reuse guard), `claim_checkout_order_creation`, `claim_order_confirmation_email`,
`set_default_address`. All SECURITY DEFINER functions now have fixed `search_path` and
are executable **only** by `service_role` (fixed in 006).

**Constraints verified live:** unique order_number; unique `checkout_session_id` and
`razorpay_order_id` on orders; unique `payments.provider_payment_id`; amount integrity
(`total = subtotal + shipping`, `total = price × qty`); `products.mrp >= price`;
one‑default‑address per user; Indian state/PIN/phone/country CHECKs on addresses.

**RLS (live cross‑user test, User A vs User B, both isolated, cleaned up):**

| Attempt | Result |
|---|---|
| B reads A profile / address / cart / orders / checkout_sessions | 0 rows each ✅ |
| B updates A address | 204 but **no‑op** — A's city unchanged ✅ |
| B deletes A address | 204 but **no‑op** — A's row still present ✅ |
| anon reads profiles / orders / payments | 0 rows each ✅ |

---

## 13. Product verification (live DB + code + build)

- Exactly **two** products in code (`lib/products.ts`) and in the live `products`
  table: `rose-magic` = "Rose Epsom Salt", `lavender-bliss` = "Lavender Epsom Salt".
- Both **₹279**, MRP **₹499**, 400 g. No stale `349`; `499` appears only as MRP.
- No `Rose Magic` / `Lavender Bliss` display strings; no `divineme` typo; no `localhost`
  or `*.vercel.app` in app code. "Epsom Salt" is prominent in titles, H1s, metadata,
  alt text, cart, checkout, and the Razorpay order description.
- Build emits exactly two product pages.

## 14. Product image verification

- All 11 referenced images exist on disk. Jar cutout is the **primary** image for both.
- Lavender gallery includes the Lavender pouch + how‑to + benefits infographics.
- **Rose pouch: does not exist** anywhere in the repo/history (all 5 pouch photos are
  Lavender). Rose correctly keeps jar‑primary + 4 rose lifestyle images. **No fake
  packaging was generated.** → **Owner action** (§35).
- ⚠️ Cutout source PNGs are 4–5 MB / 4096 px (next/image optimises at serve time, but
  they should be downscaled — see P2 perf).

## 15. India checkout validation

Enforced at **four** layers and verified:
- **Frontend:** state is a controlled `<select>` of 36 states/UTs; phone/PIN use shared
  regex patterns; country locked to `IN`; idempotency key + double‑submit guard.
- **Server (Zod, `lib/commerce.ts`):** `isIndianMobile` + `+91` normalization,
  `INDIAN_STATES` enum, `isIndianPin`, `country: 'IN'`.
- **Database (live‑tested):** valid Telangana → 201; `Riga`, 5‑digit PIN, leading‑zero
  PIN, `+37126654986`, `country=LV`, oversized city → **400** each.
- **Unit tests:** 64 pass, including Latvian phone, `Riga` state, `LV` country,
  array/object‑instead‑of‑string, +91 normalization variants.

---

## 16. Cart results (e2e + unit)

Add / increase / decrease / remove / checkout‑nav all pass on Chromium, WebKit, tablet,
320 px and iPhone‑13. Server ignores client‑supplied price/qty tampering; qty bounds
(1–20, integers) enforced by Zod; fake product ids rejected by enum + DB FK. Guest cart
persists in `localStorage` and merges into the user cart on login (code‑verified).

## 17. Authentication results

Email/password signup + login verified live; profile auto‑created by trigger; **nameless
signup now succeeds** (P1 fix). Protected routes (`/account`) redirect to
`/login?redirect=/account`; open‑redirect payloads (`redirect=https://evil.example`) are
neutralized by `safeRelativePath`. Forms are labelled (a11y). Password reset flow present.

## 18. Google OAuth results

Code path verified: `signInWithOAuth` → Supabase `/authorize` → `/auth/callback` code
exchange with safe‑relative `next`. Provider was configured in a prior session and the
live `/authorize` handshake returns a correct 302 to Google with the right client id,
callback and `email profile` scope. **Real end‑to‑end click‑through requires a human +
the consent screen set to "In production"** → owner verify (§35). No OAuth secret in any
client bundle.

## 19. Razorpay — static + mocked results

| Requirement | Result | Evidence |
|---|---|---|
| Orders created server‑side | Passed | `create-order` route |
| Trusted server pricing; browser price ignored | Passed | `calculateOrder`; unit test "ignores client price" |
| Amount → paise; INR | Passed | `total × 100`, currency asserted |
| Checkout signature verified server‑side | Passed | `verifyCheckoutSignature` + unit tests |
| Webhook verified on **raw body** | Passed | `verifyHmacHex(rawBody)` + unit test |
| Duplicate callback → one order | **Passed (mocked, live DB)** | double `finalize` → same order id; 1 order/2 items/1 payment |
| Duplicate webhook idempotent | Passed | `payment_webhook_events` PK + status gate |
| Amount/currency mismatch rejected | Passed | verify‑payment assertions |
| Fabricated success URL can't mark paid | Passed | order only via `finalize` after verify; success page reads paid‑only |
| Payment id can't be reused | **Passed (mocked, live DB)** | reused `provider_payment_id` → `provider_payment_already_used` |
| Cart clears only after verified payment | Passed | checkout page |
| Failed/cancelled preserve cart | Passed | `ondismiss` / `payment.failed` reset only |
| Secret server‑side only | Passed | bundle + git‑history scans clean |

## 20. Razorpay — BLOCKED, owner action required (see §36)

Real Test‑Mode order creation · test card payment · test UPI payment · Dashboard webhook
registration · real webhook delivery · controlled live payment · live‑mode activation.

## 21. Order & confirmation‑token results

Token = `gen_random_uuid()` (122‑bit, unguessable, unique index); success page enforces
`payment_status = 'paid'` **and** non‑expired `confirmation_token_expires_at`; exposes
**no PII** (only order number, total, line items); read‑only via service client;
fabricated token → 404 (e2e). One verified payment → exactly one order; duplicate
callbacks/webhooks → no duplicate (mocked live test).

---

## 22. Security findings (P‑ranked)

| ID | Severity | Finding | Status |
|---|---|---|---|
| S‑1 | **P0** | `finalize_razorpay_checkout` / `claim_*` callable by `anon` → paid‑order forgery | **Fixed & verified** (migration 006) |
| S‑2 | **P1** | Signup aborted for empty/short `full_name` (005 vs trigger) | **Fixed & verified** (migration 007) |
| S‑3 | **P1** | Migrations 004/005 not applied live → checkout would 500 | **Fixed** (004–007 applied live) |
| S‑4 | P2 | Supabase leaked‑password protection disabled | Owner (dashboard toggle) |
| S‑5 | P3 | 2 moderate `postcss` advisories under Next (build‑time, unreachable) | Documented; do **not** downgrade |
| S‑6 | P3 | CSP uses `script-src 'unsafe-inline'` (Next.js needs it without nonces) | Accepted |
| S‑7 | P3 | `payment_webhook_events` RLS‑on/no‑policy | Acceptable (deny‑all; only service_role) |

Also verified: full CSP + `X-Frame-Options: DENY` + `nosniff` + `Referrer-Policy` +
`Permissions-Policy`; no `X-Powered-By`; `no-store` on `/account`, `/admin`,
`/order/success`, `/api`; same‑origin CSRF guard on payment APIs (cross‑origin → 403);
open‑redirect neutralized; JSON‑LD XSS‑escaped; no secrets in client bundles, source, or
git history; no committed `.env` (and `.gitignore` now blocks all env files). No IDOR
(RLS + token). SQL/NoSQL injection not applicable (parameterized PostgREST/Zod).

## 23. Browser / device matrix

| Target | Result | Evidence |
|---|---|---|
| Chromium desktop | **Passed** | 7/7 storefront + a11y, production build |
| WebKit / Safari desktop | **Passed** | 6/6 storefront |
| Tablet (768) | **Passed** | 6/6 |
| Mobile 320 px | **Passed** | 6/6 |
| Mobile iPhone 13 | **Passed** | 6/6 |
| **Firefox / Gecko** | **Blocked by test environment** | `playwright install firefox` timed out > 5 min; headless Gecko unavailable (same as prior run). Blink + WebKit both pass. |

Total e2e vs production build: **31 passed, 0 failed** (Firefox not run). (Against the
dev server 3 checks flagged dev‑only console/a11y noise; all pass on the production build.)

## 24. Accessibility results

`@axe-core/playwright` on homepage + checkout: **0 violations** (production build).
Forms labelled; controlled state select; reduced‑motion honored; visible focus; no
horizontal overflow at 320 px. Native cursor restored (disappearing‑cursor bug fixed).

## 25. Performance results (freshly re‑run — not reused)

Lighthouse against the local production build (`next start`), Playwright Chromium:

| | Perf | A11y | Best‑Pract. | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Desktop | **97** | 100 | 100 | 100 | 1.1 s | 30 ms | 0 |
| Mobile | **71** | 100 | 100 | 100 | 5.5 s | 200 ms | 0.001 |

Total transfer ≈ **884 KiB**. **Mobile LCP 5.5 s is a P2** — the JS‑driven hero
(framer‑motion + GSAP, 276 kB first‑load) and the 4–5 MB source cutout PNGs slow
throttled‑mobile paint. Desktop is excellent. Real‑world Vercel (edge AVIF + CDN) will be
better than this local throttled measure, but downscaling the cutout sources and
deferring hero JS is recommended before heavy mobile traffic.

## 26. SEO results

Production domain `www.divinemee.com`; **apex → www 308 redirect verified live**; no
`divineme` typo; per‑page canonical; Product JSON‑LD (name, sku, brand, `price: 279`,
`INR`, `InStock`, images) — validated by e2e; OG + Twitter cards; `robots.txt` disallows
private paths; `sitemap.xml` = home + 2 products; favicon; no `noindex` on public pages;
invalid route → 404; fabricated success token → 404.

## 27. Email / Resend results

Code verified: idempotent `claim_order_confirmation_email` → `sendOrderConfirmation`
(Resend), HTML‑escaped order number, returns `false` (skips) when `RESEND_API_KEY` is
absent — so a missing key never breaks checkout. **Real delivery is owner action**
(API key + verified sender domain). No preview URL / secret in templates.

## 28. Dependency findings

`npm audit`: **2 moderate**, both `postcss < 8.5.10` (GHSA‑qx2v‑qp2m‑jg93, XSS via
`</style>` in CSS stringify) **bundled under `next@15.5.20`**. Reachability: build‑time
only, on the project's own trusted CSS — **not reachable with attacker input**. The
proposed `npm audit fix --force` downgrades to **Next 9.3.3** (breaking) — **must not
apply.** Mitigation: none required; upgrade when Next ships a newer bundled postcss.
Residual risk: negligible.

## 29. Secret‑scan results

Working tree, all tracked+untracked files, compiled `.next/static` bundles, and **full
git history** scanned for `sb_secret_`, `rzp_live_`, `GOCSPX-`, service‑role JWTs, and
`*_KEY_SECRET=` — **all clean**. Client bundles contain only the two public
`NEXT_PUBLIC_*` vars. No `.env` ever committed.

## 30. Commands executed (all exit 0 unless noted)

```
git status/branch/log/diff/ls-files        # baseline + Codex work recovery
git add -A && git commit                    # checkpoint ebf873d; fixes 2020f18
npm install                                 # deps (adds vitest/playwright)
npx tsc --noEmit                            # typecheck: PASS
npx eslint . --max-warnings=0               # lint: PASS
npx vitest run                              # 64/64 PASS (was 52; +12 added)
npm audit                                   # 2 moderate (postcss, documented)
npm run build                               # PASS, 23 routes
grep .next/static + git log -p              # secret scans: CLEAN
supabase apply_migration 004,005,006,007    # applied live; success
curl PostgREST (anon/service/JWT)           # P0 proof+fix, RLS, constraints, finalize idempotency
npx playwright install chromium/firefox     # chromium OK; firefox TIMEOUT
npx playwright test (prod build)            # 31 PASS across 5 targets
npx lighthouse (desktop+mobile)             # scores in section 25
```

## 31. Exact test totals

- Unit/security (vitest): **64 passed / 0 failed / 0 skipped** (4 files).
- E2E (Playwright, production build): **31 passed / 0 failed**; Firefox **blocked**.
- Accessibility (axe): **0 violations** (home + checkout).
- Live DB checks (curl vs Supabase): auth, profile trigger, RLS isolation, India
  constraints, finalize idempotency, payment‑reuse, token read — **all passed**; test
  rows cleaned up.
- Typecheck, ESLint, production build, apex redirect, secret scans — **all passed**.

## 32. Files changed this session

- **New:** `supabase/migrations/006_lock_down_security_definer_functions.sql`,
  `supabase/migrations/007_fix_signup_profile_trigger.sql`.
- **Edited:** `tests/unit/commerce.test.ts` (+12 cases), `.gitignore` (env‑file ignores),
  this report.
- **Preserved (Codex, via checkpoint):** all 45 modified + ~30 new files.
- Live DB: migrations 004–007 applied.

## 33. Commits created

- `ebf873d` — checkpoint of Codex work (protective).
- `2020f18` — P0/P1 migration fixes + expanded India tests.
- final report/docs commit — see git log at end (FINISH section).

---

## 34. Issue register (P0→P3)

| ID | Area | Check | Status | Sev | Fix | Retest |
|---|---|---|---|---|---|---|
| 1 | Payments/DB | anon can call `finalize_razorpay_checkout` | Failed→Fixed→Passed | P0 | migration 006 revoke exec | anon blocked; service_role works |
| 2 | Auth/DB | nameless signup aborted by name CHECK | Failed→Fixed→Passed | P1 | migration 007 trigger + relax | nameless signup creates NULL‑name profile |
| 3 | DB | migrations 004/005 not live | Failed→Fixed→Passed | P1 | applied 004–007 | tables/RPCs present; checkout path works |
| 4 | Content | policy pages missing | Owner action | P1 | — | — |
| 5 | Payments | live Razorpay | Blocked / owner | P1 | — | — |
| 6 | Perf | mobile LCP 5.5 s | Failed (open) | P2 | downscale cutouts, defer hero JS | desktop 97 / mobile 71 |
| 7 | Auth | leaked‑password protection off | Owner action | P2 | dashboard toggle | — |
| 8 | Deps | postcss moderate ×2 | Documented | P3 | none (no downgrade) | not reachable |
| 9 | Email | Resend delivery | Owner action | P3 | API key + domain | — |
| 10 | Auth | Google OAuth click‑through | Owner verify | P3 | publish consent screen | 302 handshake OK |
| 11 | A11y/UX | disappearing cursor | Fixed→Passed | P3 | removed custom cursor | native cursor always shown |

---

## 35. Owner actions

1. **Razorpay** — provide `RAZORPAY_KEY_SECRET` (+ `RAZORPAY_WEBHOOK_SECRET`) and run
   the §36 checklist. `RAZORPAY_KEY_ID` + `NEXT_PUBLIC_APP_URL` already set.
2. **`CHECKOUT_RATE_LIMIT_SECRET`** — set this env var (any long random string) in
   Vercel Production **and Preview**; create‑order returns 503 without it.
3. **Rose pouch photo** — upload the real Rose pouch shot to `public/images/` as
   `pouch-rose-front.jpg` (JPEG/WebP, ≥ 1200 px shortest side); then it's added to the
   Rose gallery. Do **not** fabricate packaging.
4. **Legal/policy pages** (required for Razorpay activation + Indian law) — provide:
   legal business name, business address, contact email, phone, delivery regions,
   delivery timeline, shipping charges, cancellation window, return eligibility, refund
   timeline, damaged‑product process, privacy contact, data‑retention period. Pages to
   create: Shipping, Refund & Cancellation, Privacy, Terms, Contact.
5. **Resend** — add `RESEND_API_KEY` + verified sender domain for order emails.
6. **Google OAuth** — confirm the consent screen is **In production** (not Testing) so
   any customer can sign in; the Supabase provider + redirect URLs are already set.
7. **Supabase Auth** — enable **leaked‑password protection** (HaveIBeenPwned) in the
   dashboard.
8. **Deploy the audit branch** — production still runs the pre‑Codex `main`. Merge this
   PR (owner decision) and redeploy so the live checkout code matches the live DB.

## 36. Razorpay setup checklist (for tomorrow)

1. Razorpay Dashboard → **Test Mode** → Settings → API Keys → generate → copy Key Id +
   Key Secret.
2. Vercel → divinemee → Settings → Environment Variables (Preview **and** Production):
   `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`,
   `CHECKOUT_RATE_LIMIT_SECRET`. Redeploy.
3. Razorpay → Settings → **Webhooks** → add `https://www.divinemee.com/api/razorpay/webhook`
   → secret = `RAZORPAY_WEBHOOK_SECRET` → events `payment.captured`, `payment.failed`.
4. Do a **Test‑Mode** order end‑to‑end (test card + test UPI); confirm order row,
   payment row, `/order/success`, and a webhook delivery in the dashboard.
5. Only after a clean test run, switch to **Live** keys (KYC must be on the business
   account) and repeat one controlled ₹1‑class live payment.

## 37. Production deployment checklist

1. Set all env vars above in **Production** (Supabase already set; add Razorpay + rate‑limit).
2. Merge `codex/full-prelaunch-audit` → `main` (this PR) after review.
3. Confirm migrations 004–007 are on the production DB (they are — same project).
4. Verify `apex → www`, HTTPS, security headers, and `/order/success` on the deployed URL.
5. Smoke‑test: homepage, both products, cart, guest checkout up to the Razorpay modal.

## 38. Controlled live‑payment procedure

Use one real low‑value order on a real device; verify: Razorpay dashboard shows captured
payment; one `orders` row (status confirmed, payment_status paid); matching `order_items`
and `payments`; `/order/success` renders; confirmation email received; webhook delivered
and idempotent (no duplicate order). Refund the test order from the dashboard.

## 39. Rollback plan

- **Code:** production is unchanged on `main@4fa3b7e`; if a deploy misbehaves, use Vercel
  **Instant Rollback** to the last good production deployment (rollback candidates exist).
- **DB:** migrations 004–007 are additive (`IF NOT EXISTS`, `NOT VALID`, new
  tables/functions) and backward‑compatible with the old code, so no DB rollback is
  required for a code rollback. If ever needed, drop the new tables/functions in reverse.
- **Branch:** `codex/full-prelaunch-audit` is preserved on the remote; the checkpoint
  `ebf873d` isolates pre‑fix Codex state.

## 40. Post‑launch monitoring checklist

- Razorpay dashboard: payment success rate, failures, webhook delivery health.
- Supabase: `get_advisors` (security/perf) weekly; watch `checkout_sessions` for stuck
  `pending`, and `payment_webhook_events` for `failed`.
- Vercel: runtime logs/errors on the payment routes; 5xx rate.
- Reconciliation: periodically confirm every captured Razorpay payment has exactly one
  `orders` row (the unique indexes enforce this, but monitor).
- Re‑run Lighthouse mobile after the cutout‑image downscale.

---

## Final verdict

Storefront, catalog, cart, auth, database security (RLS + the P0/P1 fixes), SEO,
accessibility, and desktop performance are **verified and launch‑ready**. The remaining
blockers are **owner‑supplied, not code defects**: Razorpay credentials (+ the one‑time
Test‑Mode run), the `CHECKOUT_RATE_LIMIT_SECRET` env var, Resend email, and the legal
policy pages. Because live Razorpay cannot be exercised today, the site is:

### READY FOR ONE CONTROLLED RAZORPAY TEST PAYMENT

(once `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, and `CHECKOUT_RATE_LIMIT_SECRET`
are set and the branch is deployed — no unresolved P0 remains, and the P1 code defects
are fixed and re‑verified).
