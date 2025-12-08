import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const PersonalInfoPage = () => {
  const [info, setInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true)
        const res = await api.get('/auth/me')
        setInfo(res?.data)
      } catch (e) {
        setError('获取用户信息失败')
      } finally { setLoading(false) }
    }
    run()
  }, [])

  if (loading) return <div>加载中…</div>
  if (!info) return <div>未获取到用户信息</div>

  return (
    <div>
      <h2>个人信息管理</h2>
      <div style={{ marginTop: 10 }}>
        <div>用户名：{info.userId}</div>
        <div>姓名：{info.realName}</div>
        <div>身份证号：{info.idNumber}</div>
        <div>手机号：{info.phone}</div>
        <div>邮箱：{info.email || '未填写'}</div>
        <div>注册时间：{info.createdAt}</div>
        <div>最后登录时间：{info.lastLogin || '无'}</div>
      </div>

      <div style={{ marginTop: 20 }}>
        <button className="submit-btn" onClick={()=>navigate('/my/change-password')}>修改密码</button>
      </div>
    </div>
  )
}

export default PersonalInfoPage
