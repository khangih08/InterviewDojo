"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  Github,
  Chrome,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // TODO: replace with your real auth logic
    await new Promise((r) => setTimeout(r, 1600));

    // Simulate wrong credentials demo
    if (form.password !== "correct") {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  return (
    <Card className="w-full border-zinc-200 shadow-xl shadow-zinc-200/60 dark:border-zinc-800 dark:shadow-none">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Welcome back 👋
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          Sign in to continue your interview prep.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* OAuth buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="gap-2 font-medium" type="button">
            <Github className="h-4 w-4" />
            GitHub
          </Button>
          <Button variant="outline" className="gap-2 font-medium" type="button">
            <Chrome className="h-4 w-4" />
            Google
          </Button>
        </div>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-zinc-400 dark:bg-zinc-900">
            or continue with email
          </span>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-11 rounded-lg border-zinc-300 dark:border-zinc-700 focus-visible:ring-violet-500"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-violet-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="h-11 rounded-lg border-zinc-300 pr-10 dark:border-zinc-700 focus-visible:ring-violet-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember me */}
          <div className="flex items-center gap-2.5">
            <Checkbox
              id="remember"
              checked={form.remember}
              onCheckedChange={(v) => handleChange("remember", Boolean(v))}
              className="border-zinc-400 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
            />
            <Label
              htmlFor="remember"
              className="text-sm text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer"
            >
              Remember me for 30 days
            </Label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-violet-600 hover:bg-violet-700 active:bg-violet-800 font-semibold text-white shadow-md shadow-violet-200 dark:shadow-violet-900/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <Separator />
        </div>
      </CardContent>

      <CardFooter className="justify-center pb-6 pt-0">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-violet-600 hover:underline"
          >
            Create one free
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
