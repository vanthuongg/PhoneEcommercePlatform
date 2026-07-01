import React, { useState, useEffect, useRef } from 'react';
import { ticketAPI } from '../../services/api';
import { MessageSquare, Plus, Loader2, Send, CheckCircle, Search, Clock, Check, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const UserTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'order', priority: 'medium', message: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const chatEndRef = useRef(null);

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
  }, [selectedTicket?.messages]);

  const fetchTickets = async () => {
    try {
      const res = await ticketAPI.getMy();
      setTickets(res.data || []);
      // Auto-update selected ticket if open
      if (selectedTicket) {
        const updated = (res.data || []).find(t => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.message) {
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
      toast.success('Gửi yêu cầu hỗ trợ thành công');
    } catch (err) {
      toast.error(err.message || 'Lỗi gửi yêu cầu');
    }
  };

  const handleSelectTicket = async (ticket) => {
    setShowCreate(false);
    setSelectedTicket(ticket);
    
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
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      const res = await ticketAPI.reply(selectedTicket._id, replyMessage);
      setSelectedTicket(res.data);
      setTickets(tickets.map(t => t._id === res.data._id ? res.data : t));
      setReplyMessage('');
    } catch (err) {
      toast.error(err.message || 'Lỗi gửi phản hồi');
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.ticketCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="h-[700px] flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20 shrink-0">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare size={22} className="text-primary" /> Hỗ trợ khách hàng
          </h2>
          <p className="text-xs text-gray-500 mt-1">Gửi yêu cầu và theo dõi quá trình hỗ trợ</p>
        </div>
        <button onClick={() => { setShowCreate(true); setSelectedTicket(null); }} className="btn-primary flex items-center gap-2 py-2 px-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all">
          <Plus size={16} /> Tạo yêu cầu
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Ticket List */}
        <div className={`w-full md:w-[35%] border-r border-gray-100 dark:border-gray-800 flex flex-col ${showCreate || selectedTicket ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm mã hoặc tiêu đề..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-primary/20 dark:text-white"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MessageSquare className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-500">Chưa có yêu cầu nào</p>
              </div>
            ) : (
              filteredTickets.map(t => {
                const hasUnread = t.messages.some(m => m.senderRole !== 'customer' && !m.isRead);
                return (
                  <div 
                    key={t._id} 
                    onClick={() => handleSelectTicket(t)} 
                    className={`p-4 rounded-2xl cursor-pointer transition-all ${selectedTicket?._id === t._id && !showCreate ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <h4 className={`text-sm font-bold truncate pr-2 ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {t.subject}
                      </h4>
                      {hasUnread && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></span>}
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-mono">{t.ticketCode || `#${t._id.slice(-6).toUpperCase()}`}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${t.status === 'closed' ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' : t.status === 'in_progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {t.status === 'closed' ? 'Đã đóng' : t.status === 'in_progress' ? 'Đang xử lý' : 'Mới'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className={`flex-1 flex flex-col bg-gray-50/30 dark:bg-gray-900/50 ${!showCreate && !selectedTicket ? 'hidden md:flex' : 'flex'}`}>
          {showCreate ? (
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              <button onClick={() => setShowCreate(false)} className="md:hidden text-gray-500 hover:text-primary font-bold text-sm mb-4 flex items-center gap-1">
                &larr; Quay lại danh sách
              </button>
              <form onSubmit={handleCreate} className="max-w-2xl mx-auto space-y-5 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Tạo yêu cầu mới</h3>
                  <p className="text-sm text-gray-500 mb-6">Mô tả chi tiết vấn đề của bạn để chúng tôi hỗ trợ tốt nhất.</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Tiêu đề *</label>
                    <input value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} className="input-field bg-gray-50 dark:bg-gray-900" placeholder="Ví dụ: Lỗi thanh toán đơn hàng, Hàng bị hỏng..." />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Chủ đề</label>
                      <select value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})} className="input-field bg-gray-50 dark:bg-gray-900">
                        <option value="order">Đơn hàng & Vận chuyển</option>
                        <option value="product">Sản phẩm & Bảo hành</option>
                        <option value="payment">Thanh toán & Hoàn tiền</option>
                        <option value="other">Tài khoản & Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Mức độ ưu tiên</label>
                      <select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})} className="input-field bg-gray-50 dark:bg-gray-900">
                        <option value="low">Thấp</option>
                        <option value="medium">Bình thường</option>
                        <option value="high">Cao (Cần xử lý gấp)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Nội dung chi tiết *</label>
                    <textarea rows={5} value={newTicket.message} onChange={e => setNewTicket({...newTicket, message: e.target.value})} className="input-field bg-gray-50 dark:bg-gray-900 resize-none" placeholder="Cung cấp mã đơn hàng hoặc hình ảnh (nếu có) để quá trình xử lý nhanh hơn..." />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Hủy bỏ</button>
                  <button type="submit" className="btn-primary py-2.5 px-8 rounded-xl shadow-md hover:shadow-lg">Gửi yêu cầu</button>
                </div>
              </form>
            </div>
          ) : selectedTicket ? (
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 flex items-center gap-4 shrink-0">
                <button onClick={() => setSelectedTicket(null)} className="md:hidden text-gray-500 p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  &larr;
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white truncate">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-3 text-xs mt-1">
                    <span className="text-gray-500 font-mono">{selectedTicket.ticketCode || `#${selectedTicket._id.slice(-6).toUpperCase()}`}</span>
                    <span className={`flex items-center gap-1 ${selectedTicket.status === 'closed' ? 'text-gray-500' : selectedTicket.status === 'in_progress' ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {selectedTicket.status === 'closed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {selectedTicket.status === 'closed' ? 'Đã đóng' : selectedTicket.status === 'in_progress' ? 'Đang xử lý' : 'Mới'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
                {selectedTicket.messages.map((msg, i) => {
                  const isMe = msg.senderRole === 'customer';
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[75%]`}>
                        <span className="text-[11px] font-bold text-gray-500 mb-1 mx-1">
                          {isMe ? 'Bạn' : (msg.senderRole === 'admin' ? 'Quản trị viên' : 'Nhân viên hỗ trợ')}
                        </span>
                        <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${isMe ? 'bg-primary text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm'}`}>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5 px-1">
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {isMe && (
                            <span className={msg.isRead ? 'text-primary' : 'text-gray-300 dark:text-gray-600'}>
                              {msg.isRead ? <CheckCheck size={14} /> : <Check size={14} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              {selectedTicket.status !== 'closed' ? (
                <form onSubmit={handleReply} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shrink-0">
                  <div className="flex items-end gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <textarea 
                      value={replyMessage} 
                      onChange={e => setReplyMessage(e.target.value)} 
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReply(e);
                        }
                      }}
                      className="flex-1 bg-transparent border-none resize-none max-h-32 text-sm p-2 focus:ring-0 dark:text-white" 
                      placeholder="Nhập tin nhắn... (Enter để gửi)" 
                      rows={1}
                      style={{ height: '40px' }}
                    />
                    <button type="submit" disabled={!replyMessage.trim()} className="p-2.5 rounded-xl bg-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0 mb-0.5">
                      <Send size={18} className={replyMessage.trim() ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0 flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-900 px-6 py-2 rounded-full shadow-sm text-sm text-gray-500 font-medium flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" />
                    Yêu cầu này đã được giải quyết và đóng.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50 dark:bg-gray-900/50">
              <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
                <MessageSquare className="w-10 h-10 text-primary/40" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Sẵn sàng hỗ trợ bạn</h3>
              <p className="text-sm text-gray-500 max-w-sm mb-8">
                Chọn một yêu cầu bên trái để xem chi tiết hoặc tạo yêu cầu mới nếu bạn cần trợ giúp thêm.
              </p>
              <button onClick={() => setShowCreate(true)} className="btn-primary py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                <Plus size={18} /> Tạo yêu cầu hỗ trợ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserTickets;
