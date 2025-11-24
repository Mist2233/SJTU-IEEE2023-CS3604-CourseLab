import React, { useState, useEffect } from 'react'
import { requestPasswordResetByPhone } from '../../services/api'
import api from '../../services/api'

const PasswordPhoneResetPage = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [idType, setIdType] = useState('idcard')
  const [idNumber, setIdNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const handleGetCode = async () => {
    setError('')
    setInfo('')
    const validPhone = /^1[3-9]\d{9}$/.test(phoneNumber)
    if (!validPhone) {
      setError('请输入有效的手机号')
      return
    }
    if (!idNumber?.trim()) {
      setError('请输入身份证号')
      return
    }
    try {
      const resp = await api.post('/auth/send-verification-code', { phoneNumber, context: 'password_reset', idType, idNumber })
      if (resp?.success) {
        setCountdown(60)
        setInfo('验证码已发送，请查看后端终端输出')
      }
    } catch (e) {
      setError(String(e))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await requestPasswordResetByPhone({ phoneNumber, verificationCode, newPassword })
      alert('密码重置成功')
    } catch (err) {
      setError(String(err))
    }
  }

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  return (
    <div>
      <h2>手机号码找回</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="请输入手机号" value={phoneNumber} onChange={e=>setPhoneNumber(e.target.value)} />
        <select value={idType} onChange={e=>setIdType(e.target.value)}>
          <option value="idcard">居民身份证</option>
        </select>
        <input placeholder="请输入身份证号" value={idNumber} onChange={e=>setIdNumber(e.target.value)} />
        <div>
          <input placeholder="请输入短信验证码" value={verificationCode} onChange={e=>setVerificationCode(e.target.value)} />
          <button type="button" disabled={countdown>0} onClick={handleGetCode}>获取验证码{countdown>0?`(${countdown}s)`:''}</button>
        </div>
        <input name="password" placeholder="设置新密码" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
        <input placeholder="再次输入新密码" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
        {error && <div className="error-msg">{error}</div>}
        {info && <div className="info-msg">{info}</div>}
        <button type="submit">提交</button>
      </form>
    </div>
  )
}

export default PasswordPhoneResetPage
