import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendOrderConfirmationOnce, type ConfirmedOrder } from '@/lib/order-confirmation';
import { verifyCheckoutSignature } from '@/lib/payment-security';
import { isSameOriginRequest } from '@/lib/request-security';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i),
  checkoutSessionId: z.string().uuid(),
});

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid payment details.' }, { status: 400 });
  }
  const parsed = payloadSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payment details.' }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Checkout is not configured.' }, { status: 503 });
  }

  try {
    const payload = parsed.data;
    if (!verifyCheckoutSignature(
      keySecret,
      payload.razorpay_order_id,
      payload.razorpay_payment_id,
      payload.razorpay_signature
    )) {
      return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
    }

    const service = await createServiceClient();
    const { data: checkout, error: checkoutError } = await service
      .from('checkout_sessions')
      .select('id, provider_order_id, total, currency')
      .eq('id', payload.checkoutSessionId)
      .maybeSingle();
    if (checkoutError) throw checkoutError;
    if (!checkout || checkout.provider_order_id !== payload.razorpay_order_id) {
      return NextResponse.json({ error: 'Payment does not belong to this checkout.' }, { status: 400 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const [remoteOrder, fetchedPayment] = await Promise.all([
      razorpay.orders.fetch(payload.razorpay_order_id),
      razorpay.payments.fetch(payload.razorpay_payment_id),
    ]);
    const expectedPaise = checkout.total * 100;
    const payment = fetchedPayment.status === 'authorized'
      ? await razorpay.payments.capture(payload.razorpay_payment_id, expectedPaise, 'INR')
      : fetchedPayment;
    const noteSessionId = String(remoteOrder.notes?.checkout_session_id || '');

    if (
      payment.order_id !== payload.razorpay_order_id ||
      payment.status !== 'captured' ||
      Number(remoteOrder.amount) !== expectedPaise ||
      Number(payment.amount) !== expectedPaise ||
      remoteOrder.currency !== 'INR' ||
      payment.currency !== 'INR' ||
      noteSessionId !== checkout.id
    ) {
      return NextResponse.json({ error: 'Payment could not be validated.' }, { status: 400 });
    }

    const { data, error } = await service.rpc('finalize_razorpay_checkout', {
      p_checkout_session_id: checkout.id,
      p_provider_order_id: payload.razorpay_order_id,
      p_provider_payment_id: payload.razorpay_payment_id,
      p_signature: payload.razorpay_signature,
    });
    if (error || !data?.[0]) throw error || new Error('Order finalization failed.');
    const order = data[0] as ConfirmedOrder;
    await sendOrderConfirmationOnce(service, order);

    return NextResponse.json({ orderNumber: order.order_number, token: order.confirmation_token });
  } catch {
    return NextResponse.json({ error: 'Unable to confirm your order.' }, { status: 500 });
  }
}
