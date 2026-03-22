import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pony_type')
export class PonyType {
  @PrimaryGeneratedColumn()
  type_id: number;

  @Column()
  type_name: string;

  @Column({ nullable: true })
  special_ability: string;
}