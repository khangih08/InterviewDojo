import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";

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

    const parser = new JsonOutputParser();

    // TUYỆT ĐỐI CẤM AI LÀM TOÁN. Chỉ trả về mảng 5 điểm độc lập.
    const systemPrompt = new SystemMessage(`
Bạn là một Tech Lead (Chuyên gia Đánh giá Kỹ thuật). Cuộc phỏng vấn đã kết thúc.
Nhiệm vụ của bạn là phân tích toàn bộ lịch sử trò chuyện và code của ứng viên để xuất ra báo cáo.

[TIÊU CHÍ CHẤM ĐIỂM (Thang 0-100)]
1. Technical Knowledge: Nắm vững kiến thức nền tảng, khái niệm.
2. Coding Logic: Thuật toán, khả năng giải quyết bài toán thực tế.
3. Code Optimization: Cách tối ưu hiệu suất (Time/Space Complexity), clean code.
4. Language Mastery: Độ am hiểu sâu về ngôn ngữ lập trình đang dùng.
5. Soft Skills: Sự tự tin, cách diễn đạt mạch lạc, tư duy phản biện.

[QUY TẮC ĐẦU RA JSON BẮT BUỘC]
Trả về DUY NHẤT một Object JSON hợp lệ. TUYỆT ĐỐI KHÔNG TỰ TÍNH TRUNG BÌNH CỘNG:
{
  "radar_chart": [
    0, // [0] Điểm Technical Knowledge
    0, // [1] Điểm Coding Logic
    0, // [2] Điểm Code Optimization
    0, // [3] Điểm Language Mastery
    0  // [4] Điểm Soft Skills
  ],
  "learning_path": [
    {
      "topic": "Tên chủ đề cần học (Chỉ đưa ra nếu điểm tiêu chí đó < 80)",
      "reason": "Chỉ ra chính xác lỗ hổng dựa trên lịch sử chat/code",
      "suggestion": "Lời khuyên thực tế để khắc phục",
      "link": "Đường dẫn hợp lệ tới các trang uy tín (VD: https://developer.mozilla.org)"
    }
  ],
  "summary_markdown": "Đoạn văn tóm tắt điểm mạnh và điểm yếu, dùng cú pháp Markdown."
}
    `);

    try {
      const chain = this.model.pipe(parser);
      const response = await chain.invoke([
        systemPrompt,
        new HumanMessage(`Vị trí ứng tuyển: ${userContext.target_role}.\n\n--- MÃ NGUỒN CUỐI CÙNG ---\n${finalCode}\n\n--- LỊCH SỬ CHAT (RÚT GỌN) ---\n${chatHistoryText}`)
      ]);

      // 1. Kiểm duyệt và parse mảng Radar Chart an toàn
      const rawRadar = Array.isArray(response.radar_chart) ? response.radar_chart : [0, 0, 0, 0, 0];
      const radar_chart = rawRadar.map(score => Number(score) || 0).slice(0, 5);
      while (radar_chart.length < 5) radar_chart.push(0);

      // 2. Tính toán Toán học bằng JavaScript (Chính xác tuyệt đối)
      const theory = radar_chart[0];
      const codingLogic = radar_chart[1];
      const optimization = radar_chart[2];
      const language = radar_chart[3];
      const softSkills = radar_chart[4];

      // Công thức tính Breakdown
      const coding = Math.round((codingLogic + optimization + language) / 3);
      // Công thức tính Average Score (Tổng 5 tiêu chí / 5)
      const average_score = Math.round(radar_chart.reduce((acc, curr) => acc + curr, 0) / 5);

      return {
        average_score,
        breakdown: {
          theory,
          coding,
          soft_skills: softSkills
        },
        radar_chart,
        learning_path: response.learning_path || [],
        summary_markdown: response.summary_markdown || "Không có nhận xét chi tiết."
      };

    } catch (error) {
      console.error("❌ [EvaluatorAgent] Lỗi parse JSON:", error);
      return {
        average_score: 0,
        breakdown: { theory: 0, coding: 0, soft_skills: 0 },
        radar_chart: [0, 0, 0, 0, 0],
        learning_path: [],
        summary_markdown: "## Lỗi hệ thống\nKhông thể tạo báo cáo đánh giá tự động lúc này do sự cố LLM."
      };
    }
  }
}