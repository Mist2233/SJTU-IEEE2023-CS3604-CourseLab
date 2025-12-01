import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../services/api'
import './LoginPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  // 登录方式：'scan' (扫码) | 'account' (账号)
  const [loginType, setLoginType] = useState('account')

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
        <div className="login-content-container">

          {/* 左侧：营销展示区 */}
          <div className="marketing-area">
            {/* 这里通常放一张大的APP宣传图，我们用CSS模拟布局 */}
            <div className="app-promo">
              <h1 className="promo-title">铁路12306 - 中国铁路官方APP</h1>
              <div className="promo-features">
                <div className="feature-item">✅ 个人行程提醒</div>
                <div className="feature-item">✅ 积分兑换</div>
                <div className="feature-item">✅ 餐饮·特产</div>
                <div className="feature-item">✅ 车站大屏</div>
              </div>
              <div className="qr-download">
                <div className="qr-placeholder">
                  {/* 模拟二维码 */}
                  <div style={{ width: '100px', height: '100px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd' }}>
                    二维码
                  </div>
                </div>
                <div className="download-text">
                  扫码下载<br />安装 铁路12306
                </div>
              </div>
            </div>
          </div>

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
    </div>
  )
}

export default LoginPage
