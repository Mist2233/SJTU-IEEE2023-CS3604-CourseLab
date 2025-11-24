import React, { useState } from 'react'
import { changePassword } from '../../services/api'

const ChangePasswordPage = () => {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [strength, setStrength] = useState('weak')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const resp = await changePassword({ oldPassword, newPassword })
      setMessage('密码修改成功')
    } catch (err) {
      setError(String(err))
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div>
      <h2>修改密码</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="原密码" value={oldPassword} onChange={e=>setOldPassword(e.target.value)} />
        <input name="password" placeholder="新密码" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
        <input placeholder="确认新密码" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
        <div className={`strength ${strength}`}>强度：{strength}</div>
        {error && <div className="error-msg weak">{error}</div>}
        {message && <div className="success-msg">{message}</div>}
        <button type="submit">提交</button>
      </form>
    </div>
  )
}

export default ChangePasswordPage

