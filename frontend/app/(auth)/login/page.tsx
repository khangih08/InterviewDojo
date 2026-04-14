"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

import { googleLogin as googleLoginRequest, login as loginRequest } from "@/lib/api/auth";
import { saveAccessToken, saveUser } from "@/lib/auth";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

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

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [googleError, setGoogleError] = useState("");
  const componentKey = "google-auth-button";
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (field: "email" | "password", value: string) => {
    if (error) setError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await loginRequest({
        email: form.email.trim(),
        password: form.password,
      });

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
      const normalizedMessage =
        rawMessage.includes("Email hoặc mật khẩu không đúng") ||
        rawMessage.includes("Invalid email or password")
          ? "Incorrect email or password. Please try again."
          : rawMessage;

      setError(
        normalizedMessage || "Incorrect email or password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

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
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold text-violet-600 dark:text-violet-400">
          Sign in
        </CardTitle>
        <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
          Use your email and password to continue.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {justRegistered ? (
          <div className="mb-5 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">
            Account created successfully. Please sign in.
          </div>
        ) : null}

        {error ? (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
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
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="h-11 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
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
          </div>

          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex-col items-center gap-4 justify-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-violet-600 hover:underline"
          >
            Create one
          </Link>
        </p>
        <div className="w-full">
          <GoogleAuthButton
            key={componentKey}
            label="Đăng nhập bằng Google"
            buttonText="signin_with"
            onSuccess={handleGoogleLogin}
            onError={setGoogleError}
          />
          {googleError ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {googleError}
            </p>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
