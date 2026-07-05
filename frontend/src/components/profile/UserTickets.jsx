import React, { useState, useEffect, useRef } from 'react';
import { ticketAPI } from '../../services/api';
import { 
  MessageSquare, Plus, Loader2, Send, CheckCircle, Search, Clock, Check, CheckCheck, 
  Headphones, PhoneCall, Smile, ThumbsUp, Shield, ArrowLeft, Filter, Sparkles, User, Bot, AlertCircle, X, Paperclip
} from 'lucide-react';
import toast from 'react-hot-toast';

const QUICK_QUESTIONS = [
  '⚡ Kiểm tra tiến độ xử lý đơn hàng',
  '🚚 Thời gian giao hàng dự kiến bao lâu?',
  '🔄 Hướng dẫn thủ tục đổi trả & bảo hành',
  '💳 Tra cứu tình trạng hoàn tiền',
  '📞 Nhờ chuyên viên CSKH gọi điện tư vấn'
];

const EMOJI_LIST = ['😊', '👍', '❤️', '🎉', '🔥', '✨', '🚀', '😢', '🤝', '💯', '🙏', '📦', '🛠️', '🚚', '💡'];

const UserTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'order', priority: 'medium', message: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (chatEndRef.current && chatEndRef.current.parentElement) {
      chatEndRef.current.parentElement.scrollTo({
        top: chatEndRef.current.parentElement.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [selectedTicket?.messages, isTyping]);

  const fetchTickets = async () => {
    try {
      const res = await ticketAPI.getMy();
      setTickets(res.data || []);
      if (selectedTicket) {
        const updated = (res.data || []).find(t => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách yêu cầu hỗ trợ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }
    try {
      const res = await ticketAPI.create(newTicket);
      const newTickets = [res.data, ...tickets];
      setTickets(newTickets);
      setShowCreate(false);
      setNewTicket({ subject: '', category: 'order', priority: 'medium', message: '' });
      handleSelectTicket(res.data);
      toast.success('🎉 Gửi yêu cầu hỗ trợ thành công!');
    } catch (err) {
      toast.error(err.message || 'Lỗi gửi yêu cầu');
    }
  };

  const handleSelectTicket = async (ticket) => {
    setShowCreate(false);
    setSelectedTicket(ticket);
    setShowEmojiPicker(false);
    
    // Mark as read
    const hasUnread = ticket.messages.some(m => m.senderRole !== 'customer' && !m.isRead);
    if (hasUnread) {
      try {
        const res = await ticketAPI.markAsRead(ticket._id);
        setSelectedTicket(res.data);
        setTickets(prev => prev.map(t => t._id === ticket._id ? res.data : t));
      } catch (error) {
        console.error("Failed to mark as read", error);
      }
    }
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleReply = async (e, customMsg = null) => {
    if (e) e.preventDefault();
    const textToSend = customMsg !== null ? customMsg : replyMessage;
    if (!textToSend.trim() || !selectedTicket) return;

    // Optimistic UI update
    const tempUserMsg = {
      senderRole: 'customer',
      message: textToSend,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    setSelectedTicket(prev => ({
      ...prev,
      messages: [...(prev.messages || []), tempUserMsg]
    }));
    if (customMsg === null) setReplyMessage('');
    setShowEmojiPicker(false);

    // Check if the message is one of the suggested questions
    const isSuggestedQuestion = customMsg !== null || QUICK_QUESTIONS.some(q => textToSend.toLowerCase().includes(q.toLowerCase().slice(2, 12)));
    if (isSuggestedQuestion) {
      setIsTyping(true);
    }

    try {
      if (isSuggestedQuestion) {
        // Simulate Messenger typing delay for realistic AI response to suggested questions
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      const res = await ticketAPI.reply(selectedTicket._id, textToSend);
      
      setSelectedTicket(res.data);
      setTickets(prev => prev.map(t => t._id === res.data._id ? res.data : t));
    } catch (err) {
      toast.error(err.message || 'Lỗi gửi phản hồi');
      fetchTickets(); // Revert optimistic update on error
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddEmoji = (emoji) => {
    setReplyMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.ticketCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#0084FF]" />
      <p className="text-xs font-semibold text-slate-500 animate-pulse">Đang kết nối Trung tâm CSKH TechPhone...</p>
    </div>
  );

  return (
    <div className="h-[740px] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-2xl relative w-full min-w-0">
      {/* Top Banner Header */}
      <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-[#0084FF] via-[#0066CC] to-indigo-700 text-white flex items-center justify-between gap-3 shrink-0 shadow-md w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative shrink-0">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Headphones className="w-6 h-6 text-white animate-bounce-subtle" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-[#0084FF] rounded-full animate-pulse" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <h2 className="text-base sm:text-lg font-black tracking-tight truncate">Trung Tâm Hỗ Trợ & Messenger CSKH</h2>
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm shrink-0">24/7 Live Support</span>
            </div>
            <p className="text-xs text-blue-100 font-medium opacity-90 truncate">Kết nối trực tiếp với Đội ngũ tư vấn & Trợ lý AI TechPhone</p>
          </div>
        </div>
        
        <button 
          onClick={() => { setShowCreate(true); setSelectedTicket(null); }} 
          className="px-3.5 sm:px-4 py-2.5 bg-white text-[#0084FF] hover:bg-blue-50 font-black text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
        >
          <Plus size={16} className="stroke-[3] shrink-0" />
          <span>Tạo Yêu Cầu Mới</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden min-w-0 w-full">
        {/* Left Sidebar - Conversation List */}
        <div className={`w-full md:w-[35%] border-r border-slate-200/80 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-900/50 min-w-0 shrink-0 ${showCreate || selectedTicket ? 'hidden md:flex' : 'flex'}`}>
          {/* Search and Filters */}
          <div className="p-4 border-b border-slate-200/60 dark:border-slate-800 space-y-3 shrink-0 bg-white dark:bg-slate-900">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Tìm mã #TKT hoặc tiêu đề..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-2.5 pl-10 pr-4 text-xs font-semibold focus:ring-2 focus:ring-[#0084FF]/30 dark:text-white placeholder-slate-400 outline-none transition-all"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {[
                { key: 'all', label: 'Tất cả' },
                { key: 'open', label: 'Mới' },
                { key: 'in_progress', label: 'Đang xử lý' },
                { key: 'closed', label: 'Đã đóng' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold whitespace-nowrap transition-all ${
                    statusFilter === tab.key
                      ? 'bg-[#0084FF] text-white shadow-sm scale-[1.02]'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3">
                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <MessageSquare size={24} />
                </div>
                <p className="text-xs font-bold text-slate-500">Không tìm thấy cuộc trò chuyện nào</p>
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="text-xs text-[#0084FF] font-bold hover:underline">
                    Xóa bộ lọc tìm kiếm
                  </button>
                )}
              </div>
            ) : (
              filteredTickets.map(t => {
                const hasUnread = t.messages.some(m => m.senderRole !== 'customer' && !m.isRead);
                const lastMsg = t.messages?.[t.messages.length - 1];
                const isSelected = selectedTicket?._id === t._id && !showCreate;

                return (
                  <div 
                    key={t._id} 
                    onClick={() => handleSelectTicket(t)} 
                    className={`p-3.5 rounded-2xl cursor-pointer transition-all relative border ${
                      isSelected 
                        ? 'bg-blue-50/80 dark:bg-blue-900/20 border-[#0084FF] shadow-sm' 
                        : 'bg-white dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 hover:border-blue-300 dark:hover:border-slate-700 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar with Online dot */}
                      <div className="relative shrink-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white text-xs shadow-sm ${
                          t.status === 'closed' ? 'bg-slate-400' : 'bg-gradient-to-br from-[#0084FF] to-indigo-600'
                        }`}>
                          <Headphones size={20} />
                        </div>
                        {t.status !== 'closed' && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className={`text-xs font-black truncate pr-1 ${hasUnread ? 'text-slate-900 dark:text-white font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}>
                            {t.subject}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium shrink-0">
                            {new Date(t.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className={`text-[11px] truncate mb-2 ${hasUnread ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                          {lastMsg ? (lastMsg.senderRole === 'customer' ? `Bạn: ${lastMsg.message}` : `CSKH: ${lastMsg.message}`) : 'Chưa có tin nhắn'}
                        </p>

                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-mono font-bold text-slate-400">{t.ticketCode || `#${t._id.slice(-6).toUpperCase()}`}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full font-extrabold ${
                              t.status === 'closed' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' :
                              t.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            }`}>
                              {t.status === 'closed' ? 'Đã đóng' : t.status === 'in_progress' ? 'Đang xử lý' : 'Mới'}
                            </span>
                            {hasUnread && (
                              <span className="w-2 h-2 rounded-full bg-[#0084FF] animate-pulse" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content Area - Messenger View / Create Form */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/80 min-w-0 w-full overflow-hidden ${!showCreate && !selectedTicket ? 'hidden md:flex' : 'flex'}`}>
          {showCreate ? (
            /* CREATE NEW TICKET FORM */
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-white dark:bg-slate-900">
              <button onClick={() => setShowCreate(false)} className="md:hidden text-slate-500 hover:text-[#0084FF] font-bold text-xs mb-5 flex items-center gap-1.5">
                <ArrowLeft size={16} /> Quay lại danh sách tin nhắn
              </button>

              <form onSubmit={handleCreate} className="max-w-xl mx-auto space-y-6 p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 shadow-premium">
                <div className="text-center pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#0084FF] to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-md">
                    <Sparkles size={26} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Tạo Yêu Cầu Hỗ Trợ Mới</h3>
                  <p className="text-xs text-slate-500 mt-1">Gửi thắc mắc hoặc báo lỗi để được hỗ trợ trực tiếp từ CSKH</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Tiêu đề vấn đề *</label>
                    <input 
                      value={newTicket.subject} 
                      onChange={e => setNewTicket({...newTicket, subject: e.target.value})} 
                      className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#0084FF] outline-none text-sm font-semibold text-slate-900 dark:text-white shadow-xs" 
                      placeholder="Ví dụ: Lỗi thanh toán VNPay, Hỏi thời gian bảo hành..." 
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Chủ đề hỗ trợ</label>
                      <select 
                        value={newTicket.category} 
                        onChange={e => setNewTicket({...newTicket, category: e.target.value})} 
                        className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#0084FF] outline-none text-xs font-extrabold text-slate-800 dark:text-white shadow-xs"
                      >
                        <option value="order">📦 Đơn hàng & Vận chuyển</option>
                        <option value="product">🛠️ Sản phẩm & Bảo hành</option>
                        <option value="payment">💳 Thanh toán & Hoàn tiền</option>
                        <option value="other">⚙️ Tài khoản & Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Mức độ ưu tiên</label>
                      <select 
                        value={newTicket.priority} 
                        onChange={e => setNewTicket({...newTicket, priority: e.target.value})} 
                        className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#0084FF] outline-none text-xs font-extrabold text-slate-800 dark:text-white shadow-xs"
                      >
                        <option value="low">🟢 Thấp (Tư vấn chung)</option>
                        <option value="medium">🟡 Bình thường (Đơn hàng/Bảo hành)</option>
                        <option value="high">🔴 Cao (Cần xử lý gấp/Lỗi thanh toán)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">Nội dung chi tiết *</label>
                    <textarea 
                      rows={5} 
                      value={newTicket.message} 
                      onChange={e => setNewTicket({...newTicket, message: e.target.value})} 
                      className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-[#0084FF] outline-none text-sm font-medium text-slate-900 dark:text-white shadow-xs resize-none" 
                      placeholder="Cung cấp mã đơn hàng, hình ảnh hoặc mô tả chi tiết lỗi để chuyên viên CSKH hỗ trợ bạn chính xác nhất..." 
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-3 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors">
                    Hủy bỏ
                  </button>
                  <button type="submit" className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#0084FF] to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95">
                    <Send size={15} /> Gửi Yêu Cầu Hỗ Trợ
                  </button>
                </div>
              </form>
            </div>
          ) : selectedTicket ? (
            /* MESSENGER LIVE CHAT VIEW */
            <div className="flex flex-col h-full bg-white dark:bg-slate-900 min-w-0 w-full overflow-hidden">
              {/* Chat Header (Messenger Style) */}
              <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 shrink-0 shadow-xs min-w-0 w-full">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button onClick={() => setSelectedTicket(null)} className="md:hidden text-slate-500 p-1.5 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
                    <ArrowLeft size={18} />
                  </button>

                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0084FF] via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                      <Headphones size={18} />
                    </div>
                    {selectedTicket.status !== 'closed' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{selectedTicket.subject}</h3>
                      <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">#{selectedTicket.ticketCode || selectedTicket._id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        CSKH TechPhone 24/7
                      </span>
                      <span>•</span>
                      <span className="capitalize truncate">{selectedTicket.category === 'order' ? 'Đơn hàng' : selectedTicket.category === 'product' ? 'Bảo hành' : 'Thanh toán'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => toast('📞 Hotline hỗ trợ CSKH: 1900 1234 (Miễn phí 24/7)', { icon: '☎️' })}
                    className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0084FF] transition-colors"
                    title="Gọi Hotline CSKH"
                  >
                    <PhoneCall size={18} />
                  </button>
                  {selectedTicket.status !== 'closed' && (
                    <span className="px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-black border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                      Đang mở
                    </span>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-2.5 custom-scrollbar bg-slate-50/60 dark:bg-slate-950/40 min-w-0 w-full overflow-x-hidden">
                {selectedTicket.messages?.map((msg, i) => {
                  const isMe = msg.senderRole === 'customer';
                  const isAiBot = !isMe && (
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
                    <div key={i} className={`flex items-end gap-2 min-w-0 w-full ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      {!isMe && (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 mb-0.5 shadow-xs ${isAiBot ? 'bg-gradient-to-tr from-purple-600 to-indigo-600' : 'bg-gradient-to-tr from-[#0084FF] to-blue-600'}`}>
                          {isAiBot ? <Bot size={14} /> : <Shield size={14} />}
                        </div>
                      )}

                      <div className={`flex flex-col min-w-0 max-w-[85%] sm:max-w-[65%] md:max-w-[55%] lg:max-w-[48%] ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && (
                          <div className="flex items-center gap-1 mb-0.5 ml-1">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate max-w-full">
                              {isAiBot ? '🤖 Trợ lý AI TechPhone' : `👨‍💻 ${msg.sender?.name || 'Chuyên viên CSKH'}`}
                            </span>
                            {isAiBot ? (
                              <span className="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 text-[9px] font-extrabold border border-purple-200 dark:border-purple-800">
                                AI Bot
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold border border-blue-200 dark:border-blue-800">
                                {msg.senderRole === 'admin' ? 'Admin' : msg.senderRole === 'manager' ? 'Quản lý' : 'CSKH'}
                              </span>
                            )}
                          </div>
                        )}

                        <div className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl text-[13px] sm:text-sm leading-snug shadow-xs min-w-0 max-w-full break-words ${
                          isMe 
                            ? 'bg-gradient-to-r from-[#0084FF] to-[#0099FF] text-white rounded-br-xs font-medium' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70 rounded-bl-xs font-normal'
                        }`}>
                          <p className="whitespace-pre-wrap break-words max-w-full overflow-hidden">{msg.message}</p>
                        </div>

                        <div className="flex items-center gap-1 mt-0.5 px-1">
                          <span className="text-[9px] text-slate-400 font-medium">
                            {new Date(msg.createdAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && (
                            <span className="text-[#0084FF] font-bold text-[10px] flex items-center gap-0.5" title="Đã nhận">
                              <CheckCheck size={12} className="inline" /> Đã gửi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-end gap-2 justify-start animate-fade-in">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0084FF] to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                      <Bot size={14} />
                    </div>
                    <div className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Question Chips */}
              {selectedTicket.status !== 'closed' && !isTyping && (
                <div className="px-3.5 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 min-w-0 w-full overflow-hidden">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap mr-1 flex items-center gap-1 shrink-0">
                      <Sparkles size={12} className="text-[#0084FF]" /> Gợi ý hỏi:
                    </span>
                    {QUICK_QUESTIONS.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleReply(null, q)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-[#0084FF] text-[11px] font-bold whitespace-nowrap transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 shrink-0"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messenger Input Bar */}
              {selectedTicket.status !== 'closed' ? (
                <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0 relative min-w-0 w-full">
                  {/* Emoji Picker Popover */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-16 left-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-3 flex flex-wrap gap-2 w-64 z-50 animate-scale-in">
                      {EMOJI_LIST.map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddEmoji(emoji)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-lg transition-transform hover:scale-125"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleReply} className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-slate-500 hover:text-[#0084FF] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        title="Chèn biểu tượng cảm xúc"
                      >
                        <Smile size={20} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('Tính năng gửi tệp/ảnh đang được tối ưu, vui lòng gửi link ảnh hoặc mô tả lỗi nhé!', { icon: '📎' })}
                        className="p-2 text-slate-500 hover:text-[#0084FF] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                        title="Đính kèm tệp/hình ảnh"
                      >
                        <Paperclip size={20} />
                      </button>
                    </div>

                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 flex items-center border border-transparent focus-within:border-[#0084FF]/50 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-inner">
                      <input 
                        ref={inputRef}
                        type="text"
                        value={replyMessage} 
                        onChange={e => setReplyMessage(e.target.value)} 
                        className="w-full bg-transparent border-none text-sm focus:outline-none text-slate-900 dark:text-white placeholder-slate-400" 
                        placeholder="Nhập tin nhắn hỗ trợ (như Messenger)..." 
                      />
                    </div>

                    {replyMessage.trim() ? (
                      <button 
                        type="submit" 
                        className="w-10 h-10 rounded-full bg-[#0084FF] hover:bg-blue-600 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:scale-105 active:scale-95 shrink-0"
                        title="Gửi tin nhắn"
                      >
                        <Send size={18} className="translate-x-0.5" />
                      </button>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => handleReply(null, '👍')}
                        className="w-10 h-10 rounded-full text-[#0084FF] hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 shrink-0"
                        title="Gửi Thích (👍)"
                      >
                        <ThumbsUp size={22} className="fill-[#0084FF]" />
                      </button>
                    )}
                  </form>
                </div>
              ) : (
                <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shrink-0 flex items-center justify-center">
                  <div className="bg-white dark:bg-slate-800 px-6 py-2.5 rounded-full shadow-sm text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2 border border-slate-200/60 dark:border-slate-700">
                    <CheckCircle size={16} className="text-emerald-500" />
                    Yêu cầu này đã được hoàn tất xử lý và đóng.
                    <button onClick={() => { setShowCreate(true); setSelectedTicket(null); }} className="text-[#0084FF] hover:underline font-black ml-1">
                      Tạo yêu cầu mới
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/50">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-3xl flex items-center justify-center shadow-inner border border-blue-200/50 dark:border-blue-800/50">
                  <Headphones className="w-12 h-12 text-[#0084FF] animate-bounce-subtle" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md">✓</span>
              </div>
              
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Xin chào! Chúng tôi có thể giúp gì cho bạn?</h3>
              <p className="text-xs font-medium text-slate-500 max-w-md mb-8 leading-relaxed">
                Chọn một cuộc trò chuyện từ danh sách bên trái hoặc nhấn nút bên dưới để tạo yêu cầu tư vấn, giải quyết khiếu nại hay tra cứu đơn hàng cùng Đội ngũ CSKH TechPhone.
              </p>
              
              <button 
                onClick={() => setShowCreate(true)} 
                className="px-8 py-3.5 bg-gradient-to-r from-[#0084FF] to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-2.5 hover:scale-105 active:scale-95"
              >
                <Plus size={18} className="stroke-[3]" />
                <span>Bắt Đầu Trò Chuyện & Hỗ Trợ Ngay</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTickets;
