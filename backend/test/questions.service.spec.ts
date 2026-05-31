/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { QuestionsService } from '../src/questions/questions.service';
import { Question } from '../src/entities/question.entity';
import { Category } from '../src/entities/category.entity';
import { Tag } from '../src/entities/tag.entity';

describe('QuestionsService', () => {
  let service: QuestionsService;
  let questionRepo: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    delete: jest.Mock;
    createQueryBuilder: jest.Mock;
  };
  let categoryRepo: { findOneBy: jest.Mock };
  let tagRepo: { findBy: jest.Mock };

  const category = { id: 'cat-1', name: 'JavaScript' };
  const tag = { id: 'tag-1', name: 'ES6' };
  const question = {
    id: 'q-1',
    content: 'What is closure?',
    sampleAnswer: 'A closure is a function that retains scope.',
    difficultyLevel: 2,
    category,
    tagRelations: [{ tag }],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  let qbMock: any;

  beforeEach(async () => {
    qbMock = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[question], 1]),
    };

    questionRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
    };
    categoryRepo = { findOneBy: jest.fn() };
    tagRepo = { findBy: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        { provide: getRepositoryToken(Question), useValue: questionRepo },
        { provide: getRepositoryToken(Category), useValue: categoryRepo },
        { provide: getRepositoryToken(Tag), useValue: tagRepo },
      ],
    }).compile();

    service = module.get<QuestionsService>(QuestionsService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      content: 'What is closure?',
      sampleAnswer: 'A closure...',
      difficultyLevel: 2,
      categoryId: 'cat-1',
      tagIds: ['tag-1'],
    };

    it('throws NotFoundException for unknown category', async () => {
      categoryRepo.findOneBy.mockResolvedValue(null);
      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });

    it('creates question with tags and returns mapped DTO', async () => {
      categoryRepo.findOneBy.mockResolvedValue(category);
      tagRepo.findBy.mockResolvedValue([tag]);
      questionRepo.create.mockReturnValue({ ...question });
      questionRepo.save.mockResolvedValue(question);

      const result = await service.create(dto);

      expect(result.id).toBe('q-1');
      expect(result.tags).toContain('ES6');
      expect(result.categoryName).toBe('JavaScript');
    });

    it('creates question without tags when tagIds is empty', async () => {
      categoryRepo.findOneBy.mockResolvedValue(category);
      const noTagQuestion = { ...question, tagRelations: [] };
      questionRepo.create.mockReturnValue(noTagQuestion);
      questionRepo.save.mockResolvedValue(noTagQuestion);

      const result = await service.create({ ...dto, tagIds: [] });
      expect(result.tags).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('returns paginated questions with total', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0].id).toBe('q-1');
    });

    it('applies categoryId filter when provided', async () => {
      await service.findAll({ categoryId: 'cat-1', page: 1, limit: 10 });
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('categoryId'),
        expect.objectContaining({ categoryId: 'cat-1' }),
      );
    });

    it('skips filter when categoryId is "all"', async () => {
      await service.findAll({ categoryId: 'all', page: 1, limit: 10 });
      expect(qbMock.andWhere).not.toHaveBeenCalled();
    });

    it('skips filter when categoryId is empty string', async () => {
      await service.findAll({ categoryId: '', page: 1, limit: 10 });
      expect(qbMock.andWhere).not.toHaveBeenCalled();
    });

    it('defaults page to 1 and limit to 20 when not provided', async () => {
      await service.findAll({});
      expect(qbMock.skip).toHaveBeenCalledWith(0);
      expect(qbMock.take).toHaveBeenCalledWith(20);
    });

    it('applies keyword filter when q param is provided', async () => {
      await service.findAll({ q: 'closure' });
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('keyword'),
        expect.objectContaining({ keyword: '%closure%' }),
      );
    });

    it('applies keyword filter when search param is provided', async () => {
      await service.findAll({ search: 'Promise' });
      expect(qbMock.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('keyword'),
        expect.objectContaining({ keyword: '%promise%' }),
      );
    });
  });

  describe('findOne', () => {
    it('returns mapped DTO when question found', async () => {
      questionRepo.findOne.mockResolvedValue(question);
      const result = await service.findOne('q-1');

      expect(result.id).toBe('q-1');
      expect(result.content).toBe('What is closure?');
    });

    it('throws NotFoundException when question not found', async () => {
      questionRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });

    it('parses Editor.js JSON block format in sampleAnswer', async () => {
      const editorJsAnswer = JSON.stringify({
        blocks: [
          { data: { text: 'First block' } },
          { data: { text: 'Second block' } },
        ],
      });
      questionRepo.findOne.mockResolvedValue({
        ...question,
        sampleAnswer: editorJsAnswer,
      });

      const result = await service.findOne('q-1');
      expect(result.sampleAnswer).toBe('First block\nSecond block');
    });

    it('keeps plain text sampleAnswer unchanged', async () => {
      questionRepo.findOne.mockResolvedValue({
        ...question,
        sampleAnswer: 'Plain text answer',
      });

      const result = await service.findOne('q-1');
      expect(result.sampleAnswer).toBe('Plain text answer');
    });

    it('handles malformed JSON gracefully', async () => {
      questionRepo.findOne.mockResolvedValue({
        ...question,
        sampleAnswer: '{ not valid json',
      });

      const result = await service.findOne('q-1');
      expect(result.sampleAnswer).toBe('{ not valid json');
    });

    it('extracts text field from simple JSON object', async () => {
      questionRepo.findOne.mockResolvedValue({
        ...question,
        sampleAnswer: JSON.stringify({ text: 'Simple text answer' }),
      });

      const result = await service.findOne('q-1');
      expect(result.sampleAnswer).toBe('Simple text answer');
    });

    it('extracts content field when text is absent from JSON object', async () => {
      questionRepo.findOne.mockResolvedValue({
        ...question,
        sampleAnswer: JSON.stringify({ content: 'Content field answer' }),
      });

      const result = await service.findOne('q-1');
      expect(result.sampleAnswer).toBe('Content field answer');
    });

    it('falls back to JSON.stringify for unrecognized JSON object', async () => {
      const obj = { someOtherField: 'value', count: 42 };
      questionRepo.findOne.mockResolvedValue({
        ...question,
        sampleAnswer: JSON.stringify(obj),
      });

      const result = await service.findOne('q-1');
      expect(result.sampleAnswer).toBe(JSON.stringify(obj));
    });

    it('returns empty string when sampleAnswer is null', async () => {
      questionRepo.findOne.mockResolvedValue({ ...question, sampleAnswer: null });
      const result = await service.findOne('q-1');
      expect(result.sampleAnswer).toBe('');
    });

    it('parses JSON array format and falls back to stringify', async () => {
      questionRepo.findOne.mockResolvedValue({
        ...question,
        sampleAnswer: '[{"item":1}]',
      });
      const result = await service.findOne('q-1');
      expect(result.sampleAnswer).toBeDefined();
    });

    it('handles Editor.js blocks field that is not an array', async () => {
      questionRepo.findOne.mockResolvedValue({
        ...question,
        sampleAnswer: JSON.stringify({ blocks: 'not-an-array', text: 'fallback' }),
      });
      const result = await service.findOne('q-1');
      expect(result.sampleAnswer).toBe('fallback');
    });

    it('falls back to original sampleAnswer in catch when sampleAnswer is null', async () => {
      questionRepo.findOne.mockResolvedValue({
        ...question,
        sampleAnswer: null,
        content: 'What is closure?',
      });
      const result = await service.findOne('q-1');
      expect(result.sampleAnswer).toBe('');
    });

    it('returns empty tags array when tagRelations is null', async () => {
      questionRepo.findOne.mockResolvedValue({ ...question, tagRelations: null });
      const result = await service.findOne('q-1');
      expect(result.tags).toEqual([]);
    });

    it('returns Uncategorized when question has no category', async () => {
      questionRepo.findOne.mockResolvedValue({ ...question, category: null });
      const result = await service.findOne('q-1');
      expect(result.categoryName).toBe('Uncategorized');
      expect(result.categoryId).toBeUndefined();
    });

    it('filters out Editor.js blocks with no data.text', async () => {
      const editorJsAnswer = JSON.stringify({
        blocks: [
          { data: { text: 'Valid block' } },
          { data: {} },
          { type: 'code' },
        ],
      });
      questionRepo.findOne.mockResolvedValue({
        ...question,
        sampleAnswer: editorJsAnswer,
      });

      const result = await service.findOne('q-1');
      expect(result.sampleAnswer).toBe('Valid block');
    });
  });

  describe('update', () => {
    const updateDto = {
      content: 'Updated question content',
      categoryId: 'cat-1',
      tagIds: ['tag-1'],
    };

    it('throws NotFoundException when question not found', async () => {
      questionRepo.findOne.mockResolvedValue(null);
      await expect(service.update('missing', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when new category not found', async () => {
      questionRepo.findOne.mockResolvedValue(question);
      categoryRepo.findOneBy.mockResolvedValue(null);

      await expect(service.update('q-1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('updates question fields and returns mapped DTO', async () => {
      questionRepo.findOne.mockResolvedValue({ ...question });
      categoryRepo.findOneBy.mockResolvedValue(category);
      tagRepo.findBy.mockResolvedValue([tag]);
      questionRepo.save.mockResolvedValue(question);

      const result = await service.update('q-1', updateDto);
      expect(result.id).toBe('q-1');
    });

    it('updates only content when no categoryId or tagIds', async () => {
      questionRepo.findOne.mockResolvedValue({ ...question });
      questionRepo.save.mockResolvedValue({ ...question, content: 'New content' });

      await service.update('q-1', { content: 'New content' });
      expect(categoryRepo.findOneBy).not.toHaveBeenCalled();
    });

    it('updates sampleAnswer and difficultyLevel fields when provided', async () => {
      const base = { ...question };
      const saved = { ...question, sampleAnswer: 'New answer', difficultyLevel: 3 };
      questionRepo.findOne.mockResolvedValue(base);
      questionRepo.save.mockResolvedValue(saved);

      const result = await service.update('q-1', {
        sampleAnswer: 'New answer',
        difficultyLevel: 3,
      });
      expect(result.sampleAnswer).toBe('New answer');
    });

    it('skips content update when content is not in updateDto', async () => {
      const base = { ...question };
      questionRepo.findOne.mockResolvedValue(base);
      questionRepo.save.mockResolvedValue(base);

      await service.update('q-1', { sampleAnswer: 'Only answer' });
      expect(base.content).toBe('What is closure?');
    });
  });

  describe('remove', () => {
    it('deletes question by id and returns success message', async () => {
      questionRepo.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove('q-1');

      expect(result.message).toContain('q-1');
      expect(questionRepo.delete).toHaveBeenCalledWith('q-1');
    });
  });
});
