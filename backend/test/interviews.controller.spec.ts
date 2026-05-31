import { BadRequestException } from '@nestjs/common';
import { InterviewsController } from '../src/interviews/interviews.controller';

describe('InterviewsController', () => {
  const interviewsService = {
    startNewInterview: jest.fn(),
    processAudioMessage: jest.fn(),
    requestPro: jest.fn(),
    getAllInterviewsByUser: jest.fn(),
    getNextActionPlan: jest.fn(),
    startWithCv: jest.fn(),
    getInterviewState: jest.fn(),
    getSummaryReport: jest.fn(),
    processUserMessageStream: jest.fn(),
    aiService: {
      executeCode: jest.fn(),
    },
  };

  let controller: InterviewsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new InterviewsController(interviewsService as any);
  });

  // --- Start Interview Tests ---
  it('starts a new interview successfully', async () => {
    interviewsService.startNewInterview.mockResolvedValue({ id: 'i-1', jobTitle: 'Frontend', greeting: 'Hi' });

    await expect(
      controller.startInterview('u-1', 'Frontend Developer'),
    ).resolves.toEqual({ id: 'i-1', jobTitle: 'Frontend', greeting: 'Hi' });
    expect(interviewsService.startNewInterview).toHaveBeenCalledWith(
      'u-1',
      'Frontend Developer',
    );
  });

  it('throws when startInterview is missing userId', async () => {
    await expect(controller.startInterview(undefined as any, 'Frontend')).rejects.toThrow(BadRequestException);
  });

  // --- Request Pro Tests ---
  it('throws when requestPro is missing userId', async () => {
    await expect(
      controller.requestPro(undefined as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('delegates requestPro to service', async () => {
    interviewsService.requestPro.mockResolvedValue({ success: true });
    await expect(controller.requestPro('u-1')).resolves.toEqual({ success: true });
    expect(interviewsService.requestPro).toHaveBeenCalledWith('u-1');
  });

  // --- Get All Interviews Tests ---
  it('throws when getAllInterviews is missing userId', async () => {
    await expect(controller.getAllInterviews(undefined as any)).rejects.toThrow(BadRequestException);
  });

  it('returns interviews list on success', async () => {
    interviewsService.getAllInterviewsByUser.mockResolvedValue([{ id: 'i-1' }]);
    await expect(controller.getAllInterviews('u-1')).resolves.toEqual([{ id: 'i-1' }]);
    expect(interviewsService.getAllInterviewsByUser).toHaveBeenCalledWith('u-1');
  });

  // --- Get Next Action Tests ---
  it('throws when getNextAction is missing userId', async () => {
    await expect(controller.getNextAction(undefined as any, 'Frontend')).rejects.toThrow(BadRequestException);
  });

  it('returns next action plan on success', async () => {
    interviewsService.getNextActionPlan.mockResolvedValue({ plan: 'Do logic' });
    await expect(controller.getNextAction('u-1', 'Frontend')).resolves.toEqual({ plan: 'Do logic' });
    expect(interviewsService.getNextActionPlan).toHaveBeenCalledWith('u-1', 'Frontend');
  });

  // --- Start With CV Tests ---
  it('throws when startWithCv is missing file', async () => {
    await expect(controller.startWithCv('u-1', undefined as any)).rejects.toThrow(BadRequestException);
  });

  it('initiates interview with CV on success', async () => {
    interviewsService.startWithCv.mockResolvedValue({ id: 'i-cv' });
    const file = { buffer: Buffer.from('cv content') } as Express.Multer.File;

    await expect(controller.startWithCv('u-1', file)).resolves.toEqual({ id: 'i-cv' });
    expect(interviewsService.startWithCv).toHaveBeenCalledWith('u-1', file.buffer);
  });

  // --- Get Interview State Tests ---
  it('throws when getInterviewState is missing userId', async () => {
    await expect(controller.getInterviewState('i-1', undefined as any)).rejects.toThrow(BadRequestException);
  });

  it('returns state on success', async () => {
    interviewsService.getInterviewState.mockResolvedValue({ status: 'COMPLETED' });
    await expect(controller.getInterviewState('i-1', 'u-1')).resolves.toEqual({ status: 'COMPLETED' });
    expect(interviewsService.getInterviewState).toHaveBeenCalledWith('i-1', 'u-1');
  });

  // --- Execute Code Tests ---
  it('throws when executeCode is missing code', async () => {
    await expect(controller.executeCode(undefined as any)).rejects.toThrow(BadRequestException);
  });

  it('executes sandbox code on success', async () => {
    interviewsService.aiService.executeCode.mockResolvedValue({ output: '10' });
    await expect(controller.executeCode('console.log(10)')).resolves.toEqual({ output: '10' });
    expect(interviewsService.aiService.executeCode).toHaveBeenCalledWith('console.log(10)', 'javascript');
  });

  // --- Chat With Audio Tests ---
  it('throws when chatWithAudio is missing file', async () => {
    await expect(controller.chatWithAudio('i-1', undefined as any, 'u-1', 'THEORY')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('delegates chatWithAudio to interviewsService.processAudioMessage', async () => {
    interviewsService.processAudioMessage.mockResolvedValue({ recognizedText: 'hello', reply: 'hi', current_phase: 'THEORY' });
    const file = { buffer: Buffer.from('audio'), originalname: 'answer.webm' } as Express.Multer.File;

    await expect(controller.chatWithAudio('i-1', file, 'u-1', 'THEORY')).resolves.toEqual({
      recognizedText: 'hello',
      reply: 'hi',
      current_phase: 'THEORY',
    });
    expect(interviewsService.processAudioMessage).toHaveBeenCalledWith('i-1', 'u-1', file.buffer, file.originalname, 'THEORY', '', '', 'neutral');
  });

  // --- Get Report Tests ---
  it('returns summary report on success', async () => {
    interviewsService.getSummaryReport.mockResolvedValue({ score: 90 });
    await expect(controller.getReport('i-1')).resolves.toEqual({ score: 90 });
    expect(interviewsService.getSummaryReport).toHaveBeenCalledWith('i-1');
  });

  // --- Chat With Agent SSE Streaming Tests ---
  it('streams assistant response chunks on success', async () => {
    async function* mockStream() {
      yield 'chunk 1 ';
      yield 'chunk 2';
    }
    interviewsService.processUserMessageStream.mockReturnValue(mockStream());

    const mockRes = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as any;

    await controller.chatWithAgent(
      'i-1',
      'u-1',
      'hello',
      'THEORY',
      'const x = 1;',
      'output',
      'confident',
      mockRes,
    );

    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream; charset=utf-8');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
    expect(mockRes.write).toHaveBeenCalledWith('chunk 1 ');
    expect(mockRes.write).toHaveBeenCalledWith('chunk 2');
    expect(mockRes.end).toHaveBeenCalled();
  });

  it('handles stream error gracefullly', async () => {
    interviewsService.processUserMessageStream.mockImplementation(() => {
      throw new Error('Stream failed');
    });

    const mockRes = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
      status: jest.fn().mockReturnThis(),
    } as any;

    await controller.chatWithAgent(
      'i-1',
      'u-1',
      'hello',
      'THEORY',
      'const x = 1;',
      'output',
      'confident',
      mockRes,
    );

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.end).toHaveBeenCalledWith('__METADATA__{"error":"Stream failed"}');
  });
});

