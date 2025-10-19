import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // 检查本地存储中的用户信息
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (token && userData) {
      setUser(JSON.parse(userData))
    }

    // 更新时间
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const formatTime = (date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <header className="header">
      {/* 顶部信息栏 */}
      <div className="top-bar">
        <div className="top-container">
          <div className="top-left">
            <span className="time">北京时间：{formatTime(currentTime)}</span>
            <span className="weather">晴转多云 15°C</span>
          </div>
          <div className="top-right">
            <Link to="/help" className="top-link">帮助中心</Link>
            <Link to="/feedback" className="top-link">意见反馈</Link>
            <Link to="/download" className="top-link">手机版</Link>
            <span className="language">English</span>
          </div>
        </div>
      </div>

      {/* 主导航栏 */}
      <div className="main-header">
        <div className="header-container">
          <Link to="/" className="logo">
            <div className="logo-icon">🚄</div>
            <div className="logo-text">
              <span className="logo-main">中国铁路12306</span>
              <span className="logo-sub">China Railway</span>
            </div>
          </Link>
          
          <nav className="main-nav">
            <Link to="/" className="nav-link">
              <span className="nav-icon">🏠</span>
              <span>首页</span>
            </Link>
            <Link to="/tickets" className="nav-link">
              <span className="nav-icon">🎫</span>
              <span>车票预订</span>
            </Link>
            <Link to="/timetable" className="nav-link">
              <span className="nav-icon">📅</span>
              <span>时刻表</span>
            </Link>
            <Link to="/info" className="nav-link">
              <span className="nav-icon">ℹ️</span>
              <span>出行指南</span>
            </Link>
            <Link to="/service" className="nav-link">
              <span className="nav-icon">🛎️</span>
              <span>客运服务</span>
            </Link>
            <Link to="/freight" className="nav-link">
              <span className="nav-icon">📦</span>
              <span>货运服务</span>
            </Link>
            <Link to="/corporate" className="nav-link">
              <span className="nav-icon">🏢</span>
              <span>企业服务</span>
            </Link>
          </nav>
          
          <div className="user-section">
            {user ? (
              <div className="user-info">
                <div className="user-avatar">
                  <span>{user.realName ? user.realName.charAt(0) : '用'}</span>
                </div>
                <div className="user-details">
                  <span className="user-name">{user.realName || '用户'}</span>
                  <div className="user-actions">
                    <Link to="/my-orders" className="user-link">我的订单</Link>
                    <Link to="/profile" className="user-link">个人中心</Link>
                    <button onClick={handleLogout} className="logout-btn">退出</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">登录</Link>
                <Link to="/register" className="register-btn">注册</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 二级导航栏 */}
      <div className="sub-header">
        <div className="sub-container">
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb-link">首页</Link>
            <span className="breadcrumb-separator">&gt;</span>
            <span className="breadcrumb-current">车票预订</span>
          </div>
          <div className="quick-links">
            <Link to="/my-orders" className="quick-link">我的订单</Link>
            <Link to="/refund" className="quick-link">退票改签</Link>
            <Link to="/candidate" className="quick-link">候补购票</Link>
            <Link to="/points" className="quick-link">积分查询</Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header