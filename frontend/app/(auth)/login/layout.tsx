// app/(auth)/login/layout.tsx
import { ReactNode } from "react";

export default function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* 1. Subtle Gradient Orbs (Tạo chiều sâu cho nền tối) */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[100px]" />

      {/* 2. Grid Pattern (Mờ ảo trên nền tối) */}
      <div
        className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v1H0zM0 0v40h1V0z' fill='%23ffffff' fill-opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 3. Main Card (Glassmorphism) */}
      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 mb-4 shadow-lg">
            {/* Icon Dojo */}
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l9-5-9-5-9 5 9 5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            InterviewDojo
          </h1>
          <p className="mt-2 text-sm text-slate-400 font-light">
            Luyện tập trong bóng tối, tỏa sáng tại buổi phỏng vấn
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
