/// <reference types="jest" />

jest.mock('../src/ai/ai.service', () => ({ AiService: jest.fn() }));
jest.mock('../src/rag/rag.service', () => ({ RagService: jest.fn() }));
jest.mock('@langchain/community/document_loaders/fs/pdf', () => ({ PDFLoader: jest.fn() }));
jest.mock('../src/ai/agents/evaluator.agent', () => ({ EvaluatorAgent: jest.fn() }));
jest.mock('../src/ai/agents/mentor.agent', () => ({ MentorAgent: jest.fn() }));

import { BadRequestException } from '@nestjs/common';
import { InterviewsController } from '../src/interviews/interviews.controller';

describe('InterviewsController', () => {
  const interviewsService = {
    requestPro: jest.fn(),
    getAllInterviewsByUser: jest.fn(),
    getNextActionPlan: jest.fn(),
    startNewInterview: jest.fn(),
    startWithCv: jest.fn(),
    getInterviewState: jest.fn(),
    aiService: { executeCode: jest.fn() },
    processUserMessageStream: jest.fn(),
    processAudioMessage: jest.fn(),
    getSummaryReport: jest.fn(),
  };

  let controller: InterviewsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new InterviewsController(interviewsService as any);
  });

  describe('requestPro', () => {
    it('throws if userId is missing', async () => {
      await expect(controller.requestPro(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('calls interviewsService.requestPro when userId is provided', async () => {
      interviewsService.requestPro.mockResolvedValue({ success: true });
      await expect(controller.requestPro('u-1')).resolves.toEqual({ success: true });
      expect(interviewsService.requestPro).toHaveBeenCalledWith('u-1');
    });
  });

  describe('getAllInterviews', () => {
    it('throws if userId is missing', async () => {
      await expect(controller.getAllInterviews(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('calls interviewsService.getAllInterviewsByUser', async () => {
      interviewsService.getAllInterviewsByUser.mockResolvedValue(['m1']);
      await expect(controller.getAllInterviews('u-1')).resolves.toEqual(['m1']);
      expect(interviewsService.getAllInterviewsByUser).toHaveBeenCalledWith('u-1');
    });
  });

  describe('getNextAction', () => {
    it('throws if userId is missing', async () => {
      await expect(controller.getNextAction(undefined as any, 'role')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('calls interviewsService.getNextActionPlan', async () => {
      interviewsService.getNextActionPlan.mockResolvedValue({ action: 'do it' });
      await expect(controller.getNextAction('u-1', 'role')).resolves.toEqual({ action: 'do it' });
      expect(interviewsService.getNextActionPlan).toHaveBeenCalledWith('u-1', 'role');
    });
  });

  describe('startInterview', () => {
    it('throws when userId is missing', async () => {
      await expect(controller.startInterview(undefined as any, 'Title')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('calls interviewsService.startNewInterview', async () => {
      interviewsService.startNewInterview.mockResolvedValue({ success: true });
      await expect(controller.startInterview('u-1', 'Backend Dev')).resolves.toEqual({ success: true });
      expect(interviewsService.startNewInterview).toHaveBeenCalledWith('u-1', 'Backend Dev');
    });
  });

  describe('startWithCv', () => {
    it('throws when file is missing', async () => {
      await expect(
        controller.startWithCv('u-1', undefined as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('calls interviewsService.startWithCv with the file buffer', async () => {
      const file = { buffer: Buffer.from('pdf-data') } as Express.Multer.File;
      interviewsService.startWithCv.mockResolvedValue({ success: true });

      await expect(controller.startWithCv('u-1', file)).resolves.toEqual({ success: true });
      expect(interviewsService.startWithCv).toHaveBeenCalledWith('u-1', file.buffer);
    });
  });

  describe('getInterviewState', () => {
    it('throws when userId is missing', async () => {
      await expect(controller.getInterviewState('i-1', undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('calls interviewsService.getInterviewState', async () => {
      interviewsService.getInterviewState.mockResolvedValue({ state: 'ok' });
      await expect(controller.getInterviewState('i-1', 'u-1')).resolves.toEqual({ state: 'ok' });
      expect(interviewsService.getInterviewState).toHaveBeenCalledWith('i-1', 'u-1');
    });
  });

  describe('executeCode', () => {
    it('throws when code is missing', async () => {
      await expect(controller.executeCode(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('delegates to interviewsService.aiService.executeCode', async () => {
      interviewsService.aiService.executeCode.mockResolvedValue({ result: 'ok' });
      await expect(controller.executeCode('code')).resolves.toEqual({ result: 'ok' });
      expect(interviewsService.aiService.executeCode).toHaveBeenCalledWith('code');
    });
  });

  describe('chatWithAgent', () => {
    it('streams chunks to response and ends the stream', async () => {
      async function* generator() {
        yield 'chunk1';
        yield 'chunk2';
      }
      interviewsService.processUserMessageStream.mockReturnValue(generator());

      const res = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as any;

      await controller.chatWithAgent(
        'i-1',
        'u-1',
        'hi',
        'THEORY',
        '',
        '',
        'neutral',
        res,
      );

      expect(res.setHeader).toHaveBeenCalledTimes(3);
      expect(res.write).toHaveBeenCalledWith('chunk1');
      expect(res.write).toHaveBeenCalledWith('chunk2');
      expect(res.end).toHaveBeenCalled();
    });

    it('sends error metadata when stream throws', async () => {
      const error = new Error('fail');
      interviewsService.processUserMessageStream.mockImplementation(() => {
        throw error;
      });
      const res = {
        setHeader: jest.fn(),
        write: jest.fn(),
        end: jest.fn(),
        status: jest.fn().mockReturnThis(),
      } as any;

      await controller.chatWithAgent(
        'i-1',
        'u-1',
        'hi',
        'THEORY',
        '',
        '',
        'neutral',
        res,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.end).toHaveBeenCalledWith(expect.stringContaining('__METADATA__'));
    });
  });

  describe('chatWithAudio', () => {
    it('throws when audio file is missing', async () => {
      await expect(
        controller.chatWithAudio('i-1', undefined as any, 'u-1', 'THEORY'),
      ).rejects.toThrow(BadRequestException);
    });

    it('delegates to interviewsService.processAudioMessage', async () => {
      const file = { buffer: Buffer.from('audio'), originalname: 'answer.wav' } as Express.Multer.File;
      interviewsService.processAudioMessage.mockResolvedValue({ success: true });

      await expect(
        controller.chatWithAudio('i-1', file, 'u-1', 'THEORY'),
      ).resolves.toEqual({ success: true });
      expect(interviewsService.processAudioMessage).toHaveBeenCalledWith(
        'i-1',
        'u-1',
        file.buffer,
        file.originalname,
        'THEORY',
        '',
        '',
        'neutral',
      );
    });
  });

  describe('getReport', () => {
    it('calls interviewsService.getSummaryReport', async () => {
      interviewsService.getSummaryReport.mockResolvedValue({ report: 'ok' });
      await expect(controller.getReport('i-1')).resolves.toEqual({ report: 'ok' });
      expect(interviewsService.getSummaryReport).toHaveBeenCalledWith('i-1');
    });
  });
});
