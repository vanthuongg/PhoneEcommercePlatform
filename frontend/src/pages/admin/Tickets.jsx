import { useState, useEffect } from 'react';
import { ticketAPI } from '../../services/api';
import { Search, Filter, MessageSquare, Send, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTickets();
  }, [filter]);

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

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      const res = await ticketAPI.reply(selectedTicket._id, replyMessage);
      setSelectedTicket(res.data);
      setTickets(tickets.map(t => t._id === res.data._id ? res.data : t));
      setReplyMessage('');
      toast.success('Đã gửi phản hồi');
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
      toast.success('Đã đóng yêu cầu');
    } catch (err) {
      toast.error('Lỗi khi đóng yêu cầu');
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="mb-6 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hỗ trợ khách hàng (Tickets)</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Phản hồi và giải quyết thắc mắc của người dùng</p>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Ticket List */}
        <div className="w-1/3 flex flex-col card overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-3 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Tìm kiếm mã, email..." className="input-field pl-9" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {['all', 'open', 'in_progress', 'closed'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === status ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'}`}
                >
                  {status === 'all' ? 'Tất cả' : status === 'open' ? 'Mới' : status === 'in_progress' ? 'Đang xử lý' : 'Đã đóng'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : tickets.length === 0 ? (
              <p className="text-center text-sm text-gray-500 p-4">Không có yêu cầu nào</p>
            ) : (
              tickets.map(t => (
                <div
                  key={t._id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedTicket?._id === t._id ? 'bg-blue-50 dark:bg-blue-900/20 border-primary' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-blue-300'}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold truncate pr-2 text-gray-900 dark:text-gray-100">{t.subject}</h4>
                    <span className={`shrink-0 badge ${t.status === 'closed' ? 'badge-gray' : t.status === 'in_progress' ? 'badge-warning' : 'badge-success'}`}>
                      {t.status === 'closed' ? 'Đã đóng' : t.status === 'in_progress' ? 'Đang xử lý' : 'Mới'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{t.user?.name} - {t.user?.email}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-mono text-gray-400">#{t._id.slice(-6).toUpperCase()}</span>
                    <span className="text-[10px] text-gray-400">{new Date(t.updatedAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Detail & Chat */}
        <div className="w-2/3 card flex flex-col">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/30 shrink-0">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{selectedTicket.subject}</h3>
                  <p className="text-xs text-gray-500 mt-1">Khách hàng: {selectedTicket.user?.name} ({selectedTicket.user?.email})</p>
                </div>
                {selectedTicket.status !== 'closed' && (
                  <button onClick={handleCloseTicket} className="btn-secondary flex items-center gap-2 text-sm text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50">
                    <CheckCircle className="w-4 h-4" /> Đóng Ticket
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-gray-900/20">
                {selectedTicket.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.isStaff ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3.5 rounded-2xl text-sm ${msg.isStaff ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-sm'}`}>
                      {!msg.isStaff && <p className="text-[10px] font-bold text-gray-400 mb-1">{selectedTicket.user?.name}</p>}
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-2 ${msg.isStaff ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'closed' ? (
                <form onSubmit={handleReply} className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-3 bg-white dark:bg-gray-900 shrink-0">
                  <input
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Nhập câu trả lời..."
                  />
                  <button type="submit" disabled={!replyMessage.trim()} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                    <Send className="w-4 h-4" /> Gửi
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center bg-gray-50 dark:bg-gray-800/50 shrink-0">
                  <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Ticket này đã được đóng và giải quyết.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" />
              <p>Chọn một yêu cầu hỗ trợ để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tickets;
