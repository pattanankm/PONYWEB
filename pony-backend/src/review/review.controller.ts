import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  addReview(@Body() body: { customer_id: number; pony_id: number; rating: number; comment: string }) {
    return this.reviewService.addReview(body.customer_id, body.pony_id, body.rating, body.comment);
}

  @Get(':pony_id')
  getReviews(@Param('pony_id') pony_id: number) {
    return this.reviewService.getReviews(pony_id);
  }
}