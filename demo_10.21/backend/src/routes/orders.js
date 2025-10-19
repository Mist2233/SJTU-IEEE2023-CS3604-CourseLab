const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// 模拟数据库存储
const orders = new Map();
const ticketInventory = new Map();

// 初始化票务库存
const initializeInventory = () => {
  const trains = ['G1', 'G3', 'D101', 'K1157', 'G7'];
  const seatTypes = {
    'G1': [
      { type: '商务座', count: 5 }, { type: 'business', count: 5 },
      { type: '一等座', count: 20 }, { type: 'first', count: 20 },
      { type: '二等座', count: 50 }, { type: 'second', count: 50 }
    ],
    'G3': [
      { type: '商务座', count: 3 }, { type: 'business', count: 3 },
      { type: '一等座', count: 15 }, { type: 'first', count: 15 },
      { type: '二等座', count: 80 }, { type: 'second', count: 80 }
    ],
    'D101': [
      { type: '一等座', count: 25 }, { type: 'first', count: 25 },
      { type: '二等座', count: 120 }, { type: 'second', count: 120 }
    ],
    'K1157': [
      { type: '硬卧', count: 40 }, { type: 'hard_sleeper', count: 40 },
      { type: '软卧', count: 20 }, { type: 'soft_sleeper', count: 20 },
      { type: '硬座', count: 200 }, { type: 'hard_seat', count: 200 }
    ],
    'G7': [
      { type: '商务座', count: 8 }, { type: 'business', count: 8 },
      { type: '一等座', count: 30 }, { type: 'first', count: 30 },
      { type: '二等座', count: 100 }, { type: 'second', count: 100 }
    ]
  };

  trains.forEach(trainNumber => {
    seatTypes[trainNumber].forEach(seat => {
      const key = `${trainNumber}_${seat.type}`;
      ticketInventory.set(key, seat.count);
    });
  });
};

// 初始化库存
initializeInventory();

// JWT验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: '未授权' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret', (err, user) => {
    if (err) {
      return res.status(401).json({ 
        success: false, 
        message: '未授权' 
      });
    }
    req.user = user;
    next();
  });
};

// 验证身份证号格式
function isValidIdNumber(idNumber) {
  return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(idNumber);
}

