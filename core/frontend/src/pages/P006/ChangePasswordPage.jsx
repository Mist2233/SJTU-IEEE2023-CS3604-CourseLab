import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './ChangePasswordPage.css'

const ChangePasswordPage = () => {
  const navigate = useNavigate()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [strength, setStrength] = useState(0)

  const calcStrength = v => {
    let s = 0
    if (!v) return 0
    if (v.length >= 6) s++
    if (/[A-Z]/.test(v)) s++
    if (/[0-9]/.test(v)) s++
    if (/[^A-Za-z0-9]/.test(v)) s++
    return Math.min(s, 3)
  }

  useEffect(() => {
    setStrength(calcStrength(newPassword))
  }, [newPassword])

  const submit = async () => {
    setError('')
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请完整填写所有字段')
      return
    }
    if (newPassword.length < 6) {
        setError('密码长度不能少于6位')
        return
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }
    
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword })
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.dispatchEvent(new CustomEvent('userLoginStatusChanged'))
      alert('密码修改成功，请重新登录')
      navigate('/login')
    } catch (e) {
      console.error(e)
      setError(e?.message || '密码修改失败')
    }
  }

  const getStrengthLabel = () => {
      if (strength === 0) return '';
      if (strength === 1) return '弱';
      if (strength === 2) return '中';
      return '强';
  }

  return (
    <div className="change-password-container">
      {error && <div className="error-msg">{error}</div>}
      
      <div className="form-row">
        <label className="form-label required">原密码</label>
        <div className="form-input-wrapper">
          <input 
            type="password" 
            className="form-input"
            value={oldPassword} 
            onChange={e => setOldPassword(e.target.value)}
            placeholder="请输入原密码"
          />
        </div>
      </div>

      <div className="form-row">
        <label className="form-label required">新密码</label>
        <div className="form-input-wrapper">
          <input 
            type="password" 
            className="form-input"
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)}
            placeholder="请输入新密码"
          />
        </div>
        <span className="input-tip">6-20位字符，建议由字母、数字、符号组成</span>
      </div>

      {newPassword && (
        <div className="strength-container">
            <div className="strength-bar">
                <div className={`strength-segment ${strength >= 1 ? 'weak' : ''}`} style={{opacity: strength >= 1 ? 1 : 0.3}}></div>
                <div className={`strength-segment ${strength >= 2 ? 'medium' : ''}`} style={{opacity: strength >= 2 ? 1 : 0.3}}></div>
                <div className={`strength-segment ${strength >= 3 ? 'strong' : ''}`} style={{opacity: strength >= 3 ? 1 : 0.3}}></div>
            </div>
            <div className="strength-text">安全强度：{getStrengthLabel()}</div>
        </div>
      )}

      <div className="form-row">
        <label className="form-label required">确认密码</label>
        <div className="form-input-wrapper">
          <input 
            type="password" 
            className="form-input"
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="请再次输入新密码"
          />
        </div>
      </div>

      <button className="submit-btn-orange" onClick={submit}>确认修改</button>
    </div>
  )
}

export default ChangePasswordPage
