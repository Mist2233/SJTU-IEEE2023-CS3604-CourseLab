import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const OrderConfirmationPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: 实现订单详情查询逻辑
    // TODO: 调用订单详情API
    setLoading(false)
    setOrder({
      orderId: orderId,
      status: 'PENDING_PAYMENT',
      trainInfo: {
        trainNumber: 'G1',
        date: '2024-10-20',
        from: '北京南',
        to: '上海虹桥',
        departureTime: '08:00',
        arrivalTime: '12:30'
      },
      passengers: [
        {
          name: '张三',
          idNumber: '110101199001011234',
          seatType: '二等座'
        }
      ],
      totalAmount: 553,
      paymentDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    })
  }, [orderId])

  const handlePayment = () => {
    // TODO: 实现跳转到支付页面
    navigate(`/payment/${orderId}`)
  }

  const handleCancel = async () => {
    // TODO: 实现订单取消逻辑
    // TODO: 调用取消订单API
    // TODO: 确认取消操作
    if (window.confirm('确定要取消订单吗？')) {
      navigate('/my-orders')
    }
  }

  if (loading) {
    return <div className="loading">正在加载订单信息...</div>
  }

  if (!order) {
    return <div className="error">订单不存在</div>
  }

  return (
    <div className="order-confirmation-page">
      <div className="order-header">
        <h2>订单确认</h2>
        <p className="order-id">订单号：{order.orderId}</p>
        <p className="order-status">状态：待支付</p>
      </div>

      <div className="train-details">
        <h3>车次信息</h3>
        <div className="train-info">
          <p>车次：{order.trainInfo.trainNumber}</p>
          <p>日期：{order.trainInfo.date}</p>
          <p>出发：{order.trainInfo.from} {order.trainInfo.departureTime}</p>
          <p>到达：{order.trainInfo.to} {order.trainInfo.arrivalTime}</p>
        </div>
      </div>

      <div className="passenger-details">
        <h3>乘客信息</h3>
        {order.passengers.map((passenger, index) => (
          <div key={index} className="passenger-item">
            <p>姓名：{passenger.name}</p>
            <p>身份证：{passenger.idNumber}</p>
            <p>席别：{passenger.seatType}</p>
          </div>
        ))}
      </div>

      <div className="payment-section">
        <div className="amount-info">
          <h3>支付信息</h3>
          <p className="total-amount">总金额：¥{order.totalAmount}</p>
          <p className="deadline">
            支付截止时间：{new Date(order.paymentDeadline).toLocaleString()}
          </p>
        </div>

        <div className="action-buttons">
          <button
            onClick={handlePayment}
            className="pay-btn"
          >
            立即支付
          </button>
          <button
            onClick={handleCancel}
            className="cancel-btn"
          >
            取消订单
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmationPage