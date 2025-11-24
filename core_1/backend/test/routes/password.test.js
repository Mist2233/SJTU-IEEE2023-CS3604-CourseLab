const request = require('supertest')
const app = require('../../src/app')

describe('Password API', () => {
  describe('POST /api/password/reset/phone', () => {
    test('should reset password with valid code and strong new password', async () => {
      const resp = await request(app)
        .post('/api/password/reset/phone')
        .send({ phoneNumber: '13800138000', verificationCode: '123456', newPassword: 'Aa1!aaaa' })
      expect(resp.status).toBe(200)
      expect(resp.body.message).toContain('密码重置成功')
    })

    test('should reject weak password or same as old', async () => {
      const resp = await request(app)
        .post('/api/password/reset/phone')
        .send({ phoneNumber: '13800138000', verificationCode: '123456', newPassword: 'weak' })
      expect(resp.status).toBe(422)
      expect(resp.body.error || resp.body.message).toMatch(/密码强度不足|旧密码相同/)
    })
  })

  describe('POST /api/password/reset/email/request', () => {
    test('should create 24h token after identity matches and send email', async () => {
      const resp = await request(app)
        .post('/api/password/reset/email/request')
        .send({ email: 'user@example.com', idType: 'idcard', idNumber: '110101199001011234' })
      expect(resp.status).toBe(200)
      expect(resp.body.message).toContain('重置链接已发送至您的邮箱')
    })
  })

  describe('GET /api/password/reset/email/:token', () => {
    test('should return valid true for active token', async () => {
      const resp = await request(app).get('/api/password/reset/email/valid_token')
      expect(resp.status).toBe(200)
      expect(resp.body.valid).toBe(true)
    })

    test('should return 410 for expired token', async () => {
      const resp = await request(app).get('/api/password/reset/email/expired_token')
      expect(resp.status).toBe(410)
    })

    test('should return 404 for invalid token', async () => {
      const resp = await request(app).get('/api/password/reset/email/invalid')
      expect(resp.status).toBe(404)
    })
  })

  describe('POST /api/password/reset/email', () => {
    test('should set strong new password when token valid', async () => {
      const resp = await request(app)
        .post('/api/password/reset/email')
        .send({ token: 'valid_token', newPassword: 'Aa1!aaaa' })
      expect(resp.status).toBe(200)
      expect(resp.body.message).toContain('密码重置成功')
    })
  })
})
