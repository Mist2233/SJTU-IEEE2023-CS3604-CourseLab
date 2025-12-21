import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserOrders, cancelOrder, refundOrder } from '../../services/api'
import './UserOrdersPage.css'

const UserOrdersPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [confirmModal, setConfirmModal] = useState({ visible: false, type: '', orderId: '', submitting: false, error: '' })

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userRaw = localStorage.getItem('user')
        const user = userRaw ? JSON.parse(userRaw) : null
        const userId = user?.id || user?.userId || user?.user_id
        if (!userId) {
          setOrders([])
          setLoading(false)
          return
        }
        const res = await getUserOrders(userId)
        const list = res?.data?.orders || []
        // 映射为界面展示所需字段
        const mapped = list
          .filter(o => o.status !== 'CANCELLED')
          .map(o => ({
            id: o.orderId,
            trainNumber: o.trainNumber,
            date: o.date,
            from: o.from,
            to: o.to,
            departureTime: o.departureTime || '',
            arrivalTime: o.arrivalTime || '',
            passengers: (o.ticketInfo?.passengers && o.status === 'PAID' ? o.ticketInfo.passengers : (o.passengers || [])).map(p => ({
              name: p.name,
              seatType: p.seatType,
              seatNumber: ''
            })),
            totalAmount: o.totalAmount,
            status: o.status,
            orderTime: o.createdAt,
            paymentTime: o.paidAt || ''
          }))
        setOrders(mapped)
      } catch (e) {
        setOrders([])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return order.status !== 'CANCELLED'
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
    <div className="orders-inner">
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
              onClick={() => navigate('/search')}
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
                        <div className="duration">{order.departureTime && order.arrivalTime ? '' : ''}</div>
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
                    onClick={() => { const el = document.getElementById(`detail-${order.id}`); if (el) el.classList.toggle('open'); }}
                  >
                    展开详情
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
                        onClick={() => setConfirmModal({ visible: true, type: 'cancel', orderId: order.id, submitting: false, error: '' })}
                      >
                        取消订单
                      </button>
                    </>
                  )}
                  
                  {order.status === 'PAID' && (
                    <>
                      <button className="action-btn disabled" disabled>已支付</button>
                      <button 
                        className="action-btn secondary"
                        onClick={() => setConfirmModal({ visible: true, type: 'refund', orderId: order.id, submitting: false, error: '' })}
                      >
                        申请退票
                      </button>
                    </>
                  )}
                  
                  {order.status === 'COMPLETED' && (
                    <button 
                      className="action-btn secondary"
                      onClick={() => navigate('/search')}
                    >
                      再次购买
                    </button>
                  )}
                </div>
                <div id={`detail-${order.id}`} className="order-detail-collapsible">
                  <div className="passenger-info">
                    <h4>乘车人</h4>
                    {order.passengers.map((passenger, index) => (
                      <div key={index} className="passenger-item">
                        <span className="passenger-name">{passenger.name}</span>
                        <span className="seat-info">{passenger.seatType} {passenger.seatNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {confirmModal.visible && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-title">{confirmModal.type === 'cancel' ? '取消订单' : '申请退票'}</div>
            <div className="modal-content">
              {confirmModal.type === 'cancel' ? '确定要取消该订单吗？取消后不可恢复。' : '确定要为该已支付订单申请退票吗？退票后将恢复余票。'}
              {confirmModal.error && <div className="modal-error">{confirmModal.error}</div>}
            </div>
            <div className="modal-actions">
              <button className="modal-btn" onClick={() => setConfirmModal({ visible: false, type: '', orderId: '', submitting: false, error: '' })}>再想想</button>
              <button 
                className="modal-btn primary" 
                disabled={confirmModal.submitting}
                onClick={async () => {
                  try {
                    setConfirmModal({ ...confirmModal, submitting: true, error: '' })
                    if (confirmModal.type === 'cancel') {
                      await cancelOrder(confirmModal.orderId)
                    } else {
                      await refundOrder(confirmModal.orderId)
                    }
                    window.location.reload()
                  } catch (e) {
                    setConfirmModal({ ...confirmModal, submitting: false, error: (e?.message || '操作失败') })
                  }
                }}
              >
                {confirmModal.submitting ? '处理中…' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserOrdersPage
