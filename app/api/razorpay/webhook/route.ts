import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendOrderConfirmationOnce, type ConfirmedOrder } from '@/lib/order-confirmation';
import { verifyHmacHex } from '@/lib/payment-security';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const paymentSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.string(),
}).passthrough();

const eventSchema = z.object({
  event: z.string(),
  payload: z.object({
    payment: z.object({ entity: paymentSchema }).optional(),
  }).passthrough(),
}).passthrough();

export async function POST(request: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const signature = request.headers.get('x-razorpay-signature') || '';
  const eventId = request.headers.get('x-razorpay-event-id') || '';
  const rawBody = await request.text();

  if (!webhookSecret || !keyId || !keySecret || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 });
  }
  if (!eventId || !verifyHmacHex(webhookSecret, rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });
  }
  const parsed = eventSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid webhook payload.' }, { status: 400 });

  const service = await createServiceClient();
  const eventType = parsed.data.event;
  const { data: existing } = await service
    .from('payment_webhook_events')
    .select('status')
    .eq('event_id', eventId)
    .maybeSingle();
  if (existing?.status === 'processed' || existing?.status === 'ignored') {
    return NextResponse.json({ received: true });
  }
  if (!existing) {
    const { error } = await service.from('payment_webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      status: 'processing',
    });
    if (error) return NextResponse.json({ received: true });
  } else {
    await service
      .from('payment_webhook_events')
      .update({ status: 'processing' })
      .eq('event_id', eventId);
  }

  try {
    if (!['payment.captured', 'payment.failed'].includes(eventType)) {
      await service
        .from('payment_webhook_events')
        .update({ status: 'ignored' })
        .eq('event_id', eventId);
      return NextResponse.json({ received: true });
    }

    const eventPayment = parsed.data.payload.payment?.entity;
    if (!eventPayment) throw new Error('Webhook payment is missing.');

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const [remoteOrder, payment] = await Promise.all([
      razorpay.orders.fetch(eventPayment.order_id),
      razorpay.payments.fetch(eventPayment.id),
    ]);
    const checkoutSessionId = String(remoteOrder.notes?.checkout_session_id || '');
    const { data: checkout, error: checkoutError } = await service
      .from('checkout_sessions')
      .select('id, provider_order_id, total, currency')
      .eq('id', checkoutSessionId)
      .maybeSingle();
    if (checkoutError || !checkout) throw checkoutError || new Error('Checkout not found.');

    if (eventType === 'payment.failed') {
      await service
        .from('checkout_sessions')
        .update({ status: 'failed' })
        .eq('id', checkout.id)
        .neq('status', 'paid');
    } else {
      const expectedPaise = checkout.total * 100;
      if (
        payment.status !== 'captured' ||
        payment.order_id !== remoteOrder.id ||
        Number(payment.amount) !== expectedPaise ||
        Number(remoteOrder.amount) !== expectedPaise ||
        payment.currency !== 'INR' ||
        remoteOrder.currency !== 'INR' ||
        (checkout.provider_order_id && checkout.provider_order_id !== remoteOrder.id)
      ) {
        throw new Error('Webhook payment validation failed.');
      }

      const { data, error } = await service.rpc('finalize_razorpay_checkout', {
        p_checkout_session_id: checkout.id,
        p_provider_order_id: remoteOrder.id,
        p_provider_payment_id: payment.id,
        p_signature: null,
      });
      if (error || !data?.[0]) throw error || new Error('Order finalization failed.');
      await sendOrderConfirmationOnce(service, data[0] as ConfirmedOrder);
    }

    await service
      .from('payment_webhook_events')
      .update({ status: 'processed' })
      .eq('event_id', eventId);
    return NextResponse.json({ received: true });
  } catch {
    await service
      .from('payment_webhook_events')
      .update({ status: 'failed' })
      .eq('event_id', eventId);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
