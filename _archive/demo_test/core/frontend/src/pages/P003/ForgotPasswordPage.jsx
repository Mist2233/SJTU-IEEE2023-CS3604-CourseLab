import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { sendForgotCode, resetPassword } from '../../services/api'
import './LoginPage.css'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [recipient, setRecipient] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [serverCode, setServerCode] = useState('')
  const [countdown, setCountdown] = useState(0)
  const [stage, setStage] = useState('verify') // 'verify' -> 输入账号+身份证并获取验证码；'reset' -> 输入新密码
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  const [successOpen, setSuccessOpen] = useState(false)

  useEffect(() => {
    let t
    if (countdown > 0) t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const isPhone = v => /^1[3-9]\d{9}$/.test(v || '')
  const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '')
  const isId = v => /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(v || '')

  const handleSendCode = async () => {
    setError('')
    if (!recipient || (!isPhone(recipient) && !isEmail(recipient))) {
      setDialogMessage('请输入正确的手机号或邮箱')
      setDialogOpen(true)
      return
    }
    if (!isId(idNumber)) {
      setDialogMessage('身份证号格式不正确')
      setDialogOpen(true)
      return
    }
    try {
      setLoading(true)
      const resp = await sendForgotCode({ recipient, idNumber })
      const code = resp?.data?.code
      if (code) setServerCode(code)
      setCountdown(60)
    } catch (e) {
      const msg = e?.message || '发送验证码失败'
      setError(msg)
      setDialogMessage(msg)
      setDialogOpen(true)
    } finally {
      setLoading(false)
    }
  }

  const handleNextStep = () => {
    setError('')
    if (!recipient || (!isPhone(recipient) && !isEmail(recipient))) {
      setDialogMessage('请输入正确的手机号或邮箱')
      setDialogOpen(true)
      return
    }
    if (!isId(idNumber)) {
      setDialogMessage('身份证号格式不正确')
      setDialogOpen(true)
      return
    }
    setStage('reset')
  }

  const handleReset = async () => {
    setError('')
    if (!/^\d{6}$/.test(verificationCode)) {
      setDialogMessage('请输入6位验证码')
      setDialogOpen(true)
      return
    }
    if (!newPassword || newPassword.length < 6 || newPassword.length > 20) {
      setDialogMessage('新密码长度需为6-20位')
      setDialogOpen(true)
      return
    }
    if (newPassword !== confirmPassword) {
      setDialogMessage('两次输入的密码不一致')
      setDialogOpen(true)
      return
    }
    try {
      setLoading(true)
      await resetPassword({ recipient, idNumber, verificationCode, newPassword })
      setSuccessOpen(true)
    } catch (e) {
      const msg = e?.message || '重置失败，请稍后重试'
      setError(msg)
      setDialogMessage(msg)
      setDialogOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page-wrapper">
      <div className="login-header-simple">
        <div className="header-content">
          <Link to="/" className="simple-logo">
            <img src="https://www.12306.cn/index/images/logo.png" alt="Logo" style={{ height: '48px', marginRight: '10px' }} />
          </Link>
          <span className="welcome-text">找回密码</span>
        </div>
      </div>

      <div className="login-main-bg">
        <div className="login-content-container" style={{ justifyContent: 'center' }}>
          <div className="login-box-floating" style={{ width: 480 }}>
            <div className="login-tabs" style={{ justifyContent: 'space-between', padding: '16px 20px' }}>
              <div style={{ fontSize: 18, color: '#666' }}>忘记密码</div>
              <Link to="/login" style={{ color: '#0077FF', textDecoration: 'none' }}>返回登录</Link>
            </div>
            <div className="login-box-content">
              {error && <div className="login-error-banner">{error}</div>}
              {stage === 'verify' ? (
                <div className="account-login-form">
                  <div className="input-row">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      placeholder="请输入绑定的邮箱或手机号"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </div>
                  <div className="input-row">
                    <span className="input-icon">🪪</span>
                    <input
                      type="text"
                      placeholder="请输入身份证号"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                    />
                  </div>
                  <button type="button" className="submit-btn" disabled={loading} onClick={handleNextStep}>
                    下一步
                  </button>
                </div>
              ) : (
                <div className="account-login-form">
                  <div className="input-row">
                    <span className="input-icon">🔢</span>
                    <button type="button" onClick={handleSendCode} disabled={loading || countdown > 0} style={{ border: 'none', background: '#FF8000', color: '#fff', padding: '6px 10px', borderRadius: '3px', cursor: 'pointer', marginRight: '8px' }}>
                      {countdown > 0 ? `重新发送(${countdown}s)` : '发送验证码'}
                    </button>
                    <input
                      type="text"
                      placeholder="请输入短信/邮件验证码"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    {serverCode && (
                      <span style={{ padding: '0 10px', color: '#999' }}>开发环境验证码：{serverCode}</span>
                    )}
                  </div>
                  <div className="input-row">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showNew ? 'text' : 'password'}
                      placeholder="请输入新密码（6-20位）"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button type="button" className="toggle-eye" onClick={() => setShowNew(!showNew)}>
                      {showNew ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/></svg>
                      )}
                    </button>
                  </div>
                  <div className="input-row">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="请再次输入新密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="button" className="toggle-eye" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/></svg>
                      )}
                    </button>
                  </div>
                  <button type="button" className="submit-btn" disabled={loading} onClick={handleReset}>
                    {loading ? '重置中...' : '确认重置'}
                  </button>
                </div>
              )}
            </div>
            <div className="login-box-footer">为保障账户安全，请确保本人操作。</div>
          </div>
        </div>
      </div>

      {dialogOpen && (
        <div className="ui-modal-overlay">
          <div className="ui-modal">
            <div className="ui-modal-title">提示</div>
            <div className="ui-modal-body">{dialogMessage}</div>
            <div className="ui-modal-actions">
              <button className="next-btn" type="button" onClick={() => setDialogOpen(false)}>我知道了</button>
            </div>
          </div>
        </div>
      )}

      {successOpen && (
        <div className="ui-modal-overlay">
          <div className="ui-modal">
            <div className="ui-modal-title">重置成功</div>
            <div className="ui-modal-body">密码已更新，请使用新密码登录</div>
            <div className="ui-modal-actions">
              <button className="next-btn" type="button" onClick={() => { setSuccessOpen(false); navigate('/login') }}>去登录</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ForgotPasswordPage
