import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { MeStatusService } from './me-status.service';
import { JwtPayload } from 'src/auth/strategy/jwt.strategy';

@Controller('exhibitions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class ExhibitionMeStatusController {
  constructor(private readonly meStatusService: MeStatusService) {}

  @Get(':id/me-status')
  getMeStatus(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.meStatusService.getForExhibition(req.user.sub, id);
  }
}
