import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Tickets.css';

const TicketsPage = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    departDate: '',
    returnDate: '',
    isRoundTrip: false,
    isStudent: false
  });

  const [activeTab, setActiveTab] = useState('单程');

  const handleInputChange = (field, value) => {
    setSearchForm({
      ...searchForm,
      [field]: value
    });
  };

  const handleSwapStations = () => {
    setSearchForm({
      ...searchForm,
      from: searchForm.to,
      to: searchForm.from
    });
  };

  const handleSearch = () => {
    if (!searchForm.from || !searchForm.to || !searchForm.departDate) {
      alert('请填写完整的出发地、目的地和出发日期');
      return;
    }

    // 导航到搜索结果页面
    navigate('/search-results', {
      state: {
        from: searchForm.from,
        to: searchForm.to,
        date: searchForm.departDate,
        returnDate: searchForm.returnDate,
        isRoundTrip: searchForm.isRoundTrip,
        isStudent: searchForm.isStudent
      }
    });
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const dayName = dayNames[date.getDay()];
      const monthDay = `${date.getMonth() + 1}-${date.getDate()}`;
      
      dates.push({
        value: dateStr,
        label: i === 0 ? '今天' : i === 1 ? '明天' : `${monthDay} ${dayName}`,
        fullDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      });
    }
    
    return dates;
  };

  const popularRoutes = [
    { from: '北京', to: '上海' },
    { from: '北京', to: '广州' },
    { from: '上海', to: '深圳' },
    { from: '北京', to: '深圳' },
    { from: '上海', to: '广州' },
    { from: '北京', to: '杭州' },
    { from: '上海', to: '南京' },
    { from: '北京', to: '天津' }
  ];

  return (
    <div className="tickets-page">
      {/* 主要搜索区域 */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-header">
            <div className="trip-tabs">
              <button 
                className={`tab ${activeTab === '单程' ? 'active' : ''}`}
                onClick={() => setActiveTab('单程')}
              >
                单程
              </button>
              <button 
                className={`tab ${activeTab === '往返' ? 'active' : ''}`}
                onClick={() => setActiveTab('往返')}
              >
                往返
              </button>
            </div>
          </div>

          <div className="search-form">
            <div className="form-row">
              <div className="input-group">
                <label>出发地</label>
                <input
                  type="text"
                  value={searchForm.from}
                  onChange={(e) => handleInputChange('from', e.target.value)}
                  placeholder="北京"
                  className="station-input"
                />
              </div>

              <button className="swap-button" onClick={handleSwapStations}>
                <span className="swap-icon">⇄</span>
              </button>

              <div className="input-group">
                <label>目的地</label>
                <input
                  type="text"
                  value={searchForm.to}
                  onChange={(e) => handleInputChange('to', e.target.value)}
                  placeholder="上海"
                  className="station-input"
                />
              </div>

              <div className="input-group">
                <label>出发日</label>
                <input
                  type="date"
                  value={searchForm.departDate}
                  onChange={(e) => handleInputChange('departDate', e.target.value)}
                  min={getCurrentDate()}
                  className="date-input"
                />
              </div>

              {activeTab === '往返' && (
                <div className="input-group">
                  <label>返程日</label>
                  <input
                    type="date"
                    value={searchForm.returnDate}
                    onChange={(e) => handleInputChange('returnDate', e.target.value)}
                    min={searchForm.departDate || getCurrentDate()}
                    className="date-input"
                  />
                </div>
              )}

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={searchForm.isStudent}
                    onChange={(e) => handleInputChange('isStudent', e.target.checked)}
                  />
                  学生
                </label>
              </div>

              <button className="search-button" onClick={handleSearch}>
                查询
              </button>
            </div>
          </div>

          {/* 日期快选 */}
          <div className="date-quick-select">
            <div className="date-options">
              {getDateOptions().slice(0, 7).map((date, index) => (
                <button
                  key={index}
                  className={`date-option ${searchForm.departDate === date.fullDate ? 'active' : ''}`}
                  onClick={() => handleInputChange('departDate', date.fullDate)}
                >
                  <span className="date-label">{date.label}</span>
                  <span className="date-value">{date.fullDate.split('-').slice(1).join('-')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 热门路线 */}
      <div className="popular-routes-section">
        <div className="container">
          <h3>热门路线</h3>
          <div className="routes-grid">
            {popularRoutes.map((route, index) => (
              <button
                key={index}
                className="route-item"
                onClick={() => {
                  setSearchForm({
                    ...searchForm,
                    from: route.from,
                    to: route.to
                  });
                }}
              >
                <span className="route-from">{route.from}</span>
                <span className="route-arrow">→</span>
                <span className="route-to">{route.to}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 服务信息 */}
      <div className="service-info-section">
        <div className="container">
          <div className="service-grid">
            <div className="service-item">
              <div className="service-icon">🎫</div>
              <h4>便捷购票</h4>
              <p>支持多种支付方式，购票更便捷</p>
            </div>
            <div className="service-item">
              <div className="service-icon">📱</div>
              <h4>电子客票</h4>
              <p>无需取票，刷身份证直接进站</p>
            </div>
            <div className="service-item">
              <div className="service-icon">🔄</div>
              <h4>改签退票</h4>
              <p>支持在线改签退票，操作简单</p>
            </div>
            <div className="service-item">
              <div className="service-icon">🚄</div>
              <h4>实时信息</h4>
              <p>提供列车实时运行信息</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketsPage;