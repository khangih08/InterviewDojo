import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { InterviewsService } from './interviews.service';

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  // --- API MỚI: YÊU CẦU NÂNG CẤP PRO ---
  @Post('request-pro')
  async requestPro(@Body('userId') userId: string) {
    if (!userId) throw new BadRequestException('Missing userId');
    return await this.interviewsService.requestPro(userId);
  }

  @Get()
  async getAllInterviews(@Query('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('Thiếu thông tin userId để lấy lịch sử phỏng vấn.');
    }
    return await this.interviewsService.getAllInterviewsByUser(userId);
  }

  @Get('next-action/:userId')
  async getNextAction(
    @Param('userId') userId: string,
    @Query('role') role: string
  ) {
    if (!userId) {
      throw new BadRequestException('Thiếu thông tin userId.');
    }
    return await this.interviewsService.getNextActionPlan(userId, role);
  }

  @Post('start')
  async startInterview(
    @Body('userId') userId: string,
    @Body('jobTitle') jobTitle: string
  ) {
    if (!userId) throw new BadRequestException('Thiếu thông tin userId.');
    return await this.interviewsService.startNewInterview(userId, jobTitle);
  }

  @Post('start-with-cv')
  @UseInterceptors(FileInterceptor('file'))
  async startWithCv(@Body('userId') userId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) throw new BadRequestException('Vui lòng upload file CV (PDF).');
    return await this.interviewsService.startWithCv(userId, file.buffer);
  }

  @Get(':id/state')
  async getInterviewState(@Param('id') interviewId: string, @Query('userId') userId: string) {
    if (!userId) throw new BadRequestException('Thiếu thông tin userId');
    return await this.interviewsService.getInterviewState(interviewId, userId);
  }

  @Post('execute')
  async executeCode(@Body('code') code: string) {
    if (!code) throw new BadRequestException('Vui lòng cung cấp mã nguồn.');
    return await this.interviewsService.aiService.executeCode(code);
  }

  @Post(':id/chat')
  async chatWithAgent(
    @Param('id') interviewId: string,
    @Body('userId') userId: string,
    @Body('message') message: string,
    @Body('activeTab') activeTab: 'THEORY' | 'CODING' | 'EVALUATION',
    @Body('codeSnippet') codeSnippet: string,
    @Body('terminalOutput') terminalOutput: string,
    @Body('emotion') emotion: string,
    @Res() res: Response
  ) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = this.interviewsService.processUserMessageStream(
        interviewId,
        userId,
        message,
        activeTab || 'THEORY',
        codeSnippet || '',
        terminalOutput || '',
        emotion || 'neutral'
      );

      for await (const chunk of stream) {
        res.write(chunk);
      }
      res.end();
    } catch (error) {
      res.status(400).end(`__METADATA__${JSON.stringify({ error: error.message })}`);
    }
  }

  @Post(':id/chat-audio')
  @UseInterceptors(FileInterceptor('audio'))
  async chatWithAudio(
    @Param('id') interviewId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Body('activeTab') activeTab: 'THEORY' | 'CODING' | 'EVALUATION',
    @Body('codeSnippet') codeSnippet?: string,
    @Body('terminalOutput') terminalOutput?: string,
    @Body('emotion') emotion?: string,
  ) {
    if (!file) throw new BadRequestException('Không tìm thấy file âm thanh.');
    return await this.interviewsService.processAudioMessage(
      interviewId,
      userId,
      file.buffer,
      file.originalname,
      activeTab || 'THEORY',
      codeSnippet || '',
      terminalOutput || '',
      emotion || 'neutral'
    );
  }

  @Get(':id/report')
  async getReport(@Param('id') interviewId: string) {
    return await this.interviewsService.getSummaryReport(interviewId);
  }
}