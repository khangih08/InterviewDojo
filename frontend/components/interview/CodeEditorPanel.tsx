"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw } from "lucide-react";

type EditorLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "cpp"
  | "go";

const LANGUAGE_LABELS: Record<EditorLanguage, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C++",
  go: "Go",
};

const FILE_EXTENSIONS: Record<EditorLanguage, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  java: "java",
  cpp: "cpp",
  go: "go",
};

type SavedEditorState = {
  language: EditorLanguage;
  code: string;
};

function buildStarterCode(
  language: EditorLanguage,
  questionContent?: string,
): string {
  const promptLine = questionContent
    ? questionContent.replace(/\s+/g, " ").trim()
    : "Implement your solution here.";

  switch (language) {
    case "javascript":
      return `// Problem: ${promptLine}\nfunction solve(input) {\n  // TODO: write your solution\n  return input;\n}\n\nmodule.exports = { solve };\n`;
    case "typescript":
      return `// Problem: ${promptLine}\nexport function solve(input: unknown): unknown {\n  // TODO: write your solution\n  return input;\n}\n`;
    case "python":
      return `# Problem: ${promptLine}\ndef solve(input_data):\n    # TODO: write your solution\n    return input_data\n\n\nif __name__ == \"__main__\":\n    print(solve(None))\n`;
    case "java":
      return `// Problem: ${promptLine}\npublic class Solution {\n    public static Object solve(Object input) {\n        // TODO: write your solution\n        return input;\n    }\n}\n`;
    case "cpp":
      return `// Problem: ${promptLine}\n#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // TODO: write your solution\n    return 0;\n}\n`;
    case "go":
      return `// Problem: ${promptLine}\npackage main\n\nimport \"fmt\"\n\nfunc solve(input any) any {\n    // TODO: write your solution\n    return input\n}\n\nfunc main() {\n    fmt.Println(solve(nil))\n}\n`;
    default:
      return "";
  }
}

export default function CodeEditorPanel({
  questionId,
  questionContent,
}: {
  questionId?: string | null;
  questionContent?: string;
}) {
  const [language, setLanguage] = useState<EditorLanguage>("javascript");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const storageKey = useMemo(
    () => `idc_code_editor_${questionId || "draft"}`,
    [questionId],
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as SavedEditorState;
        if (parsed.language && parsed.code) {
          setLanguage(parsed.language);
          setCode(parsed.code);
          return;
        }
      } catch {
        // Ignore malformed local state and rebuild a starter template.
      }
    }

    const starter = buildStarterCode("javascript", questionContent);
    setLanguage("javascript");
    setCode(starter);
  }, [storageKey, questionContent]);

  useEffect(() => {
    if (typeof window === "undefined" || !code) {
      return;
    }

    const payload: SavedEditorState = { language, code };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
  }, [language, code, storageKey]);

  const handleLanguageChange = (nextLanguage: EditorLanguage) => {
    if (nextLanguage === language) {
      return;
    }

    const hasMeaningfulCode = code.trim().length > 0;
    if (hasMeaningfulCode) {
      const shouldReplace = window.confirm(
        "Switching language will replace current code with a new template. Continue?",
      );
      if (!shouldReplace) {
        return;
      }
    }

    setLanguage(nextLanguage);
    setCode(buildStarterCode(nextLanguage, questionContent));
  };

  const handleReset = () => {
    const ok = window.confirm("Reset code to the default template?");
    if (!ok) {
      return;
    }

    setCode(buildStarterCode(language, questionContent));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const ext = FILE_EXTENSIONS[language];
    const fileName = `solution.${ext}`;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/8 bg-white/4 p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
            Code Editor
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Write and save your solution
          </h3>
          <p className="text-sm text-slate-400">
            Code is auto-saved on this browser for the current question.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={language}
            onChange={(event) =>
              handleLanguageChange(event.target.value as EditorLanguage)
            }
            className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-400"
            aria-label="Programming language"
          >
            {Object.entries(LANGUAGE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-white/20"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 transition hover:border-white/20"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 bg-indigo-500/15 px-3 py-2 text-sm text-indigo-200 transition hover:bg-indigo-500/25"
          >
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
      </div>

      <textarea
        value={code}
        onChange={(event) => setCode(event.target.value)}
        spellCheck={false}
        className="min-h-80 w-full resize-y rounded-xl border border-white/10 bg-[#0b1220] p-4 font-mono text-sm leading-6 text-slate-100 outline-none ring-0 placeholder:text-slate-500 focus:border-indigo-400"
        placeholder="Write your solution here..."
      />

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Language: {LANGUAGE_LABELS[language]}</span>
        <span>{code.length} characters</span>
      </div>
    </div>
  );
}
