import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk';
import * as fs from 'fs';

@Injectable()
export class InterviewsService {
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
      console.error(' Groq STT Error:', error);
      throw new Error('Lỗi khi chuyển đổi giọng nói thành văn bản');
    }
  }

  async evaluateAnswer(question: string, answer: string): Promise<string> {
    try {
      const systemPrompt = `Bạn là một chuyên gia phỏng vấn IT cấp cao (Senior Technical Interviewer).
      Nhiệm vụ của bạn là đánh giá câu trả lời của ứng viên dựa trên kiến thức chuyên môn của bạn.
      Định dạng trả lời ngắn gọn (khoảng 150 chữ) bằng tiếng Việt. BẮT BUỘC chỉ ra 1 điểm tốt và 1 điểm cần cải thiện của ứng viên.`;

      const userPrompt = `Câu hỏi phỏng vấn: "${question}"\n\nỨng viên trả lời (qua ghi âm): "${answer}"\n\nHãy nhận xét câu trả lời này.`;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
      });

      return (
        chatCompletion.choices[0]?.message?.content || 'Không thể tạo feedback.'
      );
    } catch (error) {
      console.error('❌ Groq LLM Error:', error);
      return 'Có lỗi xảy ra khi AI đánh giá câu trả lời.';
    }
  }
}
