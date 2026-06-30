const AuditLog = require('../models/AuditLog');

exports.getAuditLogs = async (req, res) => {
  try {
    const { action, targetEntity } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (targetEntity) filter.targetEntity = targetEntity;

    const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAuditLog = async ({ user, action, targetEntity, targetId, details }) => {
  try {
    if (!user) return;
    await AuditLog.create({
      user: user._id || user.id,
      userName: user.name || 'Admin',
      userRole: user.role || 'admin',
      action,
      targetEntity,
      targetId: targetId.toString(),
      details,
    });
  } catch (err) {
    console.error('Lỗi khi ghi AuditLog:', err.message);
  }
};
