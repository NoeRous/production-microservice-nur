import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionOrder, OrderStatus } from './entities/production-order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export const KAFKA_TRANSPORT = 'KAFKA_TRANSPORT';

@Injectable()
export class ProductionOrdersService {
  private readonly logger = new Logger(ProductionOrdersService.name);
  private kafkaProducer: any;

  constructor(
    @InjectRepository(ProductionOrder)
    private readonly orderRepository: Repository<ProductionOrder>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      const { Kafka } = require('kafkajs');
      const kafka = new Kafka({
        clientId: this.configService.get('KAFKA_CLIENT_ID'),
        brokers: [this.configService.get('KAFKA_BROKER')],
      });

      this.kafkaProducer = kafka.producer();
      await this.kafkaProducer.connect();
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.error('Failed to connect Kafka producer', error);
    }
  }

  async onModuleDestroy() {
    if (this.kafkaProducer) {
      await this.kafkaProducer.disconnect();
    }
  }

  async create(createOrderDto: CreateOrderDto): Promise<ProductionOrder> {
    const order = this.orderRepository.create({
      productionDate: new Date(createOrderDto.productionDate),
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepository.save(order);
    this.logger.log(`Order created: ${savedOrder.id}`);

    await this.emitEvent('production_order_created', {
      id: savedOrder.id,
      productionDate: savedOrder.productionDate,
      status: savedOrder.status,
      createdAt: savedOrder.createdAt,
    });

    return savedOrder;
  }

  async findAll(): Promise<ProductionOrder[]> {
    return this.orderRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async completeOrder(id: string): Promise<ProductionOrder> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new NotFoundException(`Order ${id} is already completed`);
    }

    order.status = OrderStatus.COMPLETED;
    const updatedOrder = await this.orderRepository.save(order);
    this.logger.log(`Order completed: ${updatedOrder.id}`);

    await this.emitEvent('production_order_completed', {
      id: updatedOrder.id,
      productionDate: updatedOrder.productionDate,
      status: updatedOrder.status,
      createdAt: updatedOrder.createdAt,
    });

    return updatedOrder;
  }

  private async emitEvent(event: string, data: any): Promise<void> {
    if (!this.kafkaProducer) {
      this.logger.warn('Kafka producer not available, skipping event emission');
      return;
    }

    try {
      await this.kafkaProducer.send({
        topic: 'production-orders',
        messages: [
          {
            key: String(data.id),
            value: JSON.stringify({ event, data, timestamp: new Date().toISOString() }),
          },
        ],
      });
      this.logger.log(`Event emitted: ${event}`);
    } catch (error) {
      this.logger.error(`Failed to emit event ${event}`, error);
    }
  }
}