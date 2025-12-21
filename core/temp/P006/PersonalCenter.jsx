import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import PersonalInfoPage from './PersonalInfoPage'
import PassengersPage from './PassengersPage'
import UserOrdersPage from './UserOrdersPage'
import './PersonalCenter.css'

const tabs = [
  { key: 'info', label: '个人信息管理' },
  { key: 'passengers', label: '常用乘车人管理' },
  { key: 'orders', label: '订单管理' }
]

const PersonalCenter = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [active, setActive] = useState('info')

  useEffect(() => {
    const hash = location.hash.replace('#','')
    if (tabs.some(t => t.key === hash)) setActive(hash)
  }, [location])

  const renderPage = () => {
    if (active === 'info') return <PersonalInfoPage />
    if (active === 'passengers') return <PassengersPage />
    return <UserOrdersPage />
  }

  return (
    <div className="pc-page">
      <div className="pc-container">
        <div className="pc-sidebar">
          <div className="pc-sidebar-title">个人中心</div>
          <ul className="pc-nav-list">
            {tabs.map(t => (
              <li key={t.key} className={`pc-nav-item ${active === t.key ? 'active' : ''}`} onClick={() => { setActive(t.key); navigate(`/my#${t.key}`) }}>{t.label}</li>
            ))}
          </ul>
        </div>
        <div className="pc-content">
          {renderPage()}
        </div>
      </div>
    </div>
  )
}

export default PersonalCenter
