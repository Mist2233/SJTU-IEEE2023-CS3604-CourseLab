import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Carousel } from 'antd'

import './HomePage.css'
import iconBooking from '../../assets/images/booking.png'
import iconLost from '../../assets/images/lost.png'
import iconCar from '../../assets/images/car.png'
import iconDelivery from '../../assets/images/Delivery.png'
import iconStation from '../../assets/images/station.png'
import iconFeature from '../../assets/images/feature.png'
import iconFeedback from '../../assets/images/feedback.png'

export const swapLogic = ({ from, to }) => ({ from: to, to: from })

const HomePage = () => {
  const navigate = useNavigate()

  // 搜索类型: single(单程), round(往返), transfer(中转), refund(退改签)
  const [activeTab, setActiveTab] = useState('single')

  const [searchForm, setSearchForm] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
    isStudent: false,
    isHighSpeed: false
  })

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSearchForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // const handleSwap = () => {
  //   setSearchForm(prev => ({
  //     ...prev,
  //     from: prev.to,
  //     to: prev.from
  //   }))
  // }

  const handleSwap = () => {
    setSearchForm(prev => ({
      ...prev,
      ...swapLogic({ from: prev.from, to: prev.to })
    }))
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // 简单的校验
    if (!searchForm.from || !searchForm.to) return alert("请输入出发地和目的地")
    navigate('/search', { state: searchForm })
  }

  // 新增：底部 Tab 状态
  const [activeFooterTab, setActiveFooterTab] = useState('latest')
  
  // 新增：模拟新闻数据
  const newsData = {
    latest: [
      { title: '关于2025年部分旅客列车时刻调整的公告', date: '2025-11-20' },
      { title: '关于优化铁路车票改签规则的公告', date: '2025-11-18' },
      { title: '铁路旅客禁止、限制携带和托运物品目录', date: '2025-11-15' },
      { title: '关于铁路车票预售期调整的公告', date: '2025-11-10' },
      { title: '中国铁路上海局集团有限公司关于2025年11月21日列车停运公告', date: '2025-11-21' },
      { title: '铁路12306 App 推出“同车接续”功能', date: '2025-11-08' },
      { title: '关于打击倒票、制贩假票的公告', date: '2025-11-05' },
      { title: '多地铁路部门推出“静音车厢”服务', date: '2025-11-01' },
    ]
  }

  // 定义轮播图组数
  const bannerImages = [
    'https://www.12306.cn/index/images/pic/banner10.jpg',
    'https://www.12306.cn/index/images/pic/banner12.jpg',
    'https://www.12306.cn/index/images/pic/banner26.jpg',
    'https://www.12306.cn/index/images/pic/banner0619.jpg',
    'https://www.12306.cn/index/images/pic/banner20200707.jpg',
    'https://www.12306.cn/index/images/pic/banner20201223.jpg',
  ]

  const serviceItems = [
    { title: "重点旅客预约", icon: iconBooking },
    { title: "遗失物品查找", icon: iconLost },
    { title: "约车服务", icon: iconCar },
    { title: "便民托运", icon: iconDelivery },
    { title: "车站引导", icon: iconStation },
    { title: "站车风采", icon: iconFeature },
    { title: "用户反馈", icon: iconFeedback },
  ]

  return (
    <div className="home-page">

      {/* 1. 全屏 Banner 区域 */}
      <div className="hero-section">
        {/* 背景图容器：这里使用一张高铁网络图作为示例，实际需替换为本地图片 */}
        <div className="hero-carousel-wrapper">
          <Carousel autoplay effect="scrollx" dots={false}>
            {bannerImages.map((imgUrl, index) => (
              <div key={index}>
                {/* 每一屏的背景图 */}
                <div
                  className="carousel-bg-item"
                  style={{ backgroundImage: `url(${imgUrl})` }}
                ></div>
              </div>
            ))}
          </Carousel>
        </div>

        <div className="hero-content container">

          {/* 左侧：搜索卡片 */}
          <div className="search-card">
            {/* 卡片顶部的 Tab */}
            <div className="search-card-tabs">
              {['single', 'round', 'transfer', 'refund'].map(type => (
                <div
                  key={type}
                  className={`card-tab ${activeTab === type ? 'active' : ''}`}
                  onClick={() => setActiveTab(type)}
                >
                  {type === 'single' && '单程'}
                  {type === 'round' && '往返'}
                  {type === 'transfer' && '中转换乘'}
                  {type === 'refund' && '退改签'}
                </div>
              ))}
            </div>

            {/* 搜索表单内容 */}
            <form className="search-card-body" onSubmit={handleSearch}>

              {/* 出发地 - 目的地 */}
              <div className="form-line stations-line">
                <div className="input-group">
                  <label>出发地</label>
                  <input
                    type="text"
                    name="from"
                    placeholder="简拼/全拼/汉字"
                    value={searchForm.from}
                    onChange={handleInputChange}
                  />
                  <span className="icon-map">📍</span>
                </div>

                <div className="swap-icon" onClick={handleSwap}>
                  ⇌
                </div>

                <div className="input-group">
                  <label>到达地</label>
                  <input
                    type="text"
                    name="to"
                    placeholder="简拼/全拼/汉字"
                    value={searchForm.to}
                    onChange={handleInputChange}
                  />
                  <span className="icon-map">📍</span>
                </div>
              </div>

              {/* 出发日期 */}
              <div className="form-line date-line">
                <div className="input-group full-width">
                  <label>出发日期</label>
                  <input
                    type="date"
                    name="date"
                    value={searchForm.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* 选项勾选 */}
              <div className="form-line options-line">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isStudent"
                    checked={searchForm.isStudent}
                    onChange={handleInputChange}
                  /> 学生
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isHighSpeed"
                    checked={searchForm.isHighSpeed}
                    onChange={handleInputChange}
                  /> 高铁/动车
                </label>
              </div>

              {/* 查询按钮 */}
              <button type="submit" className="hero-search-btn">
                查 询
              </button>
            </form>
          </div>

          {/* 右侧：透明文字/广告区 (模拟官网右侧的保险广告) */}
          {/* <div className="hero-promo">
            <div className="promo-title">铁路乘意险</div>
            <div className="promo-sub">满满诚意 护佑平安</div>
            <div className="promo-desc">给您贴心的保障</div>
          </div> */}

        </div>
      </div>
      
      {/* 2. 中部服务图标栏 */}
      <div className="service-bar">
        <div className="container service-grid">
          {serviceItems.map((item, index) => (
            <ServiceItem key={index} icon={item.icon} title={item.title} />
          ))}
        </div>
      </div>

      <div className="promo-section container">
        {/* 第一行 */}
        <div className="promo-row">
          <div className="promo-card card-member">
            {/* 如果你有爬下来的图片，用 img 标签替换这里 */}
            {/* <img src={memberImg} className="card-bg-img" /> */}
          </div>
          <div className="promo-card card-food">
          </div>
        </div>
        {/* 第二行 */}
        <div className="promo-row">
          <div className="promo-card card-insurance">
          </div>
          <div className="promo-card card-ticket">
          </div>
        </div>
      </div>

      {/* --- 4. 修改：底部信息区域 (带列表) --- */}
      <div className="info-footer-section">
        <div className="container">
          {/* Tab 头 */}
          <div className="footer-tabs">
            <div
              className={`footer-tab ${activeFooterTab === 'latest' ? 'active' : ''}`}
              onClick={() => setActiveFooterTab('latest')}
            >
              最新发布
            </div>
            <div className="footer-tab">常见问题</div>
            <div className="footer-tab">信用信息</div>
          </div>

          {/* 列表内容 */}
          <div className="footer-content">
            <ul className="news-list">
              {newsData.latest.map((item, index) => (
                <li key={index}>
                  <span className="news-icon">▪</span>
                  <a href="#" className="news-link">{item.title}</a>
                  <span className="news-date">{item.date}</span>
                </li>
              ))}
            </ul>
            <div className="more-link">更多 &gt;</div>
          </div>
        </div>
      </div>

    </div>
  )
}

// 简单的子组件
const ServiceItem = ({ icon, title }) => (
  <div className="service-item">
    <div className="service-icon-circle">
      {/* 关键修改：这里变成了 img 标签 */}
      <img src={icon} alt={title} className="service-img" />
    </div>
    <span className="service-title">{title}</span>
  </div>
)

export default HomePage