import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TagService } from './tags.service';
import { CreateTagDto } from './dto/create_tag.dto';
import { UpdateTagDto } from './dto/update_tag.dto';
import { Tag } from 'src/entities/tag.entity';

@ApiTags('Tags') 
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'The tag has been successfully created.',
    type: Tag 
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Tag name already exists.' })
  create(@Body() createTagDto: CreateTagDto) {
    return this.tagService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tags' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Return all tags sorted alphabetically.',
    type: [Tag] 
  })
  findAll() {
    return this.tagService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search tags by name (Autocomplete)' })
  @ApiQuery({ name: 'q', description: 'Search keyword', example: 'java' })
  @ApiResponse({ status: HttpStatus.OK, type: [Tag] })
  search(@Query('q') query: string) {
    return this.tagService.searchTags(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tag details by ID' })
  @ApiParam({ name: 'id', description: 'Tag UUID' })
  @ApiResponse({ status: HttpStatus.OK, type: Tag })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tag not found.' })
  findOne(@Param('id') id: string) {
    return this.tagService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({ name: 'id', description: 'Tag UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tag updated successfully.', type: Tag })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Tag not found.' })
  update(@Param('id') id: string, @Body() updateTagDto: UpdateTagDto) {
    return this.tagService.update(id, updateTagDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiParam({ name: 'id', description: 'Tag UUID' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Tag deleted successfully.' })
  remove(@Param('id') id: string) {
    return this.tagService.remove(id);
  }
}