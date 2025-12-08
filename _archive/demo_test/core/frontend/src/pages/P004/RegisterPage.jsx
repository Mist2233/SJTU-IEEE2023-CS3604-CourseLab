import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, sendVerificationCode } from '../../services/api'
import './RegisterPage.css'

const RegisterPage = () => {
  const navigate = useNavigate()

  // 扩展表单状态以匹配官网
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    certType: '1',
    realName: '',
    idNumber: '',
    passengerType: '1',
    email: '',
    phone: '',
    verificationCode: '',
    agreed: false
  })

  const [fieldErrors, setFieldErrors] = useState({})
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [serverCode, setServerCode] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  const [successOpen, setSuccessOpen] = useState(false)

  // 倒计时逻辑
  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  // 密码强度计算
  const calculateStrength = (val) => {
    let s = 0
    if (val.length >= 6) s++
    if (/[A-Z]/.test(val)) s++
    if (/[0-9]/.test(val)) s++
    if (/[^A-Za-z0-9]/.test(val)) s++
    return Math.min(s, 3)
  }

  const validateField = (name, value, all = formData) => {
    let msg = ''
    if (name === 'username') {
      if (!/^[A-Za-z][A-Za-z0-9_]{5,29}$/.test(value || '')) msg = '用户名需以字母开头，6-30位字母/数字/下划线'
    } else if (name === 'password') {
      if (!value || value.length < 6 || value.length > 20) msg = '密码长度需为6-20位'
    } else if (name === 'confirmPassword') {
      if (value !== all.password) msg = '两次输入的密码不一致'
    } else if (name === 'idNumber') {
      if (!/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(value || '')) msg = '身份证号格式不正确'
    } else if (name === 'email') {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = '邮箱格式不正确'
    } else if (name === 'phone') {
      if (!/^1[3-9]\d{9}$/.test(value || '')) msg = '手机号格式不正确'
    } else if (name === 'verificationCode') {
      if (!/^\d{6}$/.test(value || '')) msg = '请输入6位短信验证码'
    }
    setFieldErrors(prev => ({ ...prev, [name]: msg }))
    return msg
  }

  const validateAll = () => {
    const keys = ['username','password','confirmPassword','realName','idNumber','email','phone','verificationCode','agreed']
    let firstErr = ''
    keys.forEach(k => {
      const val = formData[k]
      const msg = validateField(k, val)
      if (!val && ['username','password','confirmPassword','realName','idNumber','phone','verificationCode'].includes(k)) {
        firstErr ||= '请完整填写必填项'
      }
      if (!firstErr && msg) firstErr = msg
    })
    if (!formData.agreed) firstErr ||= '请同意服务条款'
    return firstErr
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value

    setFormData(prev => ({ ...prev, [name]: val }))

    if (name === 'password') {
      setPasswordStrength(calculateStrength(val))
    }
    validateField(name, val, { ...formData, [name]: val })
  }

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      setFieldErrors(prev => ({ ...prev, phone: '手机号格式不正确' }))
      setDialogMessage('请输入正确的手机号')
      setDialogOpen(true)
      return
    }
    try {
      setIsCodeSent(true)
      setCountdown(60)
      const resp = await sendVerificationCode(formData.phone)
      const maybeCode = resp?.data?.code
      if (maybeCode) setServerCode(maybeCode)
    } catch (e) {
      setIsCodeSent(false)
      setCountdown(0)
      const msg = e?.message || '发送验证码失败'
      setError(msg)
      setDialogMessage(msg)
      setDialogOpen(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errMsg = validateAll()
    if (errMsg) {
      setError(errMsg)
      setDialogMessage(errMsg)
      setDialogOpen(true)
      return
    }

    setLoading(true)
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        verificationCode: formData.verificationCode,
        password: formData.password,
        realName: formData.realName,
        idNumber: formData.idNumber
      }
      await register(payload)
      setSuccessOpen(true)
    } catch (err) {
      const msg = err?.message || '注册失败，请检查输入'
      setError(msg)
      setDialogMessage(msg)
      setDialogOpen(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page-official">
      <div className="reg-content-wrapper">

        {/* 1. 面包屑导航 */}
        <div className="breadcrumb-nav">
          您现在的位置：<Link to="/">客运首页</Link> &gt; 注册
        </div>

        {/* 2. 注册主面板 */}
        <div className="register-panel">
          {/* 蓝色标题栏 */}
          <div className="panel-header">
            账户信息
          </div>

          <div className="panel-body">
            <form onSubmit={handleSubmit}>

              {/* --- 用户名 --- */}
              <div className="register-row">
                <div className="row-label required">用户名：</div>
                <div className="row-input">
                  <input
                    type="text"
                    name="username"
                    placeholder="用户名设置成功后不可修改"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="row-tip orange-tip">{fieldErrors.username || '6-30位字母、数字或“_”,字母开头'}</div>
              </div>

              {/* --- 密码 --- */}
              <div className="register-row">
                <div className="row-label required">登录密码：</div>
                <div className="row-input input-with-toggle">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
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
                </div>
                {formData.password && (
                  <div className="strength-meter">
                    <span className={`level level-1 ${passwordStrength >= 1 ? 'active' : ''}`}></span>
                    <span className={`level level-2 ${passwordStrength >= 2 ? 'active' : ''}`}></span>
                    <span className={`level level-3 ${passwordStrength >= 3 ? 'active' : ''}`}></span>
                  </div>
                )}
                <div className="row-tip">6-20位字母、数字或符号</div>
              </div>

              {/* --- 确认密码 --- */}
              <div className="register-row">
                <div className="row-label required">确认密码：</div>
                <div className="row-input input-with-toggle">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="再次输入您的登录密码"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <button type="button" className="toggle-eye" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/></svg>
                    )}
                  </button>
                </div>
                <div className="row-tip orange-tip">{fieldErrors.email || ''}</div>
              </div>

              {/* --- 证件类型 --- */}
              <div className="register-row">
                <div className="row-label required">证件类型：</div>
                <div className="row-input">
                  <select name="certType" value={formData.certType} onChange={handleInputChange}>
                    <option value="1">中国居民身份证</option>
                  </select>
                </div>
              </div>

              {/* --- 姓名 --- */}
              <div className="register-row">
                <div className="row-label required">姓名：</div>
                <div className="row-input">
                  <input
                    type="text"
                    name="realName"
                    placeholder="请输入姓名"
                    value={formData.realName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="row-tip orange-tip">姓名填写规则（用于身份核验，请正确填写）</div>
              </div>

              {/* --- 证件号码 --- */}
              <div className="register-row">
                <div className="row-label required">证件号码：</div>
                <div className="row-input">
                  <input
                    type="text"
                    name="idNumber"
                    placeholder="请输入您的证件号码"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="row-tip orange-tip">{fieldErrors.idNumber || '（用于身份核验，请正确填写）'}</div>
              </div>

              {/* --- 邮箱 --- */}
              <div className="register-row dashed-top">
                <div className="row-label">邮箱：</div>
                <div className="row-input">
                  <input
                    type="email"
                    name="email"
                    placeholder="请正确填写邮箱地址"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

          {/* --- 手机号 --- */}
          <div className="register-row">
            <div className="row-label required">手机号码：</div>
            <div className="row-input">
              <div className="phone-group">
                <select className="phone-prefix">
                  <option>+86 中国</option>
                </select>
                <input
                  type="text"
                  name="phone"
                  className="phone-input"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="send-code-btn"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `重新发送(${countdown}s)` : (isCodeSent ? '重新发送' : '发送验证码')}
                </button>
              </div>
            </div>
            <div className="row-tip orange-tip">{fieldErrors.phone || '请正确填写手机号码，稍后将向该手机号发送短信验证码'}</div>
          </div>

          {/* --- 短信验证码 --- */}
          <div className="register-row">
            <div className="row-label required">短信验证码：</div>
            <div className="row-input">
              <input
                type="text"
                name="verificationCode"
                placeholder="请输入短信验证码"
                value={formData.verificationCode}
                onChange={handleInputChange}
              />
              {serverCode && (
                <div className="debug-code-tip">开发环境验证码：{serverCode}</div>
              )}
            </div>
          </div>

              {/* --- 旅客类型 --- */}
              <div className="register-row">
                <div className="row-label required">优惠（待）类型：</div>
                <div className="row-input">
                  <select name="passengerType" value={formData.passengerType} onChange={handleInputChange}>
                    <option value="1">成人</option>
                    <option value="2">儿童</option>
                    <option value="3">学生</option>
                    <option value="4">残疾军人、伤残人民警察</option>
                  </select>
                </div>
              </div>

              {/* --- 协议 --- */}
              <div className="register-row agreement-row">
                <div className="row-label"></div>
                <div className="row-input full-width">
                  <label>
                    <input
                      type="checkbox"
                      name="agreed"
                      checked={formData.agreed}
                      onChange={handleInputChange}
                    />
                    我已阅读并同意遵守 <Link to="#">《中国铁路客户服务中心网站服务条款》</Link> <Link to="#">《隐私权政策》</Link>
                  </label>
                </div>
              </div>

              {/* --- 按钮 --- */}
              <div className="register-row btn-row">
                <div className="row-label"></div>
              <div className="row-input">
                <button type="submit" className="next-btn" disabled={loading}>
                  下一步
                </button>
              </div>
            </div>

            {error && (
              <div className="register-row">
                <div className="row-label"></div>
                <div className="row-input">
                  <div className="error-tip">{error}</div>
                </div>
              </div>
            )}

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
                  <div className="ui-modal-title">注册成功</div>
                  <div className="ui-modal-body">您的账号已创建成功</div>
                  <div className="ui-modal-actions">
                    <button className="next-btn" type="button" onClick={() => { setSuccessOpen(false); navigate('/login'); }}>去登录</button>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  </div>
  )
}

export default RegisterPage
