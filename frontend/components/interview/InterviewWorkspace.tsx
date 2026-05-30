import Editor from '@monaco-editor/react';
import { Play, Loader2, Terminal as TerminalIcon, XCircle } from 'lucide-react';

export default function InterviewWorkspace({
  codeSnippet, setCodeSnippet, codeOutput, setCodeOutput, isRunningCode, handleRunCode
}: any) {
  return (
    <div className="flex-1 flex flex-col bg-[#0d1117]">
      {/* Thanh tiêu đề Editor */}
      <div className="bg-[#161b22] px-6 py-3 text-[11px] font-black text-slate-500 border-b border-slate-800/50 flex justify-between items-center tracking-widest">
        <div className="flex items-center gap-2 uppercase">
          <TerminalIcon size={14} className="text-emerald-500" />
          <span>Sandbox_Environment.js</span>
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
          defaultLanguage="javascript"
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