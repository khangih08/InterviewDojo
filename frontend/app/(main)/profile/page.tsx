"use client";

import { UserRound, Mail, Briefcase, GraduationCap, MapPin, Calendar, Edit3, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-12 transition-colors">
      {/* Header Profile Section */}
      <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-slate-900/50">
        {/* Cover Banner */}
        <div className="h-48 w-full glow-gradient relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/20 blur-3xl rounded-full" />
          <div className="absolute top-8 left-8 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
        </div>

        {/* Profile Content */}
        <div className="px-8 pb-8 relative">
          {/* Avatar & Edit Button */}
          <div className="flex justify-between items-end -mt-16 mb-6">
            <div className="relative group cursor-pointer">
              <div className="h-32 w-32 rounded-3xl bg-white dark:bg-slate-800 p-2 shadow-lg ring-4 ring-white/50 dark:ring-slate-900/50 relative z-10 overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-50 dark:from-violet-900/40 dark:to-indigo-900/40 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <UserRound className="h-12 w-12" />
                </div>
              </div>
              {/* Optional glow behind avatar */}
              <div className="absolute inset-0 rounded-3xl bg-violet-400/30 blur-xl z-0 animate-pulse-glow" />
            </div>
            
            <Button variant="outline" className="hidden sm:flex gap-2 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
              <Edit3 className="w-4 h-4" />
              Chỉnh sửa hồ sơ
            </Button>
          </div>

          {/* User Info */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {user?.full_name || "Chưa cập nhật tên"}
              </h1>
              {user?.full_name && (
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1 rounded-full px-2 py-0.5">
                  <ShieldCheck className="w-3 h-3" /> Xác thực
                </Badge>
              )}
            </div>
            <p className="mt-2 text-slate-500 dark:text-slate-400 flex items-center gap-2 font-medium">
              <Briefcase className="w-4 h-4 text-violet-500" />
              {user?.target_role || "Chưa xác định vị trí mục tiêu"}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Personal Info */}
        <div className="md:col-span-1 space-y-8 animate-fade-in-up-delay-1">
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <UserRound className="w-5 h-5 text-indigo-500" />
              Thông tin cá nhân
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-200 break-all">
                    {user?.email || "Chưa cập nhật"}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Địa chỉ</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-200">
                    Việt Nam
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ngày tham gia</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-200">
                    Gần đây
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Career Profile */}
        <div className="md:col-span-2 space-y-8 animate-fade-in-up-delay-2">
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              Hồ sơ nghề nghiệp
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="relative group p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-violet-50 dark:hover:bg-violet-900/10 hover:border-violet-200 dark:hover:border-violet-800/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-violet-400">
                  <Briefcase className="w-6 h-6" />
                </div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Vị trí mục tiêu
                </dt>
                <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {user?.target_role || "Chưa thiết lập"}
                </dd>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Định hướng công việc mà bạn đang hướng tới trong tương lai gần.
                </p>
              </div>

              <div className="relative group p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-sky-50 dark:hover:bg-sky-900/10 hover:border-sky-200 dark:hover:border-sky-800/50 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity text-sky-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Kinh nghiệm
                </dt>
                <dd className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {user?.experience_level || "Chưa thiết lập"}
                </dd>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Cấp độ kỹ năng chuyên môn hiện tại để hệ thống gợi ý lộ trình phù hợp.
                </p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4">Mức độ hoàn thiện hồ sơ</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                  <span>Tiến độ</span>
                  <span className="text-violet-600 dark:text-violet-400">{(user?.target_role && user?.experience_level) ? '100%' : '50%'}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-violet-500 transition-all duration-1000 ease-out" 
                    style={{ width: (user?.target_role && user?.experience_level) ? '100%' : '50%' }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                  {(user?.target_role && user?.experience_level) ? 'Hồ sơ của bạn đã hoàn thiện. Sẵn sàng cho mọi cuộc phỏng vấn!' : 'Hãy cập nhật thêm thông tin để nhận được những gợi ý chính xác hơn.'}
                </p>
              </div>
            </div>

          </section>
        </div>
      </div>
    </div>
  );
}

