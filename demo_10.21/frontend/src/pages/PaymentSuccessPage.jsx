import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const PaymentSuccessPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    // TODO: 实现支付成功后的处理逻辑
    // TODO: 更新订单状态
    // TODO: 发送支付成功通知
  }, [orderId])

  const handleViewOrder = () => {
    // TODO: 跳转到订单详情页
    navigate('/my-orders')
  }

  const handleBackHome = () => {
    navigate('/')
  }

  return (
    <div className="payment-success-page">
      <div className="success-container">
        <div className="success-icon">
          ✓
        </div>
        
        <h2>支付成功</h2>
        
        <div className="success-info">
          <p>订单号：{orderId}</p>
          <p>支付金额：¥553</p>
          <p>支付时间：{new Date().toLocaleString()}</p>
        </div>

        <div className="success-message">
          <p>恭喜您，订单支付成功！</p>
          <p>电子票已生成，请在我的订单中查看。</p>
        </div>

        <div className="action-buttons">
          <button
            onClick={handleViewOrder}
            className="view-order-btn"
          >
            查看订单
          </button>
          <button
            onClick={handleBackHome}
            className="back-home-btn"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessPage