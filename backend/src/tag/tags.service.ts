import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Tag } from 'src/entities/tag.entity';
import { CreateTagDto } from './dto/create_tag.dto';
import { UpdateTagDto } from './dto/update_tag.dto';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const existingTag = await this.tagRepository.findOne({
      where: { name: createTagDto.name },
    });

    if (existingTag) {
      throw new ConflictException(`Tag with name "${createTagDto.name}" already exists`);
    }

    const newTag = this.tagRepository.create(createTagDto);
    return await this.tagRepository.save(newTag);
  }

  async findAll(): Promise<Tag[]> {
    return await this.tagRepository.find({
      order: { name: 'ASC' }, 
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
      relations: ['tagRelations', 'tagRelations.question'], 
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    return tag;
  }

  async searchTags(query: string): Promise<Tag[]> {
    return await this.tagRepository.find({
      where: { name: Like(`%${query}%`) },
      take: 10, 
    });
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const nameExists = await this.tagRepository.findOne({
        where: { name: updateTagDto.name },
      });
      if (nameExists) {
        throw new ConflictException('New tag name already exists');
      }
    }

    Object.assign(tag, updateTagDto);
    return await this.tagRepository.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
  }


  async findByIds(ids: string[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) return [];
    return await this.tagRepository.find({
      where: {
        id: In(ids), 
      },
    });
  }
}