export type User = {
  id?: string;
  email: string;
  full_name?: string;
  role?: "admin" | "candidate";
};

export type AuthLoginRequest = {
  email: string;
  password: string;
};

export type AuthRegisterRequest = {
  email: string;
  password: string;
  full_name?: string;
};

export type AuthLoginResponse = {
  token: string;
  user: User;
};

export type Category = {
  id: string;
  name: string;
};

export type Tag = {
  id: string;
  name: string;
};

export type Difficulty = "easy" | "medium" | "hard";

export type Question = {
  id: string;
  content: string;
  category: Category;
  difficulty: Difficulty;
  tags: Tag[];
  durationSeconds?: number;
};

export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type GetQuestionsParams = {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  difficulty?: Difficulty | "";
  tagId?: string;
};
