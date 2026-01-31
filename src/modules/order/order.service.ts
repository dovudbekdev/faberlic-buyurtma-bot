import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderStatus, type OrderStatusType } from './constants/order-status.constant';
import {
  ORDER_EVENTS,
  type OrderCreatedEventPayload,
  type OrderStatusChangedEventPayload,
} from './events/order.events';

export interface CreateOrderItemDto {
  productId: number;
  quantity: number;
  price: number;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findByUserId(
    userId: number,
    options?: { limit?: number },
  ): Promise<Order[]> {
    const limit = options?.limit ?? 10;
    return this.orderRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['items'],
    });
  }

  async findOneWithDetails(id: number): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'items', 'items.product'],
    });
  }

  async findPending(options?: { limit?: number }): Promise<Order[]> {
    const limit = options?.limit ?? 20;
    return this.orderRepository.find({
      where: { status: OrderStatus.PENDING },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user', 'items', 'items.product'],
    });
  }

  async findAll(options?: { limit?: number }): Promise<Order[]> {
    const limit = options?.limit ?? 20;
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user', 'items', 'items.product'],
    });
  }

  async findConfirmed(options?: { limit?: number }): Promise<Order[]> {
    const limit = options?.limit ?? 20;
    return this.orderRepository.find({
      where: { status: OrderStatus.CONFIRMED },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user', 'items', 'items.product'],
    });
  }

  async createOrder(
    userId: number,
    items: CreateOrderItemDto[],
  ): Promise<Order> {
    const totalSum = items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0,
    );

    const order = this.orderRepository.create({
      userId,
      status: OrderStatus.PENDING,
      totalSum,
    });
    const savedOrder = await this.orderRepository.save(order);

    const orderItems = items.map((item) =>
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      }),
    );
    await this.orderItemRepository.save(orderItems);

    const payload: OrderCreatedEventPayload = { orderId: savedOrder.id };
    this.eventEmitter.emit(ORDER_EVENTS.CREATED, payload);

    return savedOrder;
  }

  async updateStatus(
    orderId: number,
    status: OrderStatusType,
  ): Promise<Order | null> {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) return null;

    order.status = status;
    await this.orderRepository.save(order);

    const payload: OrderStatusChangedEventPayload = { orderId, newStatus: status };
    this.eventEmitter.emit(ORDER_EVENTS.STATUS_CHANGED, payload);

    return order;
  }
}
