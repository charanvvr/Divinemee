import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { Resend } from 'resend';
import { z } from 'zod';
import { addressSchema, calculateOrder, cartItemsSchema, makeOrderNumber } from '@/lib/commerce';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const payloadSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i),
  items: cartItemsSchema,
  customer: addressSchema,
});

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!keyId || !keySecret || !serviceRole) {
    return NextResponse.json({ error: 'Checkout is not configured.' }, { status: 503 });
  }

  try {
    const parsed = payloadSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payment details.' }, { status: 400 });
    }
    const payload = parsed.data;
    const expected = createHmac('sha256', keySecret)
      .update(`${payload.razorpay_order_id}|${payload.razorpay_payment_id}`)
      .digest();
    const received = Buffer.from(payload.razorpay_signature, 'hex');
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const [remoteOrder, fetchedPayment] = await Promise.all([
      razorpay.orders.fetch(payload.razorpay_order_id),
      razorpay.payments.fetch(payload.razorpay_payment_id),
    ]);
    const payment = fetchedPayment.status === 'authorized'
      ? await razorpay.payments.capture(
          payload.razorpay_payment_id,
          Number(fetchedPayment.amount),
          fetchedPayment.currency
        )
      : fetchedPayment;
    const calculated = calculateOrder(payload.items);
    if (
      payment.order_id !== payload.razorpay_order_id ||
      payment.status !== 'captured' ||
      Number(remoteOrder.amount) !== calculated.total * 100 ||
      Number(payment.amount) !== calculated.total * 100 ||
      payment.currency !== 'INR'
    ) {
      return NextResponse.json({ error: 'Payment could not be validated.' }, { status: 400 });
    }

    const service = await createServiceClient();
    const { data: existing } = await service
      .from('payments')
      .select('order_id, orders(order_number, confirmation_token)')
      .eq('provider_payment_id', payload.razorpay_payment_id)
      .maybeSingle();
    if (existing?.orders) {
      const order = Array.isArray(existing.orders) ? existing.orders[0] : existing.orders;
      return NextResponse.json({
        orderNumber: order.order_number,
        token: order.confirmation_token,
      });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const orderNumber = makeOrderNumber();
    const { data: order, error: orderError } = await service
      .from('orders')
      .insert({
        order_number: orderNumber,
        user_id: user?.id || null,
        guest_email: payload.customer.email,
        guest_name: payload.customer.fullName,
        guest_phone: payload.customer.phone,
        status: 'confirmed',
        payment_status: 'paid',
        subtotal: calculated.subtotal,
        shipping: calculated.shipping,
        total: calculated.total,
        payment_method: 'razorpay',
        shipping_address: payload.customer,
      })
      .select('id, confirmation_token')
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await service.from('order_items').insert(
      calculated.items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }))
    );
    if (itemsError) throw itemsError;

    const { error: paymentError } = await service.from('payments').insert({
      order_id: order.id,
      provider: 'razorpay',
      provider_order_id: payload.razorpay_order_id,
      provider_payment_id: payload.razorpay_payment_id,
      amount: calculated.total,
      currency: 'INR',
      status: 'captured',
      signature: payload.razorpay_signature,
    });
    if (paymentError) throw paymentError;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Divine Mee <onboarding@resend.dev>',
        to: payload.customer.email,
        subject: `Order ${orderNumber} confirmed`,
        html: `<h1>Your Divine Mee order is confirmed</h1><p>Order <strong>${orderNumber}</strong> has been paid successfully.</p><p>Total: ₹${calculated.total}</p><p>We will send another update when it ships.</p>`,
      });
    }

    return NextResponse.json({ orderNumber, token: order.confirmation_token });
  } catch (error) {
    console.error('Payment verification failed', error);
    return NextResponse.json({ error: 'Unable to confirm your order.' }, { status: 500 });
  }
}
