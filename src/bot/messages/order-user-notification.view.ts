import { OrderStatus } from 'src/modules/order/constants/order-status.constant';

/**
 * Returns user-facing message when order status changes.
 */
export function getUserStatusMessage(newStatus: string): string {
  switch (newStatus) {
    case OrderStatus.CONFIRMED:
      return '✅ Buyurtmangiz tasdiqlandi. Tez orada siz bilan bog‘lanamiz.';
    case OrderStatus.COMPLETED:
      return '🎉 Buyurtmangiz yakunlandi. Rahmat!';
    case OrderStatus.CANCELLED:
      return '❌ Buyurtmangiz bekor qilindi. Savollaringiz bo‘lsa, biz bilan bog‘laning.';
    default:
      return `Buyurtma holati yangilandi: ${newStatus}.`;
  }
}
