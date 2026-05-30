import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export class CodeTesterAgent {
  constructor(private model: ChatOpenAI) {}

  async invoke(
    messages: any[],
    userContext: any,
    codeSnippet: string | null,
    terminalOutput: string = '', // <--- BỔ SUNG: Nhận kết quả từ Terminal
    currentEmotion: string = 'Bình thường' // <--- Nhận cảm xúc từ Graph
  ) {
    // Console log để bạn debug xem dữ liệu có xuống tới đây không
    console.log(`👉 [DEBUG - CodeTester] Emotion: ${currentEmotion}`);
    console.log(`👉 [DEBUG - CodeTester] Terminal Has Output: ${terminalOutput.length > 0}`);

    const currentCode = codeSnippet && codeSnippet.trim().length > 0
      ? codeSnippet
      : "Ứng viên chưa viết code hoặc chưa gửi code.";

    const currentTerminal = terminalOutput && terminalOutput.trim().length > 0
      ? terminalOutput
      : "Chưa có kết quả chạy code (Terminal rỗng).";

    const systemPrompt = new SystemMessage(`
Bạn là Người phỏng vấn Kỹ thuật (Coding Agent) trong một hệ thống Agentic Workflow.
Vị trí ứng tuyển: ${userContext.target_role}.
Giai đoạn: Thực hành Code (CODING TAB).

[PHÂN TÍCH BIỂU CẢM ỨNG VIÊN]
- Trạng thái hiện tại qua Camera: "${currentEmotion}"
- Nếu ứng viên "Đang suy nghĩ": Hãy cho họ thêm thời gian, đừng hối thúc.
- Nếu ứng viên "Hào hứng": Hãy khen ngợi tinh thần và sự tự tin của họ.

NHIỆM VỤ CHUYÊN MÔN:
- Nếu chưa có đề bài, ra một bài tập thuật toán/thực hành liên quan đến lý thuyết trước đó.
- Nếu đã có code, review logic, cú pháp, Time/Space Complexity.
- ⚠️ ĐẶC BIỆT LƯU Ý KHI ĐÁNH GIÁ (QUAN TRỌNG):
  1. Bạn PHẢI đối chiếu Code của ứng viên với KẾT QUẢ CHẠY TERMINAL.
  2. Nếu Terminal báo lỗi (ví dụ: Lỗi cú pháp, Lỗi ReferenceError, "require is not defined",...), bạn KHÔNG ĐƯỢC khen chung chung. Bạn PHẢI chỉ ra chính xác lỗi đó và gợi ý cách sửa.
  3. KHÔNG khuyên thêm những gì ứng viên ĐÃ VIẾT. Hãy nhìn vào code để nói chuyện.

QUY TẮC ĐIỀU HƯỚNG WORKFLOW (BẮT BUỘC):
- Trả về "CONTINUE_CODING": Nếu ứng viên làm chưa xong hoặc cần hỏi xoáy thêm.
- Trả về "END_INTERVIEW": Nếu ứng viên đã hoàn thành hoặc muốn kết thúc.

⚠️ TRẢ VỀ JSON NGUYÊN BẢN:
{
  "reasoning": "Phân tích nội bộ",
  "score": 0-100,
  "next_action": "CONTINUE_CODING" | "END_INTERVIEW",
  "reply_to_user": "Lời nhận xét (Hãy tinh tế dựa trên cảm xúc ${currentEmotion})"
}
    `);

    // Gửi cả Code lẫn Terminal Output vào cho AI
    const codeContextMessage = new HumanMessage(`
[HỆ THỐNG GỬI ĐÍNH KÈM: DỮ LIỆU HIỆN TẠI TỪ EDITOR CỦA ỨNG VIÊN]

1. ĐOẠN CODE MỚI NHẤT:
\`\`\`javascript
${currentCode}
\`\`\`

2. KẾT QUẢ TỪ TERMINAL (SAU KHI CHẠY CODE):
\`\`\`text
${currentTerminal}
\`\`\`

Dựa vào đoạn code, kết quả terminal trên, biểu cảm "${currentEmotion}" và lịch sử chat, hãy đưa ra quyết định.
CHỈ TRẢ VỀ JSON NGUYÊN BẢN.
    `);

    try {
      const response = await this.model.invoke([
        systemPrompt,
        ...messages,
        codeContextMessage
      ]);

      const content = response.content as string;
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');

      if (startIdx === -1 || endIdx === -1) throw new Error("Missing JSON");
      const parsed = JSON.parse(content.substring(startIdx, endIdx + 1));
      if (!parsed.next_action) parsed.next_action = "CONTINUE_CODING";

      return parsed;
    } catch (error: any) {
      return {
        reasoning: "Lỗi hệ thống",
        score: 50,
        next_action: "CONTINUE_CODING",
        reply_to_user: "Tôi đang phân tích đoạn code của bạn, hãy đợi một chút nhé!"
      };
    }
  }
}