/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InterviewsService } from '../src/interviews/interviews.service';
import { User, UserPlan } from '../src/entities/user.entity';
import { Interview } from '../src/entities/interview.entity';
import { Message } from '../src/entities/message.entity';
import { RagService } from '../src/rag/rag.service';
import { AiService } from '../src/ai/ai.service';

jest.mock('@langchain/community/document_loaders/fs/pdf', () => {
  return {
    PDFLoader: jest.fn().mockImplementation(() => ({
      load: jest.fn().mockResolvedValue([{ pageContent: 'Mocked CV Content Developer Experience' }]),
    })),
  };
});

jest.mock('../src/ai/agents/evaluator.agent', () => {
  return {
    EvaluatorAgent: jest.fn().mockImplementation(() => ({
      invoke: jest.fn().mockResolvedValue({
        average_score: 8.5,
        breakdown: { theory: 8, coding: 9, soft_skills: 8.5 },
        radar_chart: [8, 9, 8.5],
        learning_path: 'mock path',
        summary_markdown: 'mock summary',
      }),
    })),
  };
});

jest.mock('../src/ai/agents/mentor.agent', () => {
  return {
    MentorAgent: jest.fn().mockImplementation(() => ({
      invoke: jest.fn().mockResolvedValue({
        motivational_message: 'mock dynamic motivation',
        focus_topics: ['NestJS', 'TypeScript'],
        suggested_track: 'Backend Track',
        track_description: 'mock desc',
      }),
    })),
  };
});

