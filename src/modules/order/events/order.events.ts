export const ORDER_EVENTS = {
  CREATED: 'order.created',
  STATUS_CHANGED: 'order.status_changed',
} as const;

export interface OrderCreatedEventPayload {
  orderId: number;
}

export interface OrderStatusChangedEventPayload {
  orderId: number;
  newStatus: string;
}
