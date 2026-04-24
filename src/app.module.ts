import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductionOrdersModule } from './production-orders/production-orders.module';
import { HealthController } from './health.controller';
import { ProductionOrder } from './production-orders/entities/production-order.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DB_HOST');
        const port = configService.get<number>('DB_PORT');
        const username = configService.get<string>('DB_USERNAME');
        const password = configService.get<string>('DB_PASSWORD');
        const database = configService.get<string>('DB_DATABASE');

        console.log('DB CONFIG 👉', {
          host,
          port,
          username,
          password,
          database,
        });

        return {
          type: 'postgres',
          host,
          port: Number(port),
          username,
          password,
          database,

          // 🔥 TODO VA AQUÍ DENTRO
          entities: [ProductionOrder],
          synchronize: true,
        };
      },
    }),

    ProductionOrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}