describe('InterviewsService', () => {
  let service: InterviewsService;
  let interviewRepo: { findOne: jest.Mock; find: jest.Mock; create: jest.Mock; save: jest.Mock; createQueryBuilder: jest.Mock };
  let messageRepo: { find: jest.Mock; save: jest.Mock };
  let userRepo: { findOne: jest.Mock; save: jest.Mock };
  let ragService: { indexCv: jest.Mock };
  let aiService: {
    analyzeCvProfile: jest.Mock;
    transcribeAudio: jest.Mock;
    processInterviewTurnStream: jest.Mock;
    model: any;
  };
  let mockInterview: any;

  beforeEach(async () => {
    mockInterview = {
      id: 'i-1',
      user_id: 'u-1',
      status: 'IN_PROGRESS',
      current_phase: 'THEORY',
      job_title: 'Frontend Developer',
      credits: 5,
    };

    interviewRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    messageRepo = {
      find: jest.fn(),
      save: jest.fn(),
    };
    userRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    ragService = {
      indexCv: jest.fn(),
    };
    aiService = {
      analyzeCvProfile: jest.fn(),
      transcribeAudio: jest.fn(),
      processInterviewTurnStream: jest.fn(),
      model: {},
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        { provide: getRepositoryToken(Interview), useValue: interviewRepo },
        { provide: getRepositoryToken(Message), useValue: messageRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: RagService, useValue: ragService },
        { provide: AiService, useValue: aiService },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
  });

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('requestPro', () => {
    it('sets is_pending_pro to true and saves user', async () => {
      const mockUser = { id: 'u-1', email: 'test@example.com', full_name: 'Test', is_pending_pro: false };
      userRepo.findOne.mockResolvedValue(mockUser);
      userRepo.save.mockResolvedValue(mockUser);

      const result = await service.requestPro('u-1');

      expect(result.success).toBe(true);
      expect(mockUser.is_pending_pro).toBe(true);
      expect(userRepo.save).toHaveBeenCalledWith(mockUser);
    });

    it('throws NotFoundException when user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.requestPro('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('startNewInterview', () => {
    beforeEach(() => {
      userRepo.findOne.mockResolvedValue({ id: 'u-1', plan: UserPlan.FREE, credits: 5 });
      userRepo.save.mockResolvedValue({ id: 'u-1', plan: UserPlan.FREE, credits: 4 });
      interviewRepo.create.mockReturnValue(mockInterview);
      interviewRepo.save.mockResolvedValue(mockInterview);
      messageRepo.save.mockResolvedValue({});
    });

    it('creates an interview and deducts credits for FREE user', async () => {
      const result = await service.startNewInterview('u-1', 'Frontend Developer');
      expect(result.id).toBe('i-1');
      expect(result.greeting).toContain('Chào bạn');
      expect(userRepo.save).toHaveBeenCalled();
    });

    it('throws BadRequestException if FREE user has 0 credits', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'u-1', plan: UserPlan.FREE, credits: 0 });
      await expect(service.startNewInterview('u-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('startWithCv', () => {
    beforeEach(() => {
      userRepo.findOne.mockResolvedValue({ id: 'u-1', plan: UserPlan.FREE, credits: 5 });
      userRepo.save.mockResolvedValue({ id: 'u-1', plan: UserPlan.FREE, credits: 4 });
      aiService.analyzeCvProfile.mockResolvedValue({
        job_title: 'NodeJS Developer',
        experience_level: 'Senior',
      });
      interviewRepo.create.mockReturnValue(mockInterview);
      interviewRepo.save.mockResolvedValue(mockInterview);
      messageRepo.save.mockResolvedValue({});
      ragService.indexCv.mockResolvedValue({});
    });

    it('successfully extracts PDF CV, creates interview and indexes CV', async () => {
      const pdfBuffer = Buffer.from('dummy-pdf-content');
      const result = await service.startWithCv('u-1', pdfBuffer);

      expect(result.id).toBe('i-1');
      expect(result.jobTitle).toBe('NodeJS Developer');
      expect(ragService.indexCv).toHaveBeenCalled();
    });
  });

  describe('getInterviewState', () => {
    it('returns structured interview state and history', async () => {
      interviewRepo.findOne.mockResolvedValue(mockInterview);
      messageRepo.find.mockResolvedValue([
        { id: 'm-1', role: 'assistant', content: 'Hello', phase: 'THEORY', score: 0 },
      ]);

      const result = await service.getInterviewState('i-1', 'u-1');

      expect(result.interviewId).toBe('i-1');
      expect(result.chatHistory).toHaveLength(1);
      expect(result.chatHistory[0].content).toBe('Hello');
    });

    it('throws NotFoundException when interview is not found', async () => {
      interviewRepo.findOne.mockResolvedValue(null);
      await expect(service.getInterviewState('i-invalid', 'u-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSummaryReport', () => {
    it('returns existing report data if interview is COMPLETED and has radar data', async () => {
      const completedInterview = {
        ...mockInterview,
        status: 'COMPLETED',
        radar_data: [8, 9, 8],
        average_score: 8.3,
        score_theory: 8,
        score_coding: 9,
        score_softskills: 8,
        learning_path: 'path',
        final_report: 'summary',
      };
      interviewRepo.findOne.mockResolvedValue(completedInterview);
      messageRepo.find.mockResolvedValue([
        { role: 'user', content: 'Answer' },
      ]);

      const result = await service.getSummaryReport('i-1');

      expect(result.avgScore).toBe(8.3);
      expect(result.summary).toBe('summary');
    });

    it('generates new report via EvaluatorAgent if not completed or missing radar data', async () => {
      interviewRepo.findOne.mockResolvedValue(mockInterview);
      messageRepo.find.mockResolvedValue([
        { role: 'user', content: 'Answer' },
      ]);
      interviewRepo.save.mockResolvedValue({});

      const result = await service.getSummaryReport('i-1');

      expect(result.avgScore).toBe(8.5);
      expect(result.theory).toBe(8);
      expect(interviewRepo.save).toHaveBeenCalled();
    });
  });

  describe('processAudioMessage', () => {
    beforeEach(() => {
      aiService.transcribeAudio.mockResolvedValue('Hello AI');
      aiService.processInterviewTurnStream.mockImplementation(async function* () {
        yield 'Hello back';
      });
      interviewRepo.findOne.mockResolvedValue(mockInterview);
      messageRepo.find.mockResolvedValue([]);
    });

    it('transcribes audio and yields stream responses', async () => {
      const result = await service.processAudioMessage(
        'i-1',
        'u-1',
        Buffer.from('audio'),
        'test.webm',
        'THEORY',
        'code',
      );

      expect(result.recognizedText).toBe('Hello AI');
      expect(result.reply).toBe('Hello back');
    });
  });
});
