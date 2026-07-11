import { Resend } from 'resend';

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    };
    return entities[character];
  });
}

export async function sendOrderConfirmation({
  email,
  orderNumber,
  total,
}: {
  email: string;
  orderNumber: string;
  total: number;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const resend = new Resend(apiKey);
  const safeOrderNumber = escapeHtml(orderNumber);
  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Divine Mee <orders@divinemee.com>',
    to: email,
    subject: `Order ${orderNumber} confirmed`,
    html: `<h1>Your Divine Mee order is confirmed</h1><p>Order <strong>${safeOrderNumber}</strong> has been paid successfully.</p><p>Total: ₹${total}</p><p>We will send another update when it ships.</p>`,
  });
  if (error) throw new Error('Order email provider rejected the message.');
  return true;
}
