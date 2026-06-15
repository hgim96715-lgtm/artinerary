import { Test, TestingModule } from '@nestjs/testing';
import { ExhibitionMeStatusController } from './me-status.controller';
import { MeStatusService } from './me-status.service';

describe('ExhibitionMeStatusController', () => {
  let controller: ExhibitionMeStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExhibitionMeStatusController],
      providers: [
        {
          provide: MeStatusService,
          useValue: { getForExhibition: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ExhibitionMeStatusController>(
      ExhibitionMeStatusController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
