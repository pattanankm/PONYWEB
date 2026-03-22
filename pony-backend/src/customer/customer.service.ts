import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async register(username: string, email: string, password: string) {
  const existing = await this.customerRepository.findOne({
    where: [{ username }, { email }],
  });
  if (existing) throw new ConflictException('Username or email already exists');
  const hashed = await bcrypt.hash(password, 10);
  const customer = this.customerRepository.create({ username, email, password: hashed });
  const saved = await this.customerRepository.save(customer);
  const { password: _, ...result } = saved; // ← เพิ่มตรงนี้
  return result;
}

async login(email: string, password: string) {
  const customer = await this.customerRepository.findOne({ where: { email } });
  if (!customer) throw new UnauthorizedException('Invalid credentials');
  const valid = await bcrypt.compare(password, customer.password);
  if (!valid) throw new UnauthorizedException('Invalid credentials');
  const { password: _, ...result } = customer;
  return result;
}
}