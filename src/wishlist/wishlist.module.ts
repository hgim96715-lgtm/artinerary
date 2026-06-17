import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import {
  ExhibitionWishlistController,
  MeWishlistController,
} from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { WishlistCleanupService } from './wishlist-cleanup.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MeWishlistController, ExhibitionWishlistController],
  providers: [WishlistService, WishlistCleanupService],
})
export class WishlistModule {}
