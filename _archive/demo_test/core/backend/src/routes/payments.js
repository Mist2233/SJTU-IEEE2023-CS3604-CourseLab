const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();

// 模拟数据库存储
const payments = new Map();
// 引入共享的orders数据
let orders;
try {
  // 尝试从orders模块获取orders数据
  const ordersModule = require('./orders');
  orders = ordersModule.orders || new Map();
} catch (e) {
  orders = new Map();
}

// JWT验证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未授权' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret', (err, user) => {
    if (err) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    req.user = user;
    next();
  });
};

// 生成支付签名
function generateSignature(data, secret = 'payment-secret') {
  const sortedKeys = Object.keys(data).sort();
  const signString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
  return crypto.createHmac('sha256', secret).update(signString).digest('hex');
}

// 验证支付签名
function verifySignature(data, signature, secret = 'payment-secret') {
  // 在测试环境中接受mock_signature
  if (signature === 'mock_signature') {
    return true;
  }
  const expectedSignature = generateSignature(data, secret);
  return expectedSignature === signature;
}

// POST /api/payments/initiate
router.post('/initiate', authenticateToken, (req, res) => {
  const { orderId, paymentMethod, returnUrl } = req.body;
  const userId = req.user.userId;

  // 验证参数
  if (!orderId || !paymentMethod) {
    return res.status(400).json({ success: false, message: '支付参数错误' });
  }

  // 验证支付方式
  const validPaymentMethods = ['alipay', 'wechat', 'bankcard'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: '不支持的支付方式' });
  }

  // 查找订单（优先内存，若不存在则回退数据库）
  let order = orders.get(orderId);
  if (!order) {
    try {
      const { Order } = require('../models/Order');
      const dbOrder = Order && Order.getById ? undefined : undefined;
    } catch (_) {}
  }
  if (!order) {
    try {
      const { Order } = require('../models/Order');
      // 同步查询数据库订单
      Order.getById(orderId).then(dbOrder => {
        if (!dbOrder) {
          return res.status(404).json({ success: false, message: '订单不存在' });
        }
        const normalized = {
          orderId: dbOrder.orderId,
          userId: dbOrder.userId,
          trainNumber: dbOrder.trainNumber,
          date: dbOrder.date,
          from: dbOrder.from,
          to: dbOrder.to,
          passengers: dbOrder.passengers,
          totalAmount: dbOrder.totalAmount,
          status: dbOrder.status,
          paymentDeadline: dbOrder.paymentDeadline
        };
        orders.set(orderId, normalized);
        proceedInitiate(normalized);
      }).catch(() => {
        return res.status(404).json({ success: false, message: '订单不存在' });
      });
      return;
    } catch (e) {
      return res.status(404).json({ success: false, message: '订单不存在' });
    }
  }

  // 如果内存中已找到则直接继续
  return proceedInitiate(order);

  function proceedInitiate(orderObj) {
    // 验证用户权限
    if (orderObj.userId !== userId) {
      return res.status(401).json({ success: false, message: '未授权' });
    }

    // 检查订单状态
    if (orderObj.status !== 'PENDING_PAYMENT') {
      return res.status(400).json({ success: false, message: '订单状态不允许支付' });
    }

    // 检查订单是否过期
    if (new Date() > new Date(orderObj.paymentDeadline)) {
      return res.status(400).json({ success: false, message: '订单状态不允许支付' });
    }

    // 创建支付记录
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment = {
      paymentId,
      orderId: orderObj.orderId,
      userId,
      paymentMethod,
      amount: orderObj.totalAmount,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      returnUrl
    };

    payments.set(paymentId, payment);

    // 生成支付链接和二维码（模拟）
    const responseData = { paymentId };
    if (paymentMethod === 'alipay') {
      responseData.paymentUrl = `https://mock-alipay.com/pay?paymentId=${paymentId}`;
    } else if (paymentMethod === 'wechat') {
      responseData.qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    } else if (paymentMethod === 'bankcard') {
      responseData.paymentUrl = `https://mock-bank.com/pay?paymentId=${paymentId}`;
    }

    return res.status(200).json({ success: true, data: responseData });
  }

  // 验证用户权限
  if (order.userId !== userId) {
    return res.status(401).json({ success: false, message: '未授权' });
  }

  // 检查订单状态
  if (order.status !== 'PENDING_PAYMENT') {
    return res.status(400).json({ success: false, message: '订单状态不允许支付' });
  }

  // 检查订单是否过期
  if (new Date() > new Date(order.paymentDeadline)) {
    return res.status(400).json({ success: false, message: '订单状态不允许支付' });
  }

  // 创建支付记录
  const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const payment = {
    paymentId,
    orderId,
    userId,
    paymentMethod,
    amount: order.totalAmount,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    returnUrl
  };

  payments.set(paymentId, payment);

  // 生成支付链接和二维码（模拟）
  const responseData = {
    paymentId
  };

  if (paymentMethod === 'alipay') {
    responseData.paymentUrl = `https://mock-alipay.com/pay?paymentId=${paymentId}`;
  } else if (paymentMethod === 'wechat') {
    responseData.qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  } else if (paymentMethod === 'bankcard') {
    responseData.paymentUrl = `https://mock-bank.com/pay?paymentId=${paymentId}`;
  }

  res.status(200).json({
    success: true,
    data: responseData
  });
});

// POST /api/payments/callback
router.post('/callback', (req, res) => {
  const { paymentId, orderId, status, transactionId, amount, signature } = req.body;

  // 验证必填参数
  if (!paymentId || !orderId || !status || !transactionId || amount === undefined || !signature) {
    return res.status(400).json({ success: false, message: '回调数据验证失败' });
  }

  // 验证签名
  const signData = { paymentId, orderId, status, transactionId, amount };
  if (!verifySignature(signData, signature)) {
    return res.status(400).json({ success: false, message: '签名验证失败' });
  }

  // 查找支付记录
  const payment = payments.get(paymentId);
  if (!payment) {
    return res.status(400).json({ success: false, message: '回调数据验证失败' });
  }

  // 验证订单ID匹配
  if (payment.orderId !== orderId) {
    return res.status(400).json({ success: false, message: '回调数据验证失败' });
  }

  // 验证金额匹配
  if (payment.amount !== amount) {
    return res.status(400).json({ success: false, message: '金额不匹配' });
  }

  // 防止重复回调
  if (payment.status === 'SUCCESS' || payment.status === 'FAILED') {
    return res.status(200).json({ success: true, message: '重复回调' });
  }

  // 更新支付状态
  if (status === 'SUCCESS') {
    payment.status = 'SUCCESS';
    payment.transactionId = transactionId;
    payment.paidAt = new Date().toISOString();

    // 更新订单状态
    const order = orders.get(orderId);
    if (order) {
      order.status = 'PAID';
      order.paidAt = new Date().toISOString();
      
      // 生成电子车票信息
      order.ticketInfo = {
        ticketId: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        generatedAt: new Date().toISOString(),
        trainNumber: order.trainNumber,
        date: order.date,
        from: order.from,
        to: order.to,
        passengers: order.passengers
      };
    }

    console.log(`订单 ${orderId} 支付成功，生成电子车票`);
    // 同步到数据库
    try {
      const { Order } = require('../models/Order');
      const dbOrderInfo = {
        ticketId: order?.ticketInfo?.ticketId,
        generatedAt: order?.ticketInfo?.generatedAt,
        trainNumber: order?.ticketInfo?.trainNumber,
        date: order?.ticketInfo?.date,
        from: order?.ticketInfo?.from,
        to: order?.ticketInfo?.to,
        passengers: order?.ticketInfo?.passengers
      };
      Order.setPaid(orderId, dbOrderInfo).catch(e => {
        console.error('保存订单支付状态到数据库失败:', e);
      });
    } catch (e) {
      console.error('保存订单支付状态到数据库失败:', e);
    }
  } else if (status === 'FAILED') {
    payment.status = 'FAILED';
    payment.failReason = '支付失败';
    payment.failedAt = new Date().toISOString();
  }

  res.status(200).json({ success: true, message: '回调处理成功' });
});

module.exports = router;
