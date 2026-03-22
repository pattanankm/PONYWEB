import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ReviewService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async addReview(customer_id: number, pony_id: number, rating: number, comment: string) {
  await this.dataSource.query(
    'INSERT INTO review (customer_id, pony_id, rating, comment) VALUES (?, ?, ?, ?)',
    [customer_id, pony_id, rating, comment]
  );
  return { message: 'Review added' };
}

  async getReviews(pony_id: number) {
    return this.dataSource.query(
      'SELECT r.*, c.username FROM review r JOIN customer c ON r.customer_id = c.customer_id WHERE r.pony_id = ?',
      [pony_id]
    );
  }
}