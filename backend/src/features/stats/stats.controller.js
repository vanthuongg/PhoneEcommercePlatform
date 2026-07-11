const Order = require('../orders/order.model');
const Product = require('../products/product.model');
const User = require('../users/user.model');

// @desc    Get dashboard stats
// @route   GET /api/stats/dashboard
// @access  Manager, Admin
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalOrders,
      totalRevenue,
      totalUsers,
      totalProducts,
      monthlyRevenue,
      lastMonthRevenue,
      recentOrders,
      topProducts,
      ordersByStatus,
      cancelledOrdersCount,
      topCustomers,
      ordersByDay,
      revenueByCategory,
      revenueByBrand
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Order.find().populate('user', 'name email avatar').sort({ createdAt: -1 }).limit(6),
      Product.find({ isActive: true }).sort({ sold: -1 }).limit(5).populate('category', 'name'),
      Order.aggregate([{ $group: { _id: '$orderStatus', count: { $sum: 1 } } }]),
      Order.countDocuments({ orderStatus: 'cancelled' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: '$user', totalSpent: { $sum: '$totalAmount' }, ordersCount: { $sum: 1 } } },
        { $sort: { totalSpent: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
        { $unwind: '$userInfo' },
        { $project: { _id: 1, totalSpent: 1, ordersCount: 1, name: '$userInfo.name', email: '$userInfo.email', avatar: '$userInfo.avatar' } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod' } },
        { $unwind: '$prod' },
        { $lookup: { from: 'categories', localField: 'prod.category', foreignField: '_id', as: 'cat' } },
        { $unwind: '$cat' },
        { $group: { _id: '$cat.name', revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: '$items' },
        { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'prod' } },
        { $unwind: '$prod' },
        { $group: { _id: { $ifNull: ['$prod.brand', 'Khác'] }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
        { $sort: { revenue: -1 } }
      ])
    ]);

    const currentMonthRevenue = monthlyRevenue[0]?.total || 0;
    const prevMonthRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = prevMonthRevenue > 0
      ? (((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1)
      : 100;

    const returnRate = totalOrders > 0 ? ((cancelledOrdersCount / totalOrders) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          totalUsers,
          totalProducts,
          monthlyRevenue: currentMonthRevenue,
          revenueGrowth: Number(revenueGrowth),
          returnRate: Number(returnRate),
        },
        recentOrders,
        topProducts,
        topCustomers,
        ordersByDay: ordersByDay.map(d => ({ date: d._id, orders: d.orders, revenue: d.revenue })),
        revenueByCategory: revenueByCategory.map(c => ({ name: c._id, value: c.revenue })),
        revenueByBrand: revenueByBrand.map(b => ({ name: b._id, value: b.revenue })),
        ordersByStatus: ordersByStatus.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get revenue by month (last 12 months)
// @route   GET /api/stats/revenue
// @access  Manager, Admin
const getRevenueChart = async (req, res) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);

    const data = await Order.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo }, paymentStatus: 'paid' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const formattedData = data.map(item => ({
      name: `T${item._id.month}/${item._id.year}`,
      revenue: item.revenue,
      orders: item.orders
    }));

    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getRevenueChart };
