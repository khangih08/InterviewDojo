type DemoInterviewQuestion = {
  id: string;
  content: string;
  sampleAnswer: string;
};

type DemoInterviewResult = {
  transcript: string;
  feedback: string;
  technicalScore: number;
  communicationScore: number;
  metrics: Array<{ label: string; score: number }>;
};

const demoResults: Record<string, DemoInterviewResult> = {
  q1: {
    transcript:
      "I would choose SQL when I need strong consistency, relational joins, and predictable reporting. I would choose NoSQL when the product needs flexible schema, high write throughput, or rapid iteration.",
    feedback:
      "Clear answer with the right trade-offs. You explained both options without overcomplicating the reasoning. Add one real production example to make the answer more memorable.",
    technicalScore: 90,
    communicationScore: 87,
    metrics: [
      { label: "Technical", score: 90 },
      { label: "Communication", score: 87 },
      { label: "Depth", score: 89 },
      { label: "Clarity", score: 88 },
      { label: "Confidence", score: 91 },
    ],
  },
  q2: {
    transcript:
      "React reconciliation walks the tree, compares the previous and next state, and updates only the parts of the UI that changed. Keys help React preserve component identity in lists.",
    feedback:
      "Strong and concise. You covered the main mechanism and added a useful practical detail about keys. You could go one step further by mentioning batching and memoization strategies.",
    technicalScore: 86,
    communicationScore: 92,
    metrics: [
      { label: "Technical", score: 86 },
      { label: "Communication", score: 92 },
      { label: "Depth", score: 84 },
      { label: "Clarity", score: 93 },
      { label: "Confidence", score: 88 },
    ],
  },
  q3: {
    transcript:
      "Floyd's cycle detection uses two pointers at different speeds. If the list has a cycle, the fast pointer eventually meets the slow pointer inside the loop.",
    feedback:
      "Good algorithmic explanation. The answer is clean and easy to follow, but it would be stronger if you also described how to find the entry point after detecting the cycle.",
    technicalScore: 84,
    communicationScore: 85,
    metrics: [
      { label: "Technical", score: 84 },
      { label: "Communication", score: 85 },
      { label: "Depth", score: 82 },
      { label: "Clarity", score: 86 },
      { label: "Confidence", score: 83 },
    ],
  },
  q4: {
    transcript:
      "A closure is when a function remembers variables from its outer scope even after that outer function has returned. It is useful for encapsulating state in handlers and factories.",
    feedback:
      "Strong fundamentals and a practical example. The explanation feels confident and complete. You could add a short code example to make the concept even more concrete.",
    technicalScore: 88,
    communicationScore: 89,
    metrics: [
      { label: "Technical", score: 88 },
      { label: "Communication", score: 89 },
      { label: "Depth", score: 87 },
      { label: "Clarity", score: 90 },
      { label: "Confidence", score: 86 },
    ],
  },
};

function buildFallbackResult(question: DemoInterviewQuestion): DemoInterviewResult {
  const baseScore = Math.min(95, Math.max(80, 82 + (question.content.length % 8)));
  const communicationScore = Math.min(95, baseScore + 2);

  return {
    transcript:
      `I would answer this by explaining the core idea first, then showing one concrete implementation detail for ${question.content.toLowerCase()}.`,
    feedback:
      "Solid answer structure with a calm delivery. Use one named trade-off or code-level example to make it stand out in interviews.",
    technicalScore: baseScore,
    communicationScore,
    metrics: [
      { label: "Technical", score: baseScore },
      { label: "Communication", score: communicationScore },
      { label: "Depth", score: Math.max(78, baseScore - 2) },
      { label: "Clarity", score: communicationScore },
      { label: "Confidence", score: Math.min(95, baseScore + 1) },
    ],
  };
}

export function buildDemoInterviewResult(question: DemoInterviewQuestion) {
  const result = demoResults[question.id] ?? buildFallbackResult(question);

  return {
    sessionId: `demo-interview-${question.id}`,
    transcript: result.transcript,
    feedback: result.feedback,
    technicalScore: result.technicalScore,
    communicationScore: result.communicationScore,
    metrics: result.metrics,
  };
}