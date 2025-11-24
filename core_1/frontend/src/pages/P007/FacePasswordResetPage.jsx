import React, { useEffect, useState } from 'react'
import { initFaceAuth, getFaceAuthStatus, confirmFaceAuth } from '../../services/api'

const FacePasswordResetPage = () => {
  const [sessionId, setSessionId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [status, setStatus] = useState('pending')
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const resp = await initFaceAuth()
        setSessionId(resp.sessionId || '')
        setQrCode(resp.qrCode || '')
      } catch (err) {
        setError(String(err))
      }
    }
    run()
  }, [])

  useEffect(() => {
    let timer
    if (sessionId) {
      timer = setInterval(async () => {
        try {
          const resp = await getFaceAuthStatus(sessionId)
          setStatus(resp.status)
          setAttempts(resp.attempts || 0)
          setLockedUntil(resp.lockedUntil || '')
        } catch (err) {}
      }, 1000)
    }
    return () => timer && clearInterval(timer)
  }, [sessionId])

  const handleConfirm = async () => {
    try {
      await confirmFaceAuth({ sessionId, newPassword: 'Aa1!aaaa' })
      alert('密码重置成功')
    } catch (err) {
      setError(String(err))
    }
  }

  return (
    <div>
      <h2>人脸识别找回</h2>
      {qrCode && <img alt="二维码" src={qrCode} />}
      <div className="status">状态：{status}</div>
      <div className="attempts">失败次数：{attempts}</div>
      {lockedUntil && <div className="lock">锁定至：{lockedUntil}</div>}
      <button onClick={handleConfirm}>设置新密码</button>
      <button type="button">尝试其他方式</button>
      {error && <div className="error-msg">{error}</div>}
    </div>
  )
}

export default FacePasswordResetPage

