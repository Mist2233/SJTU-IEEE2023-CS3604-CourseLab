import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { searchTrains } from '../services/api'

const SearchResultsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [trains, setTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchParams = location.state

  const fetchTrains = async () => {
    if (!searchParams) return
    
    try {
      setLoading(true)
      setError(null)
      const results = await searchTrains(searchParams)
      setTrains(results)
    } catch (err) {
      setError(err.message)
      setTrains([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrains()
  }, [searchParams])

  const handleBooking = (train, seatType = 'secondClass') => {
    navigate('/booking', { 
      state: { 
        train: {
          ...train,
          selectedSeatType: seatType
        },
        searchParams 
      } 
    })
  }

  if (loading) {
    return <div className="loading">正在搜索列车信息...</div>
  }

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h2>
          {searchParams?.from} → {searchParams?.to}
        </h2>
        <p>出发日期：{searchParams?.date}</p>
      </div>

      <div className="train-list" role="list">
        {error ? (
          <div className="error-state">
            <p>搜索失败</p>
            <p>{error}</p>
            <button onClick={fetchTrains}>重新搜索</button>
          </div>
        ) : trains.length === 0 ? (
          <div className="no-results">
            <p>未找到符合条件的列车</p>
            <p>请尝试修改搜索条件</p>
          </div>
        ) : (
          trains.map((train) => (
            <div key={train.trainNumber} className="train-item">
              <div className="train-info">
                <h3>{train.trainNumber}</h3>
                <div className="time-info">
                  <span>{train.departureTime}</span>
                  <span>→</span>
                  <span>{train.arrivalTime}</span>
                </div>
                <div className="duration">
                  {train.duration}
                </div>
                <div className="stations">
                  <span>{train.departureStation}</span>
                  <span>→</span>
                  <span>{train.arrivalStation}</span>
                </div>
              </div>

              <div className="seat-info">
                {train.seats?.businessClass && (
                  <div className="seat-type">
                    <span>商务座</span>
                    <span className="price">¥{train.seats.businessClass.price}</span>
                    <span className="available">
                      {train.seats.businessClass.available > 0 ? `余${train.seats.businessClass.available}张` : '无票'}
                    </span>
                    {train.seats.businessClass.available > 0 && (
                      <button onClick={() => handleBooking(train, 'businessClass')}>预订</button>
                    )}
                  </div>
                )}
                {train.seats?.firstClass && (
                  <div className="seat-type">
                    <span>一等座</span>
                    <span className="price">¥{train.seats.firstClass.price}</span>
                    <span className="available">
                      {train.seats.firstClass.available > 0 ? `余${train.seats.firstClass.available}张` : '无票'}
                    </span>
                    {train.seats.firstClass.available > 0 && (
                      <button onClick={() => handleBooking(train, 'firstClass')}>预订</button>
                    )}
                  </div>
                )}
                {train.seats?.secondClass && (
                  <div className="seat-type">
                    <span>二等座</span>
                    <span className="price">¥{train.seats.secondClass.price}</span>
                    <span className="available">
                      {train.seats.secondClass.available > 0 ? `余${train.seats.secondClass.available}张` : '无票'}
                    </span>
                    {train.seats.secondClass.available > 0 && (
                      <button onClick={() => handleBooking(train, 'secondClass')}>预订</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="actions">
        <button onClick={fetchTrains}>刷新</button>
      </div>
    </div>
  )
}

export default SearchResultsPage