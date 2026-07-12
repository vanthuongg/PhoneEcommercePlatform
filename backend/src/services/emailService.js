// Dịch vụ gửi Email Automation giả lập (Simulation)
// Ghi log ra console hoặc hệ thống để minh họa tính năng hoạt động thực tế

const sendEmail = async ({ to, subject, template, data }) => {
  console.log('==================================================');
  console.log(`📧 [EMAIL AUTOMATION] Gửi tới: ${to}`);
  console.log(`📌 Chủ đề: ${subject}`);
  console.log(`📄 Template: ${template}`);
  console.log(`📦 Dữ liệu:`, JSON.stringify(data, null, 2));
  console.log('==================================================');
  return { success: true, messageId: `msg_${Date.now()}` };
};

exports.sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: '🎉 Chào mừng bạn đến với hệ thống TMĐT chuyên nghiệp!',
    template: 'WELCOME_REGISTER',
    data: { name: user.name, email: user.email, date: new Date().toLocaleDateString('vi-VN') },
  });
};

exports.sendOrderConfirmationEmail = async (user, order) => {
  return sendEmail({
    to: user.email,
    subject: `📦 Xác nhận đơn hàng #${order.orderCode} đặt thành công`,
    template: 'ORDER_CONFIRMATION',
    data: {
      orderCode: order.orderCode,
      totalAmount: order.totalAmount,
      itemsCount: order.items?.length || 0,
      paymentMethod: order.paymentMethod,
    },
  });
};

exports.sendShippingNotificationEmail = async (user, order) => {
  return sendEmail({
    to: user.email,
    subject: `🚚 Đơn hàng #${order.orderCode} đang được giao tới bạn!`,
    template: 'SHIPPING_NOTIFICATION',
    data: {
      orderCode: order.orderCode,
      shippingAddress: order.shippingAddress,
    },
  });
};

exports.sendPasswordResetEmail = async (email, resetToken) => {
  return sendEmail({
    to: email,
    subject: '🔐 Khôi phục mật khẩu tài khoản',
    template: 'FORGOT_PASSWORD',
    data: { resetLink: `http://localhost:5173/reset-password?token=${resetToken}` },
  });
};
