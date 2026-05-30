import { SystemMessage } from "@langchain/core/messages";

export class InterviewerAgent {
  constructor(private model: any) {}

  async invoke(
    messages: any[],
    userContext: any,
    cvContext: string,
    currentEmotion: string = 'Bình thường' // <--- Sửa tham số thứ 4 để hết lỗi TS2554
  ) {
    // Log debug
    console.log(`👉 [DEBUG - Interviewer] Emotion: ${currentEmotion}`);

    const systemPrompt = new SystemMessage(`
Bạn là Người phỏng vấn Kỹ thuật cao cấp (Senior Technical Interviewer).
Vị trí: ${userContext.target_role} (${userContext.experience_level || 'Chưa xác định'}).

[PHÂN TÍCH TÂM LÝ ỨNG VIÊN]
Hệ thống Camera báo cáo ứng viên đang: "${currentEmotion}".
- Nếu "Đang suy nghĩ": Bạn hãy tỏ ra kiên nhẫn, có thể gợi ý: "Bạn cứ bình tĩnh suy nghĩ, phần này khá quan trọng...".
- Nếu "Hào hứng": Hãy giữ nhịp độ phỏng vấn sôi nổi.

NGỮ CẢNH CV:
---
${cvContext}
---

QUY TẮC ĐIỀU PHỐI:
1. **Lý thuyết (THEORY)**: Trả lời tốt 3-4 câu -> "SWITCH_TO_CODING".
2. **Coding (CODING)**: Hoàn thành code -> "END_INTERVIEW".
3. Trả lời hời hợt -> Kết thúc sớm ("END_INTERVIEW").

⚠️ ĐẦU RA PHẢI LÀ JSON NGUYÊN BẢN:
{
  "reasoning": "Lý do chọn hành động này",
  "score": 0-100,
  "next_action": "CONTINUE_THEORY" | "SWITCH_TO_CODING" | "CONTINUE_CODING" | "END_INTERVIEW",
  "reply_to_user": "Lời nói với ứng viên (Hãy đồng cảm với trạng thái ${currentEmotion})"
}
    `);

    try {
      const response = await this.model.invoke([systemPrompt, ...messages]);
      const content = response.content as string;
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');

      if (startIdx === -1 || endIdx === -1) throw new Error("AI không trả về JSON.");

      const parsed = JSON.parse(content.substring(startIdx, endIdx + 1));
      if (!parsed.next_action) parsed.next_action = "CONTINUE_THEORY";

      return parsed;
    } catch (error: any) {
      return {
        reasoning: "Lỗi parse JSON.",
        score: 50,
        next_action: "CONTINUE_THEORY",
        reply_to_user: "Tôi đang lắng nghe bạn, bạn có thể nói rõ hơn phần vừa rồi không?"
      };
    }
  }
}