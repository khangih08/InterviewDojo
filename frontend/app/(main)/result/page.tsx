import { Suspense } from "react";
import InterviewResultPageContent from "./ResultClient";

export default function InterviewResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c18]" />}>
      <InterviewResultPageContent />
    </Suspense>
  );
}
