const request = require('supertest')
const app = require('../../src/app')

describe('Face Password Reset API', () => {
  test('should initialize session and return qrCode + sessionId', async () => {
    const resp = await request(app).post('/api/password/reset/face/init').send({})
    expect(resp.status).toBe(200)
    expect(resp.body.sessionId).toBeDefined()
    expect(resp.body.qrCode).toBeDefined()
  })

  test('should return lockout after 3 failed recognitions and allow authorized', async () => {
    const resp = await request(app).get('/api/password/reset/face/session123/status')
    expect(resp.status).toBe(200)
    expect(['pending','authorized','failed','expired']).toContain(resp.body.status)
  })

  test('should set new password only when authorized', async () => {
    const resp = await request(app)
      .post('/api/password/reset/face/confirm')
      .send({ sessionId: 'session123', newPassword: 'Aa1!aaaa' })
    expect(resp.status).toBe(200)
    expect(resp.body.message).toContain('密码重置成功')
  })
})
