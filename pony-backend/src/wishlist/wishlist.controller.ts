import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { WishlistService } from './wishlist.service';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  addToWishlist(@Body() body: { customer_id: number; pony_id: number }) {
    return this.wishlistService.addToWishlist(Number(body.customer_id), Number(body.pony_id));
  }

  @Get(':customer_id')
  getWishlist(@Param('customer_id') customer_id: string) {
    // ใส่ + หน้าตัวแปรเพื่อแปลง string จาก URL เป็น number
    return this.wishlistService.getWishlist(+customer_id);
  }

  @Delete(':wishlist_id')
  removeFromWishlist(@Param('wishlist_id') wishlist_id: string) {
    return this.wishlistService.removeFromWishlist(+wishlist_id);
  }
}