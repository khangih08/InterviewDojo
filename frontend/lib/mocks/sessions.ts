import type { Session } from "@/lib/api/types";

const demoSessions: Session[] = [
  {
    id: "demo-session-2026-05-13",
    created_at: "2026-05-13T08:30:00.000Z",
    status: "COMPLETED",
    question_content:
      "Thiết kế API đăng nhập an toàn cho ứng dụng luyện phỏng vấn và giải thích trade-off bạn chọn.",
    ai_analysis: {
      technical_score: 92,
      communication_score: 88,
      transcript:
        "I would start with short-lived access tokens, rotating refresh tokens, rate limiting, and structured audit logs. For the client, I would hydrate auth state before requesting protected data.",
      feedback:
        "Strong system thinking and clear sequencing. The answer is specific, balanced, and easy to follow. Add one example of how you would handle token revocation to make the solution even stronger.",
    },
  },
  {
    id: "demo-session-2026-05-11",
    created_at: "2026-05-11T14:10:00.000Z",
    status: "COMPLETED",
    question_content:
      "React reconciliation là gì và virtual DOM giúp tối ưu như thế nào?",
    ai_analysis: {
      technical_score: 86,
      communication_score: 90,
      transcript:
        "Reconciliation compares the previous and next render tree so React can update only what changed. The virtual DOM is an implementation detail that helps React describe UI updates efficiently.",
      feedback:
        "Good explanation with the right level of depth. The structure is neat and practical. Mention keys and component boundaries to show stronger implementation awareness.",
    },
  },
  {
    id: "demo-session-2026-05-09",
    created_at: "2026-05-09T10:45:00.000Z",
    status: "PROCESSING",
    question_content:
      "Khi nào nên chọn NoSQL thay vì SQL trong một sản phẩm đang tăng trưởng nhanh?",
    ai_analysis: null,
  },
  {
    id: "demo-session-2026-05-08",
    created_at: "2026-05-08T16:20:00.000Z",
    status: "FAILED",
    question_content:
      "Mô tả một lần bạn tối ưu performance cho giao diện có nhiều dữ liệu động.",
    ai_analysis: null,
  },
  {
    id: "demo-session-2026-05-06",
    created_at: "2026-05-06T09:00:00.000Z",
    status: "PENDING",
    question_content: "Closure trong JavaScript là gì? Cho ví dụ thực tế khi sử dụng.",
    ai_analysis: null,
  },
];

function cloneSessions(sessions: Session[]) {
  return sessions.map((session) => ({
    ...session,
    ai_analysis: session.ai_analysis ? { ...session.ai_analysis } : null,
  }));
}

export const demoInterviewSessionId = demoSessions[0].id;

export function getDemoInterviewSessions() {
  return cloneSessions(demoSessions);
}

export function getDemoInterviewSessionById(id: string) {
  const sessions = cloneSessions(demoSessions);
  return sessions.find((session) => session.id === id) ?? sessions[0];
}