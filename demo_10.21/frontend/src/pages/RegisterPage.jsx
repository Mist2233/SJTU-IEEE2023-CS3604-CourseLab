import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register, sendVerificationCode } from '../services/api'
import './RegisterPage.css'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    phone: '',
    verificationCode: '',
    password: '',
    confirmPassword: '',
    realName: '',
    idNumber: ''
  })
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [agreed, setAgreed] = useState(false)

  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [countdown])

  const validatePhone = (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  const validateIdNumber = (idNumber) => {
    const idRegex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/
    return idRegex.test(idNumber)
  }

  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return Math.min(strength, 3)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.phone) {
      errors.phone = '请输入手机号'
    } else if (!validatePhone(formData.phone)) {
      errors.phone = '请输入正确的手机号格式'
    }
    
    if (!formData.verificationCode) {
      errors.verificationCode = '请输入验证码'
    } else if (formData.verificationCode.length !== 6) {
      errors.verificationCode = '验证码应为6位数字'
    }
    
    if (!formData.password) {
      errors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      errors.password = '密码长度至少6位'
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码'
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致'
    }
    
    if (!formData.realName) {
      errors.realName = '请输入真实姓名'
    } else if (formData.realName.length < 2) {
      errors.realName = '姓名长度不能少于2位'
    } else if (!/^[\u4e00-\u9fa5]+$/.test(formData.realName)) {
      errors.realName = '请输入正确的真实姓名'
    }
    
    if (!formData.idNumber) {
      errors.idNumber = '请输入身份证号'
    } else if (!validateIdNumber(formData.idNumber)) {
      errors.idNumber = '请输入正确的身份证号格式'
    }
    
    if (!agreed) {
      errors.agreement = '请先同意用户协议'
    }
    
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // 计算密码强度
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
    
    // 清除对应字段的错误
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    
    // 清除全局错误
    if (error) {
      setError('')
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    
    // 实时验证
    if (name === 'phone' && value && !validatePhone(value)) {
      setFieldErrors(prev => ({ ...prev, phone: '请输入正确的手机号格式' }))
    }
    
    if (name === 'password' && value && value.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: '密码长度至少6位' }))
    }
    
    if (name === 'confirmPassword' && value && formData.password !== value) {
      setFieldErrors(prev => ({ ...prev, confirmPassword: '两次输入的密码不一致' }))
    }
    
    if (name === 'realName' && value && !/^[\u4e00-\u9fa5]+$/.test(value)) {
      setFieldErrors(prev => ({ ...prev, realName: '请输入正确的真实姓名' }))
    }
    
    if (name === 'idNumber' && value && !validateIdNumber(value)) {
      setFieldErrors(prev => ({ ...prev, idNumber: '请输入正确的身份证号格式' }))
    }
  }

  const handleSendCode = async () => {
    if (!formData.phone) {
      setFieldErrors(prev => ({ ...prev, phone: '请先输入手机号' }))
      return
    }
    
    if (!validatePhone(formData.phone)) {
      setFieldErrors(prev => ({ ...prev, phone: '请输入正确的手机号格式' }))
      return
    }
    
    setSendingCode(true)
    setError('')
    
    try {
      const response = await sendVerificationCode(formData.phone)
      
      if (response.success) {
        setIsCodeSent(true)
        setCountdown(60)
        setSuccess('验证码已发送，请查收短信')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(response.message || '发送验证码失败，请重试')
      }
    } catch (err) {
      console.error('发送验证码错误:', err)
      setError(err.message || '发送验证码失败，请检查网络连接')
    } finally {
      setSendingCode(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await register({
        phone: formData.phone,
        verificationCode: formData.verificationCode,
        password: formData.password,
        realName: formData.realName,
        idNumber: formData.idNumber
      })
      
      if (response.success) {
        setSuccess('注册成功！即将跳转到登录页面...')
        navigate('/login')
      } else {
        setError(response.message || '注册失败，请重试')
      }
    } catch (err) {
      console.error('注册错误:', err)
      setError(err.message || '注册失败，请检查网络连接')
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return '弱'
      case 2:
        return '中'
      case 3:
        return '强'
      default:
        return ''
    }
  }

  const getPasswordStrengthClass = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return 'weak'
      case 2:
        return 'medium'
      case 3:
        return 'strong'
      default:
        return ''
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <h2>用户注册</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="register-form" role="form">
          <div className={`form-group ${fieldErrors.phone ? 'error' : ''}`}>
            <label htmlFor="phone" className="required">手机号</label>
            <div className="input-with-icon">
              <span className="input-icon">📱</span>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="请输入手机号"
                maxLength="11"
                aria-label="手机号"
              />
            </div>
            {fieldErrors.phone && (
              <div className="field-error">{fieldErrors.phone}</div>
            )}
          </div>

          <div className={`form-group verification-group ${fieldErrors.verificationCode ? 'error' : ''}`}>
            <label htmlFor="verificationCode" className="required">验证码</label>
            <div className="verification-input">
              <input
                id="verificationCode"
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleInputChange}
                placeholder="请输入验证码"
                maxLength="6"
                aria-label="验证码"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0 || sendingCode}
                className="send-code-btn"
              >
                {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s后重新发送` : '发送验证码'}
              </button>
            </div>
            {fieldErrors.verificationCode && (
              <div className="field-error">{fieldErrors.verificationCode}</div>
            )}
          </div>

          <div className={`form-group ${fieldErrors.password ? 'error' : ''}`}>
            <label htmlFor="password" className="required">密码</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="请输入密码（至少6位）"
                aria-label="密码"
              />
            </div>
            {formData.password && (
              <div className="password-strength">
                <div className={`strength-bar ${passwordStrength >= 1 ? getPasswordStrengthClass() : ''}`}></div>
                <div className={`strength-bar ${passwordStrength >= 2 ? getPasswordStrengthClass() : ''}`}></div>
                <div className={`strength-bar ${passwordStrength >= 3 ? getPasswordStrengthClass() : ''}`}></div>
              </div>
            )}
            {formData.password && (
              <div className="strength-text">
                密码强度：{getPasswordStrengthText()}
              </div>
            )}
            {fieldErrors.password && (
              <div className="field-error">{fieldErrors.password}</div>
            )}
          </div>

          <div className={`form-group ${fieldErrors.confirmPassword ? 'error' : ''}`}>
            <label htmlFor="confirmPassword" className="required">确认密码</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="请再次输入密码"
                aria-label="确认密码"
              />
            </div>
            {fieldErrors.confirmPassword && (
              <div className="field-error">{fieldErrors.confirmPassword}</div>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="field-success">密码一致</div>
            )}
          </div>

          <div className={`form-group ${fieldErrors.realName ? 'error' : ''}`}>
            <label htmlFor="realName" className="required">真实姓名</label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                id="realName"
                type="text"
                name="realName"
                value={formData.realName}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="请输入真实姓名"
                aria-label="真实姓名"
              />
            </div>
            {fieldErrors.realName && (
              <div className="field-error">{fieldErrors.realName}</div>
            )}
          </div>

          <div className={`form-group ${fieldErrors.idNumber ? 'error' : ''}`}>
            <label htmlFor="idNumber" className="required">身份证号</label>
            <div className="input-with-icon">
              <span className="input-icon">🆔</span>
              <input
                id="idNumber"
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="请输入身份证号"
                maxLength="18"
                aria-label="身份证号"
              />
            </div>
            {fieldErrors.idNumber && (
              <div className="field-error">{fieldErrors.idNumber}</div>
            )}
          </div>

          <div className="agreement">
            <label>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              我已阅读并同意
              <Link to="/terms" target="_blank">用户协议</Link>
              和
              <Link to="/privacy" target="_blank">隐私政策</Link>
            </label>
            {fieldErrors.agreement && (
              <div className="field-error">{fieldErrors.agreement}</div>
            )}
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading && <span className="loading"></span>}
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="back-to-login">
          <Link to="/login">已有账号？立即登录</Link>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage