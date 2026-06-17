import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/prisma/prisma.service';
import { WishlistCleanupService } from './wishlist-cleanup.service';

describe('WishlistCleanupService', () => {
  let service: WishlistCleanupService;
  const deleteMany = jest.fn().mockResolvedValue({ count: 3 });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistCleanupService,
        { provide: PrismaService, useValue: { wishlist: { deleteMany } } },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(WishlistCleanupService);
    deleteMany.mockClear();
  });

  it('stale 찜 deleteMany 호출', async () => {
    await service.purgeStaleWishlists();
    expect(deleteMany).toHaveBeenCalledWith({
      where: { exhibition: expect.objectContaining({ OR: expect.any(Array) }) },
    });
  });
});
