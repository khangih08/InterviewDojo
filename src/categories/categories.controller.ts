import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Controller('categories')
export class CategoriesController {
  
  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return {
      message: 'This action adds a new category',
      data: createCategoryDto
    };
  }

  @Get()
  findAll() {
    return {
      message: 'This action returns all categories'
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return {
      message: `This action returns category #${id}`
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return {
      message: `This action updates category #${id}`,
      data: updateCategoryDto
    };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return {
      message: `This action removes category #${id}`
    };
  }
}
