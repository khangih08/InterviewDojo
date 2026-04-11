import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InterviewsService } from './service';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Post('upload-audio')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
          const ext = extname(file.originalname) || '.webm';
          cb(null, `${randomName}${ext}`);
        },
      })
    }),
  )
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('Không tìm thấy file gửi lên');
    }

    const question = body.question || "Bạn hãy giới thiệu bản thân mình?";

    console.log('🎬 Đang xử lý file:', file.filename);
    console.log(`📝 Câu hỏi đang chấm: "${question}"`);

    const transcript = await this.interviewsService.speechToText(file);
    console.log('🗣️ Ứng viên nói:', transcript);

    console.log('🤖 AI đang phân tích câu trả lời...');
    const feedback = await this.interviewsService.evaluateAnswer(question, transcript);
    console.log('✅ AI nhận xét:', feedback);

    return {
      success: true,
      transcript: transcript,
      feedback: feedback,
    };
  }
}