import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const UserOrdersPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    // TODO: 实现用户订单查询逻辑
    // TODO: 调用用户订单API
    // TODO: 处理加载状态
    setLoading(false)
    setOrders([]) // 暂时返回空数组
  }, [filter])

  const handleOrderDetail = (orderId) => {
    // TODO: 跳转到订单详情页
    navigate(`/order-confirmation/${orderId}`)
  }

  const handleCancelOrder = async (orderId) => {
    // TODO: 实现订单取消逻辑
    if (window.confirm('确定要取消订单吗？')) {
      // TODO: 调用取消订单API
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING_PAYMENT': '待支付',
      'PAID': '已支付',
      'CANCELLED': '已取消',
      'COMPLETED': '已完成'
    }
    return statusMap[status] || status
  }

  if (loading) {
    return <div className="loading">正在加载订单信息...</div>
  }

  return (
    <div className="user-orders-page">
      <div className="orders-header">
        <h2>我的订单</h2>
        
        <div className="filter-tabs">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button
            className={filter === 'PENDING_PAYMENT' ? 'active' : ''}
            onClick={() => setFilter('PENDING_PAYMENT')}
          >
            待支付
          </button>
          <button
            className={filter === 'PAID' ? 'active' : ''}
            onClick={() => setFilter('PAID')}
          >
            已支付
          </button>
          <button
            className={filter === 'COMPLETED' ? 'active' : ''}
            onClick={() => setFilter('COMPLETED')}
          >
            已完成
          </button>
        </div>
      </div>

      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>暂无订单记录</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className="order-item">
              <div className="order-header">
                <span className="order-id">订单号：{order.orderId}</span>
                <span className={`order-status ${order.status.toLowerCase()}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="order-content">
                <div className="train-info">
                  <h4>{order.trainInfo.trainNumber}</h4>
                  <p>
                    {order.trainInfo.from} → {order.trainInfo.to}
                  </p>
                  <p>{order.trainInfo.date}</p>
                </div>

                <div className="passenger-info">
                  <p>乘客：{order.passengers.map(p => p.name).join('、')}</p>
                </div>

                <div className="amount-info">
                  <p className="amount">¥{order.totalAmount}</p>
                </div>
              </div>

              <div className="order-actions">
                <button
                  onClick={() => handleOrderDetail(order.orderId)}
                  className="detail-btn"
                >
                  查看详情
                </button>
                
                {order.status === 'PENDING_PAYMENT' && (
                  <>
                    <button
                      onClick={() => navigate(`/payment/${order.orderId}`)}
                      className="pay-btn"
                    >
                      立即支付
                    </button>
                    <button
                      onClick={() => handleCancelOrder(order.orderId)}
                      className="cancel-btn"
                    >
                      取消订单
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default UserOrdersPage