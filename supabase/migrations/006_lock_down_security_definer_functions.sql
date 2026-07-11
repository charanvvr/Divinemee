-- P0 FIX (2026-07-11 pre-launch audit)
-- Supabase grants EXECUTE on public-schema functions to the `anon` and
-- `authenticated` roles via ALTER DEFAULT PRIVILEGES set at project creation.
-- Migration 004 only did `REVOKE ... FROM PUBLIC`, which does NOT remove those
-- role-specific grants. As a result finalize_razorpay_checkout and the claim_*
-- helpers were callable directly over PostgREST (/rest/v1/rpc/...) by any anon
-- client. Because a browser knows its own checkoutSessionId (returned by
-- create-order), an attacker could call finalize_razorpay_checkout with a
-- fabricated payment id and mint a fully "paid" order WITHOUT paying.
--
-- Fix: revoke EXECUTE from every client-facing role. Only the server-side
-- service_role (used by the API routes, and which bypasses these grants anyway
-- for the app path) may invoke them. Trigger execution of handle_new_user is
-- unaffected — PostgreSQL does not check EXECUTE privilege when a trigger fires.

REVOKE EXECUTE ON FUNCTION public.finalize_razorpay_checkout(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_checkout_order_creation(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_order_confirmation_email(UUID) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.finalize_razorpay_checkout(UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_checkout_order_creation(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_order_confirmation_email(UUID) TO service_role;

-- Harden mutable search_path on the older trigger/util functions (advisor 0011).
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.prevent_profile_privilege_escalation() SET search_path = public;
