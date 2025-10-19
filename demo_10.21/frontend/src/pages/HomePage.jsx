import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './HomePage.css'

const HomePage = () => {
  const navigate = useNavigate()
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
    trainType: 'all'
  })

  const [errors, setErrors] = useState({})

  // 热门路线数据
  const hotRoutes = [
    { from: '北京', to: '上海' },
    { from: '广州', to: '深圳' },
    { from: '北京', to: '广州' },
    { from: '上海', to: '深圳' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSearchForm(prev => ({
      ...prev,
      [name]: value
    }))
    // 清除对应字段的错误信息
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSwapStations = () => {
    setSearchForm(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!searchForm.from.trim()) {
      newErrors.from = '请填写出发地'
    }
    
    if (!searchForm.to.trim()) {
      newErrors.to = '请填写目的地'
    }
    
    if (!searchForm.date) {
      newErrors.date = '请选择出发日期'
    } else {
      const selectedDate = new Date(searchForm.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.date = '出发日期不能是过去的日期'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSearch = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      navigate('/search-results', { state: searchForm })
    }
  }

  const handleHotRouteClick = (route) => {
    setSearchForm(prev => ({
      ...prev,
      from: route.from,
      to: route.to
    }))
  }

  return (
    <div className="home-page">
      {/* 主横幅区域 */}
      <div className="hero-banner">
        <div className="banner-content">
          <div className="search-container">
            <div className="search-tabs">
              <div className="tab active">
                <span className="tab-icon">🚄</span>
                <span>车票预订</span>
              </div>
              <div className="tab">
                <span className="tab-icon">✈️</span>
                <span>机票预订</span>
              </div>
              <div className="tab">
                <span className="tab-icon">🏨</span>
                <span>酒店预订</span>
              </div>
            </div>

            <div className="search-header">
              <h2>火车票查询</h2>
            </div>
            
            <form onSubmit={handleSearch} className="search-form" role="form">
              <div className="form-row">
                <div className="station-group">
                  <div className="form-group">
                    <label htmlFor="from">出发地</label>
                    <input
                      type="text"
                      id="from"
                      name="from"
                      value={searchForm.from}
                      onChange={handleInputChange}
                      placeholder="请输入出发城市"
                      className="station-input"
                      required
                    />
                    {errors.from && <div className="error-message">{errors.from}</div>}
                  </div>
                  
                  <button 
                    type="button" 
                    className="swap-btn"
                    onClick={handleSwapStations}
                    title="交换出发地和目的地"
                    aria-label="互换"
                  >
                    ⇄
                  </button>
                  
                  <div className="form-group">
                    <label htmlFor="to">目的地</label>
                    <input
                      type="text"
                      id="to"
                      name="to"
                      value={searchForm.to}
                      onChange={handleInputChange}
                      placeholder="请输入到达城市"
                      className="station-input"
                      required
                    />
                    {errors.to && <div className="error-message">{errors.to}</div>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="date">出发日期</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={searchForm.date}
                    onChange={handleInputChange}
                    className="date-input"
                    required
                  />
                  {errors.date && <div className="error-message">{errors.date}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="trainType">车次类型</label>
                  <select
                    id="trainType"
                    name="trainType"
                    value={searchForm.trainType}
                    onChange={handleInputChange}
                    className="type-select"
                  >
                    <option value="all">全部</option>
                    <option value="G">高速动车(G)</option>
                    <option value="D">动车(D)</option>
                    <option value="C">城际(C)</option>
                    <option value="T">特快(T)</option>
                    <option value="K">快速(K)</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" className="search-btn">
                查询
              </button>
            </form>

            {/* 热门路线推荐 */}
            <div className="hot-routes">
              <h3>热门路线</h3>
              <div className="routes-list">
                {hotRoutes.map((route, index) => (
                  <div 
                    key={index} 
                    className="route-item"
                    onClick={() => handleHotRouteClick(route)}
                  >
                    {route.from} → {route.to}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧广告区域 */}
          <div className="banner-ad">
            <div className="ad-content">
              <div className="insurance-ad">
                <div className="insurance-logo">🛡️</div>
                <div className="insurance-text">
                  <h3>铁路乘意险</h3>
                  <p>满满诚意 护佑平安</p>
                  <p>给旅途安心的保障</p>
                </div>
              </div>
              <div className="train-image">
                <div className="train-graphic">🚄</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能导航区域 */}
      <div className="feature-nav">
        <div className="nav-container">
          <div className="nav-item">
            <div className="nav-icon">🎫</div>
            <span>新版售票</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">📱</div>
            <span>候补购票</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">🚗</div>
            <span>约车服务</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">🎯</div>
            <span>车站引导</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">🎪</div>
            <span>遗失物品</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">💰</div>
            <span>积分商城</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">🏢</div>
            <span>铁路e卡</span>
          </div>
          <div className="nav-item">
            <div className="nav-icon">👥</div>
            <span>用户中心</span>
          </div>
        </div>
      </div>

      {/* 底部信息区域 */}
      <div className="info-section">
        <div className="info-container">
          <div className="info-item">
            <h4>购票说明</h4>
            <ul>
              <li>• 车票预售期为15天</li>
              <li>• 开车前25分钟停止售票</li>
              <li>• 网上购票需要实名制</li>
            </ul>
          </div>
          <div className="info-item">
            <h4>退改签规则</h4>
            <ul>
              <li>• 开车前8天以上退票免费</li>
              <li>• 48小时以上按票价5%计</li>
              <li>• 24小时以上按票价10%计</li>
            </ul>
          </div>
          <div className="info-item">
            <h4>客服热线</h4>
            <ul>
              <li>• 全国统一客服热线：12306</li>
              <li>• 服务时间：6:00-23:00</li>
              <li>• 人工服务：7:00-19:00</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage