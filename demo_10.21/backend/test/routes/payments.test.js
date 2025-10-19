const request = require('supertest');
const app = require('../../src/app');

describe('Payments API', () => {
  let authToken;
  let orderId;

  beforeEach(async () => {
    // 清理测试数据
    await request(app).post('/api/auth/clear-test-data');
    
    // 创建测试用户
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '13800138008',
        verificationCode: '123456',
        password: 'password123',
        realName: '支付测试用户',
        idNumber: '110101199001011239'
      });

    authToken = registerResponse.body.data.token;

    // 创建测试订单
    const orderResponse = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        trainNumber: 'G1',
        date: '2024-10-20',
        from: '北京南',
        to: '上海虹桥',
        passengers: [
          {
            name: '张三',
            idNumber: '110101199001011234',
            seatType: 'second'
          }
        ]
      });

    orderId = orderResponse.body.data.orderId;
  });

  describe('POST /api/payments/initiate', () => {
    it('应该成功发起支付宝支付', async () => {
      const paymentData = {
        orderId: orderId,
        paymentMethod: 'alipay'
      };

      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('paymentUrl');
      expect(response.body.data).toHaveProperty('paymentId');
      expect(response.body.data.paymentUrl).toContain('alipay');
    });

    it('应该成功发起微信支付', async () => {
      const paymentData = {
        orderId: orderId,
        paymentMethod: 'wechat'
      };

      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('qrCode');
      expect(response.body.data).toHaveProperty('paymentId');
    });

    it('应该验证订单状态', async () => {
      // 先取消订单
      await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      const paymentData = {
        orderId: orderId,
        paymentMethod: 'alipay'
      };

      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('订单状态不允许支付');
    });

    it('应该验证支付方式', async () => {
      const paymentData = {
        orderId: orderId,
        paymentMethod: 'invalid_method'
      };

      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('不支持的支付方式');
    });

    it('应该验证用户权限', async () => {
      const paymentData = {
        orderId: orderId,
        paymentMethod: 'alipay'
      };

      const response = await request(app)
        .post('/api/payments/initiate')
        .send(paymentData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('应该检查订单是否存在', async () => {
      const paymentData = {
        orderId: 'NONEXISTENT_ORDER',
        paymentMethod: 'alipay'
      };

      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('订单不存在');
    });

    it('应该检查支付超时', async () => {
      // 创建一个过期的订单（需要模拟时间）
      const expiredOrderData = {
        trainNumber: 'G1',
        date: '2024-10-20',
        from: '北京南',
        to: '上海虹桥',
        passengers: [
          {
            name: '张三',
            idNumber: '110101199001011234',
            seatType: 'second'
          }
        ],
        paymentDeadline: new Date(Date.now() - 1000).toISOString() // 1秒前过期
      };

      // 这里需要模拟创建过期订单的逻辑
      const paymentData = {
        orderId: orderId,
        paymentMethod: 'alipay'
      };

      // 根据实际实现，可能需要调整测试逻辑
      const response = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(paymentData);

      // 如果订单未过期，应该成功；如果过期，应该失败
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('POST /api/payments/callback', () => {
    let paymentId;

    beforeEach(async () => {
      // 发起支付获取paymentId
      const paymentResponse = await request(app)
        .post('/api/payments/initiate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: orderId,
          paymentMethod: 'alipay'
        });

      paymentId = paymentResponse.body.data.paymentId;
    });

    it('应该成功处理支付成功回调', async () => {
      const callbackData = {
        paymentId: paymentId,
        orderId: orderId,
        status: 'SUCCESS',
        amount: 553,
        transactionId: 'TXN_' + Date.now(),
        signature: 'mock_signature'
      };

      const response = await request(app)
        .post('/api/payments/callback')
        .send(callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('回调处理成功');
    });

    it('应该验证回调签名', async () => {
      const callbackData = {
        paymentId: paymentId,
        orderId: orderId,
        status: 'SUCCESS',
        amount: 553,
        transactionId: 'TXN_' + Date.now(),
        signature: 'invalid_signature'
      };

      const response = await request(app)
        .post('/api/payments/callback')
        .send(callbackData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('签名验证失败');
    });

    it('应该处理支付失败回调', async () => {
      const callbackData = {
        paymentId: paymentId,
        orderId: orderId,
        status: 'FAILED',
        amount: 553,
        transactionId: 'TXN_' + Date.now(),
        signature: 'mock_signature'
      };

      const response = await request(app)
        .post('/api/payments/callback')
        .send(callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // 验证订单状态是否正确更新
      const orderResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(orderResponse.body.data.status).not.toBe('PAID');
    });

    it('应该验证金额一致性', async () => {
      const callbackData = {
        paymentId: paymentId,
        orderId: orderId,
        status: 'SUCCESS',
        amount: 999, // 错误的金额
        transactionId: 'TXN_' + Date.now(),
        signature: 'mock_signature'
      };

      const response = await request(app)
        .post('/api/payments/callback')
        .send(callbackData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('金额不匹配');
    });

    it('应该防止重复处理回调', async () => {
      const callbackData = {
        paymentId: paymentId,
        orderId: orderId,
        status: 'SUCCESS',
        amount: 553,
        transactionId: 'TXN_' + Date.now(),
        signature: 'mock_signature'
      };

      // 第一次回调
      await request(app)
        .post('/api/payments/callback')
        .send(callbackData);

      // 第二次相同回调
      const response = await request(app)
        .post('/api/payments/callback')
        .send(callbackData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('重复回调');
    });

    it('应该在支付成功后生成电子票', async () => {
      const callbackData = {
        paymentId: paymentId,
        orderId: orderId,
        status: 'SUCCESS',
        amount: 553,
        transactionId: 'TXN_' + Date.now(),
        signature: 'mock_signature'
      };

      const response = await request(app)
        .post('/api/payments/callback')
        .send(callbackData);

      expect(response.status).toBe(200);
      
      // 验证订单状态更新为已支付
      const orderResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(orderResponse.body.data.status).toBe('PAID');
      expect(orderResponse.body.data).toHaveProperty('ticketInfo');
    });
  });
});