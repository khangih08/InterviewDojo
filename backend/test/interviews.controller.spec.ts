/// <reference types="jest" />

import { BadRequestException } from '@nestjs/common';

const mockExtractPdf = jest.fn();

jest.mock('pdf-extraction', () => mockExtractPdf, { virtual: true });
jest.mock('fs', () => {
  const actualFs = jest.requireActual('fs');
  return {
    ...actualFs,
    readFileSync: jest.fn(),
  };
});

import * as fs from 'fs';
import { InterviewsController } from '../src/interviews/interviews.controller';

describe('InterviewsController', () => {
  const interviewsService = {
    startNewInterview: jest.fn(),
    processAudioMessage: jest.fn(),
    requestPro: jest.fn(),
  };

  let controller: InterviewsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new InterviewsController(interviewsService as any);
  });

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
});
