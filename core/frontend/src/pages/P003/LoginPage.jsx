import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, sendVerificationCode, verify2FA } from '../../services/api'
import './LoginPage.css'

const backgroundImages = [
  'https://www.12306.cn/index/images/pic/banner-login-20200629.jpg',
  'https://www.12306.cn/index/images/pic/banner-login-20200924.jpg'
]

const LoginPage = () => {
  const navigate = useNavigate()
  // 登录方式：'scan' (扫码) | 'account' (账号)
  const [loginType, setLoginType] = useState('account')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % backgroundImages.length)
    }, 5000) // 每5秒切换一次
    return () => clearInterval(interval)
  }, [])

  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [rememberMe, setRememberMe] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  // 2FA State
  const [show2FA, setShow2FA] = useState(false)
  const [twoFAData, setTwoFAData] = useState({ userId: null, maskedPhone: '' })
  const [twoFAForm, setTwoFAForm] = useState({ idLast4: '', code: '' })
  const [twoFAError, setTwoFAError] = useState('')
  const [twoFASuccess, setTwoFASuccess] = useState('')
  const [countdown, setCountdown] = useState(0)

  const validateIdentifier = (id) => {
    return !!String(id || '').trim()
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    if (error) setError('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit(e)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (loginAttempts >= 6) {
      setError('登录尝试次数过多，请稍后再试')
      return
    }

    const errors = {}
    if (!validateIdentifier(formData.identifier)) errors.identifier = '请输入用户名/邮箱/手机号'
    if (!formData.password) errors.password = '请输入密码'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      const data = await login({ identifier: formData.identifier, password: formData.password })

      if (data.success) {
        if (data.require2FA) {
           setTwoFAData({ userId: data.userId, maskedPhone: data.maskedPhone })
           setShow2FA(true)
           setLoading(false)
           return
        }
        const token = data.token ?? data.data?.token
        const user = data.user ?? data.data?.user
        const userId = data.userId ?? data.data?.userId
        const userStored = { ...(user || {}), id: userId }
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userStored))

        window.dispatchEvent(new CustomEvent('userLoginStatusChanged'))
        setLoginAttempts(0)
        navigate('/')
      } else {
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        setError(data.message || '登录失败')
      }
    } catch (err) {
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      setError(err.message || err.response?.data?.message || '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSendCode = async () => {
    if (countdown > 0) return
    if (!twoFAForm.idLast4 || twoFAForm.idLast4.length !== 4) {
      setTwoFAError('请先输入正确的身份证后四位')
      return
    }
    
    setTwoFAError('')
    setTwoFASuccess('')
    
    try {
      const res = await sendVerificationCode({ 
        userId: twoFAData.userId,
        idLast4: twoFAForm.idLast4
      })
      if (res.data && res.data.code) {
        setTwoFASuccess(`获取手机验证码成功！验证码：${res.data.code}`)
      } else {
        setTwoFASuccess('获取手机验证码成功！')
      }
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      setTwoFAError(err.message || err.response?.data?.message || '发送验证码失败')
    }
  }

  const handleVerify2FA = async () => {
     setTwoFAError('')
     try {
       const data = await verify2FA({ 
         userId: twoFAData.userId, 
         idLast4: twoFAForm.idLast4, 
         code: twoFAForm.code 
       })
       if (data.success) {
         const token = data.token ?? data.data?.token
         const user = data.user ?? data.data?.user
         const userId = data.userId ?? data.data?.userId
         const userStored = { ...(user || {}), id: userId }
         localStorage.setItem('token', token)
         localStorage.setItem('user', JSON.stringify(userStored))
         window.dispatchEvent(new CustomEvent('userLoginStatusChanged'))
         setLoginAttempts(0)
         navigate('/')
       } else {
         setTwoFAError(data.message || '验证失败')
       }
     } catch (err) {
       setTwoFAError(err.message || '验证失败')
     }
  }

  return (
    <div className="login-page-wrapper">
      {/* 1. 简易头部 */}
      <div className="login-header-simple">
        <div className="header-content">
          <Link to="/" className="simple-logo">
            {/* <span className="logo-icon">🚄</span> */}
            <img src="https://www.12306.cn/index/images/logo.png" alt="Logo" style={{ height: '48px', marginRight: '10px' }} />
            {/* <div className="logo-text">
              <span className="cn">中国铁路12306</span>
              <span className="en">China Railway</span>
            </div> */}
          </Link>
          <span className="welcome-text">欢迎登录12306</span>
        </div>
      </div>

      {/* 2. 主体背景区域 */}
      <div className="login-main-bg">
        {/* 背景轮播 */}
        <div className="bg-carousel">
          {backgroundImages.map((src, index) => (
            <div
              key={index}
              className={`bg-slide ${index === currentImageIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>

        <div className="login-content-container">

          {/* 右侧：悬浮登录框 */}
          <div className="login-box-floating">
            {/* Tab 切换 */}
            <div className="login-tabs">
              <div
                className={`tab-item ${loginType === 'scan' ? 'active' : ''}`}
                onClick={() => setLoginType('scan')}
              >
                扫码登录
              </div>
              <div className="tab-divider">|</div>
              <div
                className={`tab-item ${loginType === 'account' ? 'active' : ''}`}
                onClick={() => setLoginType('account')}
              >
                账号登录
              </div>
            </div>

            {/* 登录框内容 */}
            <div className="login-box-content">
              {loginType === 'scan' ? (
                <div className="scan-login-view">
                  <div className="scan-qr-wrapper">
                    {/* 模拟二维码 */}
                    <div style={{ width: '160px', height: '160px', background: '#f0f0f0', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                      二维码区域
                    </div>
                  </div>
                  <p className="scan-tip">打开 <span style={{ color: '#FC8302' }}>铁路12306手机APP</span> 扫一扫登录</p>
                </div>
              ) : (
                /* 账号登录表单 */
                <form onSubmit={handleSubmit} className="account-login-form">
                  {error && <div className="login-error-banner">{error}</div>}

                  <div className={`input-row ${fieldErrors.identifier ? 'has-error' : ''}`}>
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      name="identifier"
                      placeholder="用户名/邮箱/手机号"
                      value={formData.identifier}
                      onChange={handleInputChange}
                    />
                    {fieldErrors.identifier && (
                      <span style={{ padding: '0 10px', color: '#ff4d4f' }}>{fieldErrors.identifier}</span>
                    )}
                  </div>

                  <div className={`input-row ${fieldErrors.password ? 'has-error' : ''}`}>
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="密码"
                      value={formData.password}
                      onChange={handleInputChange}
                    />
                    <button type="button" className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/></svg>
                      )}
                    </button>
                    {fieldErrors.password && (
                      <span style={{ padding: '0 10px', color: '#ff4d4f' }}>{fieldErrors.password}</span>
                    )}
                  </div>

                  <div className="form-options">
                    <label className="remember-me">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      自动登录
                    </label>
                    <Link to="/forgot-password">忘记密码？</Link>
                  </div>

                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? '登录中...' : '立即登录'}
                  </button>

                  <div className="register-row">
                    <Link to="/register">注册12306账号</Link>
                  </div>
                </form>
              )}
            </div>

            {/* 底部提示 */}
            <div className="login-box-footer">
              铁路12306每日5:00至次日1:00（周二为5:00至24:00）提供服务。
            </div>
          </div>

        </div>
      </div>

      {/* 3. 简易页脚 */}
      <div className="login-footer-simple">
        <p>© 2008-2025 中国铁道科学研究院集团有限公司</p>
        <p>京ICP备05020493号-4 | ICP证：京B2-20202537</p>
      </div>
      {/* 2FA Modal */}
      {show2FA && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShow2FA(false)}>×</button>
            <div className="modal-header">选择验证方式</div>
            <div className="modal-body">
              <div className="modal-subtitle">短信验证</div>
              <div className="modal-row">
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="请输入身份证后四位"
                    value={twoFAForm.idLast4}
                    onChange={(e) => {
                      setTwoFAForm({ ...twoFAForm, idLast4: e.target.value })
                      setTwoFAError('')
                      setTwoFASuccess('')
                    }}
                    maxLength={4}
                  />
                </div>
                <div className="modal-row">
                  <div className="modal-input-group">
                    <input
                      type="text"
                      className="modal-input"
                      placeholder="输入验证码"
                      value={twoFAForm.code}
                      onChange={(e) => {
                        setTwoFAForm({ ...twoFAForm, code: e.target.value })
                        setTwoFAError('')
                      }}
                    />
                  <button
                    type="button"
                    className={`modal-btn-code ${(!twoFAForm.idLast4 || twoFAForm.idLast4.length !== 4) ? 'disabled' : ''}`}
                    onClick={handleSendCode}
                    disabled={countdown > 0 || !twoFAForm.idLast4 || twoFAForm.idLast4.length !== 4}
                  >
                    {countdown > 0 ? `重新发送(${countdown})` : '获取验证码'}
                  </button>
                </div>
              </div>
              {twoFASuccess && (
                <div className="success-msg-box">
                  {twoFASuccess}
                </div>
              )}
              {twoFAError && <div className="error-msg">{twoFAError}</div>}
            </div>
            <div className="modal-footer">
              <button className="modal-btn modal-btn-primary full-width" onClick={handleVerify2FA}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
