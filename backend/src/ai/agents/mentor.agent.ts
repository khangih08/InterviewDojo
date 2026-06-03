import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';

export class MentorAgent {
  constructor(private readonly llm: BaseChatModel) {}

  async invoke(cvContext: string, lastInterviewReport: string, averageScore: number) {
    const parser = new JsonOutputParser();

    const prompt = PromptTemplate.fromTemplate(`
      Bạn là một chuyên gia cố vấn nghề nghiệp (Career Mentor) cấp cao.
      Nhiệm vụ của bạn là phân tích báo cáo phỏng vấn và CV của ứng viên để đưa ra Kế hoạch hành động (Next Action).

      [DỮ LIỆU ĐẦU VÀO]
      - Điểm phỏng vấn: {score}/100
      - Báo cáo đánh giá AI: {report}
      - Nội dung CV ứng viên:
      ---
      {cv}
      ---

      [QUY TẮC TỐI THƯỢNG]
      1. Tự động xác định "Vị trí chuyên môn" của ứng viên dựa trên nội dung CV (Ví dụ: Frontend, Data, AI, v.v.).
      2. Khóa học (suggested_track) PHẢI bám sát vị trí chuyên môn vừa tìm được. (VD: Nếu CV thiên về AI, hãy sáng tạo tên track thật ngầu như "AI/ML Mastery Track").
      3. TUYỆT ĐỐI KHÔNG SỬ DỤNG CHÚ THÍCH (như "//" hay "/* */") TRONG JSON.

      [ĐỊNH DẠNG ĐẦU RA]
      Bắt buộc trả về JSON hợp lệ theo đúng cấu trúc sau. Không giải thích thêm:
      {{
        "motivational_message": "Một câu động viên dựa trên điểm số (tiếng Việt).",
        "focus_topics": ["Chủ đề 1", "Chủ đề 2", "Chủ đề 3"],
        "suggested_track": "Tên khóa học (Sáng tạo dựa trên CV)",
        "track_description": "Lý do nên học track này để cải thiện kỹ năng cho vị trí hiện tại."
      }}
    `);

    let aiText = "";
    try {
      const promptValue = await prompt.format({
        cv: cvContext || "Không có thông tin CV.",
        score: averageScore,
        report: lastInterviewReport || "Chưa có dữ liệu.",
      });

      const rawResponse = await this.llm.invoke(promptValue);

      if (typeof rawResponse === "string") {
        aiText = rawResponse;
      } else if (rawResponse && typeof rawResponse.content === "string") {
        aiText = rawResponse.content;
      } else if (rawResponse && rawResponse.text) {
        aiText = rawResponse.text;
      }
      aiText = aiText.trim();

      aiText = aiText.replace(/(?<!https?:)\/\/.*$/gm, '');
      aiText = aiText.replace(/\/\*[\s\S]*?\*\//g, '');

      let parsedResponse: any = null;
      try {
        parsedResponse = await parser.parse(aiText);
      } catch (parseError) {
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Không tìm thấy JSON hợp lệ trong câu trả lời của Mentor.");
        }
      }

      return parsedResponse;

    } catch (error) {
      console.error("❌ [MentorAgent] Lỗi khi sinh kế hoạch:", error);
      console.error("Dữ liệu thô gây lỗi:", aiText);

      return {
        motivational_message: "Hãy tiếp tục luyện tập để giữ vững phong độ và chinh phục đỉnh cao mới!",
        focus_topics: ["Kiến thức nền tảng", "Kỹ năng mềm", "Tối ưu hóa Code"],
        suggested_track: "Career Starter Track",
        track_description: "Khóa học rèn luyện toàn diện các kỹ năng cốt lõi dựa trên kinh nghiệm hiện tại của bạn."
      };
    }
  }
}