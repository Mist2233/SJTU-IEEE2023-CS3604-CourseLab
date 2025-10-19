import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/SearchResults.css';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    trainType: 'all',
    departureTime: 'all',
    arrivalTime: 'all'
  });
  const [sortBy, setSortBy] = useState('departure');

  // 从URL参数或location state获取搜索条件
  const searchParams = new URLSearchParams(location.search);
  const [searchConditions, setSearchConditions] = useState({
    from: searchParams.get('from') || location.state?.from || '',
    to: searchParams.get('to') || location.state?.to || '',
    date: searchParams.get('date') || location.state?.date || ''
  });

  useEffect(() => {
    fetchTrains();
  }, [searchConditions, filters, sortBy]);

  const fetchTrains = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟数据 - 更丰富的车次信息
      const mockTrains = [
        {
          id: 'G103',
          trainNumber: 'G103',
          departureStation: searchConditions.from || '北京南',
          arrivalStation: searchConditions.to || '上海虹桥',
          departureTime: '06:20',
          arrivalTime: '10:38',
          duration: '4小时18分',
          businessSeat: '3',
          firstClass: '有',
          secondClass: '有',
          hardSleeper: '--',
          softSleeper: '--',
          hardSeat: '--',
          noSeat: '--',
          price: '553'
        },
        {
          id: 'G1',
          trainNumber: 'G1',
          departureStation: searchConditions.from || '北京南',
          arrivalStation: searchConditions.to || '上海虹桥',
          departureTime: '07:00',
          arrivalTime: '11:05',
          duration: '4小时5分',
          businessSeat: '有',
          firstClass: '有',
          secondClass: '有',
          hardSleeper: '--',
          softSleeper: '--',
          hardSeat: '--',
          noSeat: '--',
          price: '553'
        },
        {
          id: 'G105',
          trainNumber: 'G105',
          departureStation: searchConditions.from || '北京南',
          arrivalStation: searchConditions.to || '上海虹桥',
          departureTime: '07:17',
          arrivalTime: '11:40',
          duration: '4小时23分',
          businessSeat: '10',
          firstClass: '有',
          secondClass: '有',
          hardSleeper: '--',
          softSleeper: '--',
          hardSeat: '--',
          noSeat: '--',
          price: '553'
        },
        {
          id: 'G107',
          trainNumber: 'G107',
          departureStation: searchConditions.from || '北京南',
          arrivalStation: searchConditions.to || '上海虹桥',
          departureTime: '07:25',
          arrivalTime: '11:47',
          duration: '4小时22分',
          businessSeat: '10',
          firstClass: '有',
          secondClass: '有',
          hardSleeper: '--',
          softSleeper: '--',
          hardSeat: '--',
          noSeat: '--',
          price: '553'
        },
        {
          id: 'G3',
          trainNumber: 'G3',
          departureStation: searchConditions.from || '北京南',
          arrivalStation: searchConditions.to || '上海虹桥',
          departureTime: '07:40',
          arrivalTime: '11:52',
          duration: '4小时12分',
          businessSeat: '有',
          firstClass: '有',
          secondClass: '有',
          hardSleeper: '--',
          softSleeper: '--',
          hardSeat: '--',
          noSeat: '--',
          price: '553'
        },
        {
          id: 'G109',
          trainNumber: 'G109',
          departureStation: searchConditions.from || '北京南',
          arrivalStation: searchConditions.to || '上海虹桥',
          departureTime: '07:45',
          arrivalTime: '12:04',
          duration: '4小时19分',
          businessSeat: '有',
          firstClass: '有',
          secondClass: '有',
          hardSleeper: '--',
          softSleeper: '--',
          hardSeat: '--',
          noSeat: '--',
          price: '553'
        },
        {
          id: 'G111',
          trainNumber: 'G111',
          departureStation: searchConditions.from || '北京南',
          arrivalStation: searchConditions.to || '上海虹桥',
          departureTime: '08:16',
          arrivalTime: '12:35',
          duration: '4小时19分',
          businessSeat: '2',
          firstClass: '2',
          secondClass: '有',
          hardSleeper: '--',
          softSleeper: '--',
          hardSeat: '--',
          noSeat: '--',
          price: '553'
        },
        {
          id: 'G113',
          trainNumber: 'G113',
          departureStation: searchConditions.from || '北京南',
          arrivalStation: searchConditions.to || '上海虹桥',
          departureTime: '08:34',
          arrivalTime: '12:47',
          duration: '4小时13分',
          businessSeat: '有',
          firstClass: '有',
          secondClass: '有',
          hardSleeper: '--',
          softSleeper: '--',
          hardSeat: '--',
          noSeat: '--',
          price: '553'
        },
        {
          id: 'G5',
          trainNumber: 'G5',
          departureStation: searchConditions.from || '北京南',
          arrivalStation: searchConditions.to || '上海虹桥',
          departureTime: '09:00',
          arrivalTime: '13:17',
          duration: '4小时17分',
          businessSeat: '有',
          firstClass: '有',
          secondClass: '有',
          hardSleeper: '--',
          softSleeper: '--',
          hardSeat: '--',
          noSeat: '--',
          price: '553'
        },
        {
          id: 'G115',
          trainNumber: 'G115',
          departureStation: searchConditions.from || '北京南',
          arrivalStation: searchConditions.to || '上海虹桥',
          departureTime: '09:10',
          arrivalTime: '13:38',
          duration: '4小时28分',
          businessSeat: '有',
          firstClass: '有',
          secondClass: '有',
          hardSleeper: '--',
          softSleeper: '--',
          hardSeat: '--',
          noSeat: '--',
          price: '553'
        }
      ];
      
      setTrains(mockTrains);
    } catch (err) {
      setError('获取车次信息失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchTrains();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
  };

  const handleBooking = (train) => {
    // 跳转到订票页面
    navigate('/booking', { state: { train, searchConditions } });
  };

  const swapStations = () => {
    setSearchConditions(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  // 获取座位显示样式
  const getSeatClass = (seatInfo) => {
    if (seatInfo === '--' || seatInfo === '无') {
      return 'seat-none';
    } else if (seatInfo === '有') {
      return 'seat-available';
    } else if (typeof seatInfo === 'string' && !isNaN(seatInfo)) {
      const num = parseInt(seatInfo);
      return num <= 5 ? 'seat-few' : 'seat-available';
    }
    return 'seat-available';
  };

  return (
    <div className="search-results-container">
      {/* 顶部导航栏 */}
      <div className="top-nav">
        <div className="nav-content">
          <div className="logo">
            <div className="logo-icon">中</div>
            中国铁路12306
          </div>
          <div className="nav-links">
            <a href="#" className="nav-link">车票预订</a>
            <a href="#" className="nav-link">餐饮特产</a>
            <a href="#" className="nav-link">客运服务</a>
            <a href="#" className="nav-link">铁路货运</a>
            <a href="#" className="nav-link">信息查询</a>
            <a href="#" className="nav-link">铁路资讯</a>
            <a href="#" className="nav-link">English</a>
          </div>
        </div>
      </div>

      {/* 搜索条件栏 */}
      <div className="search-bar">
        <div className="search-content">
          <div className="search-form">
            <div className="search-group">
              <label>出发地</label>
              <input
                type="text"
                className="search-input"
                value={searchConditions.from}
                onChange={(e) => setSearchConditions(prev => ({ ...prev, from: e.target.value }))}
                placeholder="出发地"
              />
            </div>
            <button className="swap-btn" onClick={swapStations}>⇄</button>
            <div className="search-group">
              <label>目的地</label>
              <input
                type="text"
                className="search-input"
                value={searchConditions.to}
                onChange={(e) => setSearchConditions(prev => ({ ...prev, to: e.target.value }))}
                placeholder="目的地"
              />
            </div>
            <div className="search-group">
              <label>出发日</label>
              <input
                type="date"
                className="search-input"
                value={searchConditions.date}
                onChange={(e) => setSearchConditions(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <button className="search-btn" onClick={handleSearch}>查询</button>
          </div>
        </div>
      </div>

      {/* 筛选和排序栏 */}
      <div className="filter-bar">
        <div className="filter-content">
          <div className="filter-left">
            <div className="filter-group">
              <span className="filter-label">车次类型:</span>
              <div className="filter-options">
                <span 
                  className={`filter-option ${filters.trainType === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('trainType', 'all')}
                >
                  全部
                </span>
                <span 
                  className={`filter-option ${filters.trainType === 'G' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('trainType', 'G')}
                >
                  高速
                </span>
                <span 
                  className={`filter-option ${filters.trainType === 'D' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('trainType', 'D')}
                >
                  动车
                </span>
                <span 
                  className={`filter-option ${filters.trainType === 'Z' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('trainType', 'Z')}
                >
                  直达
                </span>
                <span 
                  className={`filter-option ${filters.trainType === 'T' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('trainType', 'T')}
                >
                  特快
                </span>
                <span 
                  className={`filter-option ${filters.trainType === 'K' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('trainType', 'K')}
                >
                  快速
                </span>
              </div>
            </div>
            <div className="filter-group">
              <span className="filter-label">出发时间:</span>
              <div className="filter-options">
                <span 
                  className={`filter-option ${filters.departureTime === 'all' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('departureTime', 'all')}
                >
                  全部
                </span>
                <span 
                  className={`filter-option ${filters.departureTime === '06-12' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('departureTime', '06-12')}
                >
                  06:00-12:00
                </span>
                <span 
                  className={`filter-option ${filters.departureTime === '12-18' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('departureTime', '12-18')}
                >
                  12:00-18:00
                </span>
                <span 
                  className={`filter-option ${filters.departureTime === '18-24' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('departureTime', '18-24')}
                >
                  18:00-24:00
                </span>
                <span 
                  className={`filter-option ${filters.departureTime === '00-06' ? 'active' : ''}`}
                  onClick={() => handleFilterChange('departureTime', '00-06')}
                >
                  00:00-06:00
                </span>
              </div>
            </div>
          </div>
          <div className="sort-options">
            <a 
              href="#" 
              className={`sort-option ${sortBy === 'departure' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleSortChange('departure'); }}
            >
              出发时间
            </a>
            <a 
              href="#" 
              className={`sort-option ${sortBy === 'arrival' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleSortChange('arrival'); }}
            >
              到达时间
            </a>
            <a 
              href="#" 
              className={`sort-option ${sortBy === 'duration' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleSortChange('duration'); }}
            >
              历时
            </a>
          </div>
        </div>
      </div>

      {/* 车次列表 */}
      <div className="results-container">
        {loading && (
          <div className="loading">
            <span className="loading-text">正在加载车次信息</span>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {!loading && !error && trains.length === 0 && (
          <div className="no-results">
            <h3>未找到符合条件的车次</h3>
            <p>请尝试修改搜索条件或选择其他日期</p>
          </div>
        )}

        {!loading && !error && trains.length > 0 && (
          <>
            <div className="results-header">
              <div>车次</div>
              <div>出发站</div>
              <div>到达站</div>
              <div>历时</div>
              <div>商务座</div>
              <div>一等座</div>
              <div>二等座</div>
              <div>硬卧</div>
              <div>软卧</div>
              <div>硬座</div>
              <div>无座</div>
              <div>预订</div>
            </div>
            <div className="train-list">
              {trains.map((train) => (
                <div key={train.id} className="train-item">
                  <div className="train-number">{train.trainNumber}</div>
                  <div className="station-info">
                    <div className="station-name">{train.departureStation}</div>
                    <div className="station-time">{train.departureTime}</div>
                  </div>
                  <div className="station-info">
                    <div className="station-name">{train.arrivalStation}</div>
                    <div className="station-time">{train.arrivalTime}</div>
                  </div>
                  <div className="duration">{train.duration}</div>
                  <div className={`seat-info ${getSeatClass(train.businessSeat)}`}>
                    {train.businessSeat}
                  </div>
                  <div className={`seat-info ${getSeatClass(train.firstClass)}`}>
                    {train.firstClass}
                  </div>
                  <div className={`seat-info ${getSeatClass(train.secondClass)}`}>
                    {train.secondClass}
                  </div>
                  <div className={`seat-info ${getSeatClass(train.hardSleeper)}`}>
                    {train.hardSleeper}
                  </div>
                  <div className={`seat-info ${getSeatClass(train.softSleeper)}`}>
                    {train.softSleeper}
                  </div>
                  <div className={`seat-info ${getSeatClass(train.hardSeat)}`}>
                    {train.hardSeat}
                  </div>
                  <div className={`seat-info ${getSeatClass(train.noSeat)}`}>
                    {train.noSeat}
                  </div>
                  <button 
                    className="book-btn"
                    onClick={() => handleBooking(train)}
                  >
                    预订
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;