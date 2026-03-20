import type { Category, Question, Tag } from "@/lib/api/types";

export const mockCategories: Category[] = [
  { id: "system-design", name: "System Design" },
  { id: "dsa", name: "DSA" },
  { id: "frontend", name: "Frontend" },
];

export const mockTags: Tag[] = [
  { id: "react", name: "React" },
  { id: "sql", name: "SQL" },
  { id: "google", name: "Google" },
  { id: "javascript", name: "JavaScript" },
];

export const mockQuestions: Question[] = [
  {
    id: "q1",
    content: "Giải thích sự khác nhau giữa SQL và NoSQL, khi nào nên chọn mỗi loại?",
    category: mockCategories[0],
    difficulty: "medium",
    tags: [mockTags[1], mockTags[2]],
    durationSeconds: 120,
  },
  {
    id: "q2",
    content: "React reconciliation là gì và virtual DOM giúp tối ưu như thế nào?",
    category: mockCategories[2],
    difficulty: "medium",
    tags: [mockTags[0], mockTags[3]],
    durationSeconds: 180,
  },
  {
    id: "q3",
    content: "Mô tả cách tìm chu trình trong linked list bằng Floyd's cycle detection.",
    category: mockCategories[1],
    difficulty: "hard",
    tags: [mockTags[2]],
    durationSeconds: 180,
  },
  {
    id: "q4",
    content: "Closure trong JavaScript là gì? Cho ví dụ thực tế khi sử dụng.",
    category: mockCategories[2],
    difficulty: "easy",
    tags: [mockTags[3]],
    durationSeconds: 90,
  },
];
