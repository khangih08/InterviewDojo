import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export class EvaluatorAgent {
  constructor(private model: ChatOpenAI) {}

  async invoke(messages: any[], userContext: any, codeSnippet: string | null) {
    const chatHistoryText = messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => `**${msg.role === 'user' ? 'Ứng viên' : 'AI'}:** ${msg.content}`)
      .join('\n\n');

    const finalCode = codeSnippet && codeSnippet.trim().length > 0
      ? codeSnippet
      : "[HỆ THỐNG]: Ứng viên không có dữ liệu code thực hành.";

    const systemPrompt = new SystemMessage(`
Bạn là một Tech Lead (Chuyên gia Đánh giá Kỹ thuật). Cuộc phỏng vấn đã kết thúc.
Nhiệm vụ của bạn là phân tích toàn bộ lịch sử trò chuyện và code của ứng viên để xuất ra báo cáo Dashboard dưới dạng JSON.

[TIÊU CHÍ CHẤM ĐIỂM (Thang 0-100)]
1. Technical Knowledge: Nắm vững kiến thức nền tảng, khái niệm (Dựa trên câu trả lời lý thuyết).
2. Coding Logic: Thuật toán, khả năng giải quyết bài toán thực tế.
3. Code Optimization: Cách tối ưu hiệu suất (Time/Space Complexity), clean code.
4. Language Mastery: Độ am hiểu sâu về ngôn ngữ lập trình đang dùng.
5. Soft Skills: Sự tự tin, cách diễn đạt mạch lạc, tư duy phản biện.

[QUY TẮC ĐẦU RA JSON BẮT BUỘC]
Bắt buộc trả về DUY NHẤT một Object JSON hợp lệ. KHÔNG bọc bằng \`\`\`json.
Cấu trúc JSON yêu cầu:
{
  "average_score": 0, // Điểm trung bình cộng của 5 tiêu chí trên
  "breakdown": {
    "theory": 0, // Dựa trên Technical Knowledge
    "coding": 0, // Trung bình của Coding Logic, Optimization và Language
    "soft_skills": 0 // Dựa trên Soft Skills
  },
  "radar_chart": [
    0, // [0] BẮT BUỘC LÀ: Technical Knowledge
    0, // [1] BẮT BUỘC LÀ: Coding Logic
    0, // [2] BẮT BUỘC LÀ: Code Optimization
    0, // [3] BẮT BUỘC LÀ: Language Mastery
    0  // [4] BẮT BUỘC LÀ: Soft Skills
  ],
  "learning_path": [
    {
      "topic": "Tên chủ đề cần học (Chỉ đưa ra nếu điểm tiêu chí đó < 80)",
      "reason": "Chỉ ra chính xác lỗ hổng dựa trên lịch sử chat/code",
      "suggestion": "Lời khuyên thực tế để khắc phục",
      "link": "Đường dẫn hợp lệ tới các trang uy tín (VD: https://developer.mozilla.org, https://react.dev) hoặc từ khóa tìm kiếm rõ ràng."
    }
  ],
  "summary_markdown": "Đoạn văn tóm tắt điểm mạnh và điểm yếu, dùng cú pháp Markdown (Ví dụ dùng in đậm, list danh sách)."
}
    `);

    try {
      const response = await this.model.invoke(
        [
          systemPrompt,
          new HumanMessage(`Vị trí ứng tuyển: ${userContext.target_role}.\n\n--- MÃ NGUỒN CUỐI CÙNG ---\n${finalCode}\n\n--- LỊCH SỬ CHAT (RÚT GỌN) ---\n${chatHistoryText}`)
        ],
        {
          response_format: { type: "json_object" }
        }
      );

      const content = (response.content as string).trim();
      return JSON.parse(content);

    } catch (error) {
      console.error("❌ [EvaluatorAgent] Lỗi parse JSON:", error);
      return {
        average_score: 0,
        breakdown: { theory: 0, coding: 0, soft_skills: 0 },
        radar_chart: [0, 0, 0, 0, 0],
        learning_path: [],
        summary_markdown: "## Lỗi hệ thống\nKhông thể tạo báo cáo đánh giá tự động lúc này. Dữ liệu phỏng vấn chưa đủ hoặc API đang gián đoạn."
      };
    }
  }
}