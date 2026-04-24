import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductionOrdersModule } from './production-orders/production-orders.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ProductionOrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}