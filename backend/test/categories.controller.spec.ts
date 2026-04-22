/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../src/categories/categories.controller';
import { CategoriesService } from '../src/categories/categories.service';

const mockCategoriesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const category = { id: 'cat-1', name: 'JavaScript' };

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to categoriesService.create', async () => {
      mockCategoriesService.create.mockResolvedValue(category);

      const result = await controller.create({ name: 'JavaScript' });

      expect(mockCategoriesService.create).toHaveBeenCalledWith({
        name: 'JavaScript',
      });
      expect(result).toEqual(category);
    });
  });

  describe('findAll', () => {
    it('delegates to categoriesService.findAll with query', async () => {
      const pagedResult = { items: [category], total: 1 };
      mockCategoriesService.findAll.mockResolvedValue(pagedResult);

      const result = await controller.findAll({ search: 'Java', page: 1, limit: 10 } as any);

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'Java' }),
      );
      expect(result).toEqual(pagedResult);
    });
  });

  describe('findOne', () => {
    it('delegates to categoriesService.findOne with id', async () => {
      mockCategoriesService.findOne.mockResolvedValue(category);

      const result = await controller.findOne('cat-1');

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith('cat-1');
      expect(result).toEqual(category);
    });
  });

  describe('update', () => {
    it('delegates to categoriesService.update', async () => {
      const updated = { ...category, name: 'TypeScript' };
      mockCategoriesService.update.mockResolvedValue(updated);

      const result = await controller.update('cat-1', { name: 'TypeScript' });

      expect(mockCategoriesService.update).toHaveBeenCalledWith('cat-1', {
        name: 'TypeScript',
      });
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('delegates to categoriesService.remove', async () => {
      mockCategoriesService.remove.mockResolvedValue({
        message: 'Category cat-1 deleted',
      });

      const result = await controller.remove('cat-1');

      expect(mockCategoriesService.remove).toHaveBeenCalledWith('cat-1');
      expect(result).toMatchObject({ message: expect.stringContaining('cat-1') });
    });
  });
});
