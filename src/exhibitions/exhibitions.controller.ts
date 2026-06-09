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
} from '@nestjs/common';
import { ExhibitionsService } from './exhibitions.service';
import { CreateExhibitionDto } from './dto/create-exhibition.dto';
import { UpdateExhibitionDto } from './dto/update-exhibition.dto';
import { FilterExhibitionsDto } from './dto/filter-exhibitions.dto';

@Controller('exhibitions')
export class ExhibitionsController {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  @Get('areas')
  findAreas() {
    return this.exhibitionsService.findAreaStats();
  }
  @Get()
  findAll(@Query() query: FilterExhibitionsDto) {
    return this.exhibitionsService.findAll(query.area);
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitionsService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateExhibitionDto) {
    return this.exhibitionsService.createExhibition(body);
  }
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExhibitionDto,
  ) {
    return this.exhibitionsService.updateExhibition(id, dto);
  }
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.exhibitionsService.deleteExhibition(id);
  }
}
