/// <reference types="jest" />

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';

jest.mock('openai', () => jest.fn());
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    writeFileSync: jest.fn(),
    copyFileSync: jest.fn(),
    existsSync: jest.fn().mockReturnValue(false),
    unlinkSync: jest.fn(),
    createReadStream: jest.fn().mockReturnValue('mock-stream'),
  };
});

import OpenAI from 'openai';
import { InterviewsService } from '../src/interviews/interviews.service';
import { Interview } from '../src/entities/interview.entity';
import { Message } from '../src/entities/message.entity';

describe('InterviewsService', () => {
  let service: InterviewsService;
  let interviewRepo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let messageRepo: { find: jest.Mock; save: jest.Mock };
  let mockTranscribe: jest.Mock;
  let mockChat: jest.Mock;

  const savedInterview = {
    id: 'i-1',
    type: 'FREE',
    cv_text: null,
    job_description: null,
  };

  beforeEach(async () => {
    mockTranscribe = jest.fn();
    mockChat = jest.fn();

    (OpenAI as unknown as jest.Mock).mockImplementation(() => ({
      audio: { transcriptions: { create: mockTranscribe } },
      chat: { completions: { create: mockChat } },
    }));

    interviewRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    messageRepo = {
      find: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        { provide: getRepositoryToken(Interview), useValue: interviewRepo },
        { provide: getRepositoryToken(Message), useValue: messageRepo },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
  });

  afterEach(() => jest.restoreAllMocks());

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('startInterview', () => {
    beforeEach(() => {
      interviewRepo.create.mockReturnValue(savedInterview);
      interviewRepo.save.mockResolvedValue(savedInterview);
      messageRepo.save.mockResolvedValue([]);
    });

    it('creates a FREE interview and returns first message', async () => {
      const result = await service.startInterview('FREE');

      expect(result.success).toBe(true);
      expect(result.interviewId).toBe('i-1');
      expect(result.firstMessage).toContain('Chào bạn');
    });

    it('creates a TARGETED interview with CV and JD context', async () => {
      interviewRepo.create.mockReturnValue({
        ...savedInterview,
        type: 'TARGETED',
        cv_text: 'cv content',
        job_description: 'jd content',
      });
      interviewRepo.save.mockResolvedValue({
        ...savedInterview,
        type: 'TARGETED',
      });

      const result = await service.startInterview(
        'TARGETED',
        'cv content',
        'jd content',
      );

      expect(result.success).toBe(true);
      expect(result.firstMessage).toContain('CV');
    });

    it('saves exactly two messages: system and assistant greeting', async () => {
      await service.startInterview('FREE');

      const savedMessages = (messageRepo.save as jest.Mock).mock.calls[0][0];
      expect(savedMessages).toHaveLength(2);
      expect(savedMessages[0].role).toBe('system');
      expect(savedMessages[1].role).toBe('assistant');
    });

    it('FREE system prompt includes one-question-at-a-time rule', async () => {
      await service.startInterview('FREE');

      const savedMessages = (messageRepo.save as jest.Mock).mock.calls[0][0];
      expect(savedMessages[0].content).toContain('1 CÂU DUY NHẤT');
    });

    it('TARGETED system prompt includes CV and JD content', async () => {
      interviewRepo.create.mockReturnValue({
        ...savedInterview,
        type: 'TARGETED',
      });
      interviewRepo.save.mockResolvedValue({
        ...savedInterview,
        type: 'TARGETED',
      });

      await service.startInterview('TARGETED', 'my-cv', 'my-jd');

      const savedMessages = (messageRepo.save as jest.Mock).mock.calls[0][0];
      expect(savedMessages[0].content).toContain('my-cv');
      expect(savedMessages[0].content).toContain('my-jd');
    });
  });

  describe('processAudio', () => {
    const mockFile = {
      originalname: 'audio.webm',
      buffer: Buffer.from('fake-audio-data'),
      path: undefined,
    } as unknown as Express.Multer.File;

    beforeEach(() => {
      interviewRepo.findOne.mockResolvedValue(savedInterview);
      messageRepo.find.mockResolvedValue([
        { role: 'system', content: 'system prompt', interview_id: 'i-1' },
      ]);
      mockTranscribe.mockResolvedValue({ text: 'User said something meaningful' });
      mockChat.mockResolvedValue({
        choices: [{ message: { content: 'AI interviewer response' } }],
      });
      messageRepo.save.mockResolvedValue([]);
    });

    it('throws BadRequestException when interview not found', async () => {
      interviewRepo.findOne.mockResolvedValue(null);
      await expect(service.processAudio('missing', mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('transcribes audio and returns AI response', async () => {
      const result = await service.processAudio('i-1', mockFile);

      expect(result.success).toBe(true);
      expect(result.userText).toBe('User said something meaningful');
      expect(result.aiResponse).toBe('AI interviewer response');
    });

    it('saves user message and AI response to database', async () => {
      await service.processAudio('i-1', mockFile);

      const savedMessages = (messageRepo.save as jest.Mock).mock.calls[0][0];
      expect(savedMessages[0].role).toBe('user');
      expect(savedMessages[0].content).toBe('User said something meaningful');
      expect(savedMessages[1].role).toBe('assistant');
      expect(savedMessages[1].content).toBe('AI interviewer response');
    });

    it('throws BadRequestException when transcription returns empty text', async () => {
      mockTranscribe.mockResolvedValue({ text: '' });
      await expect(service.processAudio('i-1', mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when transcription returns whitespace only', async () => {
      mockTranscribe.mockResolvedValue({ text: '   ' });
      await expect(service.processAudio('i-1', mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('handles mp3 file extension correctly', async () => {
      const mp3File = {
        ...mockFile,
        originalname: 'audio.mp3',
      } as Express.Multer.File;

      const result = await service.processAudio('i-1', mp3File);
      expect(result.success).toBe(true);
    });

    it('handles unknown extension by defaulting to webm', async () => {
      const unknownFile = {
        ...mockFile,
        originalname: 'audio.xyz',
      } as Express.Multer.File;

      const result = await service.processAudio('i-1', unknownFile);
      expect(result.success).toBe(true);
    });

    it('includes conversation history in chat completion call', async () => {
      messageRepo.find.mockResolvedValue([
        { role: 'system', content: 'sys', interview_id: 'i-1' },
        { role: 'assistant', content: 'Hello!', interview_id: 'i-1' },
      ]);

      await service.processAudio('i-1', mockFile);

      const chatCall = mockChat.mock.calls[0][0];
      expect(chatCall.messages.length).toBeGreaterThanOrEqual(2);
      expect(chatCall.messages[chatCall.messages.length - 1].role).toBe('user');
    });

    it('throws BadRequestException when AI service fails', async () => {
      mockChat.mockRejectedValue(new Error('Groq API error'));
      await expect(service.processAudio('i-1', mockFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
