import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Header.css'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // 检查本地存储中的用户信息
    const checkUserStatus = () => {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      if (token && userData) {
        setUser(JSON.parse(userData))
      } else {
        setUser(null)
      }
    }

    // 初始检查
    checkUserStatus()

    // 监听存储变化（用于多标签页同步）
    window.addEventListener('storage', checkUserStatus)
    
    // 监听自定义登录事件（用于同标签页内的状态更新）
    window.addEventListener('userLoginStatusChanged', checkUserStatus)

    // 更新时间
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
    
    // 触发自定义事件，确保状态同步
    window.dispatchEvent(new CustomEvent('userLoginStatusChanged'))
    
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

  // 生成面包屑导航
  const generateBreadcrumb = () => {
    const pathMap = {
      '/': { name: '首页', path: '/' },
      '/tickets': { name: '车票预订', path: '/tickets' },
      '/my-orders': { name: '我的订单', path: '/my-orders' },
      '/login': { name: '登录', path: '/login' },
      '/register': { name: '注册', path: '/register' },
      '/timetable': { name: '时刻表', path: '/timetable' },
      '/info': { name: '出行指南', path: '/info' },
      '/service': { name: '客运服务', path: '/service' },
      '/freight': { name: '货运服务', path: '/freight' },
      '/corporate': { name: '企业服务', path: '/corporate' },
      '/profile': { name: '个人中心', path: '/profile' }
    }

    const currentPath = location.pathname
    const breadcrumbs = [{ name: '首页', path: '/' }]

    if (currentPath !== '/') {
      const currentPage = pathMap[currentPath]
      if (currentPage) {
        // 对于某些页面，添加中间层级
        if (currentPath === '/my-orders') {
          breadcrumbs.push({ name: '车票预订', path: '/tickets' })
        }
        breadcrumbs.push(currentPage)
      }
    }

    return breadcrumbs
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
              <div className="nav-icon">🏠</div>
              <span>首页</span>
            </Link>
            <Link to="/tickets" className="nav-link">
              <div className="nav-icon">🎫</div>
              <span>车票预订</span>
            </Link>
            <Link to="/timetable" className="nav-link">
              <div className="nav-icon">🕐</div>
              <span>时刻表</span>
            </Link>
            <Link to="/info" className="nav-link">
              <div className="nav-icon">📋</div>
              <span>出行指南</span>
            </Link>
            <Link to="/service" className="nav-link">
              <div className="nav-icon">🚇</div>
              <span>客运服务</span>
            </Link>
            <Link to="/freight" className="nav-link">
              <div className="nav-icon">📦</div>
              <span>货运服务</span>
            </Link>
            <Link to="/corporate" className="nav-link">
              <div className="nav-icon">🏢</div>
              <span>企业服务</span>
            </Link>
          </nav>
          
          <div className="user-section">
            {user ? (
              <div className="user-logged-in">
                <span className="user-greeting">
                  {user.real_name || user.realName || '用户'}，你好
                </span>
                <button onClick={handleLogout} className="logout-btn">退出</button>
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
            {generateBreadcrumb().map((item, index, array) => (
              <React.Fragment key={item.path}>
                {index === array.length - 1 ? (
                  <span className="breadcrumb-current">{item.name}</span>
                ) : (
                  <>
                    <Link to={item.path} className="breadcrumb-link">{item.name}</Link>
                    <span className="breadcrumb-separator">&gt;</span>
                  </>
                )}
              </React.Fragment>
            ))}
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