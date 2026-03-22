import { Controller, Get } from '@nestjs/common';
import { PonyService } from './pony.service';

@Controller('ponies')
export class PonyController {
  constructor(private readonly ponyService: PonyService) {}

  @Get()
  getAllPonies() {
    return this.ponyService.findAll();
  }
}