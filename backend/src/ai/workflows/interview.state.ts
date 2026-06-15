// src/ai/workflows/interview.state.ts
import { BaseMessage } from "@langchain/core/messages";

export interface InterviewState {
  messages: BaseMessage[];
  userId: string;
  userContext: { target_role: string; experience_level: string };
  cvContext: string;

  active_tab:  'THEORY' | 'CODING' | 'EVALUATION';
  code_snippet?: string;

  // [CẬP NHẬT] Thêm biến lưu kết quả Terminal
  terminal_output?: string;

  current_emotion?: string;
  finalAgentOutput: any;
}

export const interviewStateChannels = {
  messages: {
    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
    default: () => [],
  },
  userId: null,
  userContext: null,
  cvContext: null,
  active_tab: null,
  code_snippet: null,

  // [CẬP NHẬT] Khai báo vào channels
  terminal_output: null,

  current_emotion: null,
  finalAgentOutput: null,
};