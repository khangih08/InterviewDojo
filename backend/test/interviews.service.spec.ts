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
    mkdirSync: jest.fn(),
    statSync: jest.fn().mockReturnValue({ size: 123 }),
    existsSync: jest.fn().mockReturnValue(false),
    unlinkSync: jest.fn(),
    createReadStream: jest.fn().mockReturnValue('mock-stream'),
  };
});

import OpenAI from 'openai';
import { InterviewsService } from '../src/interviews/interviews.service';
import { User } from '../src/entities/user.entity';
import { Interview } from '../src/entities/interview.entity';
import { Message } from '../src/entities/message.entity';
import { RagService } from '../src/rag/rag.service';
import { AiService } from '../src/ai/ai.service';


describe('InterviewsService', () => {
  let service: InterviewsService;
  let interviewRepo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };
  let messageRepo: { find: jest.Mock; save: jest.Mock };
  let userRepo: { findOne: jest.Mock; save: jest.Mock };
  let mockTranscribe: jest.Mock;
  let mockChat: jest.Mock;


  const savedInterview = {
    id: 'i-1',
    type: 'FREE',
    cv_text: null,
    job_description: null,
  };

  beforeEach(async () => {
    process.env.GROQ_API_KEY = 'test-groq-key';
    process.env.Gemini_API_KEY = 'test-gemini-key';
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

    userRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        { provide: getRepositoryToken(Interview), useValue: interviewRepo },
        { provide: getRepositoryToken(Message), useValue: messageRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: RagService, useValue: {} },
        { provide: AiService, useValue: {
          analyzeCvProfile: jest.fn(),
        } },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
  });


  afterEach(() => jest.restoreAllMocks());

  it('is defined', () => {
    expect(service).toBeDefined();
  });

  describe('startNewInterview', () => {
    beforeEach(() => {
      userRepo.findOne.mockResolvedValue({ id: 'u-1', plan: 'FREE', credits: 5 });
      userRepo.save.mockResolvedValue({ id: 'u-1', plan: 'FREE', credits: 4 });
      interviewRepo.create.mockReturnValue(savedInterview);
      interviewRepo.save.mockResolvedValue(savedInterview);
      messageRepo.save.mockResolvedValue([]);
    });


    it('creates an IN_PROGRESS interview and returns greeting message', async () => {
      const result = await service.startNewInterview('u-1', 'Frontend Developer');

      expect(result.id).toBe('i-1');
      expect(result.greeting).toContain('Chào bạn');
    });

    it('saves exactly one greeting message: assistant greeting', async () => {
      await service.startNewInterview('u-1');

      const savedMessage = (messageRepo.save as jest.Mock).mock.calls[0][0];
      expect(savedMessage.role).toBe('assistant');
    });
  });

  describe('processAudioMessage', () => {
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
      service.aiService.transcribeAudio = jest.fn().mockResolvedValue('User said something meaningful');
      service.aiService.processInterviewTurnStream = jest.fn().mockImplementation(async function* () {
        yield 'AI interviewer response';
      });
      messageRepo.save.mockResolvedValue([]);
    });

    it('transcribes audio and returns AI response', async () => {
      const result = await service.processAudioMessage('i-1', 'u-1', mockFile.buffer, mockFile.originalname, 'THEORY', 'code');

      expect(result.recognizedText).toBe('User said something meaningful');
      expect(result.reply).toBe('AI interviewer response');
    });

    it('throws BadRequestException when transcription returns empty text', async () => {
      service.aiService.transcribeAudio = jest.fn().mockResolvedValue('');
      const result = await service.processAudioMessage('i-1', 'u-1', mockFile.buffer, mockFile.originalname, 'THEORY', 'code');
      expect(result.recognizedText).toBe('');
      expect(result.reply).toBe('Mình không nghe rõ, bạn nói lại được không?');
    });
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
      await expect(service.requestPro('invalid')).rejects.toThrow('User not found');
    });
  });
});

