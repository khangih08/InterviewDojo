/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from '../src/questions/questions.controller';
import { QuestionsService } from '../src/questions/questions.service';

const mockQuestionsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

const questionDto = {
  id: 'q-1',
  content: 'What is closure?',
  sampleAnswer: 'A closure is...',
  difficultyLevel: 2,
  categoryId: 'cat-1',
  categoryName: 'JavaScript',
  tags: ['ES6'],
  createdAt: new Date(),
};

describe('QuestionsController', () => {
  let controller: QuestionsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        { provide: QuestionsService, useValue: mockQuestionsService },
      ],
    }).compile();

    controller = module.get<QuestionsController>(QuestionsController);
  });

  it('is defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to questionsService.create', async () => {
      mockQuestionsService.create.mockResolvedValue(questionDto);

      const dto = {
        content: 'What is closure?',
        sampleAnswer: 'A closure...',
        difficultyLevel: 2,
        categoryId: 'cat-1',
        tagIds: ['tag-1'],
      } as any;

      const result = await controller.create(dto);

      expect(mockQuestionsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(questionDto);
    });
  });

  describe('findAll', () => {
    it('delegates to questionsService.findAll with query', async () => {
      const pagedResult = { items: [questionDto], total: 1 };
      mockQuestionsService.findAll.mockResolvedValue(pagedResult);

      const result = await controller.findAll({ categoryId: 'cat-1', page: '1' });

      expect(mockQuestionsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat-1' }),
      );
      expect(result).toEqual(pagedResult);
    });
  });

  describe('findOne', () => {
    it('delegates to questionsService.findOne with id', async () => {
      mockQuestionsService.findOne.mockResolvedValue(questionDto);

      const result = await controller.findOne('q-1');

      expect(mockQuestionsService.findOne).toHaveBeenCalledWith('q-1');
      expect(result).toEqual(questionDto);
    });
  });

  describe('update', () => {
    it('delegates to questionsService.update', async () => {
      const updated = { ...questionDto, content: 'Updated content' };
      mockQuestionsService.update.mockResolvedValue(updated);

      const result = await controller.update('q-1', { content: 'Updated content' } as any);

      expect(mockQuestionsService.update).toHaveBeenCalledWith(
        'q-1',
        expect.objectContaining({ content: 'Updated content' }),
      );
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('delegates to questionsService.remove', async () => {
      mockQuestionsService.remove.mockResolvedValue({
        message: 'Question q-1 has been deleted',
      });

      const result = await controller.remove('q-1');

      expect(mockQuestionsService.remove).toHaveBeenCalledWith('q-1');
      expect(result).toMatchObject({ message: expect.stringContaining('q-1') });
    });
  });
});
