import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pony } from './pony.entity';

@Injectable()
export class PonyService {
  constructor(
    @InjectRepository(Pony)
    private ponyRepository: Repository<Pony>,
  ) {}

  findAll() {
    // ใช้ relations เพื่อทำการ JOIN กับตาราง pony_type อัตโนมัติ
    // (ตรวจสอบใน pony.entity.ts ว่าคุณตั้งชื่อความสัมพันธ์ว่า 'type' หรือ 'pony_type')
    return this.ponyRepository.find({
      relations: ['pony_type'], 
    });
  }
}