/** Admin main menu (reply keyboard) */
export const ADMIN_MENU_PENDING_ORDERS = '⏳ Kutilayotgan buyurtmalar';
export const ADMIN_MENU_ALL_ORDERS = '📋 Barcha buyurtmalar';
export const ADMIN_MENU_COMPLETE_DELIVERED = '✅ Topshirilganlarni yakunlash';

/** Admin order action callbacks: admin_order:confirm:id, admin_order:complete:id, admin_order:cancel:id */
export const ADMIN_ORDER_CONFIRM_PREFIX = 'admin_order:confirm:';
export const ADMIN_ORDER_COMPLETE_PREFIX = 'admin_order:complete:';
export const ADMIN_ORDER_CANCEL_PREFIX = 'admin_order:cancel:';

export const ADMIN_ORDER_CONFIRM_REGEX = /^admin_order:confirm:(\d+)$/;
export const ADMIN_ORDER_COMPLETE_REGEX = /^admin_order:complete:(\d+)$/;
export const ADMIN_ORDER_CANCEL_REGEX = /^admin_order:cancel:(\d+)$/;

export function getAdminOrderConfirmCallback(orderId: number): string {
  return `${ADMIN_ORDER_CONFIRM_PREFIX}${orderId}`;
}
export function getAdminOrderCompleteCallback(orderId: number): string {
  return `${ADMIN_ORDER_COMPLETE_PREFIX}${orderId}`;
}
export function getAdminOrderCancelCallback(orderId: number): string {
  return `${ADMIN_ORDER_CANCEL_PREFIX}${orderId}`;
}
