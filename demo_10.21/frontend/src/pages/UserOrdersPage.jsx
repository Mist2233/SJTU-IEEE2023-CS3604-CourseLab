import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './UserOrdersPage.css'

const UserOrdersPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')

  // 模拟订单数据
  const mockOrders = [
    {
      id: 'E123456789',
      trainNumber: 'G103',
      date: '2024-01-15',
      departureTime: '06:20',
      arrivalTime: '10:38',
      from: '北京南',
      to: '上海虹桥',
      passengers: [
        { name: '张三', idCard: '110101199001011234', seatType: '二等座', seatNumber: '05车06A' }
      ],
      totalAmount: 553,
      status: 'PAID',
      orderTime: '2024-01-10 14:30:25',
      paymentTime: '2024-01-10 14:32:15'
    },
    {
      id: 'E987654321',
      trainNumber: 'G1',
      date: '2024-01-20',
      departureTime: '07:00',
      arrivalTime: '11:05',
      from: '北京南',
      to: '上海虹桥',
      passengers: [
        { name: '李四', idCard: '110101199002021234', seatType: '一等座', seatNumber: '03车02A' }
      ],
      totalAmount: 933,
      status: 'COMPLETED',
      orderTime: '2024-01-15 09:15:30',
      paymentTime: '2024-01-15 09:17:45'
    }
  ]

  useEffect(() => {
    // 模拟API调用
    setTimeout(() => {
      setOrders(mockOrders)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true
    if (activeTab === 'unpaid') return order.status === 'PENDING_PAYMENT'
    if (activeTab === 'upcoming') return order.status === 'PAID'
    if (activeTab === 'completed') return order.status === 'COMPLETED'
    return true
  })

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING_PAYMENT': '待支付',
      'PAID': '未出行',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    const classMap = {
      'PENDING_PAYMENT': 'status-pending',
      'PAID': 'status-paid',
      'COMPLETED': 'status-completed',
      'CANCELLED': 'status-cancelled'
    }
    return classMap[status] || ''
  }

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading-container">
          <p>正在加载订单信息</p>
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page">
      {/* 页面头部 */}
      <div className="orders-header">
        <div className="header-content">
          <h1>我的订单</h1>
        </div>
      </div>

      {/* 订单筛选标签 */}
      <div className="orders-tabs">
        <div className="tabs-container">
          <div className="tabs-buttons">
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              全部订单
            </button>
            <button
              className={`tab-btn ${activeTab === 'unpaid' ? 'active' : ''}`}
              onClick={() => setActiveTab('unpaid')}
            >
              待支付
            </button>
            <button
              className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              未出行
            </button>
            <button
              className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveTab('completed')}
            >
              已完成
            </button>
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="orders-content">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="35" stroke="#e0e0e0" strokeWidth="2" fill="#f9f9f9"/>
                <path d="M25 40h30M40 25v30" stroke="#ccc" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3>暂无订单</h3>
            <p>您还没有相关的订单记录</p>
            <button 
              className="go-booking-btn"
              onClick={() => navigate('/tickets')}
            >
              立即订票
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-number">订单号：{order.id}</span>
                    <span className="order-time">下单时间：{order.orderTime}</span>
                  </div>
                  <div className={`order-status ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>

                <div className="order-body">
                  <div className="train-info">
                    <div className="train-number">{order.trainNumber}</div>
                    <div className="route-info">
                      <div className="station-time">
                        <div className="time">{order.departureTime}</div>
                        <div className="station">{order.from}</div>
                      </div>
                      <div className="route-line">
                        <div className="line"></div>
                        <div className="duration">4小时18分</div>
                      </div>
                      <div className="station-time">
                        <div className="time">{order.arrivalTime}</div>
                        <div className="station">{order.to}</div>
                      </div>
                    </div>
                    <div className="travel-date">{order.date}</div>
                  </div>

                  <div className="passenger-info">
                    <h4>乘车人</h4>
                    {order.passengers.map((passenger, index) => (
                      <div key={index} className="passenger-item">
                        <span className="passenger-name">{passenger.name}</span>
                        <span className="seat-info">{passenger.seatType} {passenger.seatNumber}</span>
                      </div>
                    ))}
                  </div>

                  <div className="amount-info">
                    <div className="amount">¥{order.totalAmount}</div>
                    <div className="amount-label">订单金额</div>
                  </div>
                </div>

                <div className="order-actions">
                  <button 
                    className="action-btn secondary"
                    onClick={() => navigate(`/order-detail/${order.id}`)}
                  >
                    订单详情
                  </button>
                  
                  {order.status === 'PENDING_PAYMENT' && (
                    <>
                      <button 
                        className="action-btn primary"
                        onClick={() => navigate(`/payment/${order.id}`)}
                      >
                        立即支付
                      </button>
                      <button 
                        className="action-btn danger"
                        onClick={() => {
                          if (window.confirm('确定要取消订单吗？')) {
                            // TODO: 实现取消订单逻辑
                          }
                        }}
                      >
                        取消订单
                      </button>
                    </>
                  )}
                  
                  {order.status === 'PAID' && (
                    <button 
                      className="action-btn secondary"
                      onClick={() => {
                        // TODO: 实现退票逻辑
                      }}
                    >
                      申请退票
                    </button>
                  )}
                  
                  {order.status === 'COMPLETED' && (
                    <button 
                      className="action-btn secondary"
                      onClick={() => navigate('/tickets')}
                    >
                      再次购买
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserOrdersPage