import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateTagDto, UpdateTagDto } from './tag.dto';

@Controller('tags')
export class TagsController {
  
  @Post()
  create(@Body() createTagDto: CreateTagDto) {
    return {
      message: 'This action adds a new tag',
      data: createTagDto
    };
  }

  @Get()
  findAll() {
    return {
      message: 'This action returns all tags'
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return {
      message: `This action returns tag #${id}`
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return {
      message: `This action updates tag #${id}`,
      data: updateTagDto
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return {
      message: `This action removes tag #${id}`
    };
  }
}
