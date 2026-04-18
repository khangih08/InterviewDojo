"use client";

import { useState, Suspense } from "react"; // Thêm Suspense vào đây
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import {
  googleLogin as googleLoginRequest,
  googleRegisterStart,
  googleRegisterVerify,
  register as registerRequest,
} from "@/lib/api/auth";
import { saveAuthTokens, saveUser } from "@/lib/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import type {
  AuthGoogleRegisterStartResponse,
  ExperienceLevel,
  JobRole,
} from "@/lib/api/types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const jobRoleOptions: JobRole[] = [
  "Backend Developer",
  "Frontend Developer",
  "Fullstack Developer",
  "AI Engineer",
  "DevOps Engineer",
  "Data Scientist",
  "Cloud Engineer",
  "Mobile Developer",
  "Security Engineer",
  "Embedded Systems Engineer",
];

const experienceOptions: { value: ExperienceLevel; label: string }[] = [
  { value: "intern", label: "Intern" },
  { value: "fresher", label: "Fresher" },
  { value: "junior", label: "Junior" },
  { value: "middle", label: "Middle" },
  { value: "senior", label: "Senior" },
];

// --- 1. COMPONENT CHỨA LOGIC (Nơi lỗi xảy ra nếu không có Suspense) ---
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams(); // Hook gây lỗi build nếu đứng một mình

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    targetRole: "Backend Developer" as JobRole,
    experienceLevel: "fresher" as ExperienceLevel,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");

    setLoading(true);
    try {
      await registerRequest({
        email: form.email.trim(),
        password: form.password,
        full_name: form.full_name.trim(),
        target_role: form.targetRole,
        experience_level: form.experienceLevel,
      });
      router.push("/login?registered=1");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      const result = await googleLoginRequest({ idToken });
      saveAuthTokens({
        accessToken: result.accessToken || result.token,
        refreshToken: result.refreshToken,
      });
      saveUser(result.user);

      const next = searchParams.get("next"); // Sử dụng searchParams an toàn nhờ Suspense ở ngoài
      router.push(next || "/dashboard");
    } catch (err: any) {
      setError(err.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const isPasswordQualified = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pwd);

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">
          Create your account
        </CardTitle>
        <CardDescription>Fill in the details to get started.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <GoogleAuthButton
          label="Google"
          onSuccess={handleGoogleLogin}
          onError={setError}
        />

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          <Input
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              value={form.targetRole}
              onChange={(e) => handleChange("targetRole", e.target.value)}
              className="h-10 rounded-md border text-sm px-2"
              aria-label="Target role"
              title="Target role"
            >
              {jobRoleOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={form.experienceLevel}
              onChange={(e) => handleChange("experienceLevel", e.target.value)}
              className="h-10 rounded-md border text-sm px-2"
              aria-label="Experience level"
              title="Experience level"
            >
              {experienceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-zinc-400"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-3 text-zinc-400"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin" /> : "Register"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-violet-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
