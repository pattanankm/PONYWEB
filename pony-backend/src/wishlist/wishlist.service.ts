import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class WishlistService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async addToWishlist(customer_id: number, pony_id: number) {
    const result = await this.dataSource.query(
      'INSERT INTO wishlist_item (customer_id, pony_id, added_date) VALUES (?, ?, NOW())',
      [customer_id, pony_id]
    );
    return { wishlist_id: result.insertId, message: 'Added to wishlist' };
  }

  async getWishlist(customer_id: number) {
    return this.dataSource.query(
      `SELECT w.*, p.name, p.price, p.rarity 
       FROM wishlist_item w 
       JOIN pony p ON w.pony_id = p.pony_id 
       WHERE w.customer_id = ?`,
      [customer_id]
    );
  }

  async removeFromWishlist(wishlist_id: number) {
    await this.dataSource.query(
      'DELETE FROM wishlist_item WHERE wishlist_id = ?',
      [wishlist_id]
    );
    return { message: 'Removed from wishlist' };
  }
}