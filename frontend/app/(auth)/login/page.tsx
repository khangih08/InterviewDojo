"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// import { post } from "@/lib/api"; // Giả định đường dẫn api
// import { saveToken } from "@/lib/auth"; // Giả định đường dẫn auth
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Eye, EyeOff, Terminal } from "lucide-react";
import Link from "next/link";

// --- 1. CSS Animations (Thêm vào cuối file hoặc globals.css) ---
const backgroundAnimations = `
  @keyframes move-grid {
    0% { transform: translateY(0); }
    100% { transform: translateY(4rem); }
  }

  @keyframes particle-float {
    0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; }
    50% { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
  }

  @keyframes blob-float {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(20px, -30px) scale(1.1); }
    50% { transform: translate(-10px, 10px) scale(0.9); }
    75% { transform: translate(-30px, -10px) scale(1.05); }
  }

  .animate-move-grid {
    animation: move-grid 3s linear infinite;
  }

  .animate-blob-float {
    animation: blob-float 15s ease-in-out infinite;
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Giả lập hàm login để demo
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError("Vui lòng nhập email và mật khẩu");
        setIsLoading(false);
        return;
      }
      // Giả lập call API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // const res = await post("/auth/login", { email, password });
      // saveToken(res.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden px-4">
      {/* Thêm style tag cho animation */}
      <style>{backgroundAnimations}</style>

      {/* --- BACKGROUND DỘNG --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Tầng 1: Deep Radial Gradient Nền */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1e293b_0%,#020617_80%)]"></div>

        {/* Tầng 2: Moving Blobs (Tia sáng di chuyển chậm) */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px] animate-blob-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[130px] animate-blob-float delay-5000"></div>

        {/* Tầng 3: Animated 3D Grid (Lưới di chuyển) */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] animate-move-grid opacity-30"></div>
        </div>

        {/* Tầng 4: Floating Particles (Hạt lơ lửng - tạo bằng CSS đơn giản) */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `particle-float ${5 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
      {/* --- HẾT BACKGROUND DỘNG --- */}

      {/* CARD ĐĂNG NHẬP (Được giữ nguyên và tối ưu nhẹ) */}
      <Card className="w-full max-w-md relative z-10 shadow-[0_0_60px_-15px_rgba(30,58,138,0.3)] border-slate-800 bg-slate-900/80 backdrop-blur-xl ring-1 ring-white/10">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-16 h-16 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center shadow-inner">
                <Terminal className="text-blue-400 w-8 h-8" />
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-extrabold tracking-tighter text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
            InterviewDojo
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium">
            Mài sắc kỹ năng, chinh phục nhà tuyển dụng
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert className="bg-red-500/5 border-red-500/20 text-red-400 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300 text-sm ml-1">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-slate-300 text-sm ml-1"
                >
                  Mật khẩu
                </Label>
                <Link
                  href="/forgot-password"
                  title="Quên mật khẩu"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="bg-slate-950/50 border-slate-800 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 pr-10 h-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 rounded-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_35px_rgba(37,99,235,0.5)] active:scale-[0.98] mt-6 text-base"
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                "Đăng nhập ngay"
              )}
            </Button>

            <div className="relative py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
                <span className="px-3 bg-slate-900 text-slate-500">
                  New to the Dojo?
                </span>
              </div>
            </div>

            <Link href="/register" className="block">
              <Button
                variant="outline"
                className="w-full border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white h-12 transition-all duration-200 text-base"
              >
                Tạo tài khoản mới
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>

      {/* Footer info */}
      <div className="absolute bottom-6 text-slate-700 text-xs z-10 font-mono">
        &gt;_ code_your_future()
      </div>
    </div>
  );
}
