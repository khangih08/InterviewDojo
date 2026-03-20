"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Github, Chrome } from "lucide-react";

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

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const handleChange = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: integrate your auth logic here
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
  };

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

  return (
    <Card className="w-full border-zinc-200 shadow-xl shadow-zinc-200/60 dark:border-zinc-800 dark:shadow-none">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Create your account
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">
          Start your interview prep journey today — it's free.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full name
            </Label>
            <Input
              id="fullName"
              placeholder="Nguyen Van A"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="h-11 rounded-lg border-zinc-300 dark:border-zinc-700 focus-visible:ring-violet-500"
              required
            />
          </div>

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
            <Label htmlFor="password" className="text-sm font-medium">
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
            {/* Strength bar */}
            {strength && (
              <div className="space-y-1 pt-1">
                <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${strength.color} ${strength.w}`}
                  />
                </div>
                <p className="text-xs text-zinc-400">
                  Strength:{" "}
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {strength.label}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-sm font-medium">
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
                className={`h-11 rounded-lg pr-10 focus-visible:ring-violet-500 ${
                  form.confirmPassword && form.confirmPassword !== form.password
                    ? "border-red-400 dark:border-red-500"
                    : "border-zinc-300 dark:border-zinc-700"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
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

          {/* Terms */}
          <div className="flex items-start gap-2.5 pt-1">
            <Checkbox
              id="agree"
              checked={form.agree}
              onCheckedChange={(v) => handleChange("agree", Boolean(v))}
              className="mt-0.5 border-zinc-400 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
            />
            <Label
              htmlFor="agree"
              className="text-sm leading-snug text-zinc-500 dark:text-zinc-400 font-normal cursor-pointer"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="font-medium text-violet-600 hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium text-violet-600 hover:underline"
              >
                Privacy Policy
              </Link>
            </Label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !form.agree}
            className="h-11 w-full rounded-lg bg-violet-600 hover:bg-violet-700 active:bg-violet-800 font-semibold text-white shadow-md shadow-violet-200 dark:shadow-violet-900/40 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account…
              </>
            ) : (
              "Create free account"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pb-6 pt-0">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-violet-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
