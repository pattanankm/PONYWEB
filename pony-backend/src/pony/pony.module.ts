import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PonyController } from './pony.controller';
import { PonyService } from './pony.service';
import { Pony } from './pony.entity';
import { PonyType } from './pony-type.entity'; // ← เพิ่ม

@Module({
  imports: [TypeOrmModule.forFeature([Pony, PonyType])],
  controllers: [PonyController],
  providers: [PonyService],
})
export class PonyModule {}