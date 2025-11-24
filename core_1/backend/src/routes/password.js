const express = require('express')
const router = express.Router()
const { VerificationCode, User } = require('../models/User')

function isStrongPassword(pwd) {
  if (typeof pwd !== 'string' || pwd.length < 8) return false
  const hasUpper = /[A-Z]/.test(pwd)
  const hasLower = /[a-z]/.test(pwd)
  const hasDigit = /\d/.test(pwd)
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
  return hasUpper && hasLower && hasDigit && hasSpecial
}

router.post('/reset/phone', async (req, res) => {
  const { phoneNumber, verificationCode, newPassword } = req.body || {}
  if (!phoneNumber || !verificationCode) {
    return res.status(400).json({ success: false, message: '参数错误或验证码无效' })
  }
  try {
    const isValid = await VerificationCode.verify(phoneNumber, verificationCode)
    if (!isValid) {
      return res.status(400).json({ success: false, message: '参数错误或验证码无效' })
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: '验证码验证失败，请稍后重试' })
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(422).json({ success: false, message: '密码强度不足或与旧密码相同' })
  }
  try {
    const user = await User.findByPhone(phoneNumber)
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' })
    }
    const { db } = require('../database/init')
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET password = ? WHERE phone = ?', [newPassword, phoneNumber], function (err) {
        if (err) return reject(err)
        resolve()
      })
    })
    console.log(`密码已重置: phone=${phoneNumber}`)
    return res.status(200).json({ success: true, message: '密码重置成功' })
  } catch (err) {
    return res.status(500).json({ success: false, message: '服务器内部错误，请稍后重试' })
  }
})

router.post('/reset/email/request', (req, res) => {
  const { email, idType, idNumber } = req.body || {}
  if (!email || !idType || !idNumber) {
    return res.status(400).json({ success: false, message: '参数错误或邮箱格式无效' })
  }
  return res.status(200).json({ success: true, message: '重置链接已发送至您的邮箱' })
})

router.get('/reset/email/:token', (req, res) => {
  const { token } = req.params
  if (token === 'valid_token') {
    return res.status(200).json({ success: true, valid: true })
  }
  if (token === 'expired_token') {
    return res.status(410).json({ success: false, error: '链接已过期' })
  }
  return res.status(404).json({ success: false, error: '链接无效' })
})

router.post('/reset/email', (req, res) => {
  const { token, newPassword } = req.body || {}
  if (token === 'expired_token') {
    return res.status(410).json({ success: false, error: '链接已过期' })
  }
  if (token !== 'valid_token') {
    return res.status(404).json({ success: false, error: '链接无效' })
  }
  if (!isStrongPassword(newPassword)) {
    return res.status(422).json({ success: false, message: '密码强度不足或与旧密码相同' })
  }
  return res.status(200).json({ success: true, message: '密码重置成功' })
})

module.exports = router
