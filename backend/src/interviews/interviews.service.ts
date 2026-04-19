import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interview } from '../entities/interview.entity';
import { Message } from '../entities/message.entity';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InterviewsService {
  private groq: OpenAI;
  private genAI: GoogleGenerativeAI;

  constructor(
    @InjectRepository(Interview) private interviewRepo: Repository<Interview>,
    @InjectRepository(Message) private messageRepo: Repository<Message>,
  ) {
    this.groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY || '',
      baseURL: 'https://api.groq.com/openai/v1',
    });

    this.genAI = new GoogleGenerativeAI(process.env.Gemini_API_KEY || '');
  }

  async startInterview(type: string, cvText?: string, jdText?: string) {
    const interview = this.interviewRepo.create({
      type: type as 'FREE' | 'TARGETED',
      cv_text: cvText,
      job_description: jdText,
    });
    const savedInterview = await this.interviewRepo.save(interview);

    let systemPrompt = '';
    let firstAiGreeting = '';

    if (type === 'FREE') {
      systemPrompt = `
        Bạn là một chuyên gia phỏng vấn kỹ thuật (Technical Interviewer) cấp cao trong lĩnh vực IT (Software Engineering).
        Nhiệm vụ của bạn là phỏng vấn ứng viên để đánh giá năng lực lập trình, tư duy hệ thống (System Design), và kiến thức công nghệ.

        Quy tắc:
        1. Hỏi ứng viên xem họ muốn phỏng vấn vị trí gì (Frontend, Backend, DevOps, Mobile...) và tech stack nào.
        2. Dựa vào vị trí đó, đưa ra các câu hỏi chuyên sâu từ lý thuyết cơ bản đến các tình huống thực tế khó (tránh hỏi quá hàn lâm).
        3. QUAN TRỌNG: Chỉ hỏi MỖI LẦN 1 CÂU DUY NHẤT. Tuyệt đối không hỏi dồn dập nhiều câu cùng lúc.
        4. Chờ ứng viên trả lời, nhận xét ngắn gọn đúng sai, rồi mới hỏi câu tiếp theo. Giao tiếp tự nhiên, ngắn gọn như người thật.
      `;
      firstAiGreeting = 'Chào bạn! Tôi là Technical Interviewer. Hôm nay bạn muốn chúng ta luyện tập phỏng vấn cho vị trí IT nào (ví dụ: ReactJS Developer, Backend Nodejs, Data Engineer...) và mức độ là Fresher, Junior hay Senior?';

    } else {
      systemPrompt = `
        Bạn là Giám đốc Kỹ thuật (CTO) đang trực tiếp phỏng vấn ứng viên.
        Dưới đây là tài liệu của ứng viên:
        ---
        YÊU CẦU CÔNG VIỆC (JD): ${jdText || 'Không có thông tin JD cụ thể'}
        ---
        HỒ SƠ ỨNG VIÊN (CV): ${cvText || 'Không đọc được CV'}
        ---

        Nhiệm vụ của bạn:
        1. SOI KỸ CV: Đừng hỏi chung chung. Hãy tìm các dự án, công nghệ, hoặc kinh nghiệm mà ứng viên ghi trong CV để đặt câu hỏi xoáy sâu (ví dụ: "Trong CV bạn có ghi dùng Redis cho dự án X, bạn đã giải quyết vấn đề cache invalidation thế nào?").
        2. ĐỐI CHIẾU JD: Đặt các câu hỏi tình huống để xem ứng viên có đáp ứng được các kỹ năng yêu cầu trong JD hay không.
        3. QUAN TRỌNG NHẤT: Bắt buộc chỉ được hỏi MỖI LẦN 1 CÂU DUY NHẤT. Phải đợi ứng viên trả lời xong mới được nhận xét và hỏi câu tiếp theo.
        4. Giữ thái độ chuyên nghiệp, sắc sảo của một người làm kỹ thuật lâu năm. Phản hồi ngắn gọn, đi thẳng vào vấn đề.
      `;
      firstAiGreeting = 'Chào bạn! Tôi đã đọc kỹ CV của bạn và đối chiếu với JD vị trí đang tuyển. Hồ sơ của bạn có một vài điểm khá thú vị. Để bắt đầu, bạn hãy chọn một dự án kỹ thuật trong CV mà bạn tâm đắc nhất và chia sẻ về vai trò của mình trong đó nhé?';
    }

    await this.messageRepo.save([
      { interview_id: savedInterview.id, role: 'system' as any, content: systemPrompt },
      { interview_id: savedInterview.id, role: 'assistant' as any, content: firstAiGreeting }
    ]);

    return { success: true, interviewId: savedInterview.id, firstMessage: firstAiGreeting };
  }

  async processAudio(interviewId: string, file: Express.Multer.File) {
    const interview = await this.interviewRepo.findOne({ where: { id: interviewId } });
    if (!interview) throw new BadRequestException('Phỏng vấn không tồn tại!');

    let audioFilePath = '';
    let isTempFile = false;

    try {

      let ext = 'webm';
      if (file.originalname && file.originalname.includes('.')) {
        ext = file.originalname.split('.').pop()?.toLowerCase() || 'webm';
      }

      const validExts = ['flac', 'mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'ogg', 'opus', 'wav', 'webm'];
      if (!validExts.includes(ext)) {
        ext = 'webm';
      }

      audioFilePath = path.join(__dirname, `temp_${Date.now()}.${ext}`);

      if (file.buffer) {
        fs.writeFileSync(audioFilePath, file.buffer);
      } else if (file.path) {
        fs.copyFileSync(file.path, audioFilePath);
      } else {
        throw new Error("File âm thanh bị lỗi cấu trúc.");
      }
      isTempFile = true;

      const transcription = await this.groq.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: 'whisper-large-v3',
        language: 'vi',
      });
      const userText = transcription.text || '';

      if (!userText || userText.trim() === "") {
        throw new Error("Không nhận diện được giọng nói.");
      }

      const history = await this.messageRepo.find({
        where: { interview_id: interviewId },
        order: { created_at: 'ASC' }
      });

      const messages = history.map(m => ({
        role: m.role as 'system' | 'user' | 'assistant',
        content: m.content
      }));
      messages.push({ role: 'user', content: userText });

      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: messages,
      });

      const aiResponse = completion.choices[0]?.message?.content || '';

      await this.messageRepo.save([
        { interview_id: interviewId, role: 'user' as any, content: userText },
        { interview_id: interviewId, role: 'assistant' as any, content: aiResponse }
      ]);

      return { success: true, userText, aiResponse };

    } catch (error) {
      console.error("Lỗi AI:", error);
      throw new BadRequestException("AI đang bận hoặc không nghe rõ, thử lại sau!");
    } finally {
      if (isTempFile && fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
      }
    }
  }
}