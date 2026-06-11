import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtPayload } from 'src/auth/strategy/jwt.strategy';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Role } from 'generated/prisma/client';
import { Roles } from 'src/auth/decorator/roles.decorator';

/** 경로 me , exhibitions 두개 컨트롤러 필요  */
@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class MeWishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get('wishlist')
  findMine(@Req() req: { user: JwtPayload }) {
    return this.wishlistService.findMine(req.user.sub);
  }
}

@Controller('exhibitions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class ExhibitionWishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post(':id/wishlist')
  add(@Req() req: { user: JwtPayload }, @Param('id', ParseIntPipe) id: number) {
    return this.wishlistService.addWishlist(req.user.sub, id);
  }

  @Delete(':id/wishlist')
  remove(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.wishlistService.removeWishlist(req.user.sub, id);
  }
}
