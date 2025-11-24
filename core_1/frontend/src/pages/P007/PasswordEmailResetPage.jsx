import React, { useState } from 'react'
import { requestEmailResetLink } from '../../services/api'

const PasswordEmailResetPage = () => {
  const [email, setEmail] = useState('')
  const [idType, setIdType] = useState('idcard')
  const [idNumber, setIdNumber] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const resp = await requestEmailResetLink({ email, idType, idNumber })
      setMessage('重置链接已发送至您的邮箱')
    } catch (err) {
      setError(String(err))
    }
  }

  return (
    <div>
      <h2>邮箱找回</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="请输入邮箱" value={email} onChange={e=>setEmail(e.target.value)} />
        <select value={idType} onChange={e=>setIdType(e.target.value)}>
          <option value="idcard">居民身份证</option>
        </select>
        <input placeholder="请输入身份证号" value={idNumber} onChange={e=>setIdNumber(e.target.value)} />
        <button type="submit">申请重置链接</button>
      </form>
      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}
      <a href="#">链接过期？重新申请</a>
    </div>
  )
}

export default PasswordEmailResetPage

