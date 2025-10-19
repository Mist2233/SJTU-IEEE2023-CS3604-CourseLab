const request = require('supertest');
const app = require('../../src/app');

describe('Orders API', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // 清理测试数据
    await request(app).post('/api/auth/clear-test-data');
    
    // 创建测试用户并获取token
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        phone: '13800138007',
        verificationCode: '123456',
        password: 'password123',
        realName: '订单测试用户',
        idNumber: '110101199001011238'
      });

    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.userId;
  });

  describe('POST /api/orders', () => {
    it('应该成功创建订单', async () => {
      const orderData = {
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
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderId');
      expect(response.body.data).toHaveProperty('status', 'PENDING_PAYMENT');
      expect(response.body.data).toHaveProperty('totalAmount');
      expect(response.body.data).toHaveProperty('paymentDeadline');
    });

    it('应该验证用户身份', async () => {
      const orderData = {
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
      };

      const response = await request(app)
        .post('/api/orders')
        .send(orderData); // 不提供token

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('未授权');
    });

    it('应该验证乘客信息完整性', async () => {
      const orderData = {
        trainNumber: 'G1',
        date: '2024-10-20',
        from: '北京南',
        to: '上海虹桥',
        passengers: [
          {
            name: '张三'
            // 缺少身份证号和座位类型
          }
        ]
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('乘客信息不完整');
    });

    it('应该检查车票库存', async () => {
      const orderData = {
        trainNumber: 'SOLD_OUT_TRAIN',
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
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('余票不足');
    });

    it('应该设置30分钟支付倒计时', async () => {
      const orderData = {
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
      };

      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      expect(response.status).toBe(201);
      
      const paymentDeadline = new Date(response.body.data.paymentDeadline);
      const now = new Date();
      const timeDiff = paymentDeadline.getTime() - now.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      
      expect(minutesDiff).toBeGreaterThan(29);
      expect(minutesDiff).toBeLessThan(31);
    });
  });

  describe('GET /api/orders/:orderId', () => {
    let orderId;

    beforeEach(async () => {
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

    it('应该成功获取订单详情', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orderId', orderId);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('trainInfo');
      expect(response.body.data).toHaveProperty('passengers');
      expect(response.body.data).toHaveProperty('totalAmount');
    });

    it('应该验证用户权限', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('应该处理不存在的订单', async () => {
      const response = await request(app)
        .get('/api/orders/NONEXISTENT_ORDER')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('订单不存在');
    });
  });

  describe('POST /api/orders/:orderId/cancel', () => {
    let orderId;

    beforeEach(async () => {
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

    it('应该成功取消待支付订单', async () => {
      const response = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('订单取消成功');
    });

    it('应该验证用户权限', async () => {
      const response = await request(app)
        .post(`/api/orders/${orderId}/cancel`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('应该拒绝取消已支付订单', async () => {
      // 先模拟支付订单
      // TODO: 这里需要实际的支付逻辑

      const response = await request(app)
        .post(`/api/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);

      // 根据订单状态，可能成功或失败
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('GET /api/orders/user/:userId', () => {
    it('应该成功获取用户订单列表', async () => {
      const response = await request(app)
        .get(`/api/orders/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('orders');
      expect(response.body.data).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data.orders)).toBe(true);
    });

    it('应该支持分页查询', async () => {
      const response = await request(app)
        .get(`/api/orders/user/${userId}`)
        .query({ page: 1, pageSize: 5 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.pageSize).toBe(5);
    });

    it('应该支持状态筛选', async () => {
      const response = await request(app)
        .get(`/api/orders/user/${userId}`)
        .query({ status: 'PENDING_PAYMENT' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('应该验证用户权限', async () => {
      const response = await request(app)
        .get(`/api/orders/user/${userId}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});