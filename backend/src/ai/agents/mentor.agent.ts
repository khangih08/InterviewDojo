import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';

export class MentorAgent {
  constructor(private readonly llm: BaseChatModel) {}

  async invoke(targetRole: string, lastInterviewReport: string, averageScore: number) {
    // 1. Sử dụng JsonOutputParser bọc thép của Langchain
    const parser = new JsonOutputParser();

    // 2. Viết Prompt dặn dò cực kỳ gắt gao
    const prompt = PromptTemplate.fromTemplate(`
      Bạn là một chuyên gia cố vấn nghề nghiệp (Career Mentor) cấp cao.
      Nhiệm vụ của bạn là phân tích báo cáo phỏng vấn của ứng viên và đưa ra Kế hoạch hành động (Next Action).

      Thông tin ứng viên:
      - Vị trí mục tiêu: {role}
      - Điểm phỏng vấn: {score}/100
      - Đánh giá từ AI: {report}

      [QUY TẮC TỐI THƯỢNG]
      1. Khóa học (suggested_track) PHẢI dành riêng cho vị trí "{role}".
      2. Nếu "{role}" là AI, TUYỆT ĐỐI KHÔNG sinh ra chữ Frontend hay Backend. Hãy sáng tạo tên track thật ngầu (VD: "AI/ML Mastery Track").

      [ĐỊNH DẠNG ĐẦU RA]
      Bắt buộc trả về JSON hợp lệ theo đúng cấu trúc sau. Không giải thích thêm:
      {{
        "motivational_message": "Một câu động viên dựa trên điểm số (tiếng Việt).",
        "focus_topics": ["Chủ đề 1", "Chủ đề 2", "Chủ đề 3"],
        "suggested_track": "Tên khóa học (Phải bám sát vị trí {role})",
        "track_description": "Lý do nên học track này để cải thiện kỹ năng cho {role}."
      }}
    `);

    // 3. Nối chuỗi pipe
    const chain = prompt.pipe(this.llm).pipe(parser);

    try {
      const response = await chain.invoke({
        role: targetRole,
        score: averageScore,
        report: lastInterviewReport || "Chưa có dữ liệu.",
      });

      return response;

    } catch (error) {
      console.error("❌ Lỗi khi Mentor Agent sinh kế hoạch:", error);
      // Fallback khi đứt mạng / hết tiền API / Groq sập
      return {
        motivational_message: "Hãy tiếp tục luyện tập để giữ vững phong độ!",
        focus_topics: ["General", "Soft Skills", "Technical"],
        suggested_track: `${targetRole} Starter Track`,
        track_description: `Luyện tập các kỹ năng nền tảng cho vị trí ${targetRole}.`
      };
    }
  }
}