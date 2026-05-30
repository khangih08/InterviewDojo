import ReactMarkdown from 'react-markdown';
import { Send, Mic, Square } from 'lucide-react';

export default function InterviewChat({
  activeTab, messages, input, setInput, isLoading, isRecording,
  messagesEndRef, onSendMessage, onToggleRecording, fetchReport, handleReset
}: any) {
  return (
    <div className={`${activeTab === 'CODING' ? 'w-[450px]' : 'w-full max-w-5xl mx-auto'} flex flex-col border-r border-slate-800/50 bg-[#0f172a] transition-all duration-700`}>
      {/* Khung hiển thị tin nhắn */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
        {messages.map((msg: any, idx: number) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-5 rounded-[1.5rem] shadow-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#1e293b] border border-slate-700/50 rounded-tl-none'}`}>
              <div className="text-[13px] leading-relaxed prose prose-invert prose-sm">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Khung Input / Nút hành động */}
      <div className="p-6 border-t border-slate-800/50">
        {activeTab === 'EVALUATION' ? (
          <div className="flex gap-4">
            <button onClick={fetchReport} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 py-5 rounded-2xl font-black tracking-widest hover:brightness-110 transition-all text-white uppercase">XEM BÁO CÁO</button>
            <button onClick={handleReset} className="px-8 bg-slate-800 border border-slate-700 py-5 rounded-2xl font-black tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all text-slate-400 uppercase">PHỎNG VẤN MỚI</button>
          </div>
        ) : (
          <form onSubmit={onSendMessage} className="flex gap-3 bg-[#0f172a]/80 p-2 rounded-[1.5rem] border border-slate-700 shadow-inner">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Nhập câu trả lời..."
              disabled={isRecording || isLoading}
              className="flex-1 bg-transparent px-5 py-3 outline-none text-sm text-white"
            />
            <button type="button" onClick={onToggleRecording} className={`p-4 rounded-2xl transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              {isRecording ? <Square size={20} fill="currentColor"/> : <Mic size={20}/>}
            </button>
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg">
              <Send size={20}/>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}