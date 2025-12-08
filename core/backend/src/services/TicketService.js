const TicketService = {
  // 内存存储结构
  // Key: `${trainCode}_${date}`
  // Value: { businessClass: 10, firstClass: 20, ... }
  store: new Map(),

  // 座位类型映射
  seatTypeMap: {
    '商务座': 'businessClass', 'business': 'businessClass', 'businessClass': 'businessClass',
    '一等座': 'firstClass', 'first': 'firstClass', 'firstClass': 'firstClass',
    '二等座': 'secondClass', 'second': 'secondClass', 'secondClass': 'secondClass',
    '硬卧': 'hardSleeper', 'hard_sleeper': 'hardSleeper', 'hardSleeper': 'hardSleeper',
    '软卧': 'softSleeper', 'soft_sleeper': 'softSleeper', 'softSleeper': 'softSleeper',
    '硬座': 'hardSeat', 'hard_seat': 'hardSeat', 'hardSeat': 'hardSeat',
    '高级软卧': 'premiumSleeper', 'premium_sleeper': 'premiumSleeper', 'premiumSleeper': 'premiumSleeper'
  },

  normalizeSeatType(type) {
    return this.seatTypeMap[type] || type;
  },

  /**
   * 获取车票库存
   * @param {string} trainCode 车次号
   * @param {string} date 日期 (YYYY-MM-DD)
   * @param {object} defaultSeats 默认库存（若内存中不存在时使用）
   * @returns {object} 库存对象
   */
  getTickets(trainCode, date, defaultSeats = null) {
    const key = `${trainCode}_${date}`;
    if (!this.store.has(key)) {
      if (defaultSeats) {
        // 深拷贝以防引用修改
        this.store.set(key, { ...defaultSeats });
      } else {
        return null;
      }
    }
    return this.store.get(key);
  },

  /**
   * 更新库存
   * @param {string} trainCode 车次号
   * @param {string} date 日期
   * @param {string} seatType 席别
   * @param {number} change 变化量（负数扣减，正数增加）
   * @returns {boolean} 是否更新成功
   */
  updateStock(trainCode, date, seatType, change) {
    const key = `${trainCode}_${date}`;
    const seats = this.store.get(key);
    
    if (!seats) return false; // 必须先初始化

    const normalizedKey = this.normalizeSeatType(seatType);
    if (seats[normalizedKey] === undefined) return false;

    const newCount = seats[normalizedKey] + change;
    if (newCount < 0) return false; // 库存不足

    seats[normalizedKey] = newCount;
    return true;
  }
};

module.exports = TicketService;
