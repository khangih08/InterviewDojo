import { Controller, Post, Body, UploadedFile, UseInterceptors, BadRequestException, Get, UseGuards, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorator/get-user.decorator';
import * as fs from 'fs';


@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserInterviews(@GetUser('id') userId: string) {
    return this.interviewsService.getUserInterviews(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getInterviewById(@Param('id') id: string, @GetUser('id') userId: string) {
    return this.interviewsService.getInterviewById(id, userId);
  }

  @Post('start')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('cvFile'))
  async startInterview(
    @Body() body: { type: string; jobDescription?: string },
    @GetUser('id') userId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let cvText = '';

    if (body.type === 'TARGETED') {
      if (!file) throw new BadRequestException('Vui lòng upload CV (PDF)!');

      try {
        console.log("Bắt đầu đọc file PDF với pdf-extraction...");

        let pdfBuffer: Buffer;
        if (file.buffer) {
          pdfBuffer = file.buffer;
          console.log("-> File đang nằm trên RAM (buffer)");
        } else if (file.path) {
          pdfBuffer = fs.readFileSync(file.path);
          console.log("-> File đang nằm trên ổ cứng, đường dẫn:", file.path);
        } else {
          console.log("Cấu trúc file bị dị dạng:", file);
          throw new BadRequestException('File upload không đúng định dạng chuẩn!');
        }

        const extractPdf = require('pdf-extraction');
        const parsed = await extractPdf(pdfBuffer);
        cvText = parsed.text;

        console.log("🎉 BÓC TEXT THÀNH CÔNG! Số ký tự:", cvText.length);
      } catch (err) {
        console.error("\n=== LỖI ĐỌC PDF ===");
        console.error(err);
        console.error("===================\n");
        throw new BadRequestException('Không thể đọc chữ trong file PDF này! Vui lòng thử lại.');
      }
    }

    return this.interviewsService.startInterview(body.type, userId, cvText, body.jobDescription);
  }

  @Post('upload-audio')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(
    @Body('interviewId') interviewId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!interviewId) throw new BadRequestException('Thiếu ID buổi phỏng vấn!');
    if (!file) throw new BadRequestException('Không tìm thấy file âm thanh!');

    return this.interviewsService.processAudio(interviewId, file);
  }
}