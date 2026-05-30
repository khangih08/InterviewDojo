// src/ai/workflows/interview.graph.ts
import { StateGraph, START, END } from "@langchain/langgraph";
import { InterviewState, interviewStateChannels } from "./interview.state";
import { InterviewerAgent } from "../agents/interviewer.agent";
import { CodeTesterAgent } from "../agents/code_tester.agent";
import { EvaluatorAgent } from "../agents/evaluator.agent";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage } from "@langchain/core/messages";
import { RagService } from "../../rag/rag.service";

export class InterviewGraph {
  public graph: any;

  constructor(private model: ChatOpenAI, private ragService: RagService) {
    this.buildGraph();
  }

  private buildGraph() {
    const workflow = new StateGraph<InterviewState>({
        channels: interviewStateChannels
    });

    // ==========================================
    // CÁC NODES (Xử lý logic từng Tab)
    // ==========================================

    // 1. Node Lý thuyết (THEORY)
    const theoryNode = async (state: InterviewState) => {
      const theoryAgent = new InterviewerAgent(this.model);

      const response = await theoryAgent.invoke(
        state.messages,
        state.userContext,
        state.cvContext,
        state.current_emotion || 'Bình thường'
      );

      return {
        messages: [new AIMessage(response.reply_to_user)],
        finalAgentOutput: response
      };
    };

    // 2. Node Coding (CODING)
    const codingNode = async (state: InterviewState) => {
      console.log("👉 [DEBUG LangGraph] Mảng messages dài:", state.messages.length);
      console.log("👉 [DEBUG LangGraph] Emotion hiện tại:", state.current_emotion);
      console.log("👉 [DEBUG LangGraph] Terminal Output có không:", state.terminal_output ? "CÓ" : "KHÔNG");

      const codingAgent = new CodeTesterAgent(this.model);

      // [CẬP NHẬT] Truyền thêm tham số state.terminal_output vào vị trí thứ 4
      const response = await codingAgent.invoke(
        state.messages,
        state.userContext,
        state.code_snippet ?? null,
        state.terminal_output ?? '', // <--- Bổ sung ở đây để Agent hết "mù" Terminal
        state.current_emotion || 'Bình thường'
      );

      return {
        messages: [new AIMessage(response.reply_to_user)],
        finalAgentOutput: response
      };
    };

    // 3. Node Evaluation (EVALUATION)
    const evaluationNode = async (state: InterviewState) => {
      const evaluatorAgent = new EvaluatorAgent(this.model);
      const response = await evaluatorAgent.invoke(
        state.messages,
        state.userContext,
        state.code_snippet ?? null
      );
      return {
        finalAgentOutput: response
      };
    };

    // ==========================================
    // ĐĂNG KÝ NODES & ĐỊNH TUYẾN
    // ==========================================

    workflow.addNode("theory_node", theoryNode);
    workflow.addNode("coding_node", codingNode);
    workflow.addNode("evaluation_node", evaluationNode);

    // BƯỚC 1: START -> Phân luồng theo Tab
    workflow.addConditionalEdges(START, (state) => {
      const tab = state.active_tab || 'THEORY';
      if (tab === 'THEORY') return "theory_node";
      if (tab === 'CODING') return "coding_node";
      if (tab === 'EVALUATION') return "evaluation_node";
      return "theory_node";
    });

    // BƯỚC 2: Các Tab xử lý xong -> kết thúc luồng
    workflow.addEdge("theory_node" as any, END);
    workflow.addEdge("coding_node" as any, END);
    workflow.addEdge("evaluation_node" as any, END);

    this.graph = workflow.compile();
  }
}