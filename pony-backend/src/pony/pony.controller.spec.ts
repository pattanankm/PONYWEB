import { Test, TestingModule } from '@nestjs/testing';
import { PonyController } from './pony.controller';

describe('PonyController', () => {
  let controller: PonyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PonyController],
    }).compile();

    controller = module.get<PonyController>(PonyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
