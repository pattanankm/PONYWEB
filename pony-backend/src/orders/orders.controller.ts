import { Controller, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
createOrder(@Body() body: { customer_id: number; total: number; status: string; items: any[] }) {
  return this.ordersService.createOrder(body.customer_id, body.total, body.status, body.items);
}
}