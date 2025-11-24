const express = require('express')
const router = express.Router()

router.post('/init', (req, res) => {
  const sessionId = 'S' + Date.now()
  const qrCode = 'data:image/png;base64,placeholder'
  res.status(200).json({ sessionId, qrCode })
})

router.get('/:sessionId/status', (req, res) => {
  res.status(200).json({ status: 'pending', attempts: 0 })
})

router.post('/confirm', (req, res) => {
  res.status(200).json({ success: true, message: '密码重置成功' })
})

module.exports = router
