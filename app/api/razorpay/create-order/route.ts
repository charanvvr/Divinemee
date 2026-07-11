import Razorpay from 'razorpay';
import { createHmac } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { addressSchema, calculateOrder, cartItemsSchema } from '@/lib/commerce';
import { isSameOriginRequest } from '@/lib/request-security';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const requestSchema = z.object({
  items: cartItemsSchema,
  customer: addressSchema,
  idempotencyKey: z.string().uuid(),
});

function clientIpHash(request: Request, secret: string) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return createHmac('sha256', secret).update(ip).digest('hex');
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid checkout details.' }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid checkout details.' }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const rateLimitSecret = process.env.CHECKOUT_RATE_LIMIT_SECRET;
  if (!keyId || !keySecret || !process.env.SUPABASE_SERVICE_ROLE_KEY || !rateLimitSecret) {
    return NextResponse.json({ error: 'Payment service is not configured.' }, { status: 503 });
  }

  try {
    const payload = parsed.data;
    const calculated = calculateOrder(payload.items);
    const service = await createServiceClient();
    const ipHash = clientIpHash(request, rateLimitSecret);

    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const { count, error: countError } = await service
      .from('checkout_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since);
    if (countError) throw countError;
    if ((count || 0) >= 10) {
      return NextResponse.json(
        { error: 'Too many checkout attempts. Please wait a few minutes.' },
        { status: 429 }
      );
    }

    const { data: existingCheckout, error: checkoutError } = await service
      .from('checkout_sessions')
      .select('id, provider_order_id, total, currency, expires_at, status')
      .eq('idempotency_key', payload.idempotencyKey)
      .maybeSingle();
    if (checkoutError) throw checkoutError;
    let checkout = existingCheckout;

    if (checkout) {
      if (checkout.status === 'paid') {
        return NextResponse.json({ error: 'This checkout is already paid.' }, { status: 409 });
      }
      if (new Date(checkout.expires_at).getTime() <= Date.now()) {
        return NextResponse.json({ error: 'Checkout expired. Please try again.' }, { status: 409 });
      }
      if (checkout.total !== calculated.total) {
        return NextResponse.json({ error: 'Checkout contents changed. Please try again.' }, { status: 409 });
      }
      if (checkout.provider_order_id) {
        return NextResponse.json({
          id: checkout.provider_order_id,
          amount: calculated.total * 100,
          currency: checkout.currency,
          keyId,
          checkoutSessionId: checkout.id,
        });
      }
    } else {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const trustedCart = calculated.items.map((item) => ({
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }));
      const inserted = await service
        .from('checkout_sessions')
        .insert({
          idempotency_key: payload.idempotencyKey,
          user_id: user?.id || null,
          customer_email: payload.customer.email,
          customer_name: payload.customer.fullName,
          customer_phone: payload.customer.phone,
          shipping_address: payload.customer,
          cart: trustedCart,
          subtotal: calculated.subtotal,
          shipping: calculated.shipping,
          total: calculated.total,
          currency: 'INR',
          ip_hash: ipHash,
        })
        .select('id, provider_order_id, total, currency, expires_at, status')
        .single();
      if (inserted.error) throw inserted.error;
      checkout = inserted.data;
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const receipt = `dm_${checkout.id.replaceAll('-', '').slice(0, 32)}`;
    const { data: claimed, error: claimError } = await service.rpc(
      'claim_checkout_order_creation',
      { p_checkout_session_id: checkout.id }
    );
    if (claimError) throw claimError;
    if (!claimed) {
      return NextResponse.json({ error: 'Checkout is already starting.' }, { status: 409 });
    }

    const previous = await razorpay.orders.all({ receipt, count: 1 });
    const recovered = previous.items[0];
    if (
      recovered &&
      (Number(recovered.amount) !== calculated.total * 100 || recovered.currency !== 'INR')
    ) {
      throw new Error('Recovered Razorpay order does not match checkout.');
    }
    const razorpayOrder = recovered || await razorpay.orders.create({
        amount: calculated.total * 100,
        currency: 'INR',
        receipt,
        notes: { store: 'Divine Mee', checkout_session_id: checkout.id },
      });

    const { error: updateError } = await service
      .from('checkout_sessions')
      .update({ provider_order_id: razorpayOrder.id, provider_order_claimed_at: null })
      .eq('id', checkout.id)
      .is('provider_order_id', null);
    if (updateError) throw updateError;

    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId,
      checkoutSessionId: checkout.id,
    });
  } catch {
    return NextResponse.json({ error: 'Unable to start payment.' }, { status: 500 });
  }
}
