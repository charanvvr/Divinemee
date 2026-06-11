import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { cartItemsSchema, calculateOrder } from '@/lib/commerce';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json({ error: 'Payment service is not configured.' }, { status: 503 });
  }

  try {
    const parsed = cartItemsSchema.safeParse((await request.json()).items);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid cart.' }, { status: 400 });
    }

    const order = calculateOrder(parsed.data);
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const razorpayOrder = await razorpay.orders.create({
      amount: order.total * 100,
      currency: 'INR',
      receipt: `dm_${Date.now()}`,
      notes: { store: 'Divine Mee' },
    });

    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation failed', error);
    return NextResponse.json({ error: 'Unable to start payment.' }, { status: 500 });
  }
}
