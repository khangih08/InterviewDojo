import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export class CodeTesterAgent {
  constructor(private model: ChatOpenAI) {}

  async invoke(
    messages: any[],
    userContext: any,
    codeSnippet: string | null,
    terminalOutput: string = '', // Vẫn giữ tham số để không lỗi interface nhưng không dùng tới
    currentEmotion: string = 'Bình thường'
  ) {
    console.log(`👉 [DEBUG - CodeTester] Emotion: ${currentEmotion}`);

    const currentCode = codeSnippet && codeSnippet.trim().length > 0
      ? codeSnippet
      : "[SYSTEM]: Candidate has not written any code yet.";

    const seniority = userContext.seniority || "Middle/Senior";

    // BẢN CẬP NHẬT: LOẠI BỎ TERMINAL - CHẤM ĐIỂM BẰNG LOGIC THUẬT TOÁN
    const systemPrompt = new SystemMessage(`
You are a strict Principal Engineer conducting a Technical Coding Interview.
Target Role: ${userContext.target_role} (${seniority} level).

[CRITICAL RULES - NEVER VIOLATE]
1. STRICTLY FORBIDDEN: Do not ask basic/newbie questions (e.g., "Sum of two numbers", "Even/Odd numbers", "Reverse string", "Fibonacci", "Prime numbers").
2. If the candidate has NO CODE yet: You MUST provide a complex, real-world challenge related to ${userContext.target_role}.
3. CONTEXT AWARENESS: Read the chat history. If the previous agent discussed a specific topic (like FastAPI, GraphQL, or Security), your coding challenge MUST relate to that topic.

[EVALUATION RULES - VISUAL REVIEW ONLY]
- YOU DO NOT HAVE ACCESS TO TERMINAL OUTPUT. Evaluate the code logic by reading it carefully.
- IGNORE environment-related syntax errors (like "import/export", "require", or "sourceType: module"). Focus ONLY on algorithm, logic, and complexity (Time/Space).
- If the logic is sound and the algorithm correctly solves the problem, accept the answer.
- If the candidate asks "Is it okay?" or "Done?": If the logic is correct, return "END_INTERVIEW".

[OUTPUT INSTRUCTION]
- "reply_to_user" MUST BE IN VIETNAMESE.
- Return ONLY a raw JSON object.

{
  "reasoning": "Detailed logic analysis (Why the code is correct/incorrect, English)",
  "score": 0-100,
  "next_action": "CONTINUE_CODING" | "END_INTERVIEW",
  "reply_to_user": "Lời nói với ứng viên bằng TIẾNG VIỆT (Nhận xét sâu về thuật toán, độ phức tạp hoặc gợi ý tối ưu)."
}
    `);

    // Gửi ngữ cảnh code nhưng KHÔNG gửi Terminal Output
    const codeContextMessage = new HumanMessage(`
[CURRENT STATE]
Candidate Code:
\`\`\`javascript
${currentCode}
\`\`\`

Note: Evaluate the code logic visually. Ignore any environment/module syntax errors.
Respond in JSON. (reply_to_user in Vietnamese).
    `);

    try {
      const response = await this.model.invoke([
        systemPrompt,
        ...messages,
        codeContextMessage
      ], {
        response_format: { type: "json_object" }
      });

      const content = response.content as string;
      const startIdx = content.indexOf('{');
      const endIdx = content.lastIndexOf('}');

      if (startIdx === -1 || endIdx === -1) throw new Error("Invalid JSON format");
      const parsed = JSON.parse(content.substring(startIdx, endIdx + 1));

      if (!parsed.next_action) parsed.next_action = "CONTINUE_CODING";

      return parsed;
    } catch (error: any) {
      console.error("Error in CodeTesterAgent:", error);
      return {
        reasoning: "Error parsing LLM response",
        score: 50,
        next_action: "CONTINUE_CODING",
        reply_to_user: "Tôi đang xem qua code của bạn. Bạn có thể giải thích thêm về độ phức tạp thuật toán (Time Complexity) của phương án này không?"
      };
    }
  }
}