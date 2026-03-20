import type { AuthLoginRequest, AuthLoginResponse } from "@/lib/api/types";

export async function mockLogin(input: AuthLoginRequest): Promise<AuthLoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const validUsers = [
    { email: "admin@gmail.com", password: "123456", role: "admin" as const, full_name: "Admin Dojo" },
    { email: "user@gmail.com", password: "123456", role: "candidate" as const, full_name: "Candidate Demo" },
  ];

  const matched = validUsers.find((item) => item.email === input.email && item.password === input.password);
  if (!matched) {
    throw new Error("Email hoặc mật khẩu không đúng.");
  }

  return {
    token: `mock-token-${matched.role}`,
    user: {
      email: matched.email,
      full_name: matched.full_name,
      role: matched.role,
    },
  };
}
