"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { googleLogin as googleLoginRequest, googleRegisterStart, googleRegisterVerify, register as registerRequest 
} from "@/lib/api/auth";
import { saveAccessToken, saveUser } from "@/lib/auth";
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

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleMessage, setGoogleMessage] = useState("");
  const [googleError, setGoogleError] = useState("");
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [googleStep, setGoogleStep] = useState<"initial" | "verify">("initial");

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    targetRole: "Backend Developer" as JobRole,
    experienceLevel: "fresher" as ExperienceLevel,
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string, value: string | boolean) =>
    setForm((prev) => {
      if (error) setError("");
      return { ...prev, [field]: value };
    });
    
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(form.password)) {
      setError(
        "Password must contain uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

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
      router.refresh();
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "";
      const normalizedMessage =
        rawMessage.includes("User with this email already exists")
          ? "An account with this email already exists."
          : rawMessage;

      setError(normalizedMessage || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegisterStart = async (idToken: string) => {
    setLoading(true);
    setError("");
    setGoogleMessage("");

    try {
      const result: AuthGoogleRegisterStartResponse =
        await googleRegisterStart({
          idToken,
          target_role: form.targetRole,
          experience_level: form.experienceLevel,
        });

      setGoogleEmail(result.email);
      setForm((prev) => ({
        ...prev,
        email: result.email,
        fullName: result.full_name,
      }));
      setGoogleStep("verify");
      setGoogleMessage(result.message);
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "";
      setError(rawMessage || "Google registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegisterVerify = async () => {
    if (!googleEmail) {
      setError("Google email is missing. Please try again.");
      return;
    }

    setLoading(true);
    setError("");
    setGoogleMessage("");

    try {
      const result = await googleRegisterVerify({
        email: googleEmail,
        code: verificationCode.trim(),
      });

      const token = result.accessToken ?? result.token;
      saveAccessToken(token);
      saveUser(result.user);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const rawMessage = err instanceof Error ? err.message : "";
      setError(rawMessage || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

   const isPasswordQualified = (pwd: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(pwd);

  const passwordStrength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 6)
      return { label: "Weak", color: "bg-red-500", w: "w-1/4" };
    if (pwd.length < 10)
      return { label: "Fair", color: "bg-amber-400", w: "w-2/4" };
    if (!/[^a-zA-Z0-9]/.test(pwd))
      return { label: "Good", color: "bg-emerald-400", w: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-600", w: "w-full" };
  };

  const strength = passwordStrength(form.password);
  const showPasswordInvalid = form.password.length > 0 && !isPasswordQualified(form.password);

  const handleGoogleLogin = async (idToken: string) => {
      setLoading(true);
      setError("");
      setGoogleError("");
  
      try {
        const result = await googleLoginRequest({ idToken });
        const token = result.accessToken ?? result.token;
        if (!token) {
          throw new Error("Login failed. No access token was returned.");
        }
        saveAccessToken(token);
        saveUser(result.user);
        const next = searchParams.get("next");
        router.push(next || "/dashboard");
        router.refresh();
      } catch (err) {
        const rawMessage = err instanceof Error ? err.message : "";
        setGoogleError(rawMessage || "Google login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };

  return (
    <Card className="border-zinc-200 bg-white shadow-xl shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold text-zinc-950 dark:text-white">
          Create your account
        </CardTitle>
        <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
          Fill in the required account details to match your profile data.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="w-full">
          <GoogleAuthButton
            label="Đăng nhập bằng Google"
            buttonText="signin_with"
            onSuccess={handleGoogleLogin}
            onError={(message) => setError(message)}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900">
              Hoặc
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email của bạn</Label>
            <Input
              id="email"
              type="email"
              autoComplete="new-password"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Tên của bạn</Label>
            <Input
              id="full_name"
              type="text"
              autoComplete="new-password"
              placeholder="Nhập tên của bạn"
              value={form.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="targetRole">Target role</Label>
              <select
                id="targetRole"
                value={form.targetRole}
                onChange={(e) => handleChange("targetRole", e.target.value)}
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
                required
              >
                {jobRoleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience level</Label>
              <select
                id="experienceLevel"
                value={form.experienceLevel}
                onChange={(e) =>
                  handleChange("experienceLevel", e.target.value)
                }
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
                required
              >
                {experienceOptions.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`h-11 pr-10 ${showPasswordInvalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            
            {showPasswordInvalid && (
              <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 text-xs text-red-600 space-y-1">
                <p className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-3.5 w-3.5" /> Mật khẩu chưa hợp lệ
                </p>
                <ul className="list-inside list-disc pl-2 space-y-0.5">
                  <li>Từ 8 - 32 ký tự</li>
                  <li>Bao gồm chữ thường và số</li>
                  <li>Bao gồm ký tự đặc biệt (!, $, @, %,...)</li>
                  <li>Có ít nhất 1 ký tự in hoa</li>
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Nhập lại mật khẩu</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="h-11 w-full bg-zinc-900 text-white hover:bg-zinc-800">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Tạo tài khoản"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-center pb-8">
        <p className="text-sm text-zinc-500">Đã có tài khoản?</p>
        <Link href="/login" className="text-sm font-semibold text-emerald-500 hover:text-emerald-600 transition-colors mt-1">
          Đăng nhập ngay
        </Link>
      </CardFooter>
    </Card>
  );
}