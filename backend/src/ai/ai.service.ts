import { Injectable, Logger } from '@nestjs/common';
import { RagService } from '../rag/rag.service';
import { ChatOpenAI } from "@langchain/openai";
import { InterviewGraph } from './workflows/interview.graph';
import { EvaluatorAgent } from './agents/evaluator.agent';
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import OpenAI, { toFile } from 'openai';
import { VM } from 'vm2';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private model: ChatOpenAI;
  private interviewGraph: InterviewGraph;
  private openai: OpenAI;

  constructor(public readonly ragService: RagService) {
    const groqKey = (process.env.GROQ_API_KEY || '').trim();

    this.model = new ChatOpenAI({
      apiKey: groqKey,
      configuration: { baseURL: "https://api.groq.com/openai/v1" },
      modelName: "llama-3.3-70b-versatile",
      temperature: 0.5,
    });

    this.openai = new OpenAI({
      apiKey: groqKey,
      baseURL: "https://api.groq.com/openai/v1",
    });

    this.interviewGraph = new InterviewGraph(this.model, this.ragService);
  }

  async executeCode(code: string): Promise<{ output: string; error?: string }> {
    let capturedLog = '';
    const vm = new VM({
      timeout: 3000,
      sandbox: {
        console: {
          log: (...args: any[]) => {
            capturedLog += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
          },
      error: (...args: any[]) => {
            capturedLog += '❌ Error: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
          },
          // Thêm luôn warn cho an toàn:
          warn: (...args: any[]) => {
            capturedLog += '⚠️ Warn: ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') + '\n';
          }
        }
      },
    });

    try {
      vm.run(code);
      return { output: capturedLog || '> Code executed successfully (no output).\n' };
    } catch (error: any) {
      return { output: '', error: error.message };
    }
  }

  async transcribeAudio(fileBuffer: Buffer, filename: string): Promise<string> {
    try {
      const file = await toFile(fileBuffer, filename || 'audio.webm');
      const response = await this.openai.audio.transcriptions.create({
        file: file,
        model: "whisper-large-v3",
        language: "vi",
      });
      return response.text;
    } catch (error: any) {
      this.logger.error(`❌ [AI] Lỗi Whisper: ${error.message}`);
      throw new Error("Không thể nhận diện giọng nói từ Audio.");
    }
  }

  async analyzeCvProfile(cvText: string): Promise<{ job_title: string; experience_level: string }> {
    const prompt = `Bạn là một chuyên gia tuyển dụng (Headhunter).
Hãy đọc nội dung CV dưới đây và trích xuất chức danh công việc, cấp độ kinh nghiệm.

⚠️ YÊU CẦU QUAN TRỌNG:
Chỉ trả về DUY NHẤT một chuỗi JSON hợp lệ. KHÔNG giải thích, KHÔNG markdown.
{
  "job_title": "<Ví dụ: Senior Frontend Developer>",
  "experience_level": "<Ví dụ: Junior, Senior>"
}

Nội dung CV:
---
${cvText.substring(0, 3000)}
---`;

    try {
      const response = await this.model.invoke([new HumanMessage(prompt)]);
      let resultContent = response.content as string;

      const jsonStart = resultContent.indexOf('{');
      const jsonEnd = resultContent.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1) {
        resultContent = resultContent.substring(jsonStart, jsonEnd + 1);
      } else {
        resultContent = resultContent.replace(/```json/gi, '').replace(/```/gi, '').trim();
      }

      const result = JSON.parse(resultContent);
      return {
        job_title: result.job_title || 'Chưa xác định',
        experience_level: result.experience_level || 'Chưa xác định'
      };
    } catch (error: any) {
      this.logger.error(`❌ [AI] Lỗi trích xuất CV: ${error.message}`);
      return { job_title: 'Chưa xác định', experience_level: 'Chưa xác định' };
    }
  }

  // CẬP NHẬT: Thêm tham số terminalOutput
  async *processInterviewTurnStream(
    userId: string,
    interviewId: string,
    userMessage: string,
    userContext: { target_role: string, experience_level: string },
    history: any[],
    activeTab: 'THEORY' | 'CODING' | 'EVALUATION',
    codeSnippet: string | null = null,
    terminalOutput: string = '',
    currentEmotion: string = 'neutral'
  ) {
    this.logger.log(`[WORKFLOW] Session: ${interviewId} | Tab: ${activeTab} | Emotion: ${currentEmotion}`);

    let cvContextString = "Không có ngữ cảnh CV.";
    if (activeTab === 'THEORY' || activeTab === 'CODING') {
      const searchQuery = userMessage || "Kỹ năng và kinh nghiệm";
      const relevantCvDocs = await this.ragService.search(searchQuery, 'interviews', { userId, interviewId });
      cvContextString = relevantCvDocs.length > 0
        ? relevantCvDocs.map(doc => doc.pageContent).join('\n---\n')
        : "Không tìm thấy thông tin trong CV cho phiên này.";
    }

    const formattedMessages = history.map(msg =>
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );

    if (userMessage) {
      formattedMessages.push(new HumanMessage(userMessage));
    } else if (activeTab === 'EVALUATION') {
      formattedMessages.push(new HumanMessage("Hãy đánh giá tổng quan buổi phỏng vấn."));
    }

    // CẬP NHẬT: State truyền cho Agentic Workflow giờ đã chứa terminal_output
    const initialState = {
      messages: formattedMessages,
      userId,
      userContext,
      cvContext: cvContextString,
      active_tab: activeTab,
      code_snippet: codeSnippet,
      terminal_output: terminalOutput, // BƠM CHO CODING AGENT TẠI ĐÂY
      current_emotion: currentEmotion,
      finalAgentOutput: null
    };

    const config = { configurable: { thread_id: interviewId } };

    try {
      const finalState = await this.interviewGraph.graph.invoke(initialState, config);
      const output = finalState.finalAgentOutput || {
        reply_to_user: "Mình gặp chút sự cố kỹ thuật, bạn thử lại nhé!",
        reasoning: "Missing agent output",
        score: 50,
        next_action: "CONTINUE_THEORY"
      };

      const replyText = output.reply_to_user || "OK";
      const words = replyText.split(/(\s+)/);

      for (const word of words) {
        if (word.length > 0) {
          yield word;
          await new Promise(res => setTimeout(res, 20));
        }
      }

      return output;
    } catch (error: any) {
      this.logger.error(`❌ [WORKFLOW ERROR]: ${error.message}`);
      yield "Hệ thống gặp gián đoạn nhỏ, bạn có thể nhắc lại câu vừa rồi không?";
      return null;
    }
  }

  async generateFinalReport(targetRole: string, chatHistory: any[], averageScore: number) {
    const evaluator = new EvaluatorAgent(this.model);
    const formattedMessages = chatHistory.map(msg =>
      msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );
    formattedMessages.push(new HumanMessage(`Kết thúc. Điểm trung bình: ${averageScore}/100. Xuất báo cáo.`));

    const result = await evaluator.invoke(formattedMessages, { target_role: targetRole }, null);
    return result.reply_to_user;
  }
}