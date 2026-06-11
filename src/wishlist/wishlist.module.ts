import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import {
  ExhibitionWishlistController,
  MeWishlistController,
} from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [MeWishlistController, ExhibitionWishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
