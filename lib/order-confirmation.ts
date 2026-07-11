import type { SupabaseClient } from '@supabase/supabase-js';
import { sendOrderConfirmation } from '@/lib/order-email';

export type ConfirmedOrder = {
  order_id: string;
  order_number: string;
  confirmation_token: string;
  customer_email: string;
  order_total: number;
};

export async function sendOrderConfirmationOnce(
  service: SupabaseClient,
  order: ConfirmedOrder
) {
  const { data: claimed, error: claimError } = await service.rpc(
    'claim_order_confirmation_email',
    { p_order_id: order.order_id }
  );
  if (claimError || !claimed) return;

  try {
    const sent = await sendOrderConfirmation({
      email: order.customer_email,
      orderNumber: order.order_number,
      total: order.order_total,
    });
    if (!sent) throw new Error('Order email is not configured.');
    await service
      .from('orders')
      .update({ confirmation_email_sent_at: new Date().toISOString(), confirmation_email_claimed_at: null })
      .eq('id', order.order_id);
  } catch {
    await service
      .from('orders')
      .update({ confirmation_email_claimed_at: null })
      .eq('id', order.order_id)
      .is('confirmation_email_sent_at', null);
  }
}
