import { mockCategories, mockQuestions, mockTags } from "@/lib/mocks/questions";
import { shouldUseMocks } from "@/lib/api/mock";
import { http, toApiError } from "@/lib/api/http";
import type { Category, GetQuestionsParams, Paged, Question, Tag } from "@/lib/api/types";

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

export async function getQuestions(params?: GetQuestionsParams): Promise<Paged<Question>> {
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

  try {
    const response = await http.get<Paged<Question>>("/questions", { params });
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      return {
        items: filterQuestions(params),
        total: filterQuestions(params).length,
        page: 1,
        limit: params?.limit ?? 10,
      };
    }
    throw new Error(toApiError(error).message);
  }
}

export async function getQuestionById(id: string) {
  if (shouldUseMocks()) {
    return mockQuestions.find((item) => item.id === id) ?? null;
  }

  try {
    const response = await http.get<Question>(`/questions/${id}`);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      return mockQuestions.find((item) => item.id === id) ?? null;
    }
    throw new Error(toApiError(error).message);
  }
}

export async function getQuestionFilters(): Promise<{ categories: Category[]; tags: Tag[] }> {
  if (shouldUseMocks() || process.env.NODE_ENV === "development") {
    return {
      categories: mockCategories,
      tags: mockTags,
    };
  }

  try {
    const [categoryRes, tagRes] = await Promise.all([
      http.get<Category[]>("/categories"),
      http.get<Tag[]>("/tags"),
    ]);

    return {
      categories: categoryRes.data,
      tags: tagRes.data,
    };
  } catch (error) {
    throw new Error(toApiError(error).message);
  }
}
