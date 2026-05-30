"use client";

import { useEffect, useState } from "react";
import { Target, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation"; // [THAY ĐỔI]: Đổi Link thành useRouter
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export function DashboardNextActionCard() {
  const { user } = useAuth();
  const router = useRouter();

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false); // [THÊM MỚI]: State loading khi tạo phòng

  useEffect(() => {
    async function fetchNextAction() {
      if (!user?.id) return;
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        const role = user?.target_role || "Frontend Developer";

        const res = await fetch(`${API_BASE}/interviews/next-action/${user.id}?role=${encodeURIComponent(role)}`);

        if (res.ok) {
          const data = await res.json();
          setPlan(data);
        }
      } catch (error) {
        console.error("Lỗi lấy kế hoạch tiếp theo từ Mentor Agent:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNextAction();
  }, [user]);

  // [THÊM MỚI]: Hàm tạo nhanh phòng thi bám sát Lộ trình AI gợi ý
  const handleStartSuggestedInterview = async () => {
    if (!user?.id || !plan) return;
    setIsCreating(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      // Ưu tiên dùng suggested_track của AI làm chủ đề bài thi tiếp theo
      const jobTitle = plan.suggested_track || user.target_role || "Frontend Developer";

      const res = await fetch(`${API_BASE}/interviews/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          jobTitle: jobTitle
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Nhảy thẳng vào phòng thi mới tạo (Focus Mode)
        router.push(`/interview/${data.id}`);
      }
    } catch (error) {
      console.error("Lỗi khởi tạo phòng thi gợi ý:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Giao diện khi đang chờ AI xử lý
  if (loading || !plan) {
    return (
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm flex flex-col min-h-[350px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            AI Mentor đang phân tích lộ trình...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col">
          <div className="h-16 w-full animate-pulse rounded-xl bg-accent/30" />
          <div className="space-y-2">
            <div className="h-4 w-1/3 animate-pulse rounded bg-accent/30" />
            <div className="flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-accent/30" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-accent/30" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-accent/30" />
            </div>
          </div>
          <div className="h-20 w-full flex-1 animate-pulse rounded-xl bg-accent/30" />
          <div className="h-12 w-full animate-pulse rounded-md bg-accent/30 mt-2" />
        </CardContent>
      </Card>
    );
  }

  // Giao diện khi AI trả về kết quả
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-sm">
            <Target className="h-3.5 w-3.5" />
          </div>
          Kế hoạch tiếp theo (AI Mentor)
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="rounded-xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 p-4 text-sm text-rose-700 dark:text-rose-300">
          <span className="font-semibold block mb-1">Gợi ý từ AI:</span>
          {plan.motivational_message}
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Chủ đề trọng tâm
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {plan.focus_topics?.map((topic: string) => (
              <span
                key={topic}
                className="rounded-full bg-accent/60 border border-border/40 px-3 py-1 text-xs font-medium"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-accent/20 p-4 mb-2 flex-1">
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            {plan.suggested_track}
          </p>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {plan.track_description}
          </p>
        </div>

        {/* [THAY ĐỔI]: Nút button gọi hàm handle thay vì dùng thẻ Link */}
        <Button
          onClick={handleStartSuggestedInterview}
          disabled={isCreating}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-6 shadow-lg shadow-blue-900/20"
        >
          {isCreating ? (
            <span className="flex items-center justify-center font-bold tracking-widest uppercase">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ĐANG TẠO PHÒNG...
            </span>
          ) : (
            <span className="flex items-center justify-center font-bold tracking-widest uppercase">
              Bắt đầu bài thi này <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}