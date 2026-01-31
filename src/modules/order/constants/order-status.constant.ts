export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export type OrderStatusType =
  (typeof OrderStatus)[keyof typeof OrderStatus];
