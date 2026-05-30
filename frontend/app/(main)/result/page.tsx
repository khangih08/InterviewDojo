import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import InterviewResultPageContent from "./ResultClient";

export default function InterviewResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 px-4 py-8">
          <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl items-center justify-center">
            <div className="w-full rounded-[1.75rem] border border-slate-800 bg-[#0f172a] p-6 shadow-2xl sm:p-8">
              <div className="space-y-5">
                <Skeleton className="h-5 w-28 bg-slate-800" />
                <Skeleton className="h-10 w-3/4 bg-slate-800" />
                <div className="grid gap-4 lg:grid-cols-2">
                  <Skeleton className="h-40 rounded-[1.5rem] bg-slate-800" />
                  <Skeleton className="h-40 rounded-[1.5rem] bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <InterviewResultPageContent />
    </Suspense>
  );
}