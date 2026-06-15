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

⚠️ BẮT BUỘC: BẠN CHỈ ĐƯỢC TRẢ VỀ JSON HỢP LỆ. KHÔNG XUẤT TEXT CHÀO HỎI, KHÔNG GIẢI THÍCH BÊN NGOÀI KHỐI JSON.
    `);

    let aiText = "";
    try {
      // 1. Gọi trực tiếp model để lấy kết quả thô, không qua .bind() tránh lỗi thư viện HuggingFace
      const rawResponse = await this.model.invoke([systemPrompt, ...messages]);

      // Trích xuất chuỗi văn bản từ các định dạng trả về khác nhau của các dòng Model
      if (typeof rawResponse === "string") {
        aiText = rawResponse;
      } else if (rawResponse && typeof rawResponse.content === "string") {
        aiText = rawResponse.content;
      } else if (rawResponse && rawResponse.text) {
        aiText = rawResponse.text;
      }
      aiText = aiText.trim();

      // 2. Tiến hành ép kiểu/parse JSON từ chuỗi thu được
      const response = await parser.parse(aiText);

      if (!response.next_action) response.next_action = "CONTINUE_THEORY";
      response.score = Number(response.score) || 0;

      return response;
    } catch (error: any) {
      console.warn("⚠️ [InterviewerAgent] Phát hiện định dạng không chuẩn hoặc lỗi Parse. Tiến hành tự động bọc lót dữ liệu.");

      // Thử tìm kiếm khối cấu trúc JSON ẩn bên trong văn bản (nếu AI viết kèm lời thoại bên ngoài)
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedJson = JSON.parse(jsonMatch[0]);
          if (!parsedJson.next_action) parsedJson.next_action = "CONTINUE_THEORY";
          parsedJson.score = Number(parsedJson.score) || 0;
          return parsedJson;
        } catch (e) {
          // Thất bại khi parse sub-json, chuyển xuống bộ lọc tối cao phía dưới
        }
      }

      // BỘ LỌC TỐI CAO: Nếu AI cứng đầu trả về 100% text hội thoại (Vd: "Bạn có kinh nghiệm..."),
      // biến luôn đoạn text đó thành câu hỏi hiển thị lên màn hình chat của ứng viên chứ không làm crash hệ thống.
      if (aiText && aiText.length > 10 && !aiText.startsWith("{")) {
        return {
          reasoning: "AI cãi lệnh trả về văn bản thuần. Tự động đóng gói để cứu luồng chat.",
          score: 50,
          next_action: "CONTINUE_THEORY",
          reply_to_user: aiText
        };
      }

      // Trường hợp lỗi kết nối nghiêm trọng/Timeout không có dữ liệu trả về
      console.error("❌ [InterviewerAgent Error]:", error);
      return {
        reasoning: "LLM Critical Error Fallback.",
        score: 0,
        next_action: "CONTINUE_THEORY",
        reply_to_user: "Xin lỗi, hệ thống của tôi vừa gặp gián đoạn nhỏ. Bạn có thể chia sẻ lại câu trả lời vừa rồi được không?"
      };
    }
  }
}