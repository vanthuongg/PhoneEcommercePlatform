const SupportTicket = require('../models/SupportTicket');

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user.id }).sort({ updatedAt: -1 });
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
    const tickets = await SupportTicket.find(filter).populate('user', 'name email').sort({ updatedAt: -1 });
    res.json({ success: true, count: tickets.length, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
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
      ],
    });
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
    if (req.user.role === 'staff' || req.user.role === 'admin') {
      ticket.status = 'in_progress';
    }
    await ticket.save();
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.closeTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status: 'closed' }, { new: true });
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
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
