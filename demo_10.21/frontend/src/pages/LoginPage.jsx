import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/api'
import './LoginPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [rememberMe, setRememberMe] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)

  const validatePhone = (phone) => {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.phone) {
      errors.phone = '请输入手机号'
    } else if (!validatePhone(formData.phone)) {
      errors.phone = '请输入正确的手机号格式'
    }
    
    if (!formData.password) {
      errors.password = '请输入密码'
    } else if (formData.password.length < 6) {
      errors.password = '密码长度不能少于6位'
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // 检查登录尝试次数（在6次失败后阻止进一步尝试）
    if (loginAttempts >= 6) {
      setError('登录尝试次数过多，请稍后再试')
      return
    }

    // 验证表单
    const errors = {}
    if (!formData.phone) {
      errors.phone = '请输入手机号'
    } else if (!validatePhone(formData.phone)) {
      errors.phone = '请输入正确的手机号'
    }

    if (!formData.password) {
      errors.password = '请输入密码'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      const data = await login(formData)
      
      console.log('登录响应数据:', data)
      
      if (data.success) {
        // 保存用户信息和token
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        
        // 触发自定义事件，通知Header组件更新状态
        window.dispatchEvent(new CustomEvent('userLoginStatusChanged'))
        
        // 重置登录尝试次数
        setLoginAttempts(0)
        
        console.log('登录成功，即将跳转到首页')
        
        // 跳转到首页
        navigate('/')
      } else {
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)
        setError(data.message || '登录失败')
        
        // 如果达到6次失败，延迟显示限制消息
        if (newAttempts >= 6) {
          setTimeout(() => {
            setError('登录尝试次数过多，请稍后再试')
          }, 100)
        }
      }
    } catch (err) {
      console.error('登录错误:', err)
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      const errorMessage = err.message || err.response?.data?.message || '登录失败，请稍后重试'
      setError(errorMessage)
      
      // 如果达到6次失败，延迟显示限制消息
      if (newAttempts >= 6) {
        setTimeout(() => {
          setError('登录尝试次数过多，请稍后再试')
        }, 100)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>用户登录</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form" role="form">
          <div className={`form-group ${fieldErrors.phone ? 'error' : ''}`}>
            <label htmlFor="phone" className="required">手机号</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="请输入手机号"
              maxLength="11"
            />
            {fieldErrors.phone && (
              <div className="field-error">{fieldErrors.phone}</div>
            )}
          </div>

          <div className={`form-group ${fieldErrors.password ? 'error' : ''}`}>
            <label htmlFor="password" className="required">密码</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="请输入密码"
            />
            {fieldErrors.password && (
              <div className="field-error">{fieldErrors.password}</div>
            )}
            <div className="forgot-password">
              <Link to="/forgot-password">忘记密码？</Link>
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkmark"></span>
              记住登录状态
            </label>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="login-footer">
          <p>
            <Link to="/register" className="register-link">
              没有账号？立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage