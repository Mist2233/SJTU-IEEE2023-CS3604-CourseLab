import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const ChangePasswordPage = () => {
  const navigate = useNavigate()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [strength, setStrength] = useState(0)
  const calcStrength = v => { let s=0; if ((v||'').length>=6) s++; if (/[A-Z]/.test(v)) s++; if (/[0-9]/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++; return Math.min(s,3) }
  useEffect(()=>{ setStrength(calcStrength(newPassword)) },[newPassword])

  const submit = async () => {
    setError('')
    if (!oldPassword || !newPassword || !confirmPassword) { setError('请完整填写'); return }
    if (newPassword !== confirmPassword) { setError('两次输入的密码不一致'); return }
    try {
      await api.post('/auth/change-password', { oldPassword, newPassword })
      localStorage.removeItem('token'); localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('userLoginStatusChanged'))
      navigate('/login')
    } catch (e) {
      setError(e?.message || '密码修改失败')
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>修改密码</h2>
      {error && <div style={{ color:'#ff4d4f', marginBottom:8 }}>{error}</div>}
      <div className="input-row" style={{ position:'relative', border:'1px solid #ddd', borderRadius:4, marginBottom:10 }}>
        <span className="input-icon" style={{ padding:'0 10px', color:'#ccc' }}>🔒</span>
        <input type={showOld ? 'text' : 'password'} value={oldPassword} onChange={e=>setOldPassword(e.target.value)} placeholder="旧密码" style={{ flex:1, border:'none', padding:'12px 34px 12px 0', outline:'none' }} />
        <button type="button" className="toggle-eye" onClick={()=>setShowOld(!showOld)} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', border:'none', background:'transparent', color:'#0077FF' }}>
          {showOld ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/></svg>
          )}
        </button>
      </div>
      <div className="input-row" style={{ position:'relative', border:'1px solid #ddd', borderRadius:4, marginBottom:10 }}>
        <span className="input-icon" style={{ padding:'0 10px', color:'#ccc' }}>🔒</span>
        <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="新密码（6-20位）" style={{ flex:1, border:'none', padding:'12px 34px 12px 0', outline:'none' }} />
        <button type="button" className="toggle-eye" onClick={()=>setShowNew(!showNew)} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', border:'none', background:'transparent', color:'#0077FF' }}>
          {showNew ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/></svg>
          )}
        </button>
      </div>
      {newPassword && (
        <div style={{ display:'flex', gap:2, height:6, marginBottom:10 }}>
          <span style={{ flex:1, background: strength>=1 ? '#FF4400':'#ddd' }}></span>
          <span style={{ flex:1, background: strength>=2 ? '#FF9900':'#ddd' }}></span>
          <span style={{ flex:1, background: strength>=3 ? '#52C41A':'#ddd' }}></span>
        </div>
      )}
      <div className="input-row" style={{ position:'relative', border:'1px solid #ddd', borderRadius:4, marginBottom:10 }}>
        <span className="input-icon" style={{ padding:'0 10px', color:'#ccc' }}>🔒</span>
        <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="确认新密码" style={{ flex:1, border:'none', padding:'12px 34px 12px 0', outline:'none' }} />
        <button type="button" className="toggle-eye" onClick={()=>setShowConfirm(!showConfirm)} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', border:'none', background:'transparent', color:'#0077FF' }}>
          {showConfirm ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/></svg>
          )}
        </button>
      </div>
      <button className="submit-btn" onClick={submit}>保存新密码</button>
    </div>
  )
}

export default ChangePasswordPage
