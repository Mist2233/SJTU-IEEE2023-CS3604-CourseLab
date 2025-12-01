import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { searchTrains } from '../../services/api';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // --- 核心状态 ---
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdv, setShowAdv] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTrainPrefixes, setSelectedTrainPrefixes] = useState([]);
  const [selectedDepStations, setSelectedDepStations] = useState([]);
  const [selectedArrStations, setSelectedArrStations] = useState([]);
  const [filterSeat, setFilterSeat] = useState({ business: false, first: false, second: false });
  const [filterTimeRange, setFilterTimeRange] = useState('00-24');

  // --- 搜索条件状态 ---
  // 从URL参数或location state获取搜索条件
  const searchParams = new URLSearchParams(location.search);
  const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parseLocalDate = (s) => {
    const [y,m,da] = String(s).split('-').map(v=>parseInt(v,10));
    return new Date(y, (m||1)-1, da||1, 0, 0, 0, 0);
  };
  const [searchConditions, setSearchConditions] = useState({
    from: searchParams.get('from') || location.state?.from || '',
    to: searchParams.get('to') || location.state?.to || '',
    date: searchParams.get('date') || location.state?.date || formatDate(new Date())
  });

  // --- 日期导航数据 ---
  const [dateNavList, setDateNavList] = useState([]);

  // --- 初始化逻辑 ---
  useEffect(() => {
    generateDateList(searchConditions.date);
    if (searchConditions.from && searchConditions.to) {
      setHasSearched(true);
      fetchTrains();
    } else {
      setLoading(false);
      setTrains([]);
    }
  }, [searchConditions]); // 当搜索条件(包含日期)变化时执行

  // --- 生成日期导航条 ---
  const generateDateList = (currentDateStr) => {
    const dates = [];
    const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const minDate = parseLocalDate(formatDate(new Date()));
    const maxDate = parseLocalDate(formatDate(new Date())); maxDate.setDate(maxDate.getDate() + 15);
    let cur = parseLocalDate(currentDateStr);
    if (cur < minDate) cur = new Date(minDate);
    if (cur > maxDate) cur = new Date(maxDate);
    const start = new Date(cur); start.setDate(cur.getDate() - 1);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = formatDate(d);
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const disabled = d < minDate || d > maxDate;
      dates.push({ fullDate: dateStr, display: `${month}-${day}`, week: weekMap[d.getDay()], isCurrent: dateStr === formatDate(cur), disabled });
    }
    setDateNavList(dates);
  };

  // --- API 请求逻辑 (保留你原有的逻辑) ---
  const fetchTrains = async () => {
    if (!searchConditions.from || !searchConditions.to) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 这里保留你原本的 API 调用参数构建逻辑
      const params = {
        from: searchConditions.from,
        to: searchConditions.to,
        date: searchConditions.date
      };

      const result = await searchTrains(params);

      // 保留你原本的数据清洗逻辑，这非常重要
      const list = Array.isArray(result) ? result : result?.data?.trains || [];
      const normalized = list.map(t => {
        // 如果数据结构需要映射 (你原本的逻辑)
        if (t.seatTypes && !t.seats) {
          const seatsObj = {};
          t.seatTypes.forEach(s => {
            const map = {
              '商务座': 'businessClass', 'business': 'businessClass',
              '一等座': 'firstClass', 'first': 'firstClass',
              '二等座': 'secondClass', 'second': 'secondClass',
              '软卧': 'softSleeper', 'soft_sleeper': 'softSleeper',
              '硬卧': 'hardSleeper', 'hard_sleeper': 'hardSleeper',
              '硬座': 'hardSeat', 'hard_seat': 'hardSeat',
              '无座': 'noSeat', 'no_seat': 'noSeat'
            };
            const key = map[s.type] || s.type;
            // 这里的 available 逻辑保留
            seatsObj[key] = {
              available: s.available ?? s.count ?? 0,
              price: s.price
            };
          });
          return {
            trainNumber: t.trainNumber,
            departureStation: t.from || t.departureStation,
            arrivalStation: t.to || t.arrivalStation,
            departureTime: t.departureTime,
            arrivalTime: t.arrivalTime,
            duration: t.duration,
            seats: seatsObj
          };
        }
        return t;
      });
      setTrains(normalized);
    } catch (err) {
      setError('查询失败，请稍后重试'); // 简化报错信息
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 交互处理 ---
  const handleSwap = () => {
    setSearchConditions(prev => ({ ...prev, from: prev.to, to: prev.from }));
  };

  const handleDateChange = (newDate) => {
    setSearchConditions(prev => ({ ...prev, date: newDate }));
  };

  const addDays = (dateStr, delta) => {
    const d = parseLocalDate(dateStr);
    d.setDate(d.getDate() + delta);
    return formatDate(d);
  };

  const handleDatePrev = () => {
    const prevStr = addDays(searchConditions.date, -1);
    const today = parseLocalDate(formatDate(new Date()));
    const prevDate = parseLocalDate(prevStr);
    if (prevDate < today) return;
    setSearchConditions(prev => ({ ...prev, date: prevStr }));
  };

  const handleDateNext = () => {
    const nextStr = addDays(searchConditions.date, 1);
    const limit = parseLocalDate(formatDate(new Date()));
    limit.setDate(limit.getDate() + 15);
    const nextDate = parseLocalDate(nextStr);
    if (nextDate > limit) return;
    setSearchConditions(prev => ({ ...prev, date: nextStr }));
  };

  // 箭头禁用态判定
  const today = parseLocalDate(formatDate(new Date()));
  const cur = parseLocalDate(searchConditions.date);
  const limit = parseLocalDate(formatDate(new Date())); limit.setDate(limit.getDate() + 15);
  const prevDisabled = cur <= today;
  const nextDisabled = cur >= limit;

  const minDateStr = formatDate(new Date());
  const maxDateTmp = new Date();
  maxDateTmp.setDate(maxDateTmp.getDate() + 15);
  const maxDateStr = formatDate(maxDateTmp);

  // 记忆上次出发地/目的地
  useEffect(() => {
    const lastFrom = localStorage.getItem('p002_last_from') || '';
    const lastTo = localStorage.getItem('p002_last_to') || '';
    if (!searchParams.get('from') && !location.state?.from && !searchConditions.from && lastFrom) {
      setSearchConditions(prev => ({ ...prev, from: lastFrom }));
    }
    if (!searchParams.get('to') && !location.state?.to && !searchConditions.to && lastTo) {
      setSearchConditions(prev => ({ ...prev, to: lastTo }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchConditions.from) localStorage.setItem('p002_last_from', searchConditions.from);
    if (searchConditions.to) localStorage.setItem('p002_last_to', searchConditions.to);
  }, [searchConditions.from, searchConditions.to]);

  const handleBooking = (train) => {
    navigate('/booking', { state: { train, searchConditions } });
  };

  const applyFilters = (list) => {
    const seatKeys = [];
    if (filterSeat.business) seatKeys.push('businessClass');
    if (filterSeat.first) seatKeys.push('firstClass');
    if (filterSeat.second) seatKeys.push('secondClass');
    const [startH, endH] = (filterTimeRange || '00-24').split('-').map(x => parseInt(x, 10));
    return list.filter(t => {
      if (selectedTrainPrefixes.length > 0) {
        const prefix = String(t.trainNumber || '').charAt(0).toUpperCase();
        if (!selectedTrainPrefixes.includes(prefix)) return false;
      }
      if (selectedDepStations.length > 0 && !selectedDepStations.includes(t.departureStation)) return false;
      if (selectedArrStations.length > 0 && !selectedArrStations.includes(t.arrivalStation)) return false;
      if (seatKeys.length > 0) {
        const hasSeat = seatKeys.some(k => {
          const val = t.seats?.[k];
          const available = typeof val === 'object' ? val?.available : val;
          return (Number(available) || 0) > 0;
        });
        if (!hasSeat) return false;
      }
      if (!isNaN(startH) && !isNaN(endH)) {
        const h = parseInt(String(t.departureTime || '00').substring(0,2), 10);
        if (!(h >= startH && h < endH)) return false;
      }
      return true;
    });
  };

  const uniquePrefixes = React.useMemo(() => {
    const allowed = ['G','D','Z','T','K'];
    const set = new Set((trains || []).map(t => String(t.trainNumber || '').charAt(0).toUpperCase()).filter(p => allowed.includes(p)));
    return Array.from(set);
  }, [trains]);
  const uniqueDepStations = React.useMemo(() => {
    const set = new Set((trains || []).map(t => t.departureStation).filter(Boolean));
    return Array.from(set);
  }, [trains]);
  const uniqueArrStations = React.useMemo(() => {
    const set = new Set((trains || []).map(t => t.arrivalStation).filter(Boolean));
    return Array.from(set);
  }, [trains]);

  const toggleSelect = (current, setter, value, checked) => {
    setter(checked ? [...current, value] : current.filter(v => v !== value));
  };

  // --- 辅助函数：席位渲染（仅三类展示数量，其余显示“无”） ---
  const renderSeatCell = (train, type) => {
    const allowed = ['businessClass', 'firstClass', 'secondClass'];
    if (!allowed.includes(type)) {
      return <td className="cell-none">无</td>;
    }
    const val = train.seats?.[type];
    const available = typeof val === 'object' ? val?.available : val;
    const num = Number(available) || 0;
    if (num <= 0) return <td className="cell-none">无</td>;
    return <td className="cell-number">{num}</td>;
  };

  // 站点选择下拉
  const CITIES = React.useMemo(() => ['北京','上海','天津','济南'], []);
  const initialMap = React.useMemo(() => ({ 北京: 'B', 上海: 'S', 天津: 'T', 济南: 'J' }), []);
  const groupedCities = React.useMemo(() => {
    const groups = {
      hot: CITIES,
      ABCDEFG: CITIES.filter(c => 'ABCDEFG'.includes(initialMap[c] || '')),
      HIJKLMN: CITIES.filter(c => 'HIJKLMN'.includes(initialMap[c] || '')),
      OPQRST: CITIES.filter(c => 'OPQRST'.includes(initialMap[c] || '')),
      UVWXYZ: CITIES.filter(c => 'UVWXYZ'.includes(initialMap[c] || '')),
    };
    return groups;
  }, [CITIES, initialMap]);

  const [openPicker, setOpenPicker] = useState(null);
  const [cityTab, setCityTab] = useState('hot');

  const pickStation = (field, name) => {
    setSearchConditions(prev => ({ ...prev, [field]: name }));
    setOpenPicker(null);
  };

  const StationDropdown = ({ field }) => (
    <div className="station-dropdown">
      <div className="station-panel">
        <div className="station-tabs">
          {['hot','ABCDEFG','HIJKLMN','OPQRST','UVWXYZ'].map(t => (
            <button key={t} className={`station-tab ${cityTab === t ? 'active' : ''}`} onClick={() => setCityTab(t)}>{t === 'hot' ? '热门' : t}</button>
          ))}
        </div>
        <div className="station-body">
          <div className="station-group">
            {(groupedCities[cityTab] || groupedCities.hot).map(city => (
              <button key={city} className="station-item" onClick={() => pickStation(field, city)}>{city}</button>
            ))}
          </div>
        </div>
        <button className="station-close" onClick={() => setOpenPicker(null)}>×</button>
      </div>
    </div>
  );

  return (
    <div className="search-results-page">

      {/* 1. 顶部紧凑搜索栏 */}
      <div className="quick-search-bar">
        <div className="search-wrapper">
          <div className="input-group">
            <label>出发地</label>
            <input
              value={searchConditions.from}
              onChange={(e) => setSearchConditions({ ...searchConditions, from: e.target.value })}
              onFocus={() => setOpenPicker('from')}
              placeholder="输入或选择站点"
            />
            {openPicker === 'from' && <StationDropdown field="from" />}
          </div>
          <button className="btn-swap" onClick={handleSwap}>⇌</button>
          <div className="input-group">
            <label>目的地</label>
            <input
              value={searchConditions.to}
              onChange={(e) => setSearchConditions({ ...searchConditions, to: e.target.value })}
              onFocus={() => setOpenPicker('to')}
              placeholder="输入或选择站点"
            />
            {openPicker === 'to' && <StationDropdown field="to" />}
          </div>
          <div className="input-group">
            <label>出发日</label>
            <input
              type="date"
              min={minDateStr}
              max={maxDateStr}
              value={searchConditions.date}
              onChange={(e) => setSearchConditions({ ...searchConditions, date: e.target.value })}
            />
          </div>
          <button className="btn-query" onClick={() => { if (!searchConditions.from || !searchConditions.to) { setError('请输入出发地和目的地'); return; } setHasSearched(true); fetchTrains(); }}>查询</button>
        </div>
      </div>

      {/* 2. 蓝色日期导航条 */}
      <div className="date-navigation">
        <div className="date-nav-wrapper">
          <div className={`nav-prev ${prevDisabled ? 'disabled' : ''}`} onClick={handleDatePrev}> &lt; </div>
          <div className="date-list">
            {dateNavList.map((item, idx) => (
              <div
                key={idx}
                className={`date-item ${item.isCurrent ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                onClick={() => { if (!item.disabled) handleDateChange(item.fullDate) }}
              >
                <span className="date-fmt">{item.display}</span>
                <span className="week-fmt">{item.week}</span>
              </div>
            ))}
          </div>
          <div className={`nav-next ${nextDisabled ? 'disabled' : ''}`} onClick={handleDateNext}> &gt; </div>
        </div>
      </div>

      {/* 3. 核心数据表格 */}
      <div className="train-table-container">

        <div className="adv-filter-bar">
            <div className="adv-rows">
              <div className="adv-line">
                <div className="adv-line-label">车次</div>
                <div className="adv-checklist inline">
                  {(hasSearched ? uniquePrefixes : []).map(prefix => (
                    <label key={prefix} className="adv-check-item">
                      <input type="checkbox" checked={selectedTrainPrefixes.includes(prefix)} onChange={(e)=>toggleSelect(selectedTrainPrefixes, setSelectedTrainPrefixes, prefix, e.target.checked)} /> {prefix}
                    </label>
                  ))}
                </div>
              </div>
              <div className="adv-line">
                <div className="adv-line-label">出发站</div>
                <div className="adv-checklist">
                  {(hasSearched ? uniqueDepStations : []).map(st => (
                    <label key={st} className="adv-check-item">
                      <input type="checkbox" checked={selectedDepStations.includes(st)} onChange={(e)=>toggleSelect(selectedDepStations, setSelectedDepStations, st, e.target.checked)} /> {st}
                    </label>
                  ))}
                </div>
              </div>
              <div className="adv-line">
                <div className="adv-line-label">到达站</div>
                <div className="adv-checklist">
                  {(hasSearched ? uniqueArrStations : []).map(st => (
                    <label key={st} className="adv-check-item">
                      <input type="checkbox" checked={selectedArrStations.includes(st)} onChange={(e)=>toggleSelect(selectedArrStations, setSelectedArrStations, st, e.target.checked)} /> {st}
                    </label>
                  ))}
                </div>
              </div>
              <div className="adv-line">
                <div className="adv-line-label">席位</div>
                <div className="adv-checks">
                  {hasSearched && (
                    <>
                      <label><input type="checkbox" checked={filterSeat.business} onChange={(e)=>setFilterSeat({ ...filterSeat, business: e.target.checked })} /> 商务座</label>
                      <label><input type="checkbox" checked={filterSeat.first} onChange={(e)=>setFilterSeat({ ...filterSeat, first: e.target.checked })} /> 一等座</label>
                      <label><input type="checkbox" checked={filterSeat.second} onChange={(e)=>setFilterSeat({ ...filterSeat, second: e.target.checked })} /> 二等座</label>
                    </>
                  )}
                </div>
              </div>
              <div className="adv-line">
                <div className="adv-line-label">发车时间</div>
                <div>
                  {hasSearched && (
                    <select className="adv-select" value={filterTimeRange} onChange={(e)=>setFilterTimeRange(e.target.value)}>
                      <option value="00-24">00:00-24:00</option>
                      <option value="00-06">00:00-06:00</option>
                      <option value="06-12">06:00-12:00</option>
                      <option value="12-18">12:00-18:00</option>
                      <option value="18-24">18:00-24:00</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* 状态提示 */}
        <div className="table-header-info">
          {searchConditions.from} → {searchConditions.to}（{searchConditions.date}）
          共计 <strong>{trains.length}</strong> 个车次
        </div>

        {loading ? (
          <div className="loading-state">正在查询列车信息...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : trains.length === 0 ? (
          <div className="empty-state">未找到符合条件的车次</div>
        ) : (
          <table className="train-table">
            <thead>
              <tr>
                <th className="col-train">车次</th>
                <th className="col-station">出发/到达车站</th>
                <th className="col-time">出发/到达时间</th>
                <th className="col-duration">历时</th>
                <th>商务座<br />特等座</th>
                <th>一等座</th>
                <th>二等座</th>
                <th>高级<br />软卧</th>
                <th>软卧<br />一等卧</th>
                <th>动卧</th>
                <th>硬卧<br />二等卧</th>
                <th>软座</th>
                <th>硬座</th>
                <th>无座</th>
                <th>其他</th>
                <th className="col-action">备注</th>
              </tr>
            </thead>
            <tbody>
              {applyFilters(trains).map((train, index) => (
                <tr key={train.trainNumber || index} className={index % 2 === 0 ? 'bg-even' : 'bg-odd'}>
                  {/* 车次 */}
                  <td className="cell-train-code">
                    <div className="code">{train.trainNumber}</div>
                  </td>

                  {/* 车站 */}
                  <td className="cell-stations">
                    <div><span className="icon-start">始</span> {train.departureStation}</div>
                    <div><span className="icon-end">终</span> {train.arrivalStation}</div>
                  </td>

                  {/* 时间 */}
                  <td className="cell-times">
                    <div className="time-start">{train.departureTime}</div>
                    <div className="time-end">{train.arrivalTime}</div>
                  </td>

                  {/* 历时 */}
                  <td className="cell-duration">
                    {train.duration}
                    {/* 如果有 dayDiff 可以在这里加 */}
                  </td>

                  {/* 动态渲染席位 - 仅三类显示数量，其余固定“无” */}
                  {renderSeatCell(train, 'businessClass')}
                  {renderSeatCell(train, 'firstClass')}
                  {renderSeatCell(train, 'secondClass')}
                  {renderSeatCell(train, 'premiumSleeper')}
                  {renderSeatCell(train, 'softSleeper')}
                  {renderSeatCell(train, 'mobileSleeper')}
                  {renderSeatCell(train, 'hardSleeper')}
                  {renderSeatCell(train, 'softSeat')}
                  {renderSeatCell(train, 'hardSeat')}
                  {renderSeatCell(train, 'noSeat')}
                  {renderSeatCell(train, 'other')}

                  {/* 预订按钮 */}
                  <td className="cell-action">
                    <button className="btn-book" onClick={() => handleBooking(train)}>预订</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;
