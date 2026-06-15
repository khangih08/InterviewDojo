import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";

export class EvaluatorAgent {
  constructor(private model: any) {}

  async invoke(messages: any[], userContext: any, codeSnippet: string | null) {
    const chatHistoryText = messages
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => `**${msg.role === 'user' ? 'Ứng viên' : 'AI'}:** ${msg.content}`)
      .join('\n\n');

    const finalCode = codeSnippet && codeSnippet.trim().length > 0
      ? codeSnippet
      : "[HỆ THỐNG]: Ứng viên không có dữ liệu code thực hành.";

    const parser = new JsonOutputParser();

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
Trả về DUY NHẤT một Object JSON hợp lệ. TUYỆT ĐỐI KHÔNG TỰ TÍNH TRUNG BÌNH CỘNG.
⚠️ QUAN TRỌNG: TUYỆT ĐỐI KHÔNG ĐƯỢC SỬ DỤNG CHÚ THÍCH (COMMENTS) NHƯ "//" HAY "/* */" Ở BÊN TRONG CHUỖI JSON. CHỈ TRẢ VỀ JSON HỢP LỆ THEO ĐÚNG ĐỊNH DẠNG SAU:
{
  "radar_chart": [0, 0, 0, 0, 0],
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

    let aiText = "";
    try {
      const rawResponse = await this.model.invoke([
        systemPrompt,
        new HumanMessage(`Vị trí ứng tuyển: ${userContext.target_role}.\n\n--- MÃ NGUỒN CUỐI CÙNG ---\n${finalCode}\n\n--- LỊCH SỬ CHAT (RÚT GỌN) ---\n${chatHistoryText}`)
      ]);

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
          throw new Error("Không tìm thấy JSON hợp lệ trong câu trả lời.");
        }
      }

      // 3. Kiểm duyệt và parse mảng Radar Chart an toàn
      const rawRadar = Array.isArray(parsedResponse.radar_chart) ? parsedResponse.radar_chart : [0, 0, 0, 0, 0];
      const radar_chart = rawRadar.map((score: any) => Number(score) || 0).slice(0, 5);
      while (radar_chart.length < 5) radar_chart.push(0);

      // 4. Tính toán Toán học bằng JavaScript (Chính xác tuyệt đối)
      const theory = radar_chart[0];
      const codingLogic = radar_chart[1];
      const optimization = radar_chart[2];
      const language = radar_chart[3];
      const softSkills = radar_chart[4];

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
        learning_path: parsedResponse.learning_path || [],
        summary_markdown: parsedResponse.summary_markdown || "Không có nhận xét chi tiết."
      };

    } catch (error) {
      console.error("❌ [EvaluatorAgent] Lỗi parse JSON:", error);
      console.error("Dữ liệu lỗi thô từ AI:", aiText);
      return {
        average_score: 0,
        breakdown: { theory: 0, coding: 0, soft_skills: 0 },
        radar_chart: [0, 0, 0, 0, 0],
        learning_path: [],
        summary_markdown: "## Lỗi hệ thống\nKhông thể tạo báo cáo đánh giá tự động lúc này do sự cố kết nối với mô hình ngôn ngữ (LLM)."
      };
    }
  }
}