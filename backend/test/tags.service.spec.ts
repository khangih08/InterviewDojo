/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TagService } from '../src/tag/tags.service';
import { Tag } from '../src/entities/tag.entity';

describe('TagService', () => {
  let service: TagService;
  let tagRepo: {
    findOne: jest.Mock;
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };

  const tag = { id: 't-1', name: 'TypeScript' };

  beforeEach(async () => {
    tagRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        { provide: getRepositoryToken(Tag), useValue: tagRepo },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('throws ConflictException when name already exists', async () => {
      tagRepo.findOne.mockResolvedValue(tag);
      await expect(service.create({ name: 'TypeScript' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('creates and returns new tag', async () => {
      tagRepo.findOne.mockResolvedValue(null);
      tagRepo.create.mockReturnValue(tag);
      tagRepo.save.mockResolvedValue(tag);

      const result = await service.create({ name: 'TypeScript' });
      expect(result.name).toBe('TypeScript');
      expect(tagRepo.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns all tags sorted alphabetically', async () => {
      tagRepo.find.mockResolvedValue([tag]);
      const result = await service.findAll();

      expect(result).toEqual([tag]);
      expect(tagRepo.find).toHaveBeenCalledWith({ order: { name: 'ASC' } });
    });

    it('returns empty array when no tags exist', async () => {
      tagRepo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('returns tag with relations when found', async () => {
      tagRepo.findOne.mockResolvedValue(tag);
      const result = await service.findOne('t-1');
      expect(result).toEqual(tag);
    });

    it('throws NotFoundException when tag not found', async () => {
      tagRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('searchTags', () => {
    it('returns tags matching the query string', async () => {
      tagRepo.find.mockResolvedValue([tag]);
      const result = await service.searchTags('Type');

      expect(result).toEqual([tag]);
      expect(tagRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });

    it('limits results to 10', async () => {
      tagRepo.find.mockResolvedValue([]);
      await service.searchTags('a');
      expect(tagRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('update', () => {
    it('throws NotFoundException when tag not found', async () => {
      tagRepo.findOne.mockResolvedValue(null);
      await expect(service.update('missing', { name: 'New' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws ConflictException when new name is already taken', async () => {
      tagRepo.findOne
        .mockResolvedValueOnce(tag)
        .mockResolvedValueOnce({ id: 't-2', name: 'React' });

      await expect(service.update('t-1', { name: 'React' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('updates tag when name is not taken', async () => {
      tagRepo.findOne
        .mockResolvedValueOnce(tag)
        .mockResolvedValueOnce(null);
      tagRepo.save.mockResolvedValue({ ...tag, name: 'Updated' });

      const result = await service.update('t-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('succeeds without conflict error when name is unchanged', async () => {
      tagRepo.findOne.mockResolvedValueOnce(tag);
      tagRepo.save.mockResolvedValue(tag);

      const result = await service.update('t-1', { name: 'TypeScript' });
      expect(result.name).toBe('TypeScript');
      expect(tagRepo.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('finds and removes the tag', async () => {
      tagRepo.findOne.mockResolvedValue(tag);
      tagRepo.remove.mockResolvedValue({});

      await service.remove('t-1');
      expect(tagRepo.remove).toHaveBeenCalledWith(tag);
    });

    it('throws NotFoundException when tag does not exist', async () => {
      tagRepo.findOne.mockResolvedValue(null);
      await expect(service.remove('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByIds', () => {
    it('returns empty array for empty ids input', async () => {
      const result = await service.findByIds([]);
      expect(result).toEqual([]);
      expect(tagRepo.find).not.toHaveBeenCalled();
    });

    it('returns tags matching the provided ids', async () => {
      tagRepo.find.mockResolvedValue([tag]);
      const result = await service.findByIds(['t-1']);
      expect(result).toEqual([tag]);
    });

    it('returns empty array for null/undefined ids', async () => {
      const result = await service.findByIds(null as any);
      expect(result).toEqual([]);
    });
  });
});
