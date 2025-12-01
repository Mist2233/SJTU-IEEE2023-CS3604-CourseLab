import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const checkUserStatus = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      if (token && userData) {
        setUser(JSON.parse(userData))
      } else {
        setUser(null)
      }
    }
    checkUserStatus()
    window.addEventListener('storage', checkUserStatus)
    window.addEventListener('userLoginStatusChanged', checkUserStatus)

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
      window.removeEventListener('storage', checkUserStatus)
      window.removeEventListener('userLoginStatusChanged', checkUserStatus)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    window.dispatchEvent(new CustomEvent('userLoginStatusChanged'))
    navigate('/')
  }

  const formatTime = (date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    })
  }

  return (
    <header className="header">
      {/* 1. 顶部细条 - 灰色背景 */}
      <div className="top-bar">
        <div className="container top-container">
          <div className="top-left">
            {/* 这里的链接通常是外部链接，为了演示用 span 或 a */}
            <span className="top-link">无障碍</span>
            <span className="separator">|</span>
            <span className="top-link">关怀版</span>
            <span className="separator">|</span>
            <span className="language">English</span>
          </div>
          <div className="top-right">
            <Link to={user ? "/my" : "/login"} className="top-link">我的12306</Link>
            <span className="separator">|</span>
            {user ? (
              <span className="user-greeting">
                欢迎，{user.real_name || user.realName || '用户'}
                <button onClick={handleLogout} className="text-logout-btn">[退出]</button>
              </span>
            ) : (
              <>
                <Link to="/login" className="top-link login-link">登录</Link>
                <Link to="/register" className="top-link register-link">注册</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. 品牌栏 - 白色背景 */}
      <div className="brand-bar">
        <div className="container brand-container">
          <Link to="/" className="logo-wrapper">
            {/* 使用 emoji 模拟 logo，实际项目中请替换为 img */}
            {/* <div className="logo-icon">🚄</div> */}
            <img src="https://www.12306.cn/index/images/logo.png" alt="12306 Logo" className="logo-img" style={{ height: '40px' }} />
            {/* <div className="logo-text">
              <span className="logo-cn">中国铁路12306</span>
              <span className="logo-en">China Railway</span>
            </div> */}
          </Link>

          <div className="search-site">
            <input type="text" placeholder="搜索车票、餐饮、常旅客、相关规章" />
            <button>🔍</button>
          </div>
        </div>
      </div>

      {/* 3. 主导航栏 - 蓝色背景 */}
      <nav className="main-nav-bar">
        <div className="container nav-container">
          <Link to="/" className="nav-item">首页</Link>

          <div className="nav-item-group">
            <Link to="/search" className="nav-item">车票 <span className="arrow">⌄</span></Link>
            {/* 这里可以做下拉菜单，暂时省略 */}
          </div>

          <div className="nav-item-group">
            <div className="nav-item">团购服务 <span className="arrow">⌄</span></div>
          </div>

          <div className="nav-item-group">
            <div className="nav-item">会员服务 <span className="arrow">⌄</span></div>
          </div>

          <div className="nav-item-group">
            <div className="nav-item">站车服务 <span className="arrow">⌄</span></div>
          </div>

          <div className="nav-item-group">
            <div className="nav-item">商旅服务 <span className="arrow">⌄</span></div>
          </div>

          <div className="nav-item-group">
            <div className="nav-item">出行指南 <span className="arrow">⌄</span></div>
          </div>

          <div className="nav-item-group">
            <div className="nav-item">信息查询 <span className="arrow">⌄</span></div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header
