import { Test, TestingModule } from '@nestjs/testing';
import { MeStatusService } from './me-status.service';

describe('MeStatusService', () => {
  let service: MeStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeStatusService],
    }).compile();

    service = module.get<MeStatusService>(MeStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
