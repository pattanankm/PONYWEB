import { Test, TestingModule } from '@nestjs/testing';
import { PonyService } from './pony.service';

describe('PonyService', () => {
  let service: PonyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PonyService],
    }).compile();

    service = module.get<PonyService>(PonyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
