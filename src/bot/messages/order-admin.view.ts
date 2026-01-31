import type { Order } from 'src/modules/order/entities/order.entity';

const SEPARATOR = '━━━━━━━━━━━━';

const statusLabel: Record<string, string> = {
  pending: 'Kutilmoqda',
  confirmed: 'Tasdiqlandi',
  completed: 'Yakunlandi',
  cancelled: 'Bekor qilindi',
};

/**
 * Formats a short list of orders for admin: #id, client name, status, total.
 */
export function formatAdminOrderList(orders: Order[]): string {
  if (!orders.length) return 'Buyurtma yo‘q.';
  const lines: string[] = ['📋 *Buyurtmalar ro‘yxati*\n'];
  for (const order of orders) {
    const name = order.user?.name ?? '—';
    const status = statusLabel[order.status] ?? order.status;
    const total = Number(order.totalSum).toLocaleString();
    lines.push(`\`#${order.id}\` ${name} | ${status} | ${total} so'm`);
  }
  return lines.join('\n');
}

/**
 * Formats order details for admin notification: client name, phone, items, total.
 */
export function formatAdminOrderMessage(order: Order): string {
  const user = order.user;
  const userName = user?.name ?? '—';
  const userPhone = user?.phone ?? '—';
  const items = order.items ?? [];
  const lines: string[] = [
    '📦 *Yangi buyurtma*',
    SEPARATOR,
    `👤 Mijoz: ${userName}`,
    `📞 Telefon: ${userPhone}`,
    `🆔 Buyurtma #${order.id}`,
    '',
  ];

  for (const item of items) {
    const product = item.product;
    const name = product?.name ?? `Mahsulot #${item.productId}`;
    const price = Number(item.price);
    const qty = item.quantity;
    const subtotal = price * qty;
    lines.push(`• ${name}: ${qty} × ${price.toLocaleString()} = ${subtotal.toLocaleString()} so'm`);
  }

  lines.push(SEPARATOR);
  const total = Number(order.totalSum);
  lines.push(`💰 *Jami:* ${total.toLocaleString()} so'm`);
  return lines.join('\n');
}
