import { useState, useEffect, useRef } from 'react';
import { ticketAPI } from '../../services/api';
import { 
  Search, Filter, MessageSquare, Send, CheckCircle, Loader2, Headphones, 
  User, Bot, Clock, Check, CheckCheck, Sparkles, PhoneCall, AlertCircle, 
  Shield, ArrowLeft, RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';

const STAFF_QUICK_REPLIES = [
  '📦 Đơn hàng của bạn đang được đóng gói và sẽ giao trong ngày hôm nay.',
  '🔧 Kỹ thuật viên đã tiếp nhận yêu cầu bảo hành, vui lòng gửi máy về trạm bảo hành gần nhất.',
  '💳 Yêu cầu hoàn tiền đã được gửi sang bộ phận kế toán, dự kiến hoàn tất trong 24h.',
  '📞 Nhân viên CSKH sẽ gọi điện liên hệ trực tiếp cho bạn qua số điện thoại đăng ký ngay bây giờ.',
  '✅ Cảm ơn bạn đã liên hệ TechPhone. Yêu cầu hỗ trợ của bạn đã được xử lý xong!'
];

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  useEffect(() => {
    if (chatEndRef.current && chatEndRef.current.parentElement) {
      chatEndRef.current.parentElement.scrollTo({
        top: chatEndRef.current.parentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await ticketAPI.getAllStaff(params);
      setTickets(res.data || []);
      if (selectedTicket) {
        const updated = res.data?.find(t => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách yêu cầu hỗ trợ');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    const hasUnread = ticket.messages.some(m => m.senderRole === 'customer' && !m.isRead);
    if (hasUnread) {
      try {
        const res = await ticketAPI.markAsRead(ticket._id);
        setSelectedTicket(res.data);
        setTickets(prev => prev.map(t => t._id === ticket._id ? res.data : t));
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;
    try {
      const res = await ticketAPI.reply(selectedTicket._id, replyMessage);
      setSelectedTicket(res.data);
      setTickets(tickets.map(t => t._id === res.data._id ? res.data : t));
      setReplyMessage('');
      toast.success('Đã gửi phản hồi cho khách hàng');
    } catch (err) {
      toast.error('Lỗi khi gửi phản hồi');
    }
  };

  const handleCloseTicket = async () => {
    if (!window.confirm('Xác nhận đóng yêu cầu này? Khách hàng sẽ không thể phản hồi thêm.')) return;
    try {
      const res = await ticketAPI.close(selectedTicket._id);
      setSelectedTicket(res.data);
      setTickets(tickets.map(t => t._id === res.data._id ? res.data : t));
      toast.success('Đã đóng yêu cầu hỗ trợ');
    } catch (err) {
      toast.error('Lỗi khi đóng yêu cầu');
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchSubject = t.subject?.toLowerCase().includes(term);
    const matchEmail = t.user?.email?.toLowerCase().includes(term);
    const matchName = t.user?.name?.toLowerCase().includes(term);
    const matchCode = t._id?.toLowerCase().includes(term);
    return matchSubject || matchEmail || matchName || matchCode;
  });

  return (
    <div className="p-4 sm:p-6 h-[calc(100vh-64px)] flex flex-col min-w-0 w-full overflow-hidden">
      {/* Top Banner Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 bg-gradient-to-r from-[#0084FF] via-[#0066CC] to-indigo-700 p-5 sm:p-6 rounded-3xl text-white shadow-lg min-w-0 w-full">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner shrink-0">
            <Headphones className="w-6 h-6 sm:w-7 sm:h-7 text-white animate-bounce-subtle" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate">Cổng Hỗ Trợ & CSKH Hệ Thống</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-900 text-[10px] font-black uppercase tracking-wider shadow-sm shrink-0">Staff 24/7 Live</span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 font-medium mt-0.5 truncate">Quản lý, tiếp nhận và trò chuyện trực tiếp với khách hàng cần hỗ trợ</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={fetchTickets} 
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-2xl font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            title="Làm mới danh sách"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0 w-full min-w-0 overflow-hidden">
        {/* Left Sidebar: Ticket List */}
        <div className={`w-full md:w-5/12 lg:w-4/12 flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden min-w-0 shrink-0 ${selectedTicket ? 'hidden md:flex' : 'flex'}`}>
          {/* Search & Filters */}
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 space-y-3 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm mã đơn, email, tên khách..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#0084FF] focus:border-transparent transition-all outline-none" 
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <span className="text-xs font-bold">✕</span>
                </button>
              )}
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'open', label: 'Mới' },
                { key: 'in_progress', label: 'Đang xử lý' },
                { key: 'closed', label: 'Đã đóng' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 ${
                    filter === key 
                      ? 'bg-gradient-to-r from-[#0084FF] to-indigo-600 text-white shadow-md scale-105' 
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket List Items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar min-w-0 w-full overflow-x-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#0084FF]" />
                <span className="text-xs font-bold">Đang tải yêu cầu hỗ trợ...</span>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 p-6 text-center">
                <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-xs font-bold text-slate-500">Không tìm thấy yêu cầu hỗ trợ nào</p>
              </div>
            ) : (
              filteredTickets.map(t => {
                const hasUnreadCustomerMsg = t.messages.some(m => m.senderRole === 'customer' && !m.isRead);
                const isSelected = selectedTicket?._id === t._id;

                return (
                  <div
                    key={t._id}
                    onClick={() => handleSelectTicket(t)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border relative min-w-0 w-full overflow-hidden ${
                      isSelected 
                        ? 'bg-blue-50/90 dark:bg-blue-950/40 border-[#0084FF] shadow-md scale-[1.01]' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-sm'
                    }`}
                  >
                    {hasUnreadCustomerMsg && (
                      <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                    )}
                    <div className="flex justify-between items-start mb-1.5 gap-2 min-w-0">
                      <h4 className={`text-xs sm:text-sm font-black truncate pr-4 ${hasUnreadCustomerMsg ? 'text-slate-900 dark:text-white font-black' : 'text-slate-700 dark:text-slate-200'}`}>
                        {t.subject}
                      </h4>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        t.status === 'closed' 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' 
                          : t.status === 'in_progress' 
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' 
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {t.status === 'closed' ? 'Đã đóng' : t.status === 'in_progress' ? 'Đang xử lý' : 'Mới'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 truncate mb-2">
                      <User size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{t.user?.name} - {t.user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        #{t.ticketCode || t._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {new Date(t.updatedAt).toLocaleDateString('vi-VN')} {new Date(t.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content Area: Ticket Detail & Messenger View */}
        <div className={`w-full md:w-7/12 lg:w-8/12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden min-w-0 w-full ${!selectedTicket ? 'hidden md:flex' : 'flex'}`}>
          {selectedTicket ? (
            <div className="flex flex-col h-full bg-white dark:bg-slate-900 min-w-0 w-full overflow-hidden">
              {/* Messenger Header */}
              <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#0084FF] via-[#0066CC] to-indigo-700 text-white flex items-center justify-between gap-3 shrink-0 shadow-md min-w-0 w-full">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <button 
                    onClick={() => setSelectedTicket(null)} 
                    className="md:hidden text-white/80 hover:text-white p-1.5 -ml-2 rounded-xl hover:bg-white/10 shrink-0 transition-colors"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                      <User size={22} className="text-white" />
                    </div>
                    {selectedTicket.status !== 'closed' && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0084FF] rounded-full animate-pulse" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                      <h3 className="font-black text-base truncate">{selectedTicket.subject}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono font-extrabold shrink-0">
                        #{selectedTicket.ticketCode || selectedTicket._id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-blue-100 font-medium truncate mt-0.5">
                      👤 {selectedTicket.user?.name} ({selectedTicket.user?.email})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedTicket.status !== 'closed' ? (
                    <button 
                      onClick={handleCloseTicket} 
                      className="px-3.5 py-2 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                    >
                      <CheckCircle size={15} />
                      <span>Đóng Ticket</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-2xl bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 whitespace-nowrap">
                      Đã giải quyết
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-2.5 custom-scrollbar bg-slate-50/60 dark:bg-slate-950/40 min-w-0 w-full overflow-x-hidden">
                {selectedTicket.messages?.map((msg, i) => {
                  const isCustomer = msg.senderRole === 'customer';
                  const isAiBot = !isCustomer && (
                    msg.message.includes('🤖') || 
                    msg.message.includes('👋') || 
                    msg.message.includes('⚡') || 
                    msg.message.includes('🚚') || 
                    msg.message.includes('🔄') || 
                    msg.message.includes('💳') || 
                    msg.message.includes('📞') || 
                    msg.message.includes('🔔')
                  );
                  
                  return (
                    <div key={i} className={`flex min-w-0 w-full gap-2 ${isCustomer ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                      {isCustomer && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0 mb-0.5 shadow-xs font-bold text-xs">
                          <User size={14} />
                        </div>
                      )}

                      <div className={`max-w-[85%] sm:max-w-[65%] md:max-w-[55%] lg:max-w-[48%] min-w-0 flex flex-col ${isCustomer ? 'items-start' : 'items-end'}`}>
                        <div className="flex items-center gap-1 mb-0.5 mx-1">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-full">
                            {isCustomer ? selectedTicket.user?.name : isAiBot ? '🤖 Trợ lý AI TechPhone' : `👨‍💻 ${msg.sender?.name || 'Nhân viên CSKH'}`}
                          </span>
                          {!isCustomer && isAiBot && (
                            <span className="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-[9px] font-extrabold border border-purple-200 dark:border-purple-800">
                              AI Bot
                            </span>
                          )}
                          {!isCustomer && !isAiBot && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold border border-blue-200 dark:border-blue-800">
                              {msg.senderRole === 'admin' ? 'Admin' : msg.senderRole === 'manager' ? 'Quản lý' : 'Staff'}
                            </span>
                          )}
                        </div>

                        <div className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-[13px] sm:text-sm leading-snug shadow-xs min-w-0 max-w-full break-words ${
                          isCustomer
                            ? 'bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                            : isAiBot
                            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white rounded-br-xs font-medium shadow-md'
                            : 'bg-gradient-to-r from-[#0084FF] to-[#0099FF] text-white rounded-br-xs font-medium shadow-md'
                        }`}>
                          <p className="whitespace-pre-wrap leading-snug break-words max-w-full overflow-hidden">{msg.message}</p>
                        </div>

                        <div className="flex items-center gap-1 mt-0.5 px-1">
                          <span className="text-[9px] text-slate-400 font-medium">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} {new Date(msg.createdAt || Date.now()).toLocaleDateString('vi-VN')}
                          </span>
                          {!isCustomer && (
                            <span className={msg.isRead ? 'text-[#0084FF] font-bold text-[10px] flex items-center gap-0.5' : 'text-slate-400 text-[10px] flex items-center gap-0.5'} title={msg.isRead ? "Khách đã đọc" : "Đã gửi"}>
                              {msg.isRead ? <CheckCheck size={12} className="inline" /> : <Check size={12} className="inline" />}
                              {msg.isRead ? 'Đã xem' : 'Đã gửi'}
                            </span>
                          )}
                        </div>
                      </div>

                      {!isCustomer && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5 shadow-xs font-bold text-xs ${isAiBot ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' : 'bg-gradient-to-tr from-[#0084FF] to-blue-600'}`}>
                          {isAiBot ? <Bot size={14} /> : <Shield size={14} />}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Staff Quick Reply Templates */}
              {selectedTicket.status !== 'closed' && (
                <div className="px-3.5 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 min-w-0 w-full overflow-hidden">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1 shrink-0">
                      <Sparkles size={12} className="text-[#0084FF]" /> Mẫu phản hồi nhanh:
                    </span>
                    {STAFF_QUICK_REPLIES.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => setReplyMessage(q)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-[#0084FF] text-[11px] font-bold whitespace-nowrap transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 shrink-0"
                      >
                        {q.slice(0, 38)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messenger Staff Input Bar */}
              {selectedTicket.status !== 'closed' ? (
                <form onSubmit={handleReply} className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0 flex items-center gap-2 min-w-0 w-full">
                  <input
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-0 focus:ring-2 focus:ring-[#0084FF] rounded-2xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium transition-all min-w-0"
                    placeholder="Nhập phản hồi cho khách hàng..."
                  />
                  <button 
                    type="submit" 
                    disabled={!replyMessage.trim()} 
                    className="p-3 sm:px-5 bg-gradient-to-r from-[#0084FF] to-[#0066CC] hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-2 font-bold text-xs whitespace-nowrap"
                  >
                    <Send size={16} className="stroke-[2.5] shrink-0" />
                    <span className="hidden sm:inline">Gửi phản hồi</span>
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-800/50 shrink-0 min-w-0 w-full">
                  <p className="text-sm text-slate-500 font-bold flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Ticket này đã được đóng và giải quyết xong.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/40 rounded-full flex items-center justify-center mb-4 text-[#0084FF] border border-blue-100 dark:border-blue-900 shadow-inner">
                <Headphones className="w-10 h-10 animate-pulse" />
              </div>
              <h3 className="text-base font-black text-slate-700 dark:text-slate-200 mb-1">Cổng Hỗ Trợ & CSKH Trực Tuyến</h3>
              <p className="text-xs font-medium text-slate-500 max-w-sm">
                Chọn một yêu cầu hỗ trợ từ danh sách bên trái để bắt đầu trò chuyện trực tiếp và giải quyết thắc mắc cho khách hàng
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;
