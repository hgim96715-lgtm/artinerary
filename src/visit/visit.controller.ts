import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from 'generated/prisma/client';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { VisitService } from './visit.service';
import { JwtPayload } from 'src/auth/strategy/jwt.strategy';
import { UpsertVisitDto } from './dto/upsert-visit.dto';

@Controller('me')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class MeVisitController {
  constructor(private readonly visitService: VisitService) {}

  @Get('visits')
  findMin(@Req() req: { user: JwtPayload }) {
    return this.visitService.findMine(req.user.sub);
  }
}

@Controller('exhibitions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class ExhibitionVisitController {
  constructor(private readonly visitService: VisitService) {}

  @Post(':id/visits')
  upsert(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertVisitDto,
  ) {
    return this.visitService.upsertForExhibition(req.user.sub, id, dto);
  }
}

@Controller('visits')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
export class VisitController {
  constructor(private readonly visitService: VisitService) {}
  @Patch(':id')
  update(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertVisitDto,
  ) {
    return this.visitService.updateMine(req.user.sub, id, dto);
  }
  @Delete(':id')
  remove(
    @Req() req: { user: JwtPayload },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.visitService.removeMine(req.user.sub, id);
  }
}
