/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from '../src/categories/categories.service';
import { Category } from '../src/entities/category.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    findAndCount: jest.Mock;
    remove: jest.Mock;
  };

  const category = {
    id: 'cat-1',
    name: 'JavaScript',
    description: 'Questions about JavaScript',
  };

  beforeEach(async () => {
    categoryRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: categoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('throws when category name already exists', async () => {
      categoryRepository.findOne.mockResolvedValue(category);

      await expect(
        service.create({
          name: 'JavaScript',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates and saves a new category', async () => {
      const dto = {
        name: 'System Design',
      };
      const createdCategory = { id: 'cat-2', ...dto };

      categoryRepository.findOne.mockResolvedValue(null);
      categoryRepository.create.mockReturnValue(createdCategory);
      categoryRepository.save.mockResolvedValue(createdCategory);

      await expect(service.create(dto)).resolves.toEqual(createdCategory);
      expect(categoryRepository.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('returns paginated result with defaults', async () => {
      categoryRepository.findAndCount.mockResolvedValue([[category], 1]);

      const result = await service.findAll({});

      expect(result).toEqual({
        data: [category],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
        },
      });
      expect(categoryRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 0,
          order: { name: 'ASC' },
        }),
      );
    });

    it('applies ILike filter when search is provided', async () => {
      categoryRepository.findAndCount.mockResolvedValue([[category], 1]);

      await service.findAll({ search: 'Java' });

      expect(categoryRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ name: expect.anything() }),
        }),
      );
    });

    it('uses empty where when search is not provided', async () => {
      categoryRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({});

      expect(categoryRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('update', () => {
    it('updates category and returns saved result', async () => {
      const updated = { ...category, name: 'TypeScript' };
      categoryRepository.findOne.mockResolvedValue({ ...category });
      categoryRepository.save.mockResolvedValue(updated);

      const result = await service.update('cat-1', { name: 'TypeScript' });

      expect(result.name).toBe('TypeScript');
      expect(categoryRepository.save).toHaveBeenCalled();
    });

    it('throws NotFoundException when category not found on update', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.update('missing', { name: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('throws when category does not exist', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('unknown')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns category when found', async () => {
      categoryRepository.findOne.mockResolvedValue(category);

      await expect(service.findOne('cat-1')).resolves.toEqual(category);
    });
  });

  describe('remove', () => {
    it('removes category and returns success message', async () => {
      categoryRepository.findOne.mockResolvedValue(category);
      categoryRepository.remove.mockResolvedValue(category);

      await expect(service.remove('cat-1')).resolves.toEqual({
        message: 'Category deleted successfully',
      });
      expect(categoryRepository.remove).toHaveBeenCalledWith(category);
    });
  });
});
