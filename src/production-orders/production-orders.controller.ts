import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductionOrdersService } from './production-orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller()
export class ProductionOrdersController {
  constructor(private readonly ordersService: ProductionOrdersService) {}

  @MessagePattern('production.orders.create')
  async create(@Payload() data: CreateOrderDto) {
    return this.ordersService.create(data);
  }

  @MessagePattern('production.orders.findAll')
  async findAll() {
    return this.ordersService.findAll();
  }

  @MessagePattern('production.orders.complete')
  async complete(@Payload() id: string) {
    return this.ordersService.completeOrder(id);
  }
}