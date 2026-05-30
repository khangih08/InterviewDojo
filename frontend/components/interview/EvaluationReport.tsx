import ReactMarkdown from 'react-markdown';
import { Zap } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';

function SkillBar({ label, value, color }: { label: string, value: number, color: string }) {
  // Đảm bảo giá trị không vượt quá 100%
  const displayValue = Math.min(value, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
        <span className="text-slate-400">{label}</span>
        <span className="text-white">{displayValue.toFixed(0)}%</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  );
}

export default function EvaluationReport({ report, setReport }: any) {
  // Chuyển đổi dữ liệu từ report.radarData sang định dạng Recharts
  // Giả sử mảng là [Lý thuyết, Thực hành, Kỹ năng mềm, Tư duy, Thái độ]
  const radarChartData = [
    { subject: 'Lý thuyết', A: report.radarData?.[0] || 0, fullMark: 100 },
    { subject: 'Thực hành', A: report.radarData?.[1] || 0, fullMark: 100 },
    { subject: 'Mềm', A: report.radarData?.[2] || 0, fullMark: 100 },
    { subject: 'Tư duy', A: report.radarData?.[3] || 0, fullMark: 100 },
    { subject: 'Thái độ', A: report.radarData?.[4] || 0, fullMark: 100 },
  ];

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 z-[100]">
      <div className="bg-[#1e293b] border border-white/10 rounded-[3rem] w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">

        <div className="p-8 border-b border-slate-700/50 flex justify-between items-center bg-[#1e293b]">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Báo Cáo Phỏng Vấn Chi Tiết</h2>
            <p className="text-slate-400 text-xs mt-1">Hệ thống đánh giá AI Dojo v2.0</p>
          </div>
          <button onClick={() => setReport(null)} className="w-12 h-12 rounded-full hover:bg-red-500/10 hover:text-red-500 text-2xl transition-all flex items-center justify-center">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0f172a]">
          {/* Thẻ điểm số */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-blue-500/20 shadow-lg text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Điểm trung bình</p>
              <div className="text-4xl font-black text-blue-400">{report.avgScore || 0}<span className="text-sm text-slate-500">/10</span></div>
            </div>
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-emerald-500/20 shadow-lg text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Lý thuyết</p>
              <div className="text-4xl font-black text-emerald-400">{report.theory || 0}</div>
            </div>
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-purple-500/20 shadow-lg text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Thực hành</p>
              <div className="text-4xl font-black text-purple-400">{report.coding || 0}</div>
            </div>
            <div className="bg-[#1e293b] p-6 rounded-3xl border border-orange-500/20 shadow-lg text-center">
              <p className="text-slate-400 text-[10px] font-bold uppercase mb-2">Kỹ năng mềm</p>
              <div className="text-4xl font-black text-orange-400">{report.softSkills || 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              {/* Chart - ĐÃ SỬA TẠI ĐÂY */}
              <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-700">
                <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                  <Zap size={18} className="text-yellow-400" /> Biểu đồ năng lực
                </h3>
                <div className="aspect-square w-full bg-slate-900/50 rounded-2xl flex items-center justify-center border border-slate-800 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarChartData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                      <Radar
                        name="Ứng viên"
                        dataKey="A"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.5}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Progress Bars - ĐÃ SỬA LOGIC NHÂN 10 */}
              <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-700">
                <h3 className="text-white font-bold mb-6">Chi tiết kỹ năng</h3>
                <div className="space-y-5">
                  {/* Nếu theory là điểm hệ 10 (ví dụ 9) thì nhân 10 để ra 90%.
                      Nếu đã là hệ 100 thì bỏ nhân 10. Ở đây tôi giữ nhân 10 cho đồng bộ hệ điểm 10 */}
                  <SkillBar label="Lý thuyết (Theory)" value={(report.theory || 0) * 10} color="bg-blue-500" />
                  <SkillBar label="Thực hành (Coding)" value={(report.coding || 0) * 10} color="bg-emerald-500" />
                  <SkillBar label="Kỹ năng mềm" value={(report.softSkills || 0) * 10} color="bg-orange-500" />
                  <SkillBar label="Tổng quan" value={(report.avgScore || 0) * 10} color="bg-purple-500" />
                </div>
              </div>
            </div>

            {/* Markdown Summary */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#1e293b] p-10 rounded-[2rem] border border-slate-700 shadow-xl min-h-full">
                <div className="prose prose-invert prose-blue max-w-none text-slate-300">
                  <ReactMarkdown>{report.summary || "Đang cập nhật đánh giá chi tiết..."}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700/50 bg-[#1e293b] flex justify-end gap-3">
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl text-xs font-bold transition-all">
            XUẤT PDF
          </button>
        </div>
      </div>
    </div>
  );
}