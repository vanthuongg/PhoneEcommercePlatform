const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id })
      .populate('user', 'name email')
      .populate('messages.sender', 'name email role')
      .sort({ updatedAt: -1 });
    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTicketsStaff = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const tickets = await SupportTicket.find(filter)
      .populate('user', 'name email')
      .populate('messages.sender', 'name email role')
      .sort({ updatedAt: -1 });
    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
    
    // Find an admin or staff user to act as the sender of the automated support response
    const supportAgent = await User.findOne({ role: { $in: ['admin', 'staff', 'manager'] } });
    const responderId = supportAgent ? supportAgent._id : req.user.id;

    const catNames = {
      order: 'Đơn hàng & Vận chuyển 📦',
      product: 'Sản phẩm & Bảo hành 🛠️',
      payment: 'Thanh toán & Hoàn tiền 💳',
      other: 'Tài khoản & Khác ⚙️'
    };
    const catLabel = catNames[category] || 'Hỗ trợ chung';

    const autoReplyText = `👋 **Xin chào bạn!** Cảm ơn bạn đã liên hệ với Bộ phận Hỗ trợ Khách hàng TechPhone.\n\n🛡️ Hệ thống đã tiếp nhận yêu cầu hỗ trợ về: **${catLabel}**.\n\n🤖 **[Trợ lý CSKH TechPhone]**: Đội ngũ chuyên viên tư vấn đang kiểm tra hồ sơ và sẽ phản hồi trực tiếp cho bạn tại khung chat này (thời gian xử lý trung bình từ 5 - 15 phút).\n\n💡 *Mẹo nhỏ*: Nhấn vào các **câu hỏi gợi ý** bên dưới để Trợ lý AI trả lời tức thì 24/7. Với các thắc mắc và tin nhắn khác, **nhân viên hệ thống** sẽ tiếp nhận và phản hồi trực tiếp cho bạn nhé! 😊`;
    
    const ticket = await SupportTicket.create({
      user: req.user.id,
      subject,
      category,
      priority,
      messages: [
        {
          sender: req.user.id,
          senderRole: req.user.role,
          message,
        },
        {
          sender: responderId,
          senderRole: 'staff',
          message: autoReplyText,
          isRead: false,
        }
      ],
    });
    await ticket.populate([{ path: 'user', select: 'name email' }, { path: 'messages.sender', select: 'name email role' }]);
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.replyTicket = async (req, res) => {
  try {
    const { message } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Không tìm thấy ticket' });

    ticket.messages.push({
      sender: req.user.id,
      senderRole: req.user.role,
      message,
    });

    if (req.user.role === 'staff' || req.user.role === 'admin' || req.user.role === 'manager') {
      ticket.status = 'in_progress';
    } else if (req.user.role === 'customer' && ticket.status !== 'closed') {
      // Smart Auto-Reply logic ONLY for Suggested Questions (Quick Question Chips)
      const supportAgent = await User.findOne({ role: { $in: ['admin', 'staff', 'manager'] } });
      const responderId = supportAgent ? supportAgent._id : req.user.id;
      const lowerMsg = message.trim().toLowerCase();

      let autoResponse = null;
      if (lowerMsg.includes('kiểm tra tiến độ') || lowerMsg.includes('tiến độ xử lý') || lowerMsg.includes('xử lý đơn hàng')) {
        autoResponse = `⚡ **[Trợ lý AI - Tiến độ đơn hàng]**: Hệ thống ghi nhận yêu cầu tra cứu tiến độ của bạn.\n\n📦 *Quy trình xử lý chuẩn*:\n1. **Xác nhận & Đóng gói**: 1-2 giờ làm việc.\n2. **Bàn giao vận chuyển**: Trong ngày.\n\n👉 Chuyên viên hệ thống đang kiểm tra trực tiếp mã đơn của bạn và sẽ cập nhật tình trạng chi tiết ngay bên dưới nhé!`;
      } else if (lowerMsg.includes('thời gian giao hàng') || lowerMsg.includes('giao hàng dự kiến') || lowerMsg.includes('dự kiến bao lâu') || lowerMsg.includes('ship bao lâu')) {
        autoResponse = `🚚 **[Trợ lý AI - Thời gian giao hàng]**: TechPhone áp dụng chính sách giao hàng siêu tốc:\n\n📍 **Nội thành TP.HCM / Hà Nội**: Giao nhanh trong **2 - 4 giờ** (hoặc giao trong ngày).\n📍 **Các tỉnh thành khác**: Thời gian chuẩn từ **2 - 3 ngày** làm việc.\n\n👉 Bạn có thể theo dõi chi tiết hành trình đơn hàng tại mục **Đơn hàng của tôi** hoặc đợi nhân viên hệ thống thông tin mã vận đơn tại đây nhé!`;
      } else if (lowerMsg.includes('thủ tục đổi trả') || lowerMsg.includes('đổi trả & bảo hành') || lowerMsg.includes('đổi trả và bảo hành') || lowerMsg.includes('hướng dẫn đổi trả')) {
        autoResponse = `🔄 **[Trợ lý AI - Bảo hành & Đổi trả]**: TechPhone cam kết quyền lợi tối đa cho khách hàng:\n\n🛡️ **Đổi mới 1 ĐỔI 1 trong 30 ngày đầu** nếu có lỗi từ nhà sản xuất.\n🛠️ **Bảo hành chính hãng đến 24 tháng** tại tất cả trung tâm bảo hành.\n\n👉 Bạn vui lòng mô tả chi tiết tình trạng máy hoặc gửi kèm ảnh/video lỗi, nhân viên kỹ thuật hệ thống sẽ tiếp nhận và làm thủ tục đổi trả ngay cho bạn!`;
      } else if (lowerMsg.includes('tình trạng hoàn tiền') || lowerMsg.includes('tra cứu tình trạng hoàn tiền') || lowerMsg.includes('hoàn tiền')) {
        autoResponse = `💳 **[Trợ lý AI - Tình trạng hoàn tiền]**: Các yêu cầu hoàn tiền tại TechPhone được tuân thủ theo quy trình an toàn:\n\n⏱️ **Thời gian xử lý**: Kế toán hệ thống sẽ kiểm tra và thực hiện lệnh hoàn tiền trong **1 - 3 ngày làm việc** (tùy thuộc vào ngân hàng / ví điện tử MoMo, VNPay, ZaloPay).\n\n👉 Chuyên viên tài chính đang tra cứu mã giao dịch của bạn và sẽ thông báo kết quả chuyển khoản ngay tại khung chat này!`;
      } else if (lowerMsg.includes('nhờ chuyên viên') || lowerMsg.includes('gọi điện tư vấn') || lowerMsg.includes('cskh gọi điện') || lowerMsg.includes('gọi lại cho tôi')) {
        autoResponse = `📞 **[Trợ lý AI - Kết nối cuộc gọi]**: Đã ghi nhận yêu cầu gọi điện hỗ trợ của bạn!\n\n☎️ **Hotline tổng đài 24/7**: **1900 1234** (Miễn phí cuộc gọi).\n\n👉 Yêu cầu của bạn đã được chuyển đến bộ phận trực tổng đài. Chuyên viên CSKH hệ thống sẽ gọi điện liên hệ lại cho bạn qua số điện thoại đăng ký tài khoản trong ít phút tới nhé!`;
      }
      // Note: For normal messages not matching suggested questions, autoResponse remains null.
      // This leaves the message for real system staff to read and reply!

      if (autoResponse) {
        ticket.messages.push({
          sender: responderId,
          senderRole: 'staff',
          message: autoResponse,
          isRead: false,
        });
      }
    }

    await ticket.save();
    await ticket.populate([{ path: 'user', select: 'name email' }, { path: 'messages.sender', select: 'name email role' }]);
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.closeTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true })
      .populate('user', 'name email')
      .populate('messages.sender', 'name email role');
    if (!ticket) return res.status(404).json({ success: false, message: 'Không tìm thấy ticket' });
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markTicketAsRead = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Không tìm thấy ticket' });

    let updated = false;
    ticket.messages.forEach(msg => {
      if (!msg.isRead) {
        if (req.user.role === 'customer' && msg.senderRole !== 'customer') {
          msg.isRead = true;
          updated = true;
        } else if (req.user.role !== 'customer' && msg.senderRole === 'customer') {
          msg.isRead = true;
          updated = true;
        }
      }
    });

    if (updated) {
      await ticket.save();
    }
    await ticket.populate([{ path: 'user', select: 'name email' }, { path: 'messages.sender', select: 'name email role' }]);
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
