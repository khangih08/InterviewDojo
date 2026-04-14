"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { forgotPassword, verifyForgotPasswordCode, resetPassword } from "@/lib/api/auth";
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

const PASSWORD_RULES = [
  "8 - 32 ký tự",
  "Bao gồm chữ thường và số",
  "Bao gồm ký tự đặc biệt (!,$,@,%,...)",
  "Có ít nhất 1 ký tự in hoa",
];

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,32}$/;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const otpLength = 4;
  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [step, setStep] = useState<"request" | "verify" | "reset">("request");
  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(Array(otpLength).fill(""));
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  useEffect(() => {
    if (!expiresAt) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      const diff = Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        window.clearInterval(interval);
      }
    }, 250);

    return () => window.clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    setCode(otpValues.join(""));
  }, [otpValues]);

  const focusOtpInput = (index: number) => {
    otpInputsRef.current[index]?.focus();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) {
      return;
    }

    const digit = value.slice(-1);
    setOtpValues((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < otpLength - 1) {
      focusOtpInput(index + 1);
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      focusOtpInput(index - 1);
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("Text")
      .trim()
      .slice(0, otpLength)
      .replace(/[^0-9]/g, "");

    if (!pasted) {
      return;
    }

    const next = Array(otpLength).fill("");
    pasted.split("").forEach((char, idx) => {
      if (idx < otpLength) {
        next[idx] = char;
      }
    });
    setOtpValues(next);
    const nextFocus = Math.min(pasted.length, otpLength - 1);
    focusOtpInput(nextFocus);
  };

  const handleRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await forgotPassword({ email });
      setMessage(response.message);
      setStep("verify");
      setExpiresAt(new Date(Date.now() + 60_000));
      setOtpValues(Array(otpLength).fill(""));
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!code.trim()) {
      setError("Vui lòng nhập mã xác thực 4 chữ số.");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyForgotPasswordCode({ email, code });
      setMessage(response.message);
      setStep("reset");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return;
    }

    if (!passwordPattern.test(password)) {
      setError("Mật khẩu không hợp lệ. Vui lòng kiểm tra yêu cầu bên dưới.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({ email, code, password });
      setMessage(response.message);
      router.push("/login?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await forgotPassword({ email });
      setMessage(response.message);
      setExpiresAt(new Date(Date.now() + 60_000));
      setCode("");
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="ring-0 border-zinc-200/80 bg-white shadow-lg shadow-slate-200/50 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-semibold text-violet-600 dark:text-violet-400">
          Forgot password
        </CardTitle>
        <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400">
          Nhập email để nhận mã xác thực.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {message ? (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {step === "request" ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="h-11 w-full">
              {loading ? "Đang gửi mã..." : "Gửi mã xác thực"}
            </Button>
          </form>
        ) : step === "verify" ? (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Mã xác thực đã được gửi đến email của bạn:
              </p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {email}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otp">Nhập mã OTP 4 chữ số</Label>
              <div className="flex items-center justify-center gap-3">
                {otpValues.map((value, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={value}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    ref={(el) => {
                      otpInputsRef.current[index] = el;
                    }}
                    className="h-14 w-14 text-center text-xl font-semibold"
                    required
                  />
                ))}
              </div>
              {remainingSeconds > 0 ? (
                <p className="text-xs text-zinc-500">
                  Mã còn hiệu lực trong {remainingSeconds} giây.
                </p>
              ) : (
                <p className="text-xs text-red-500">Mã đã hết hạn. Vui lòng gửi lại.</p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="h-11 w-full">
              {loading ? "Đang xác thực..." : "Xác thực mã"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={handleResend}
              disabled={loading}
              className="h-11 w-full"
            >
              Gửi lại mã
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                className="h-11"
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="Nhập mật khẩu mới"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium mb-2">Yêu cầu mật khẩu:</p>
              <ul className="space-y-1 list-disc pl-5">
                {PASSWORD_RULES.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>

            <Button type="submit" disabled={loading} className="h-11 w-full">
              {loading ? "Đang đặt lại mật khẩu..." : "Đặt lại mật khẩu"}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Đã nhớ mật khẩu?{' '}
          <Link href="/login" className="font-medium text-violet-600 hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
