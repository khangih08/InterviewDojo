import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AiService } from '../src/ai/ai.service';
import { RagService } from '../src/rag/rag.service';

jest.mock('../src/ai/ai.service', () => ({
  AiService: jest.fn().mockImplementation(() => ({
    analyzeCvProfile: jest.fn(),
    processInterviewTurnStream: jest.fn(),
    transcribeAudio: jest.fn(),
  })),
}));

jest.mock('../src/rag/rag.service', () => ({
  RagService: jest.fn().mockImplementation(() => ({
    indexCv: jest.fn(),
  })),
}));

import { InterviewsService } from '../src/interviews/interviews.service';
import { Interview } from '../src/entities/interview.entity';
import { Message } from '../src/entities/message.entity';
import { User, UserPlan } from '../src/entities/user.entity';

jest.mock('../src/ai/agents/mentor.agent', () => ({
  MentorAgent: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
  })),
}));

jest.mock('../src/ai/agents/evaluator.agent', () => ({
  EvaluatorAgent: jest.fn().mockImplementation(() => ({
    invoke: jest.fn(),
  })),
}));

jest.mock('@langchain/community/document_loaders/fs/pdf', () => ({
  PDFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(),
  })),
}));

describe('InterviewsService (unit)', () => {
  let service: InterviewsService;

  const mockRepository = (overrides = {}) => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
    ...overrides,
  });

  const aiServiceMock = {
    model: 'test-model',
    analyzeCvProfile: jest.fn(),
    processInterviewTurnStream: jest.fn(),
    transcribeAudio: jest.fn(),
  } as any;

  const ragServiceMock = {
    indexCv: jest.fn(),
  } as any;

  let interviewRepoMock: any;
  let messageRepoMock: any;
  let userRepoMock: any;

  beforeEach(async () => {
    interviewRepoMock = mockRepository();
    messageRepoMock = mockRepository();
    userRepoMock = mockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        { provide: getRepositoryToken(Interview), useFactory: () => interviewRepoMock },
        { provide: getRepositoryToken(Message), useFactory: () => messageRepoMock },
        { provide: getRepositoryToken(User), useFactory: () => userRepoMock },
        { provide: AiService, useValue: aiServiceMock },
        { provide: RagService, useValue: ragServiceMock },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
  });

  afterEach(() => jest.resetAllMocks());

  describe('requestPro', () => {
    it('should set is_pending_pro and return success when user exists', async () => {
      const user = {
        id: 'u1',
        full_name: 'A',
        email: 'a@x.com',
        is_pending_pro: false,
      } as any;
      userRepoMock.findOne.mockResolvedValue(user);
      userRepoMock.save.mockResolvedValue({ ...user, is_pending_pro: true });

      const res = await service.requestPro('u1');

      expect(userRepoMock.findOne).toHaveBeenCalledWith({ where: { id: 'u1' } });
      expect(userRepoMock.save).toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining({ success: true }));
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepoMock.findOne.mockResolvedValue(undefined);
      await expect(service.requestPro('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('startNewInterview', () => {
    it('should throw NotFoundException if user missing in credit check', async () => {
      userRepoMock.findOne.mockResolvedValue(undefined);
      await expect(service.startNewInterview('u1')).rejects.toThrow(NotFoundException);
    });

    it('should create interview, deduct credit for FREE plan and return greeting', async () => {
      const user = { id: 'u1', plan: UserPlan.FREE, credits: 2 } as any;
      userRepoMock.findOne.mockResolvedValue(user);
      userRepoMock.save.mockResolvedValue({ ...user, credits: 1 });

      const created = { user_id: 'u1', status: 'IN_PROGRESS' } as any;
      interviewRepoMock.create.mockReturnValue(created);
      const saved = { id: 'i1', ...created };
      interviewRepoMock.save.mockResolvedValue(saved);
      messageRepoMock.save.mockResolvedValue({});

      const out = await service.startNewInterview('u1', 'Backend Dev');

      expect(userRepoMock.findOne).toHaveBeenCalled();
      expect(interviewRepoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: 'u1', job_title: 'Backend Dev' }),
      );
      expect(interviewRepoMock.save).toHaveBeenCalledWith(created);
      expect(messageRepoMock.save).toHaveBeenCalledWith(
        expect.objectContaining({ interview_id: 'i1', role: 'assistant' }),
      );
      expect(out).toEqual(expect.objectContaining({ id: 'i1', jobTitle: 'Backend Dev' }));
    });
  });

  describe('startWithCv', () => {
    it('should throw BadRequestException when PDF text too short', async () => {
      const user = { id: 'u1', plan: UserPlan.FREE, credits: 1 } as any;
      userRepoMock.findOne.mockResolvedValue(user);
      userRepoMock.save.mockResolvedValue({ ...user, credits: 0 });

      const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
      PDFLoader.mockImplementation(() => ({
        load: jest.fn().mockResolvedValue([{ pageContent: 'short' }]),
      }));

      await expect(service.startWithCv('u1', Buffer.from('pdf'))).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should analyze CV, index it and create interview successfully', async () => {
      const user = { id: 'u1', plan: UserPlan.FREE, credits: 1 } as any;
      userRepoMock.findOne.mockResolvedValue(user);
      userRepoMock.save.mockResolvedValue({ ...user, credits: 0 });

      const cvProfile = { job_title: 'DevOps', experience_level: 'Senior' };
      aiServiceMock.analyzeCvProfile.mockResolvedValue(cvProfile);

      const { PDFLoader } = require('@langchain/community/document_loaders/fs/pdf');
      PDFLoader.mockImplementation(() => ({
        load: jest.fn().mockResolvedValue([
          { pageContent: 'This is a valid CV content with enough length.' },
        ]),
      }));

      const created = { user_id: 'u1', status: 'IN_PROGRESS' } as any;
      interviewRepoMock.create.mockReturnValue(created);
      const saved = { id: 'i-cv', job_title: 'DevOps', ...created } as any;
      interviewRepoMock.save.mockResolvedValue(saved);
      messageRepoMock.save.mockResolvedValue({});
      ragServiceMock.indexCv.mockResolvedValue({});

      const out = await service.startWithCv('u1', Buffer.from('pdf-data'));

      expect(aiServiceMock.analyzeCvProfile).toHaveBeenCalled();
      expect(ragServiceMock.indexCv).toHaveBeenCalledWith('u1', 'i-cv', expect.any(String));
      expect(out).toEqual(expect.objectContaining({ id: 'i-cv', jobTitle: 'DevOps' }));
    });
  });

  describe('getInterviewState', () => {
    it('should throw NotFoundException when interview missing', async () => {
      interviewRepoMock.findOne.mockResolvedValue(undefined);
      await expect(service.getInterviewState('i1', 'u1')).rejects.toThrow(NotFoundException);
    });

    it('should return structured state when interview exists', async () => {
      const interview = {
        id: 'i1',
        job_title: 'X',
        current_phase: 'THEORY',
        status: 'IN_PROGRESS',
        last_code: 'c',
      } as any;
      interviewRepoMock.findOne.mockResolvedValue(interview);
      messageRepoMock.find.mockResolvedValue([
        { id: 'm1', role: 'user', content: 'hi', phase: 'THEORY', score: 0 },
      ]);

      const res = await service.getInterviewState('i1', 'u1');

      expect(res.interviewId).toBe('i1');
      expect(res.chatHistory).toHaveLength(1);
      expect(res.chatHistory[0]).toHaveProperty('role', 'user');
    });
  });

  describe('processUserMessageStream', () => {
    it('should throw NotFoundException when interview not found', async () => {
      interviewRepoMock.findOne.mockResolvedValue(undefined);
      const gen = service.processUserMessageStream('i1', 'u1', 'msg', 'THEORY', '');
      await expect(gen.next()).rejects.toThrow(NotFoundException);
    });

    it('should stream replies, save assistant message and yield metadata on completion', async () => {
      const interview = {
        id: 'i1',
        user_id: 'u1',
        status: 'IN_PROGRESS',
        job_title: 'SWE',
        current_phase: 'THEORY',
      } as any;
      interviewRepoMock.findOne.mockResolvedValue(interview);
      messageRepoMock.find.mockResolvedValue([{ role: 'user', content: 'hi' }]);

      async function* fakeGen() {
        yield 'part1';
        yield 'part2';
        return { next_action: 'END_INTERVIEW' };
      }
      aiServiceMock.processInterviewTurnStream.mockReturnValue(fakeGen());
      interviewRepoMock.save.mockResolvedValue({
        ...interview,
        status: 'COMPLETED',
        current_phase: 'EVALUATION',
      });
      messageRepoMock.save.mockResolvedValue({});

      const chunks: string[] = [];
      const gen = service.processUserMessageStream('i1', 'u1', 'hello', 'THEORY', '', '', 'neutral');
      for await (const chunk of gen) {
        chunks.push(chunk as string);
      }

      expect(chunks).toContain('part1');
      expect(chunks).toContain('part2');
      expect(chunks.some(c => c.includes('__METADATA__'))).toBeTruthy();
      expect(interviewRepoMock.save).toHaveBeenCalled();
    });
  });

  describe('getSummaryReport', () => {
    it('should throw NotFoundException when interview missing', async () => {
      interviewRepoMock.findOne.mockResolvedValue(undefined);
      await expect(service.getSummaryReport('i1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when no user messages in history', async () => {
      const interview = { id: 'i1', job_title: 'X', status: 'IN_PROGRESS' } as any;
      interviewRepoMock.findOne.mockResolvedValue(interview);
      messageRepoMock.find.mockResolvedValue([{ role: 'assistant', content: 'hi' }]);
      await expect(service.getSummaryReport('i1')).rejects.toThrow(BadRequestException);
    });

    it('should call EvaluatorAgent and return computed report when interview not completed', async () => {
      const interview = { id: 'i1', job_title: 'X', status: 'IN_PROGRESS', last_code: 'c' } as any;
      interviewRepoMock.findOne.mockResolvedValue(interview);
      const fullHistory = [{ role: 'user', content: 'q' }];
      messageRepoMock.find.mockResolvedValue(fullHistory);
      const { EvaluatorAgent } = require('../src/ai/agents/evaluator.agent');
      const fakeReport = {
        average_score: 80,
        breakdown: { theory: 30, coding: 40, soft_skills: 10 },
        radar_chart: [1, 2, 3],
        learning_path: ['a'],
        summary_markdown: 'sum',
      };
      EvaluatorAgent.mockImplementation(() => ({
        invoke: jest.fn().mockResolvedValue(fakeReport),
      }));
      interviewRepoMock.save.mockResolvedValue({ ...interview, status: 'COMPLETED' });

      const out = await service.getSummaryReport('i1');
      expect(out).toHaveProperty('avgScore', 80);
      expect(interviewRepoMock.save).toHaveBeenCalled();
    });
  });

  describe('processAudioMessage', () => {
    it('should return prompt when transcription empty', async () => {
      aiServiceMock.transcribeAudio.mockResolvedValue('');
      const res = await service.processAudioMessage(
        'i1',
        'u1',
        Buffer.from(''),
        'f.wav',
        'THEORY',
        '',
        '',
      );
      expect(res).toEqual(
        expect.objectContaining({ recognizedText: '', reply: expect.any(String) }),
      );
    });

    it('should forward to processUserMessageStream and return accumulated reply', async () => {
      aiServiceMock.transcribeAudio.mockResolvedValue('hello');
      async function* fakeGen() {
        yield 'a';
        yield '__METADATA__{"current_phase":"THEORY"}';
      }
      jest.spyOn(service as any, 'processUserMessageStream').mockReturnValue(fakeGen() as any);
      interviewRepoMock.findOne.mockResolvedValue({ id: 'i1', current_phase: 'THEORY' } as any);

      const res = await service.processAudioMessage(
        'i1',
        'u1',
        Buffer.from(''),
        'f.wav',
        'THEORY',
        '',
        '',
      );
      expect(res).toHaveProperty('recognizedText', 'hello');
      expect(res).toHaveProperty('reply', 'a');
    });
  });
});
