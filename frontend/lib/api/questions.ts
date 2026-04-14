import { mockCategories, mockQuestions, mockTags } from "@/lib/mocks/questions";
import { shouldUseMocks } from "@/lib/api/mock";
import { http, toApiError } from "@/lib/api/http";
import type {
  Category,
  Difficulty,
  GetQuestionsParams,
  Paged,
  Question,
  Tag,
} from "@/lib/api/types";

type BackendQuestion = {
  id: string;
  content: string;
  sampleAnswer?: string | null;
  difficultyLevel: number;
  categoryId?: string | null;
  categoryName?: string | null;
  tags: string[];
  createdAt?: string;
};

type BackendPagedQuestions = {
  data: BackendQuestion[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

type BackendPagedCategories = {
  data: Category[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
};

// --- Helper Functions ---
function toDifficulty(level: number): Difficulty {
  if (level <= 2) return "easy";
  if (level <= 4) return "medium";
  return "hard";
}

function normalizeQuestion(question: BackendQuestion): Question {
  return {
    id: question.id,
    content: question.content,
    category: {
      id: question.categoryId ?? "unknown-category",
      name: question.categoryName ?? "Uncategorized",
    },
    difficulty: toDifficulty(question.difficultyLevel),
    tags: (question.tags ?? []).map((tagName) => ({
      id: tagName,
      name: tagName,
    })),
    durationSeconds: undefined,
  };
}

function filterQuestions(params?: GetQuestionsParams) {
  let items = [...mockQuestions];

  if (params?.categoryId) {
    items = items.filter((item) => item.category.id === params.categoryId);
  }

  if (params?.difficulty) {
    items = items.filter((item) => item.difficulty === params.difficulty);
  }

  if (params?.tagId) {
    items = items.filter((item) => item.tags.some((tag) => tag.id === params.tagId));
  }

  if (params?.q) {
    const q = params.q.toLowerCase();
    items = items.filter((item) => item.content.toLowerCase().includes(q));
  }

  return items;
}

function normalizePagedQuestions(
  payload: Paged<Question> | BackendPagedQuestions
): Paged<Question> {
  if ("items" in payload) {
    return payload;
  }

  return {
    items: payload.data.map(normalizeQuestion),
    total: payload.meta.total,
    page: payload.meta.page,
    limit: payload.meta.limit,
  };
}

// --- API Functions ---

export async function getQuestions(params?: GetQuestionsParams): Promise<Paged<Question>> {
  // 1. Trường hợp dùng Mock do cấu hình
  if (shouldUseMocks()) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const items = filterQuestions(params);
    const start = (page - 1) * limit;
    return {
      items: items.slice(start, start + limit),
      total: items.length,
      page,
      limit,
    };
  }

  // 2. Gọi API từ Backend
  try {
    const backendParams = {
      page: params?.page,
      limit: params?.limit,
      search: params?.q,
      categoryId: params?.categoryId,
      difficulty:
        params?.difficulty === "easy"
          ? 2
          : params?.difficulty === "medium"
            ? 3
            : params?.difficulty === "hard"
              ? 5
              : undefined,
      tagId: params?.tagId,
    };

    const response = await http.get<Paged<Question> | BackendPagedQuestions>(
      "/questions",
      { params: backendParams }
    );

    return normalizePagedQuestions(response.data);
  } catch (error) {
    console.error("❌ Lỗi gọi API Backend:", error);

    // 3. Fallback: Nếu lỗi nhưng đang Dev thì dùng Mock, nếu không thì báo lỗi
    if (process.env.NODE_ENV === "development") {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 10;
      const items = filterQuestions(params);
      const start = (page - 1) * limit;
      return {
        items: items.slice(start, start + limit),
        total: items.length,
        page,
        limit,
      };
    }
    throw new Error(toApiError(error).message);
  }
}

export async function getQuestionById(id: string) {
  try {
    // Luôn ưu tiên gọi API nếu không ép buộc dùng Mock
    if (!shouldUseMocks()) {
      const response = await http.get<BackendQuestion>(`/questions/${id}`);
      return normalizeQuestion(response.data);
    }
    
    // Nếu ép buộc dùng mock
    return mockQuestions.find((item) => item.id === id) ?? null;
  } catch (error) {
    console.error("❌ Lỗi lấy chi tiết câu hỏi:", error);
    
    if (process.env.NODE_ENV === "development") {
      return mockQuestions.find((item) => item.id === id) ?? null;
    }
    throw new Error(toApiError(error).message);
  }
}

export async function getQuestionFilters(): Promise<{ categories: Category[]; tags: Tag[] }> {
  if (shouldUseMocks()) {
    return {
      categories: mockCategories,
      tags: mockTags,
    };
  }

  try {
    const [categoryRes, tagRes] = await Promise.all([
      http.get<Category[] | BackendPagedCategories>("/categories"),
      http.get<Tag[]>("/tags"),
    ]);

    const categories = Array.isArray(categoryRes.data)
      ? categoryRes.data
      : (categoryRes.data as BackendPagedCategories).data ?? [];

    return {
      categories,
      tags: Array.isArray(tagRes.data) ? tagRes.data : [],
    };
  } catch (error) {
    console.error("❌ Lỗi lấy filters:", error);
    if (process.env.NODE_ENV === "development") {
      return {
        categories: mockCategories,
        tags: mockTags,
      };
    }
    throw new Error(toApiError(error).message);
  }
}