import React, { useState, useEffect } from 'react';
import { ticketAPI } from '../../services/api';
import { MessageSquare, Plus, Loader2, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const UserTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', issueType: 'order', priority: 'normal', message: '' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await ticketAPI.getMy();
      setTickets(res.data || []);
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
      setTickets([res.data, ...tickets]);
      setShowCreate(false);
      setNewTicket({ subject: '', issueType: 'order', priority: 'normal', message: '' });
      toast.success('Gửi yêu cầu hỗ trợ thành công');
    } catch (err) {
      toast.error(err.message || 'Lỗi gửi yêu cầu');
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

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare size={20} className="text-primary" /> Hỗ trợ khách hàng
          </h2>
          <p className="text-xs text-gray-500 mt-1">Gửi yêu cầu hỗ trợ và theo dõi quá trình giải quyết</p>
        </div>
        {!showCreate && !selectedTicket && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 py-2 text-xs">
            <Plus size={16} /> Tạo yêu cầu mới
          </button>
        )}
      </div>

      {showCreate ? (
        <form onSubmit={handleCreate} className="space-y-4 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Tạo yêu cầu mới</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Tiêu đề *</label>
              <input value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} className="input-field" placeholder="Ví dụ: Lỗi thanh toán đơn hàng..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Loại vấn đề</label>
              <select value={newTicket.issueType} onChange={e => setNewTicket({...newTicket, issueType: e.target.value})} className="input-field">
                <option value="order">Đơn hàng & Thanh toán</option>
                <option value="product">Sản phẩm & Bảo hành</option>
                <option value="account">Tài khoản & Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Mức độ ưu tiên</label>
              <select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})} className="input-field">
                <option value="normal">Bình thường</option>
                <option value="high">Cao (Cần gấp)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Nội dung chi tiết *</label>
              <textarea rows={4} value={newTicket.message} onChange={e => setNewTicket({...newTicket, message: e.target.value})} className="input-field resize-none" placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary py-2">Hủy</button>
            <button type="submit" className="btn-primary py-2 px-6">Gửi yêu cầu</button>
          </div>
        </form>
      ) : selectedTicket ? (
        <div className="space-y-4 flex flex-col h-[500px]">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
            <button onClick={() => setSelectedTicket(null)} className="text-gray-500 hover:text-primary font-bold text-sm">
              &larr; Quay lại
            </button>
            <h3 className="font-bold text-gray-900 dark:text-white flex-1 truncate">{selectedTicket.subject}</h3>
            <span className={`badge ${selectedTicket.status === 'closed' ? 'badge-gray' : 'badge-success'}`}>
              {selectedTicket.status === 'closed' ? 'Đã đóng' : selectedTicket.status === 'in_progress' ? 'Đang xử lý' : 'Chờ xử lý'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-700">
            {selectedTicket.messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.isStaff ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.isStaff ? 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200' : 'bg-primary text-white'}`}>
                  {msg.isStaff && <p className="text-[10px] font-bold text-gray-400 mb-1">Nhân viên hỗ trợ</p>}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.isStaff ? 'text-gray-400' : 'text-blue-100'}`}>
                    {new Date(msg.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {selectedTicket.status !== 'closed' && (
            <form onSubmit={handleReply} className="flex gap-2">
              <input value={replyMessage} onChange={e => setReplyMessage(e.target.value)} className="input-field flex-1" placeholder="Nhập tin nhắn phản hồi..." />
              <button type="submit" disabled={!replyMessage.trim()} className="btn-primary p-3 rounded-xl disabled:opacity-50">
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="font-bold text-gray-600 dark:text-gray-400">Bạn chưa có yêu cầu hỗ trợ nào</p>
            </div>
          ) : (
            tickets.map(t => (
              <div key={t._id} onClick={() => setSelectedTicket(t)} className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary cursor-pointer transition-colors flex justify-between items-center group">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{t.subject}</h4>
                  <p className="text-xs text-gray-500 mt-1">Cập nhật lần cuối: {new Date(t.updatedAt).toLocaleString('vi-VN')}</p>
                </div>
                <span className={`badge ${t.status === 'closed' ? 'badge-gray' : t.status === 'in_progress' ? 'badge-warning' : 'badge-success'}`}>
                  {t.status === 'closed' ? 'Đã đóng' : t.status === 'in_progress' ? 'Đang xử lý' : 'Mới'}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserTickets;
