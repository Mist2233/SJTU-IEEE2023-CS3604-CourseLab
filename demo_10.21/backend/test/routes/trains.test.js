const request = require('supertest');
const app = require('../../src/app');

describe('Trains API', () => {
  describe('GET /api/trains/search', () => {
    it('应该成功查询车次信息', async () => {
      const response = await request(app)
        .get('/api/trains/search')
        .query({
          from: '北京南',
          to: '上海虹桥',
          date: '2024-10-20'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('trains');
      expect(Array.isArray(response.body.data.trains)).toBe(true);
    });

    it('应该返回正确的车次信息格式', async () => {
      const response = await request(app)
        .get('/api/trains/search')
        .query({
          from: '北京南',
          to: '上海虹桥',
          date: '2024-10-20'
        });

      expect(response.status).toBe(200);
      
      if (response.body.data.trains.length > 0) {
        const train = response.body.data.trains[0];
        expect(train).toHaveProperty('trainNumber');
        expect(train).toHaveProperty('from');
        expect(train).toHaveProperty('to');
        expect(train).toHaveProperty('departureTime');
        expect(train).toHaveProperty('arrivalTime');
        expect(train).toHaveProperty('duration');
        expect(train).toHaveProperty('seatTypes');
        expect(Array.isArray(train.seatTypes)).toBe(true);
      }
    });

    it('应该验证必需的查询参数', async () => {
      const response = await request(app)
        .get('/api/trains/search')
        .query({
          from: '北京南'
          // 缺少 to 和 date 参数
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('缺少必需参数');
    });

    it('应该验证日期格式', async () => {
      const response = await request(app)
        .get('/api/trains/search')
        .query({
          from: '北京南',
          to: '上海虹桥',
          date: 'invalid-date'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('日期格式不正确');
    });

    it('应该拒绝过去的日期', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];

      const response = await request(app)
        .get('/api/trains/search')
        .query({
          from: '北京南',
          to: '上海虹桥',
          date: pastDate
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('不能查询过去的日期');
    });

    it('应该支持车次类型筛选', async () => {
      const response = await request(app)
        .get('/api/trains/search')
        .query({
          from: '北京南',
          to: '上海虹桥',
          date: '2024-10-20',
          trainType: 'G'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // 如果有返回结果，验证车次类型
      if (response.body.data.trains.length > 0) {
        response.body.data.trains.forEach(train => {
          expect(train.trainNumber).toMatch(/^G/);
        });
      }
    });

    it('应该返回座位类型和余票信息', async () => {
      const response = await request(app)
        .get('/api/trains/search')
        .query({
          from: '北京南',
          to: '上海虹桥',
          date: '2024-10-20'
        });

      expect(response.status).toBe(200);
      
      if (response.body.data.trains.length > 0) {
        const train = response.body.data.trains[0];
        expect(train.seatTypes).toBeDefined();
        
        if (train.seatTypes.length > 0) {
          const seatType = train.seatTypes[0];
          expect(seatType).toHaveProperty('type');
          expect(seatType).toHaveProperty('price');
          expect(seatType).toHaveProperty('available');
          expect(typeof seatType.price).toBe('number');
          expect(typeof seatType.available).toBe('number');
        }
      }
    });

    it('应该处理无结果的查询', async () => {
      const response = await request(app)
        .get('/api/trains/search')
        .query({
          from: '不存在的城市',
          to: '另一个不存在的城市',
          date: '2024-12-31'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.trains).toEqual([]);
    });

    it('应该支持分页查询', async () => {
      const response = await request(app)
        .get('/api/trains/search')
        .query({
          from: '北京南',
          to: '上海虹桥',
          date: '2024-10-20',
          page: 1,
          pageSize: 10
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('page');
      expect(response.body.data.pagination).toHaveProperty('pageSize');
      expect(response.body.data.pagination).toHaveProperty('total');
    });
  });
});