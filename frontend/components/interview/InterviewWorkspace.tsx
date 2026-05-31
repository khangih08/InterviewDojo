import Editor from '@monaco-editor/react';
import { Play, Loader2, Terminal as TerminalIcon, XCircle } from 'lucide-react';

const langExtensions: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  cpp: 'cpp',
  java: 'java'
};

export default function InterviewWorkspace({
  codeSnippet, 
  setCodeSnippet, 
  codeOutput, 
  setCodeOutput, 
  isRunningCode, 
  handleRunCode,
  language,
  handleLanguageChange
}: any) {
  const extension = langExtensions[language] || 'js';

  return (
    <div className="flex-1 flex flex-col bg-[#0d1117]">
      {/* Thanh tiêu đề Editor */}
      <div className="bg-[#161b22] px-6 py-3 text-[11px] font-black text-slate-500 border-b border-slate-800/50 flex justify-between items-center tracking-widest">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 uppercase">
            <TerminalIcon size={14} className="text-emerald-500" />
            <span>Sandbox_Environment.{extension}</span>
          </div>

          {/* Bộ chọn Ngôn Ngữ */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-[#0d1117] border border-slate-800 text-[10px] text-slate-400 font-bold px-3 py-1.5 rounded-lg uppercase tracking-tight focus:outline-none focus:border-violet-500 transition-all cursor-pointer hover:border-slate-700"
          >
            <option value="javascript" className="bg-[#0d1117]">JavaScript</option>
            <option value="typescript" className="bg-[#0d1117]">TypeScript</option>
            <option value="python" className="bg-[#0d1117]">Python</option>
            <option value="cpp" className="bg-[#0d1117]">C++</option>
            <option value="java" className="bg-[#0d1117]">Java</option>
          </select>
        </div>

        <button
          onClick={handleRunCode}
          disabled={isRunningCode}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {isRunningCode ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
          <span>RUN CODE</span>
        </button>
      </div>

      {/* Code Editor */}
      <div className="flex-[0.7] w-full pt-2 overflow-hidden border-b border-slate-800/50">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={codeSnippet}
          onChange={(value) => setCodeSnippet(value || '')}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            automaticLayout: true,
            padding: { top: 20 },
            lineNumbers: 'on',
          }}
        />
      </div>

      {/* Terminal Output */}
      <div className="flex-[0.3] bg-[#010409] p-6 font-mono text-sm overflow-y-auto relative group">
        <div className="flex justify-between items-center mb-4">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Output Terminal
          </span>
          <button onClick={() => setCodeOutput('')} className="text-slate-600 hover:text-red-400 transition-colors">
            <XCircle size={16} />
          </button>
        </div>
        <pre className={`whitespace-pre-wrap ${codeOutput.startsWith('❌') ? 'text-red-400' : 'text-emerald-400'}`}>
          {codeOutput || "> Sẵn sàng thực thi..."}
        </pre>
      </div>
    </div>
  );
}