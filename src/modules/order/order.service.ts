import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';

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
      status: 'pending',
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

    return savedOrder;
  }
}