// 验证手机号格式
function isValidPhoneNumber(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

// POST /api/orders
router.post('/', authenticateToken, (req, res) => {
  const { trainNumber, date, from, to, passengers } = req.body;
  const userId = req.user.userId;

  // 验证必填参数
  if (!trainNumber || !date || !from || !to || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: '订单信息不完整' 
    });
  }

  // 验证乘车人信息
  for (const passenger of passengers) {
    if (!passenger.name || !passenger.idNumber || !passenger.seatType) {
      return res.status(400).json({ 
        success: false, 
        message: '乘客信息不完整' 
      });
    }

    if (!isValidIdNumber(passenger.idNumber)) {
      return res.status(400).json({ 
        success: false, 
        message: '身份证号格式不正确' 
      });
    }
  }

  // 检查每个乘客的座位库存
  const seatRequests = {};
  for (const passenger of passengers) {
    const seatType = passenger.seatType;
    seatRequests[seatType] = (seatRequests[seatType] || 0) + 1;
  }

  // 验证库存
  for (const [seatType, count] of Object.entries(seatRequests)) {
    const inventoryKey = `${trainNumber}_${seatType}`;
    const availableSeats = ticketInventory.get(inventoryKey) || 0;
    
    if (availableSeats < count) {
      return res.status(400).json({ 
        success: false, 
        message: '余票不足' 
      });
    }
  }

  // 扣减库存
  for (const [seatType, count] of Object.entries(seatRequests)) {
    const inventoryKey = `${trainNumber}_${seatType}`;
    const availableSeats = ticketInventory.get(inventoryKey);
    ticketInventory.set(inventoryKey, availableSeats - count);
  }

  // 计算总金额
  const priceMap = {
    '商务座': 1748,
    '一等座': 933,
    '二等座': 553,
    '硬卧': 156,
    '软卧': 243,
    '硬座': 89,
    'business': 1748,
    'first': 933,
    'second': 553,
    'hard_sleeper': 156,
    'soft_sleeper': 243,
    'hard_seat': 89
  };
  
  let totalAmount = 0;
  for (const passenger of passengers) {
    totalAmount += priceMap[passenger.seatType] || 100;
  }

  // 创建订单
  const orderId = `ORDER${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  const paymentDeadline = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const order = {
    orderId,
    userId,
    trainNumber,
    date,
    from,
    to,
    passengers,
    totalAmount,
    status: 'PENDING_PAYMENT',
    paymentDeadline,
    createdAt: new Date().toISOString()
  };

  orders.set(orderId, order);

  res.status(201).json({
    success: true,
    data: {
      orderId,
      status: 'PENDING_PAYMENT',
      totalAmount,
      paymentDeadline
    }
  });
});

// GET /api/orders/:orderId
router.get('/:orderId', authenticateToken, (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.userId;

  const order = orders.get(orderId);

  if (!order) {
    return res.status(404).json({ 
      success: false, 
      message: '订单不存在' 
    });
  }

  // 检查订单是否属于当前用户
  if (order.userId !== userId) {
    return res.status(403).json({ 
      success: false, 
      message: '无权访问此订单' 
    });
  }

  const responseData = {
    orderId: order.orderId,
    status: order.status,
    trainInfo: {
      trainNumber: order.trainNumber,
      date: order.date,
      from: order.from,
      to: order.to
    },
    passengers: order.passengers,
    totalAmount: order.totalAmount,
    paymentDeadline: order.paymentDeadline,
    createdAt: order.createdAt
  };

  // 如果订单已支付，包含票务信息
  if (order.status === 'PAID' && order.ticketInfo) {
    responseData.ticketInfo = order.ticketInfo;
  }

  res.json({
    success: true,
    data: responseData
  });
});

// POST /api/orders/:orderId/cancel
router.post('/:orderId/cancel', authenticateToken, (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.userId;

  const order = orders.get(orderId);
  
  if (!order) {
    return res.status(404).json({ 
      success: false, 
      message: '订单不存在' 
    });
  }

  // 检查订单是否属于当前用户
  if (order.userId !== userId) {
    return res.status(403).json({ 
      success: false, 
      message: '无权访问此订单' 
    });
  }

  // 只有待支付状态的订单可以取消
  if (order.status !== 'PENDING_PAYMENT') {
    return res.status(400).json({ 
      success: false, 
      message: '订单状态不允许取消' 
    });
  }

  // 恢复库存
  const seatRequests = {};
  for (const passenger of order.passengers) {
    const seatType = passenger.seatType;
    seatRequests[seatType] = (seatRequests[seatType] || 0) + 1;
  }

  for (const [seatType, count] of Object.entries(seatRequests)) {
    const inventoryKey = `${order.trainNumber}_${seatType}`;
    const currentInventory = ticketInventory.get(inventoryKey) || 0;
    ticketInventory.set(inventoryKey, currentInventory + count);
  }

  // 更新订单状态
  order.status = 'CANCELLED';
  orders.set(orderId, order);

  res.json({ 
    success: true, 
    message: '订单取消成功' 
  });
});

// GET /api/orders/user/:userId
router.get('/user/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const { status, page = 1, pageSize = 10 } = req.query;

  // 检查用户权限
  if (req.user.userId !== userId) {
    return res.status(403).json({ 
      success: false, 
      message: '无权访问此用户的订单' 
    });
  }

  // 获取用户的所有订单
  let userOrders = Array.from(orders.values()).filter(order => order.userId === userId);

  // 按状态筛选
  if (status) {
    userOrders = userOrders.filter(order => order.status === status);
  }

  // 按创建时间倒序排列
  userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // 分页
  const pageNum = parseInt(page);
  const pageSizeNum = parseInt(pageSize);
  const startIndex = (pageNum - 1) * pageSizeNum;
  const endIndex = startIndex + pageSizeNum;
  const paginatedOrders = userOrders.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: {
      orders: paginatedOrders,
      pagination: {
        page: pageNum,
        pageSize: pageSizeNum,
        totalPages: Math.ceil(userOrders.length / pageSizeNum),
        totalOrders: userOrders.length,
        hasNextPage: endIndex < userOrders.length,
        hasPrevPage: pageNum > 1
      }
    }
  });
});

module.exports = router;
module.exports.orders = orders;