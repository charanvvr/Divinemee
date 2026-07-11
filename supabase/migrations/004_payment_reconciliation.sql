-- Durable, idempotent Razorpay checkout and webhook reconciliation.

CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key UUID NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  cart JSONB NOT NULL,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  shipping INTEGER NOT NULL CHECK (shipping >= 0),
  total INTEGER NOT NULL CHECK (total > 0),
  currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  provider_order_id TEXT UNIQUE,
  provider_order_claimed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'failed', 'expired')),
  ip_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS checkout_sessions_user_created_idx
  ON public.checkout_sessions (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS checkout_sessions_ip_created_idx
  ON public.checkout_sessions (ip_hash, created_at DESC);

ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own checkout sessions" ON public.checkout_sessions;
CREATE POLICY "Users view own checkout sessions"
  ON public.checkout_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS checkout_sessions_updated_at ON public.checkout_sessions;
CREATE TRIGGER checkout_sessions_updated_at BEFORE UPDATE ON public.checkout_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing'
    CHECK (status IN ('processing', 'processed', 'failed', 'ignored')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS payment_webhook_events_updated_at ON public.payment_webhook_events;
CREATE TRIGGER payment_webhook_events_updated_at BEFORE UPDATE ON public.payment_webhook_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS checkout_session_id UUID
    REFERENCES public.checkout_sessions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS confirmation_token_expires_at TIMESTAMPTZ
    NOT NULL DEFAULT (now() + interval '30 days'),
  ADD COLUMN IF NOT EXISTS confirmation_email_claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmation_email_sent_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS orders_checkout_session_idx
  ON public.orders (checkout_session_id) WHERE checkout_session_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_order_idx
  ON public.orders (razorpay_order_id) WHERE razorpay_order_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.finalize_razorpay_checkout(
  p_checkout_session_id UUID,
  p_provider_order_id TEXT,
  p_provider_payment_id TEXT,
  p_signature TEXT DEFAULT NULL
)
RETURNS TABLE (
  order_id UUID,
  order_number TEXT,
  confirmation_token UUID,
  customer_email TEXT,
  order_total INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.checkout_sessions%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_number TEXT;
BEGIN
  SELECT * INTO v_session
  FROM public.checkout_sessions
  WHERE id = p_checkout_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'checkout_session_not_found';
  END IF;

  IF v_session.provider_order_id IS NULL THEN
    UPDATE public.checkout_sessions
    SET provider_order_id = p_provider_order_id
    WHERE id = v_session.id;
  ELSIF v_session.provider_order_id <> p_provider_order_id THEN
    RAISE EXCEPTION 'provider_order_mismatch';
  END IF;

  SELECT o.* INTO v_order
  FROM public.orders o
  WHERE o.checkout_session_id = v_session.id;

  IF FOUND THEN
    RETURN QUERY SELECT v_order.id, v_order.order_number, v_order.confirmation_token,
      v_session.customer_email, v_order.total;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.payments p
    WHERE p.provider_payment_id = p_provider_payment_id
  ) THEN
    RAISE EXCEPTION 'provider_payment_already_used';
  END IF;

  v_number := 'DM-' || to_char(now() AT TIME ZONE 'UTC', 'YYYYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  INSERT INTO public.orders (
    order_number, checkout_session_id, user_id, guest_email, guest_name, guest_phone,
    status, payment_status, subtotal, shipping, total, payment_method,
    razorpay_order_id, razorpay_payment_id, razorpay_signature, shipping_address
  ) VALUES (
    v_number, v_session.id, v_session.user_id, v_session.customer_email,
    v_session.customer_name, v_session.customer_phone, 'confirmed', 'paid',
    v_session.subtotal, v_session.shipping, v_session.total, 'razorpay',
    p_provider_order_id, p_provider_payment_id, p_signature, v_session.shipping_address
  ) RETURNING * INTO v_order;

  INSERT INTO public.order_items (
    order_id, product_id, product_name, quantity, price, total
  )
  SELECT v_order.id, item.product_id, item.product_name, item.quantity, item.price, item.total
  FROM jsonb_to_recordset(v_session.cart) AS item(
    product_id TEXT,
    product_name TEXT,
    quantity INTEGER,
    price INTEGER,
    total INTEGER
  );

  INSERT INTO public.payments (
    order_id, provider, provider_order_id, provider_payment_id,
    amount, currency, status, signature
  ) VALUES (
    v_order.id, 'razorpay', p_provider_order_id, p_provider_payment_id,
    v_session.total, 'INR', 'captured', p_signature
  );

  UPDATE public.checkout_sessions SET status = 'paid' WHERE id = v_session.id;

  RETURN QUERY SELECT v_order.id, v_order.order_number, v_order.confirmation_token,
    v_session.customer_email, v_order.total;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_order_confirmation_email(p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_claimed UUID;
BEGIN
  UPDATE public.orders
  SET confirmation_email_claimed_at = now()
  WHERE id = p_order_id
    AND confirmation_email_sent_at IS NULL
    AND (
      confirmation_email_claimed_at IS NULL OR
      confirmation_email_claimed_at < now() - interval '10 minutes'
    )
  RETURNING id INTO v_claimed;
  RETURN v_claimed IS NOT NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_checkout_order_creation(p_checkout_session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_claimed UUID;
BEGIN
  UPDATE public.checkout_sessions
  SET provider_order_claimed_at = now()
  WHERE id = p_checkout_session_id
    AND provider_order_id IS NULL
    AND status = 'pending'
    AND (
      provider_order_claimed_at IS NULL OR
      provider_order_claimed_at < now() - interval '2 minutes'
    )
  RETURNING id INTO v_claimed;
  RETURN v_claimed IS NOT NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_razorpay_checkout(UUID, TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_order_confirmation_email(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_checkout_order_creation(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.finalize_razorpay_checkout(UUID, TEXT, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_order_confirmation_email(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_checkout_order_creation(UUID) TO service_role;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_price_nonnegative,
  DROP CONSTRAINT IF EXISTS products_mrp_valid;
ALTER TABLE public.products
  ADD CONSTRAINT products_price_nonnegative CHECK (price >= 0),
  ADD CONSTRAINT products_mrp_valid CHECK (mrp >= price);

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_amounts_valid;
ALTER TABLE public.orders
  ADD CONSTRAINT orders_amounts_valid
    CHECK (subtotal >= 0 AND shipping >= 0 AND total = subtotal + shipping);

ALTER TABLE public.order_items
  DROP CONSTRAINT IF EXISTS order_items_amounts_valid;
ALTER TABLE public.order_items
  ADD CONSTRAINT order_items_amounts_valid
    CHECK (price >= 0 AND total = price * quantity);

DROP POLICY IF EXISTS "Users manage own wishlist" ON public.wishlist;
CREATE POLICY "Users manage own wishlist"
  ON public.wishlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Keep exactly one default address per customer and switch it atomically.
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at) AS position
  FROM public.addresses
  WHERE is_default
)
UPDATE public.addresses
SET is_default = false
WHERE id IN (SELECT id FROM ranked WHERE position > 1);

CREATE UNIQUE INDEX IF NOT EXISTS addresses_one_default_per_user_idx
  ON public.addresses (user_id) WHERE is_default;

CREATE OR REPLACE FUNCTION public.set_default_address(p_address_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.addresses WHERE id = p_address_id AND user_id = v_user_id
  ) THEN
    RAISE EXCEPTION 'address_not_found';
  END IF;

  UPDATE public.addresses SET is_default = false WHERE user_id = v_user_id AND is_default;
  UPDATE public.addresses SET is_default = true WHERE id = p_address_id AND user_id = v_user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.set_default_address(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_default_address(UUID) TO authenticated;
