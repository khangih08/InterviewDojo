"use client";

import { useState } from "react";
import { post } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    await post("/auth/register", { email, password });
    router.push("/login");
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-[350px] space-y-4">
        <h1 className="text-2xl font-bold">Register</h1>

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

        <button
          className="w-full bg-black text-white p-2"
          onClick={handleRegister}
        >
          Register
        </button>
      </div>
    </div>
  );
}
