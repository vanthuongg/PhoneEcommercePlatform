const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, required: true },
  message: { type: String, required: true },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

const supportTicketSchema = new mongoose.Schema(
  {
    ticketCode: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    category: { type: String, enum: ['order', 'product', 'payment', 'other'], default: 'order' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
    messages: [ticketMessageSchema],
  },
  { timestamps: true }
);

supportTicketSchema.pre('save', function (next) {
  if (!this.ticketCode) {
    this.ticketCode = 'TKT' + Date.now().toString().slice(-6);
  }
  next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
