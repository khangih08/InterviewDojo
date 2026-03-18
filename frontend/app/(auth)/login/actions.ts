"use server";

import { redirect } from "next/navigation";

export async function handleLogin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const remember = formData.get("remember") as string; // "on" hoặc null

  try {
    console.log("Login Info:", { email, remember: !!remember });

    // Giả lập xử lý login
    await new Promise((res) => setTimeout(res, 1500));

    if (password === "wrong") {
      return { error: "Email hoặc mật khẩu không đúng." };
    }

    // Logic set cookie 'remember-me' nếu cần ở đây
  } catch (err) {
    return { error: "Lỗi kết nối Server." };
  }

  redirect("/dashboard");
}
