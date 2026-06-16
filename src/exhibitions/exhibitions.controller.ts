import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExhibitionsService } from './exhibitions.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
import { FilterExhibitionsDto } from './dto/filter-exhibitions.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'generated/prisma/client';

@Controller('exhibitions')
export class ExhibitionsController {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  @Get('areas')
  findAreas(@Query() query: FilterExhibitionsDto) {
    return this.exhibitionsService.findAreaStats(query.status);
  }

  @Get('admin/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllForAdmin() {
    return this.exhibitionsService.findAllForAdmin();
  }
  @Post('admin/:id/generate-description')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  generateDescriptionForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitionsService.generateDescriptionForAdmin(id);
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOneForAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitionsService.findOneForAdmin(id);
  }
  @Get()
  findAll(@Query() query: FilterExhibitionsDto) {
    return this.exhibitionsService.findAll(query);
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitionsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() body: CreateExhibitionDto) {
    return this.exhibitionsService.createExhibition(body);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExhibitionDto,
  ) {
    return this.exhibitionsService.updateExhibition(id, dto);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitionsService.deleteExhibition(id);
  }
}
