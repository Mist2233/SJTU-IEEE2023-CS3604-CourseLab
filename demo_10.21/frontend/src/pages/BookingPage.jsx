import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const BookingPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { train, searchParams } = location.state || {}
  
  const [passengers, setPassengers] = useState([
    {
      name: '',
      idNumber: '',
      seatType: 'second'
    }
  ])

  const handlePassengerChange = (index, field, value) => {
    // TODO: 实现乘客信息修改逻辑
    const updatedPassengers = [...passengers]
    updatedPassengers[index][field] = value
    setPassengers(updatedPassengers)
  }

  const addPassenger = () => {
    // TODO: 实现添加乘客逻辑
    setPassengers([...passengers, {
      name: '',
      idNumber: '',
      seatType: 'second'
    }])
  }

  const removePassenger = (index) => {
    // TODO: 实现删除乘客逻辑
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async () => {
    // TODO: 实现订单提交逻辑
    // TODO: 验证乘客信息
    // TODO: 调用创建订单API
    // TODO: 跳转到订单确认页
    const orderId = 'ORDER_' + Date.now()
    navigate(`/order-confirmation/${orderId}`)
  }

  return (
    <div className="booking-page">
      <div className="train-summary">
        <h2>车次信息</h2>
        {/* TODO: 显示选中的车次信息 */}
        <div className="train-info">
          <p>车次：{train?.trainNumber || 'G1'}</p>
          <p>出发：{searchParams?.from || '北京南'} {train?.departureTime || '08:00'}</p>
          <p>到达：{searchParams?.to || '上海虹桥'} {train?.arrivalTime || '12:30'}</p>
          <p>日期：{searchParams?.date || '2024-10-20'}</p>
        </div>
      </div>

      <div className="passenger-section">
        <h2>乘客信息</h2>
        {passengers.map((passenger, index) => (
          <div key={index} className="passenger-form">
            <h3>乘客 {index + 1}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>姓名</label>
                <input
                  type="text"
                  value={passenger.name}
                  onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                  placeholder="请输入乘客姓名"
                  required
                />
              </div>

              <div className="form-group">
                <label>身份证号</label>
                <input
                  type="text"
                  value={passenger.idNumber}
                  onChange={(e) => handlePassengerChange(index, 'idNumber', e.target.value)}
                  placeholder="请输入身份证号"
                  required
                />
              </div>

              <div className="form-group">
                <label>席别</label>
                <select
                  value={passenger.seatType}
                  onChange={(e) => handlePassengerChange(index, 'seatType', e.target.value)}
                >
                  <option value="second">二等座</option>
                  <option value="first">一等座</option>
                  <option value="business">商务座</option>
                </select>
              </div>

              {passengers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePassenger(index)}
                  className="remove-passenger-btn"
                >
                  删除
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addPassenger}
          className="add-passenger-btn"
        >
          添加乘客
        </button>
      </div>

      <div className="booking-summary">
        <div className="total-price">
          {/* TODO: 计算总价 */}
          <p>总价：¥553</p>
        </div>
        
        <button
          onClick={handleSubmit}
          className="submit-order-btn"
        >
          提交订单
        </button>
      </div>
    </div>
  )
}

export default BookingPage