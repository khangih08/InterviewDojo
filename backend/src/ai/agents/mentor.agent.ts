import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { PromptTemplate } from '@langchain/core/prompts';
import { z } from 'zod';

export class MentorAgent {
  constructor(private readonly llm: BaseChatModel) {}

  async invoke(targetRole: string, lastInterviewReport: string, averageScore: number) {
    // 1. ĐỊNH NGHĨA SCHEMA CHUẨN 100% BẰNG ZOD
    // AI sẽ bị ép buộc trả về đúng các key và type này ở cấp độ API
    const responseSchema = z.object({
      motivational_message: z.string().describe("Một câu động viên ngắn gọn dưới 20 chữ"),
      focus_topics: z.array(z.string()).describe("Mảng chứa đúng 3 từ khóa kỹ năng cần ôn tập"),
      suggested_track: z.string().describe(`Tên khóa luyện tập tiếp theo. BẮT BUỘC phải liên quan đến vị trí ${targetRole}. KHÔNG dùng Frontend/Backend nếu vị trí là AI.`),
      track_description: z.string().describe(`Mô tả ngắn gọn lý do tại sao nên luyện track này cho vị trí ${targetRole}.`)
    });

    // 2. ÉP MODEL PHẢI TRẢ VỀ CẤU TRÚC ĐÓ
    // Kỹ thuật withStructuredOutput sẽ biến prompt của bạn thành 1 Function Call
    const structuredLlm = this.llm.withStructuredOutput(responseSchema, {
      name: "generate_action_plan",
    });

    // 3. PROMPT BÂY GIỜ CHỈ CẦN TẬP TRUNG VÀO LOGIC (Không cần dạy nó viết JSON nữa)
    const prompt = PromptTemplate.fromTemplate(`
      Bạn là một chuyên gia cố vấn nghề nghiệp (Career Mentor) cấp cao.
      Nhiệm vụ của bạn là phân tích báo cáo phỏng vấn gần nhất của ứng viên và đưa ra Kế hoạch hành động (Next Action).

      Thông tin ứng viên:
      - Vị trí mục tiêu: {role}
      - Điểm phỏng vấn gần nhất: {score}/100
      - Đánh giá từ AI phỏng vấn: {report}

      Hãy sáng tạo ra một cái tên Track thật ngầu và bám sát vị trí {role} (Ví dụ: "AI/ML Mastery Track" cho vị trí AI, "React Pro" cho Frontend...).
    `);

    const chain = prompt.pipe(structuredLlm);

    try {
      // 4. KẾT QUẢ TRẢ VỀ ĐÃ LÀ 1 OBJECT JAVASCRIPT CHUẨN, KHÔNG CẦN JSON.PARSE NỮA
      const response = await chain.invoke({
        role: targetRole,
        score: averageScore,
        report: lastInterviewReport || "Chưa có dữ liệu.",
      });

      return response;

    } catch (error) {
      console.error("❌ Lỗi khi Mentor Agent sinh kế hoạch:", error);
      return {
        motivational_message: "Hãy tiếp tục luyện tập để giữ vững phong độ!",
        focus_topics: ["General", "Soft Skills", "Technical"],
        suggested_track: `${targetRole} Starter Track`,
        track_description: `Luyện tập các kỹ năng nền tảng cho vị trí ${targetRole}.`
      };
    }
  }
}