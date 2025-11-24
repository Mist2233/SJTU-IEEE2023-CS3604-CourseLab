import React, { useEffect, useState } from 'react'
import { validateEmailResetToken, resetPasswordByEmail } from '../../services/api'

const PasswordResetFromEmailPage = ({ token = '' }) => {
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const resp = await validateEmailResetToken(token || 'test')
        setIsTokenValid(!!resp?.valid)
      } catch (err) {
        setError('链接已过期或无效')
      }
    }
    run()
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await resetPasswordByEmail({ token, newPassword })
      setMessage('密码重置成功')
    } catch (err) {
      setError(String(err))
    }
  }

  if (!isTokenValid) {
    return (
      <div>
        <h2>链接过期</h2>
        <a href="#">重新申请</a>
      </div>
    )
  }

  return (
    <div>
      <h2>设置新密码</h2>
      <form onSubmit={handleSubmit}>
        <input name="password" placeholder="设置新密码" value={newPassword} onChange={e=>setNewPassword(e.target.value)} />
        <input placeholder="再次输入新密码" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
        {error && <div className="error-msg weak">{error}</div>}
        <button type="submit">提交</button>
      </form>
      {message && <div className="success-msg">{message}</div>}
    </div>
  )
}

export default PasswordResetFromEmailPage

