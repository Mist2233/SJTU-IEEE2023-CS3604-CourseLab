import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const PaymentPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('alipay')
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)
    try {
      // TODO: 实现支付发起逻辑
      // TODO: 调用支付API
      // TODO: 处理支付结果
      
      // 模拟支付成功
      setTimeout(() => {
        navigate(`/payment-success/${orderId}`)
      }, 2000)
    } catch (error) {
      // TODO: 处理支付失败
      setLoading(false)
    }
  }

  return (
    <div className="payment-page">
      <div className="payment-header">
        <h2>订单支付</h2>
        <p className="order-id">订单号：{orderId}</p>
      </div>

      <div className="payment-amount">
        <h3>支付金额</h3>
        <p className="amount">¥553</p>
      </div>

      <div className="payment-methods">
        <h3>支付方式</h3>
        <div className="method-options">
          <label className="method-option">
            <input
              type="radio"
              name="paymentMethod"
              value="alipay"
              checked={paymentMethod === 'alipay'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>支付宝</span>
          </label>

          <label className="method-option">
            <input
              type="radio"
              name="paymentMethod"
              value="wechat"
              checked={paymentMethod === 'wechat'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span>微信支付</span>
          </label>
        </div>
      </div>

      <div className="payment-action">
        <button
          onClick={handlePayment}
          disabled={loading}
          className="pay-now-btn"
        >
          {loading ? '正在处理...' : '立即支付'}
        </button>
      </div>

      {paymentInfo && (
        <div className="payment-qr">
          {/* TODO: 显示支付二维码或跳转链接 */}
          <p>请使用{paymentMethod === 'alipay' ? '支付宝' : '微信'}扫码支付</p>
        </div>
      )}
    </div>
  )
}

export default PaymentPage