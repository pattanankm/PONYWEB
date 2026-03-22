import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PonyType } from './pony-type.entity';

@Entity('pony')
export class Pony {
  @PrimaryGeneratedColumn()
  pony_id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  rarity: string;

  @Column()
  type_id: number;

  // เพิ่มส่วนนี้เพื่อเชื่อมความสัมพันธ์
  @ManyToOne(() => PonyType)
  @JoinColumn({ name: 'type_id' }) // บอกว่าใช้คอลัมน์ type_id ในการเชื่อม
  pony_type: PonyType; 
}