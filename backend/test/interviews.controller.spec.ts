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
    startInterview: jest.fn(),
    processAudio: jest.fn(),
  };

  let controller: InterviewsController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new InterviewsController(interviewsService as any);
  });

  it('starts a FREE interview without CV text', async () => {
    interviewsService.startInterview.mockResolvedValue({ success: true });

    await expect(
      controller.startInterview({ type: 'FREE' }),
    ).resolves.toEqual({ success: true });
    expect(interviewsService.startInterview).toHaveBeenCalledWith(
      'FREE',
      '',
      undefined,
    );
  });

  it('throws when TARGETED interview is missing CV file', async () => {
    await expect(
      controller.startInterview({ type: 'TARGETED' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('extracts CV text from file buffer for TARGETED interview', async () => {
    interviewsService.startInterview.mockResolvedValue({ success: true });
    mockExtractPdf.mockResolvedValue({ text: 'cv content' });

    await controller.startInterview(
      { type: 'TARGETED', jobDescription: 'jd' },
      { buffer: Buffer.from('pdf') } as Express.Multer.File,
    );

    expect(mockExtractPdf).toHaveBeenCalled();
    expect(interviewsService.startInterview).toHaveBeenCalledWith(
      'TARGETED',
      'cv content',
      'jd',
    );
  });

  it('reads file path when uploaded file is stored on disk', async () => {
    (fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('pdf'));
    interviewsService.startInterview.mockResolvedValue({ success: true });
    mockExtractPdf.mockResolvedValue({ text: 'cv from path' });

    await controller.startInterview(
      { type: 'TARGETED' },
      { path: 'tmp/cv.pdf' } as Express.Multer.File,
    );

    expect(fs.readFileSync).toHaveBeenCalledWith('tmp/cv.pdf');
    expect(interviewsService.startInterview).toHaveBeenCalledWith(
      'TARGETED',
      'cv from path',
      undefined,
    );
  });

  it('throws when pdf extraction fails', async () => {
    mockExtractPdf.mockRejectedValue(new Error('parse failed'));

    await expect(
      controller.startInterview(
        { type: 'TARGETED' },
        { buffer: Buffer.from('pdf') } as Express.Multer.File,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when uploadAudio is missing interview id', async () => {
    await expect(
      controller.uploadAudio(undefined as any, {} as Express.Multer.File),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when uploadAudio is missing file', async () => {
    await expect(controller.uploadAudio('i-1', undefined as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('delegates uploadAudio to interviewsService.processAudio', async () => {
    interviewsService.processAudio.mockResolvedValue({ success: true });
    const file = { originalname: 'answer.webm' } as Express.Multer.File;

    await expect(controller.uploadAudio('i-1', file)).resolves.toEqual({
      success: true,
    });
    expect(interviewsService.processAudio).toHaveBeenCalledWith('i-1', file);
  });
});
