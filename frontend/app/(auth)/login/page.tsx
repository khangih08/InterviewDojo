"use client";

import { useState } from "react";
import { post } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await post("/auth/login", { email, password });
      saveToken(res.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[350px] space-y-4">
        <h1 className="text-2xl font-bold">Login</h1>

        <input
          className="w-full border p-2"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full border p-2"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          className="w-full bg-black text-white p-2"
          onClick={handleLogin}
        >
          Login
        </button>

        <p className="text-sm">
          No account?{" "}
          <a href="/register" className="underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
