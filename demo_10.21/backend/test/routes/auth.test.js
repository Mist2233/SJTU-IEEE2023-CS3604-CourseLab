const request = require('supertest');
const app = require('../../src/app');

describe('Authentication API', () => {
  describe('POST /api/auth/send-code', () => {
    it('应该成功发送验证码到有效手机号', async () => {
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({
          phone: '13800138000'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('验证码发送成功');
    });

    it('应该拒绝无效的手机号格式', async () => {
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({
          phone: '123456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('手机号格式不正确');
    });

    it('应该限制同一手机号的发送频率', async () => {
      const phone = '13800138001';
      
      // 第一次发送
      await request(app)
        .post('/api/auth/send-code')
        .send({ phone });

      // 立即再次发送
      const response = await request(app)
        .post('/api/auth/send-code')
        .send({ phone });

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('发送过于频繁');
    });
  });

  describe('POST /api/auth/register', () => {
    it('应该成功注册新用户', async () => {
      const userData = {
        phone: '13800138002',
        verificationCode: '123456',
        password: 'password123',
        realName: '张三',
        idNumber: '110101199001011234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.message).toContain('注册成功');
    });

    it('应该拒绝已存在的手机号注册', async () => {
      const userData = {
        phone: '13800138003',
        verificationCode: '123456',
        password: 'password123',
        realName: '李四',
        idNumber: '110101199001011235'
      };

      // 第一次注册
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // 尝试用相同手机号再次注册
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('手机号已存在');
    });

    it('应该验证身份证号格式', async () => {
      const userData = {
        phone: '13800138004',
        verificationCode: '123456',
        password: 'password123',
        realName: '王五',
        idNumber: '123456' // 无效身份证号
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('身份证号格式不正确');
    });

    it('应该验证验证码的有效性', async () => {
      const userData = {
        phone: '13800138005',
        verificationCode: '000000', // 错误验证码
        password: 'password123',
        realName: '赵六',
        idNumber: '110101199001011236'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('验证码错误或已过期');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // 创建测试用户
      await request(app)
        .post('/api/auth/register')
        .send({
          phone: '13800138006',
          verificationCode: '123456',
          password: 'password123',
          realName: '测试用户',
          idNumber: '110101199001011237'
        });
    });

    it('应该成功登录有效用户', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800138006',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('phone', '13800138006');
      expect(response.body.message).toContain('登录成功');
    });

    it('应该拒绝错误的密码', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800138006',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('手机号或密码错误');
    });

    it('应该拒绝不存在的用户', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '13800138999',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('手机号或密码错误');
    });

    it('应该限制登录尝试次数', async () => {
      const loginData = {
        phone: '13800138006',
        password: 'wrongpassword'
      };

      // 多次错误登录尝试
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData);
      }

      // 第6次尝试应该被限制
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(429);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('登录尝试过于频繁');
    });
  });
});