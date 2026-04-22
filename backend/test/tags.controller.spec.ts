/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { TagController } from '../src/tag/tags.controller';
import { TagService } from '../src/tag/tags.service';

const mockTagService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  searchTags: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const tag = { id: 't-1', name: 'TypeScript' };

describe('TagController', () => {
  let controller: TagController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagController],
      providers: [{ provide: TagService, useValue: mockTagService }],
    }).compile();

    controller = module.get<TagController>(TagController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to tagService.create', async () => {
      mockTagService.create.mockResolvedValue(tag);

      const result = await controller.create({ name: 'TypeScript' });

      expect(mockTagService.create).toHaveBeenCalledWith({ name: 'TypeScript' });
      expect(result).toEqual(tag);
    });
  });

  describe('findAll', () => {
    it('delegates to tagService.findAll', async () => {
      mockTagService.findAll.mockResolvedValue([tag]);

      const result = await controller.findAll();

      expect(mockTagService.findAll).toHaveBeenCalled();
      expect(result).toEqual([tag]);
    });
  });

  describe('search', () => {
    it('delegates to tagService.searchTags with query string', async () => {
      mockTagService.searchTags.mockResolvedValue([tag]);

      const result = await controller.search('Type');

      expect(mockTagService.searchTags).toHaveBeenCalledWith('Type');
      expect(result).toEqual([tag]);
    });
  });

  describe('findOne', () => {
    it('delegates to tagService.findOne with id', async () => {
      mockTagService.findOne.mockResolvedValue(tag);

      const result = await controller.findOne('t-1');

      expect(mockTagService.findOne).toHaveBeenCalledWith('t-1');
      expect(result).toEqual(tag);
    });
  });

  describe('update', () => {
    it('delegates to tagService.update', async () => {
      const updated = { ...tag, name: 'JavaScript' };
      mockTagService.update.mockResolvedValue(updated);

      const result = await controller.update('t-1', { name: 'JavaScript' });

      expect(mockTagService.update).toHaveBeenCalledWith('t-1', {
        name: 'JavaScript',
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('delegates to tagService.remove', async () => {
      mockTagService.remove.mockResolvedValue(undefined);

      await controller.remove('t-1');

      expect(mockTagService.remove).toHaveBeenCalledWith('t-1');
    });
  });
});
