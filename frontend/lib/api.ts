export const API_URL = "http://localhost:3000"; // hoặc NestJS sau này

export async function post(path: string, data: any) {
  // mock API
  await new Promise((r) => setTimeout(r, 500));

  if (path === "/auth/login") {
    if (data.email === "admin@gmail.com" && data.password === "123456") {
      return { token: "fake-jwt-token", user: { email: data.email } };
    }
    throw new Error("Invalid credentials");
  }

  if (path === "/auth/register") {
    return { message: "Register success" };
  }
}
