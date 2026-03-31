"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { register as registerRequest } from "@/lib/api/auth";
import type { ExperienceLevel, JobRole } from "@/lib/api/types";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
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
        full_name: form.fullName.trim(),
        target_role: form.targetRole,
        experience_level: form.experienceLevel,
      });

      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
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

      <CardContent>
        {error && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              Full name
            </Label>
            <Input
              id="fullName"
              placeholder="Nguyen Van A"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
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
            <Label htmlFor="password">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className={`h-11 pr-10 ${showPasswordInvalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {showPasswordInvalid ? (
              <p className="text-xs text-red-500">
                Use at least 8 characters with 1 uppercase letter, 1 lowercase
                letter, 1 number, and 1 special character.
              </p>
            ) : null}
            {strength && (
              <div className="space-y-1 pt-1">
                <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${strength.color} ${strength.w}`}
                  />
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Strength:{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {strength.label}
                  </span>
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
                className={`h-11 pr-10 ${
                  form.confirmPassword && form.confirmPassword !== form.password
                    ? "border-red-400 dark:border-red-500"
                    : ""
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.confirmPassword && form.confirmPassword !== form.password && (
              <p className="text-xs text-red-500">Passwords do not match.</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
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
