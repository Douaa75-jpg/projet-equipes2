import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CongeService } from './conge.service';
import { CreateCongeDto } from './dto/create-conge.dto';
import { UpdateCongeDto } from './dto/update-conge.dto';

@Controller('conge')
export class CongeController {
  constructor(private readonly congeService: CongeService) {}

  @Post()
  create(@Body() createCongeDto: CreateCongeDto) {
    return this.congeService.create(createCongeDto);
  }

  @Get()
  findAll() {
    return this.congeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.congeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCongeDto: UpdateCongeDto) {
    return this.congeService.update(+id, updateCongeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.congeService.remove(+id);
  }
}
