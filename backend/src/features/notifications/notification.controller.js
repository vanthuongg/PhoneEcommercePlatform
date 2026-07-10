const Notification = require('./notification.model');

exports.getNotifications = async (req, res) => {
  try {
    const userRole = req.user ? req.user.role : 'all';
    const userId = req.user ? req.user.id : null;

    const query = {
      $or: [
        { user: userId },
        { user: null, role: { $in: [userRole, 'all'] } },
        { user: { $exists: false }, role: { $in: [userRole, 'all'] } }
      ],
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    const data = notifications.map(n => {
      const notif = n.toObject();
      notif.id = notif._id;
      notif.isRead = userId && notif.readBy ? notif.readBy.some(id => id.toString() === userId) : false;
      notif.time = notif.createdAt; 
      return notif;
    });

    res.json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.findByIdAndUpdate(req.params.id, { $addToSet: { readBy: userId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userRole = req.user ? req.user.role : 'all';
    const userId = req.user ? req.user.id : null;

    const query = {
      $or: [
        { user: userId },
        { user: null, role: { $in: [userRole, 'all'] } },
        { user: { $exists: false }, role: { $in: [userRole, 'all'] } }
      ],
    };

    await Notification.updateMany(query, { $addToSet: { readBy: userId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const notif = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notif });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
