import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductionOrdersController } from './production-orders.controller';
import { ProductionOrdersService } from './production-orders.service';
import { ProductionOrder } from './entities/production-order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductionOrder]),
  ],
  controllers: [ProductionOrdersController],
  providers: [ProductionOrdersService],
})
export class ProductionOrdersModule {}