import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createOrder(customer_id: number, total: number, status: string, items: any[]) {
  const result = await this.dataSource.query(
    'INSERT INTO orders (customer_id, status, total, order_date) VALUES (?, ?, ?, NOW())',
    [customer_id, status ?? 'pending', total]
  );
  const orderId = result.insertId;

  // insert แต่ละ item
  for (const item of items) {
    await this.dataSource.query(
      'INSERT INTO order_item (order_id, pony_id, quantity) VALUES (?, ?, ?)',
      [orderId, item.pony_id, item.quantity ?? 1]
    );
  }

  return { order_id: orderId, message: 'Order created' };
}
}