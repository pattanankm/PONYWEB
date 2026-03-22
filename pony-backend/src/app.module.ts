import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PonyModule } from './pony/pony.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from './customer/customer.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewModule } from './review/review.module';
import { PonyType } from './pony/pony-type.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'pony_shop',
      autoLoadEntities: true,
      synchronize: false,
    }),

    PonyModule,
    PonyType,
    CustomerModule,
    OrdersModule, 
    ReviewModule,
  ],
})
export class AppModule {}
