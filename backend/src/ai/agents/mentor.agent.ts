import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class MentorAgent {
  constructor(private readonly llm: BaseChatModel) {}

  async invoke(targetRole: string, lastInterviewReport: string, averageScore: number) {
    const prompt = PromptTemplate.fromTemplate(`
      Bạn là một chuyên gia cố vấn nghề nghiệp (Career Mentor) cấp cao.
      Nhiệm vụ của bạn là phân tích báo cáo phỏng vấn gần nhất của ứng viên và đưa ra Kế hoạch hành động (Next Action) để họ cải thiện.

      Thông tin ứng viên:
      - Vị trí mục tiêu: {role}
      - Điểm phỏng vấn gần nhất: {score}/100
      - Đánh giá từ AI phỏng vấn: {report}

      YÊU CẦU ĐẦU RA:
      Bạn BẮT BUỘC phải trả về một chuỗi JSON hợp lệ (không chứa markdown, không có backticks \`\`\`), với cấu trúc chính xác như sau:
      {{
        "motivational_message": "Một câu động viên ngắn gọn (dưới 20 chữ) dựa trên điểm số của họ.",
        "focus_topics": ["Chủ đề 1", "Chủ đề 2", "Chủ đề 3"], // Trích xuất 3 từ khóa kỹ năng họ cần ôn tập nhất (ví dụ: ["System Design", "Database", "React Hook"])
        "suggested_track": "Tên khóa luyện tập tiếp theo (ví dụ: Frontend Advanced Track)",
        "track_description": "Mô tả ngắn gọn lý do tại sao họ nên luyện track này dựa trên điểm yếu của họ."
      }}
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    try {
      const response = await chain.invoke({
        role: targetRole,
        score: averageScore,
        report: lastInterviewReport || "Chưa có dữ liệu, hãy khuyên ứng viên làm bài phỏng vấn đầu tiên.",
      });

      // Xóa các ký tự markdown thừa nếu LLM lỡ sinh ra
      const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Lỗi khi Mentor Agent sinh kế hoạch:", error);
      // Trả về data mặc định nếu LLM lỗi
      return {
        motivational_message: "Hãy tiếp tục luyện tập để giữ vững phong độ!",
        focus_topics: ["General", "Soft Skills", "Technical"],
        suggested_track: "General Interview Track",
        track_description: "Luyện tập các câu hỏi tổng quan để chuẩn bị tốt nhất."
      };
    }
  }
}