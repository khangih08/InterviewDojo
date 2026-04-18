"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CodeEditorPanel from "@/components/interview/CodeEditorPanel";

export default function CodeEditorPage() {
  return (
    <Suspense fallback={<CodeEditorPageSkeleton />}>
      <CodeEditorPageContent />
    </Suspense>
  );
}

function CodeEditorPageContent() {
  const searchParams = useSearchParams();
  const questionId = searchParams.get("questionId");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Code Editor
        </h1>
        <p className="text-sm text-slate-500">
          Write, save, and export your solution on a dedicated coding workspace.
        </p>
        {questionId ? (
          <p className="text-xs text-slate-400">
            Current question: <span className="font-medium">{questionId}</span>
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            Tip: open from a question using query `?questionId=...` to keep
            notes per question.
          </p>
        )}
      </div>

      <CodeEditorPanel questionId={questionId} />

      <div className="flex flex-wrap gap-3">
        <Link
          href="/questions"
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Back to Questions
        </Link>
        <Link
          href="/interview"
          className="inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
        >
          Go to Interview Room
        </Link>
      </div>
    </div>
  );
}

function CodeEditorPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-96 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="h-96 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
    </div>
  );
}
