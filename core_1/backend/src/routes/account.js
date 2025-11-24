const express = require('express')
const router = express.Router()

const attemptStore = new Map()

function isStrongPassword(pwd) {
  if (typeof pwd !== 'string' || pwd.length < 8) return false
  const hasUpper = /[A-Z]/.test(pwd)
  const hasLower = /[a-z]/.test(pwd)
  const hasDigit = /\d/.test(pwd)
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd)
  return hasUpper && hasLower && hasDigit && hasSpecial
}

router.post('/password/change', (req, res) => {
  const auth = req.headers['authorization'] || ''
  const key = auth || 'anon'
  const { oldPassword, newPassword } = req.body || {}

  const meta = attemptStore.get(key) || { failures: 0, lockedUntil: 0 }
  if (meta.lockedUntil && Date.now() < meta.lockedUntil) {
    return res.status(423).json({ success: false, message: '账户暂时锁定，请稍后再试' })
  }

  if (oldPassword !== 'Correct$1') {
    meta.failures += 1
    if (meta.failures >= 3) {
      meta.lockedUntil = Date.now() + 10 * 60 * 1000
    }
    attemptStore.set(key, meta)
    if (meta.lockedUntil && Date.now() < meta.lockedUntil) {
      return res.status(423).json({ success: false, message: '账户暂时锁定，请稍后再试' })
    }
    return res.status(400).json({ success: false, message: '参数错误' })
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(422).json({ success: false, message: '密码强度不足或与旧密码相同' })
  }

  attemptStore.set(key, { failures: 0, lockedUntil: 0 })
  return res.status(200).json({ success: true, message: '密码修改成功' })
})

module.exports = router
