import { Test, TestingModule } from '@nestjs/testing';
import { MeWishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

describe('MeWishlistController', () => {
  let controller: MeWishlistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeWishlistController],
      providers: [{ provide: WishlistService, useValue: { findMine: jest.fn() } }],
    }).compile();

    controller = module.get<MeWishlistController>(MeWishlistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
