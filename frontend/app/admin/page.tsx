"use client";
import { useEffect, useState } from "react";
import { Users, CreditCard, ShieldAlert, DollarSign, Check, Search, Eye, Gift, X, MessageSquare, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function AdminPage() {
  const { logout } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PRO'>('ALL');

  // State cho Tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");

  // State cho Modal Xem Log
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [expandedInterviewId, setExpandedInterviewId] = useState<string | null>(null);

  // 1. [ĐÃ FIX LỖI LOCALHOST]: Dùng biến môi trường để gọi đúng Backend trên Render
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  const loadData = async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        fetch(`${apiUrl}/admin/stats`),
        fetch(`${apiUrl}/admin/users`)
      ]);
      setStats(await sRes.json());
      const usersData = await uRes.json();
      setUsers(usersData);
      filterUsers(usersData, activeTab, searchQuery);
    } catch (e) { console.error("Lỗi load data admin", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filterUsers = (data: any[], tab: string, query: string) => {
    let result = data;
    if (tab === 'PENDING') result = result.filter(u => u.is_pending_pro);
    else if (tab === 'PRO') result = result.filter(u => u.plan === 'PRO');

    if (query.trim() !== "") {
      const q = query.toLowerCase();
      result = result.filter(u => 
        (u.full_name && u.full_name.toLowerCase().includes(q)) || 
        (u.email && u.email.toLowerCase().includes(q))
      );
    }
    setFilteredUsers(result);
  };

  const handleTabChange = (tab: 'ALL' | 'PENDING' | 'PRO') => {
    setActiveTab(tab);
    filterUsers(users, tab, searchQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    filterUsers(users, activeTab, val);
  };

  // Các hành động của Admin
  const handleLogout = () => {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất khỏi Admin Center?")) return;
    logout();
    window.location.href = "/login";
  };

  const handleApprove = async (id: string, name: string) => {
    if (!confirm(`Xác nhận nâng cấp PRO cho ${name}?`)) return;
    const res = await fetch(`${apiUrl}/admin/approve-pro/${id}`, { method: 'POST' });
    if (res.ok) { alert("Đã duyệt thành công!"); loadData(); }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn THU HỒI gói PRO của ${name}? Tài khoản sẽ bị hạ cấp xuống FREE.`)) return;
    const res = await fetch(`${apiUrl}/admin/revoke-pro/${id}`, { method: 'POST' });
    if (res.ok) { alert("Đã thu hồi gói PRO thành công!"); loadData(); }
    else { alert("Lỗi khi thực hiện thu hồi gói PRO."); }
  };

  const handleAddCredits = async (id: string, name: string, currentCredits: number) => {
    const input = prompt(`Nhập số credits muốn set cho ${name} (Hiện tại: ${currentCredits}):`, (currentCredits + 10).toString());
    if (!input || isNaN(Number(input))) return;

    const res = await fetch(`${apiUrl}/admin/update-credits/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credits: Number(input) })
    });
    if (res.ok) { alert("Cập nhật lượt thành công!"); loadData(); }
  };

  const handleViewLogs = async (user: any) => {
    setSelectedUser(user);
    setLoadingLogs(true);
    setExpandedInterviewId(null); // Reset lại trạng thái expanded
    try {
      const res = await fetch(`${apiUrl}/admin/user-interviews/${user.id}`);
      setUserLogs(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoadingLogs(false); }
  };

  if (loading) return <div className="p-10 text-white flex justify-center items-center h-screen"><MessageSquare className="animate-pulse mr-2" /> Loading Command Center...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">ADMIN CENTER</h1>
          <p className="text-slate-400">Quản lý người dùng và giám sát hệ thống AI.</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25 px-5 py-2.5 rounded-2xl font-bold transition-all flex items-center gap-2"
        >
          <LogOut size={16} /> ĐĂNG XUẤT
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard icon={<Users />} label="Tổng User" value={stats?.totalUsers || 0} color="text-blue-400" />
        <StatCard icon={<CreditCard />} label="Gói PRO" value={stats?.proUsers || 0} color="text-emerald-400" />
        <StatCard icon={<ShieldAlert />} label="Chờ duyệt" value={stats?.pendingPayments || 0} color="text-orange-400" />
        {/* 2. [ĐÃ FIX LỖI undefinedđ]: Bọc fallback (stats?.revenue || 0) trước khi toLocaleString */}
        <StatCard icon={<DollarSign />} label="Doanh thu" value={`${(stats?.revenue || 0).toLocaleString()}đ`} color="text-purple-400" />
      </div>

      {/* BỘ LỌC TABS & TÌM KIẾM */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex gap-4">
          {['ALL', 'PENDING', 'PRO'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as any)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50' : 'bg-[#1e293b] text-slate-400 hover:bg-slate-800'
                }`}
            >
              {tab === 'ALL' ? 'Tất cả' : tab === 'PENDING' ? 'Chờ duyệt' : 'Đã lên PRO'}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm tên hoặc email..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-xl py-2 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#1e293b]/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 overflow-hidden shadow-2xl mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 text-[10px] uppercase font-black text-slate-500 tracking-widest">
              <tr>
                <th className="p-6">Người dùng</th>
                <th className="p-6">Gói hiện tại</th>
                <th className="p-6">Credits</th>
                <th className="p-6 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredUsers.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-700/20 transition-all">
                  <td className="p-6">
                    <div className="font-bold text-white flex items-center gap-2">
                      {u.full_name}
                      {u.is_pending_pro && <ShieldAlert size={14} className="text-orange-400 animate-pulse" />}
                    </div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${u.plan === 'PRO' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="p-6 font-mono font-bold text-slate-400">{u.credits}</td>
                  <td className="p-6 flex justify-end gap-2">
                    {/* Nút Xem Log */}
                    <button onClick={() => handleViewLogs(u)} title="Xem lịch sử phỏng vấn" className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 p-2.5 rounded-xl transition-all">
                      <Eye size={16} />
                    </button>
                    {/* Nút Tặng Credits (Chỉ dùng cho acc Free) */}
                    {u.plan !== 'PRO' && (
                      <button onClick={() => handleAddCredits(u.id, u.full_name, u.credits)} title="Tặng Credits" className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 p-2.5 rounded-xl transition-all">
                        <Gift size={16} />
                      </button>
                    )}
                    {/* Nút Thu hồi PRO */}
                    {u.plan === 'PRO' && (
                      <button onClick={() => handleRevoke(u.id, u.full_name)} title="Thu hồi gói PRO" className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2.5 rounded-xl transition-all">
                        <ShieldAlert size={16} />
                      </button>
                    )}
                    {/* Nút Duyệt PRO */}
                    {u.is_pending_pro && (
                      <button onClick={() => handleApprove(u.id, u.full_name)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 shadow-lg shadow-emerald-900/20">
                        <Check size={14} /> DUYỆT PRO
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={4} className="p-10 text-center text-slate-500">Không tìm thấy người dùng nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT LOG */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f172a] border border-slate-700 w-full max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h3 className="text-xl font-bold text-white">Lịch sử phỏng vấn</h3>
                <p className="text-sm text-slate-400">Ứng viên: <span className="text-emerald-400">{selectedUser.full_name}</span></p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 overflow-y-auto flex-1 bg-[#1e293b]/30">
              {loadingLogs ? (
                <div className="text-center text-slate-500 py-10">Đang tải dữ liệu chat...</div>
              ) : userLogs.length === 0 ? (
                <div className="text-center text-slate-500 py-10">Người dùng này chưa tham gia buổi phỏng vấn nào.</div>
              ) : (
                <div className="space-y-6">
                  {userLogs.map((log, idx) => {
                    const isExpanded = expandedInterviewId === log.id;
                    return (
                      <div key={log.id} className="bg-[#1e293b]/80 p-5 rounded-2xl border border-slate-700/50 shadow-md">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="font-bold text-violet-400 flex items-center gap-2">
                              Buổi phỏng vấn #{userLogs.length - idx}
                              <span className="text-[10px] text-slate-500 font-normal">({log.id})</span>
                            </div>
                            <div className="text-xs text-slate-500">{new Date(log.created_at).toLocaleString('vi-VN')}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${log.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-400'}`}>
                              {log.status}
                            </span>
                            <button
                              onClick={() => setExpandedInterviewId(isExpanded ? null : log.id)}
                              className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 p-1.5 rounded-lg transition-all"
                              title={isExpanded ? "Thu gọn chat" : "Xem chi tiết cuộc chat"}
                            >
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                          <div><span className="text-slate-500">Giai đoạn:</span> <span className="font-bold text-slate-300">{log.current_phase}</span></div>
                          <div><span className="text-slate-500">Điểm đánh giá:</span> <span className="font-bold text-yellow-400">{log.evaluation_score || 'Chưa có'} / 10</span></div>
                        </div>

                        {/* HIỂN THỊ CHI TIẾT BONG BÓNG CHAT KHI ĐƯỢC MỞ RỘNG */}
                        {isExpanded ? (
                          <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {log.messages && log.messages.length > 0 ? (
                              log.messages.map((msg: any) => {
                                const isAI = msg.role === 'assistant' || msg.role === 'system';
                                return (
                                  <div key={msg.id} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
                                    <div className={`text-[10px] text-slate-500 mb-1 px-2 ${isAI ? 'text-left' : 'text-right'}`}>
                                      {isAI ? '🤖 AI Interviewer' : '👤 Candidate'}
                                    </div>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm shadow-sm leading-relaxed border ${
                                      isAI 
                                        ? 'bg-slate-800/90 text-slate-100 border-slate-700 rounded-tl-none' 
                                        : 'bg-violet-600/90 text-white border-violet-500/30 rounded-tr-none'
                                    }`}>
                                      {msg.content}
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center text-slate-500 text-xs py-4">Không có tin nhắn chi tiết nào trong buổi phỏng vấn này.</div>
                            )}
                          </div>
                        ) : (
                          /* Hiển thị tóm tắt tin nhắn cuối cùng khi thu gọn */
                          log.messages && log.messages.length > 0 && (
                            <div 
                              onClick={() => setExpandedInterviewId(log.id)}
                              className="text-xs text-slate-400 bg-slate-800/40 hover:bg-slate-800/60 p-3 rounded-lg line-clamp-2 cursor-pointer transition-all border border-transparent hover:border-slate-700/30"
                              title="Click để xem chi tiết cuộc chat"
                            >
                              <span className="font-bold text-slate-300">Tin nhắn cuối: </span>
                              {log.messages[log.messages.length - 1].content}
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-[#1e293b]/50 p-7 rounded-[2rem] border border-slate-700/50 shadow-xl hover:border-slate-600 transition-all group">
      <div className={`${color} mb-5 group-hover:scale-110 transition-transform`}>{icon}</div>
      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
      <div className={`text-3xl font-black mt-2 tracking-tighter ${color}`}>{value}</div>
    </div>
  );
}