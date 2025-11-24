import React from 'react'
import { Link } from 'react-router-dom'

const ForgotPasswordPage = () => {
  return (
    <div style={{ maxWidth: 680, margin: '40px auto' }}>
      <h2>忘记密码</h2>
      <p>请选择一种验证方式完成密码找回</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Link to="/password/phone" className="btn">手机号码找回</Link>
        <Link to="/password/email" className="btn">邮箱找回</Link>
        <Link to="/password/face" className="btn">人脸识别找回</Link>
      </div>
    </div>
  )
}

export default ForgotPasswordPage

