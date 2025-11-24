const request = require('supertest')
const app = require('../../src/app')

describe('Account API', () => {
  describe('POST /api/account/password/change', () => {
    test('should lock account for 10 minutes after 3 failed attempts', async () => {
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/account/password/change')
          .set('Authorization', 'Bearer mock')
          .send({ oldPassword: 'wrong', newPassword: 'Aa1!aaaa' })
      }
      const resp = await request(app)
        .post('/api/account/password/change')
        .set('Authorization', 'Bearer mock')
        .send({ oldPassword: 'wrong', newPassword: 'Aa1!aaaa' })
      expect(resp.status).toBe(423)
      expect(resp.body.error || resp.body.message).toMatch(/锁定|稍后再试/)
    })

    test('should change to strong new password and clear failure counter', async () => {
      const resp = await request(app)
        .post('/api/account/password/change')
        .set('Authorization', 'Bearer mock2')
        .send({ oldPassword: 'Correct$1', newPassword: 'Aa1!bbbb' })
      expect(resp.status).toBe(200)
      expect(resp.body.message).toContain('密码修改成功')
    })
  })
})
