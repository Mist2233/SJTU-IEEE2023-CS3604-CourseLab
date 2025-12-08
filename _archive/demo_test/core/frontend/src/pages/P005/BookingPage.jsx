import React, { useState, useMemo, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { createOrder } from '../../services/api'
import api from '../../services/api'
import './BookingPage.css'

const BookingPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { train, searchParams, searchConditions } = location.state || {}
  const sp = searchParams || searchConditions
  
  const [passengers, setPassengers] = useState([
    { name: '', idNumber: '', seatType: 'second' }
  ])
  const [savedPassengers, setSavedPassengers] = useState([])
  const [selectedSavedIds, setSelectedSavedIds] = useState([])
  const [errorModal, setErrorModal] = useState('')

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get('/passengers')
        const data = res?.data?.passengers || []
        setSavedPassengers(data)
      } catch (_) {}
    }
    fetchSaved()
  }, [])

  useEffect(() => {
    if (selectedSavedIds.length > 0) {
      const selected = savedPassengers.filter(p => selectedSavedIds.includes(p.id))
      const mapped = selected.map(p => ({ name: p.name, idNumber: p.id_number, seatType: 'second' }))
      setPassengers(mapped.length > 0 ? mapped : [{ name: '', idNumber: '', seatType: 'second' }])
    }
  }, [selectedSavedIds, savedPassengers])

  const seatOptions = useMemo(() => {
    const seats = train?.seats || {}
    return [
      { key: 'secondClass', label: '二等座', value: 'second', price: seats?.secondClass?.price ?? 553, available: seats?.secondClass?.available ?? 0 },
      { key: 'firstClass', label: '一等座', value: 'first', price: seats?.firstClass?.price ?? 933, available: seats?.firstClass?.available ?? 0 },
      { key: 'businessClass', label: '商务座', value: 'business', price: seats?.businessClass?.price ?? 1748, available: seats?.businessClass?.available ?? 0 }
    ]
  }, [train])

  const totalPrice = useMemo(() => {
    return passengers.reduce((sum, p) => {
      const opt = seatOptions.find(s => s.value === p.seatType)
      return sum + (opt?.price || 0)
    }, 0)
  }, [passengers, seatOptions])

  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers]
    updatedPassengers[index][field] = value
    setPassengers(updatedPassengers)
  }

  const addPassenger = () => {
    setPassengers([...passengers, { name: '', idNumber: '', seatType: 'second' }])
  }

  const removePassenger = (index) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async () => {
    for (const p of passengers) {
      if (!p.name || !p.idNumber || !p.seatType) {
        setErrorModal('请完整填写乘客信息')
        return
      }
      const idPattern = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/
      if (!idPattern.test(p.idNumber)) {
        setErrorModal('身份证号格式不正确')
        return
      }
    }

    const payload = {
      trainNumber: train?.trainNumber || 'G1',
      date: sp?.date || '2024-10-20',
      from: sp?.from || '北京南',
      to: sp?.to || '上海虹桥',
      passengers
    }

    try {
      const res = await createOrder(payload)
      if (res?.success) {
        navigate('/my-orders')
      } else {
        setErrorModal(res?.message || '创建订单失败')
      }
    } catch (e) {
      setErrorModal(e?.message || '创建订单失败')
    }
  }

  const toggleSaved = (id, checked) => {
    setSelectedSavedIds(prev => {
      const set = new Set(prev)
      if (checked) set.add(id); else set.delete(id)
      return Array.from(set)
    })
  }

  const maskId = (v) => {
    if (!v) return ''
    return v.replace(/^(\w{3})\w+(\w{3})$/, '$1**********$2')
  }

  return (
    <div className="booking-page">
      <div className="train-summary">
        <div className="summary-top">
          <div className="date">{sp?.date || '2024-10-20'}</div>
          <div className="train">{train?.trainNumber || 'G1'}次 {sp?.from || '北京南站'}（{train?.departureTime || '08:00'}开）→ {sp?.to || '上海虹桥'}（{train?.arrivalTime || '12:30'}到）</div>
        </div>
        <div className="seat-stats">
          {seatOptions.map(opt => (
            <div key={opt.key} className={`seat-stat ${opt.available > 0 ? 'available' : 'none'}`}>
              <span className="seat-name">{opt.label}</span>
              <span className="seat-price">¥{opt.price}</span>
              <span className="seat-available">{opt.available > 0 ? `${opt.available}张` : '无票'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="passenger-section">
        <div className="section-title">乘客信息</div>

        {/* 已保存乘车人选择栏 */}
        <div className="saved-select-bar">
          <div style={{ fontWeight: 600, color: '#004499' }}>选择常用乘车人</div>
          <div className="saved-list">
            {savedPassengers.length === 0 ? (
              <div style={{ color:'#666' }}>暂无常用乘车人，您可以在“个人中心-常用乘车人管理”添加。</div>
            ) : (
              savedPassengers.map(p => (
                <label key={p.id} className="saved-item">
                  <input type="checkbox" checked={selectedSavedIds.includes(p.id)} onChange={(e) => toggleSaved(p.id, e.target.checked)} />
                  <span>{p.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {passengers.map((passenger, index) => (
          <div key={index} className="passenger-form">
            <div className="form-row">
              <div className="form-group narrow">
                <label>票种</label>
                <select className="ticket-type-select" disabled value="adult">
                  <option value="adult">成人票</option>
                </select>
              </div>
              <div className="form-group narrow">
                <label>席别</label>
                <select className="seat-select"
                  value={passenger.seatType}
                  onChange={(e) => handlePassengerChange(index, 'seatType', e.target.value)}
                >
                  {seatOptions.map(opt => (
                    <option key={opt.key} value={opt.value} disabled={opt.available <= 0}>
                      {opt.label}（¥{opt.price}）{opt.available <= 0 ? ' - 无票' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group large">
                <label>姓名</label>
                <input type="text" value={passenger.name} onChange={(e) => handlePassengerChange(index, 'name', e.target.value)} placeholder="请输入乘客姓名" required />
              </div>
              <div className="form-group large">
                <label>证件类型</label>
                <select disabled value="idcard">
                  <option value="idcard">居民身份证</option>
                </select>
              </div>
              <div className="form-group xlarge">
                <label>证件号码</label>
                <input type="text" value={passenger.idNumber} onChange={(e) => handlePassengerChange(index, 'idNumber', e.target.value)} placeholder="请输入身份证号" required />
              </div>
              {passengers.length > 1 && (
                <button type="button" onClick={() => removePassenger(index)} className="remove-passenger-btn">删除</button>
              )}
            </div>
          </div>
        ))}
        <div className="actions-row">
          <button type="button" onClick={addPassenger} className="add-passenger-btn">添加乘客</button>
        </div>
        <div className="tips-box">
          <div className="tips-title">温馨提示：</div>
          <ul>
            <li>实名制购票请填写乘车人真实姓名与身份证号。</li>
            <li>席别按余票情况选择，无票席别不可选。</li>
          </ul>
        </div>
      </div>

      <div className="booking-summary">
        <div className="total-price">总价：¥{totalPrice}</div>
        <div className="summary-actions">
          <button onClick={() => navigate(-1)} className="secondary-btn">上一步</button>
          <button onClick={handleSubmit} className="submit-order-btn">提交订单</button>
        </div>
      </div>
      {errorModal && (
        <div className="booking-modal-overlay" onClick={() => setErrorModal('')}>
          <div className="booking-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="booking-modal-title">提交失败</div>
            <div className="booking-modal-content">{errorModal}</div>
            <div className="booking-modal-actions">
              <button className="secondary-btn" onClick={() => setErrorModal('')}>我知道了</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingPage
