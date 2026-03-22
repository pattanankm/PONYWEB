import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PonyModule } from './pony/pony.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from './customer/customer.module';
import { OrdersModule } from './orders/orders.module';
import { ReviewModule } from './review/review.module';
import { WishlistModule } from './wishlist/wishlist.module'; // อย่าลืมตัวนี้ที่เราเพิ่งทำกัน!

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
      // เพิ่ม SSL เพื่อให้ต่อกับ TiDB Cloud ได้ (ถ้ามี Host แปลว่ารันบน Render/Cloud)
      ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : null,
    }),

    PonyModule,
    CustomerModule,
    OrdersModule, 
    ReviewModule,
    WishlistModule, // เพิ่ม Module ของ Wishlist เข้าไปด้วยครับ
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}