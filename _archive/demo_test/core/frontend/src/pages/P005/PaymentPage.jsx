import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getOrderDetails, initiatePayment, handlePaymentCallback } from '../../services/api'
import './PaymentPage.css'

const PaymentPage = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [paymentMethod, setPaymentMethod] = useState('alipay')
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [successModal, setSuccessModal] = useState(false)
  const [failModal, setFailModal] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await getOrderDetails(orderId)
        setOrder(res?.data)
      } catch (e) {
        setOrder(null)
      }
    }
    fetchOrder()
  }, [orderId])

  const handlePayment = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await initiatePayment({ orderId, paymentMethod })
      setPaymentInfo(res?.data)
    } catch (error) {
      setError(error?.message || '生成支付凭据失败')
    } finally {
      setLoading(false)
    }
  }

  const simulateCallback = async (success = true) => {
    if (!paymentInfo?.paymentId || !order) return
    try {
      await handlePaymentCallback({
        paymentId: paymentInfo.paymentId,
        orderId,
        status: success ? 'SUCCESS' : 'FAILED',
        amount: order.totalAmount,
        transactionId: 'TXN_' + Date.now(),
        signature: 'mock_signature'
      })
      if (success) {
        setSuccessModal(true)
        setTimeout(() => navigate('/my#orders'), 1200)
      } else {
        setFailModal(true)
      }
    } catch (e) {}
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <div className="card-header">
          <div className="title">订单支付</div>
          <div className="subtitle">订单号：{orderId}</div>
        </div>
        {error && (<div className="login-error-banner" style={{ margin: '10px 0' }}>{error}</div>)}
        {order && (
          <div className="order-info">
            <div className="route">{order.trainInfo.trainNumber} · {order.trainInfo.from} → {order.trainInfo.to} · {order.trainInfo.date}</div>
            <div className="amount">应付金额 ¥{order.totalAmount}</div>
            <div className="status">当前状态：{order.status === 'PENDING_PAYMENT' ? '待支付' : order.status}</div>
          </div>
        )}
        <div className="method-box">
          <div className="method-title">选择支付方式</div>
          <div className="method-options">
            <label className={`method-option ${paymentMethod === 'alipay' ? 'active' : ''}`}>
              <input type="radio" name="paymentMethod" value="alipay" checked={paymentMethod === 'alipay'} onChange={(e) => setPaymentMethod(e.target.value)} />
              <span>支付宝</span>
            </label>
            <label className={`method-option ${paymentMethod === 'wechat' ? 'active' : ''}`}>
              <input type="radio" name="paymentMethod" value="wechat" checked={paymentMethod === 'wechat'} onChange={(e) => setPaymentMethod(e.target.value)} />
              <span>微信支付</span>
            </label>
          </div>
        </div>
        <div className="actions">
          <button className="primary-btn" onClick={handlePayment} disabled={loading}>{loading ? '正在生成…' : '生成支付凭据'}</button>
          {paymentInfo && (
            <>
              {paymentInfo.qrCode && (
                <div className="qr-box">
                  <img alt="支付二维码" src={paymentInfo.qrCode} />
                  <div className="qr-tip">请使用{paymentMethod === 'alipay' ? '支付宝' : '微信'}扫码支付</div>
                </div>
              )}
              <div className="simulate-box">
                <button className="success-btn" onClick={() => simulateCallback(true)}>模拟支付成功</button>
                <button className="danger-btn" onClick={() => simulateCallback(false)}>模拟支付失败</button>
              </div>
            </>
          )}
        </div>
      </div>
      {successModal && (
        <div className="pay-modal-overlay">
          <div className="pay-modal-card">
            <div className="pay-modal-title success">支付成功</div>
            <div className="pay-modal-content">订单已支付成功，正在返回“我的订单”。</div>
          </div>
        </div>
      )}
      {failModal && (
        <div className="pay-modal-overlay" onClick={() => setFailModal(false)}>
          <div className="pay-modal-card">
            <div className="pay-modal-title danger">支付失败</div>
            <div className="pay-modal-content">支付失败，请重试或更换支付方式。</div>
            <div className="pay-modal-actions">
              <button className="primary-btn" onClick={() => setFailModal(false)}>我知道了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentPage
