import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export class EvaluatorAgent {
  constructor(private model: ChatOpenAI) {}

  async invoke(messages: any[], userContext: any, codeSnippet: string | null) {
    // Tóm tắt lịch sử chat
    const chatHistoryText = messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => `**${msg.role === 'user' ? 'Ứng viên' : 'AI'}:** ${msg.content}`)
      .join('\n\n');

    const finalCode = codeSnippet ? codeSnippet : "Không có dữ liệu code.";

    const systemPrompt = new SystemMessage(`
Bạn là Chuyên gia Đánh giá Kỹ thuật (Senior Tech Lead). Cuộc phỏng vấn đã kết thúc.
Nhiệm vụ của bạn là phân tích lịch sử trò chuyện và code để xuất ra báo cáo Dashboard dưới dạng JSON.

TIÊU CHÍ CHẤM ĐIỂM (Thang 0-100):
1. Technical Knowledge (Lý thuyết): Dựa trên các câu hỏi lý thuyết.
2. Coding Logic (Thực hành): Khả năng giải quyết bài toán.
3. Code Optimization: Cách tối ưu hiệu suất, clean code.
4. Language Mastery: Độ am hiểu ngôn ngữ lập trình.
5. Soft Skills (Kỹ năng mềm): Sự tự tin, cách diễn đạt.

⚠️ QUY TẮC ĐẦU RA:
Bắt buộc trả về DUY NHẤT một Object JSON hợp lệ (Không bọc \`\`\`json).

Cấu trúc JSON yêu cầu:
{
  "average_score": 0,
  "breakdown": {
    "theory": 0,
    "coding": 0,
    "soft_skills": 0
  },
  "radar_chart": [0, 0, 0, 0, 0],
  "learning_path": [
    {
      "topic": "Tên chủ đề cần học",
      "reason": "Lý do yếu điểm",
      "suggestion": "Lời khuyên",
      "link": "URL tài liệu (VD: MDN, React Docs)"
    }
  ],
  "summary_markdown": "Đoạn văn tóm tắt điểm mạnh và điểm yếu, dùng cú pháp Markdown."
}
    `);

    try {
      // ĐÃ SỬA: Truyền response_format trực tiếp vào options của invoke
      const response = await this.model.invoke(
        [
          systemPrompt,
          new HumanMessage(`Vị trí: ${userContext.target_role}.\n\n--- CODE CUỐI CÙNG ---\n${finalCode}\n\n--- LỊCH SỬ CHAT ---\n${chatHistoryText}`)
        ],
        {
          response_format: { type: "json_object" }
        }
      );

      let content = response.content as string;
      return JSON.parse(content);
    } catch (error) {
      console.error("❌ [EvaluatorAgent] Lỗi parse JSON:", error);
      return {
        average_score: 0,
        breakdown: { theory: 0, coding: 0, soft_skills: 0 },
        radar_chart: [0, 0, 0, 0, 0],
        learning_path: [],
        summary_markdown: "## Lỗi hệ thống\nKhông thể tạo báo cáo đánh giá lúc này. Xin vui lòng thử lại sau."
      };
    }
  }
}