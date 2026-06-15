import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { JsonOutputParser } from "@langchain/core/output_parsers";

export class CodeTesterAgent {
  constructor(private model: ChatOpenAI) {}

  async invoke(
    messages: any[],
    userContext: any,
    codeSnippet: string | null,
    terminalOutput: string = '',
    currentEmotion: string = 'Bình thường'
  ) {
    console.log(`👉 [DEBUG - CodeTester] Emotion: ${currentEmotion}`);

    const currentCode = codeSnippet && codeSnippet.trim().length > 0
      ? codeSnippet
      : "[SYSTEM]: Candidate has not written any code yet.";

    const seniority = userContext.seniority || "Middle/Senior";

    // Sử dụng JsonOutputParser
    const parser = new JsonOutputParser();

    const systemPrompt = new SystemMessage(`
You are a strict Principal Engineer conducting a Technical Coding Interview.
Target Role: ${userContext.target_role} (${seniority} level).

[CRITICAL RULES - NEVER VIOLATE]
1. STRICTLY FORBIDDEN: Do not ask basic/newbie questions (e.g., "Sum of two numbers", "Even/Odd numbers").
2. If the candidate has NO CODE yet: You MUST provide a complex, real-world challenge related to ${userContext.target_role}.
3. CONTEXT AWARENESS: Read the chat history. Make sure the coding challenge matches previously discussed topics.

[EVALUATION RULES - VISUAL REVIEW ONLY]
- YOU DO NOT HAVE ACCESS TO TERMINAL OUTPUT. Evaluate the code logic by reading it carefully.
- IGNORE environment-related syntax errors. Focus ONLY on algorithm, logic, and complexity (Time/Space).
- If the logic is sound and the algorithm correctly solves the problem, accept the answer.
- If the candidate asks "Is it okay?" or "Done?": If the logic is correct, return "END_INTERVIEW".

[OUTPUT INSTRUCTION]
Return ONLY a valid JSON object.
{
  "reasoning": "Detailed logic analysis (Why the code is correct/incorrect, English)",
  "score": 0, // Integer 0-100
  "next_action": "CONTINUE_CODING", // Or "END_INTERVIEW"
  "reply_to_user": "Lời nói với ứng viên bằng TIẾNG VIỆT (Nhận xét sâu về thuật toán, độ phức tạp hoặc gợi ý tối ưu)."
}
    `);

    const codeContextMessage = new HumanMessage(`
[CURRENT STATE]
Candidate Code:
\`\`\`javascript
${currentCode}
\`\`\`

Note: Evaluate the code logic visually. Ignore any environment/module syntax errors.
    `);

    try {
      const chain = this.model.pipe(parser);
      const response = await chain.invoke([
        systemPrompt,
        ...messages,
        codeContextMessage
      ]);

      if (!response.next_action) response.next_action = "CONTINUE_CODING";
      response.score = Number(response.score) || 0;

      return response;
    } catch (error: any) {
      console.error("❌ [CodeTesterAgent] Error:", error);
      return {
        reasoning: "LLM Error Fallback.",
        score: 0,
        next_action: "CONTINUE_CODING",
        reply_to_user: "Mạng có vẻ hơi chậm. Bạn có thể tóm tắt lại ý tưởng và độ phức tạp (Time Complexity) của thuật toán vừa rồi không?"
      };
    }
  }
}