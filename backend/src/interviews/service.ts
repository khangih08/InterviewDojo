import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import * as fs from 'fs';

@Injectable()
export class InterviewsService {
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  // 1. Hàm STT cũ
  async speechToText(file: Express.Multer.File): Promise<string> {
    try {
      const transcription = await this.groq.audio.transcriptions.create({
        file: fs.createReadStream(file.path),
        model: 'whisper-large-v3',
        response_format: 'json',
        language: 'vi',
      });

      fs.unlinkSync(file.path);
      return transcription.text;
    } catch (error) {
      console.error('❌ Groq STT Error:', error);
      throw new Error('Lỗi khi chuyển đổi giọng nói thành văn bản');
    }
  }

  // 2. HÀM MỚI: Dùng AI chấm điểm
  async evaluateAnswer(question: string, answer: string): Promise<string> {
    try {
      const systemPrompt = `Bạn là một chuyên gia phỏng vấn IT cấp cao (Senior Technical Interviewer).
      Nhiệm vụ của bạn là đánh giá câu trả lời của ứng viên một cách chuyên nghiệp, ngắn gọn (dưới 150 chữ) và mang tính xây dựng.
      Hãy chỉ ra 1 điểm tốt và 1 điểm cần cải thiện. Trả lời bằng tiếng Việt.`;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Câu hỏi: "${question}"\n\nỨng viên trả lời: "${answer}"\n\nHãy nhận xét.` }
        ],
        model: 'llama-3.3-70b-versatile', // Model xịn và nhanh của Groq
        temperature: 0.7,
      });

      return chatCompletion.choices[0]?.message?.content || 'Không thể tạo feedback.';
    } catch (error) {
      console.error('❌ Groq LLM Error:', error);
      return 'Có lỗi xảy ra khi AI đánh giá câu trả lời.';
    }
  }
}