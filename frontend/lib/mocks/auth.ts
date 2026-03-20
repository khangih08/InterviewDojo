import type { AuthLoginRequest, AuthLoginResponse } from "@/lib/api/types";

export async function mockLogin(
  input: AuthLoginRequest
): Promise<AuthLoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const validUsers = [
    {
      id: "1",
      email: "admin@gmail.com",
      password: "123456",
      role: "admin" as const,
      full_name: "Admin Dojo",
    },
    {
      id: "2",
      email: "user@gmail.com",
      password: "123456",
      role: "user" as const,
      full_name: "Candidate Demo",
    },
  ];

  const matched = validUsers.find(
    (item) =>
      item.email.trim().toLowerCase() === input.email.trim().toLowerCase() &&
      item.password === input.password
  );

  if (!matched) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }

  return {
    token: `mock-token-${matched.role}`,
    accessToken: `mock-token-${matched.role}`,
    user: {
      id: matched.id,
      email: matched.email,
      full_name: matched.full_name,
      role: matched.role,
    },
  };
}