import { SystemMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";

export class InterviewerAgent {
  constructor(private model: any) {}

  async invoke(
    messages: any[],
    userContext: any,
    cvContext: string,
    currentEmotion: string = 'Bình thường'
  ) {
    console.log(`👉 [DEBUG - Interviewer] Emotion: ${currentEmotion}`);

    // Sử dụng JsonOutputParser để bọc thép việc parse JSON từ LLM
    const parser = new JsonOutputParser();

    const systemPrompt = new SystemMessage(`
Bạn là Người phỏng vấn Kỹ thuật cao cấp (Senior Technical Interviewer).
Vị trí: ${userContext.target_role} (${userContext.experience_level || 'Chưa xác định'}).

[PHÂN TÍCH TÂM LÝ ỨNG VIÊN]
Hệ thống Camera báo cáo ứng viên đang: "${currentEmotion}".
- Nếu "Đang suy nghĩ": Bạn hãy tỏ ra kiên nhẫn, có thể gợi ý: "Bạn cứ bình tĩnh suy nghĩ...".
- Nếu "Hào hứng": Hãy giữ nhịp độ phỏng vấn sôi nổi.

NGỮ CẢNH CV CỦA ỨNG VIÊN:
---
${cvContext}
---

[QUY TẮC ĐẶT CÂU HỎI - BẮT BUỘC TUÂN THỦ]
1. VÀO VIỆC NGAY: Khi ứng viên nói "Sẵn sàng", "Bắt đầu", BẠN PHẢI LẬP TỨC đặt một câu hỏi chuyên môn đi thẳng vào vấn đề.
2. CẤM KỴ: TUYỆT ĐỐI KHÔNG dùng các câu sáo rỗng kiểu "Hãy chia sẻ suy nghĩ của bạn".
3. Điều phối (THEORY): Trả lời tốt 3-4 câu lý thuyết -> Chuyển "SWITCH_TO_CODING".
4. Điều phối (CODING): Ứng viên hoàn thành logic code -> Chuyển "END_INTERVIEW".
5. Kết thúc sớm: Nếu ứng viên liên tục trả lời hời hợt hoặc không biết -> "END_INTERVIEW".

⚠️ ĐẦU RA BẮT BUỘC LÀ JSON THEO ĐÚNG CẤU TRÚC SAU:
{
  "reasoning": "Phân tích logic câu trả lời của ứng viên, lý do chấm điểm và chọn hành động tiếp.",
  "score": 0, // Điểm cho câu trả lời vừa rồi (SỐ NGUYÊN 0-100)
  "next_action": "CONTINUE_THEORY", // Hoặc "SWITCH_TO_CODING", "CONTINUE_CODING", "END_INTERVIEW"
  "reply_to_user": "Câu phản hồi + Câu hỏi chuyên môn tiếp theo dành cho ứng viên."
}
    `);

    try {
      const chain = this.model.pipe(parser);
      const response = await chain.invoke([systemPrompt, ...messages]);

      if (!response.next_action) response.next_action = "CONTINUE_THEORY";

      // Đảm bảo score luôn là số hợp lệ
      response.score = Number(response.score) || 0;

      return response;
    } catch (error: any) {
      console.error("❌ [InterviewerAgent] Lỗi parse JSON hoặc Timeout:", error);
      return {
        reasoning: "LLM Error Fallback.",
        score: 0, // Fallback về 0 để không cộng ảo điểm 50 cho ứng viên
        next_action: "CONTINUE_THEORY",
        reply_to_user: "Xin lỗi, đường truyền của tôi vừa bị gián đoạn. Bạn có thể nhắc lại ý vừa rồi được không?"
      };
    }
  }
}