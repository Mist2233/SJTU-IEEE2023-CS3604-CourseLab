const request = require('supertest');
const app = require('../../src/app');

beforeEach(async () => {
  await request(app).post('/api/auth/clear-test-data');
});

test('trains required params', async () => {
  const r = await request(app).get('/api/trains/search').query({ from: '北京', to: '', date: '' });
  expect(r.status).toBe(400);
});

test('trains invalid date', async () => {
  const r = await request(app).get('/api/trains/search').query({ from: '北京', to: '上海', date: '2025-13-01' });
  expect(r.status).toBe(400);
});

test('trains past date', async () => {
  const d = new Date(Date.now() - 24*3600*1000);
  const ds = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  const r = await request(app).get('/api/trains/search').query({ from: '北京', to: '上海', date: ds });
  expect(r.status).toBe(400);
});

test('trains normal query', async () => {
  const r = await request(app).get('/api/trains/search').query({ from: '北京', to: '上海', date: '2030-01-01' });
  expect(r.status).toBe(200);
  expect(r.body.success).toBe(true);
  expect(Array.isArray(r.body.data.trains)).toBe(true);
  expect(r.body.data.pagination).toBeDefined();
});

test('train search returns correct seat prices', async () => {
  const r = await request(app).get('/api/trains/search').query({ from: '北京', to: '上海', date: '2030-01-01' });
  expect(r.status).toBe(200);
  const seatTypes = r.body.data.trains[0].seatTypes;
  const second = seatTypes.find(s => s.type === 'secondClass');
  const hardSleeper = seatTypes.find(s => s.type === 'hardSleeper');
  expect(second && second.price).toBe(553);
  expect(hardSleeper && hardSleeper.price).toBe(156);
});

test('trains filter by type prefix', async () => {
  const r = await request(app).get('/api/trains/search').query({ from: '北京', to: '上海', date: '2030-01-01', trainType: 'G' });
  expect(r.status).toBe(200);
  const list = r.body.data.trains;
  expect(list.length).toBeGreaterThan(0);
  expect(list.every(t => String(t.trainNumber).startsWith('G'))).toBe(true);
});

test('trains departure time range and sort', async () => {
  const r = await request(app).get('/api/trains/search').query({ from: '北京', to: '上海', date: '2030-01-01', departureTime: '06-09', sortBy: 'departure', page: 1, pageSize: 5 });
  expect(r.status).toBe(200);
  const list = r.body.data.trains;
  expect(list.length).toBeGreaterThan(0);
});

test('trains pagination', async () => {
  const r1 = await request(app).get('/api/trains/search').query({ from: '北京', to: '上海', date: '2030-01-01', page: 1, pageSize: 2 });
  expect(r1.status).toBe(200);
  const p1 = r1.body.data.pagination;
  const r2 = await request(app).get('/api/trains/search').query({ from: '北京', to: '上海', date: '2030-01-01', page: 2, pageSize: 2 });
  const p2 = r2.body.data.pagination;
  expect(p1.total).toBeGreaterThan(0);
  expect(p1.pageSize).toBe(2);
  expect(p2.page).toBe(2);
});

test('trains fallback to mock data when DB fails', async () => {
  const { db } = require('../../src/database/init');
  const orig = db.all;
  db.all = (sql, params, cb) => cb(new Error('forced fail'));
  const r = await request(app).get('/api/trains/search').query({ from: '北京', to: '上海', date: '2030-01-01' });
  db.all = orig;
  expect(r.status).toBe(200);
  expect(Array.isArray(r.body.data.trains)).toBe(true);
});

test('global health endpoint works', async () => {
  const r = await request(app).get('/health');
  expect(r.status).toBe(200);
  expect(r.body.status).toBe('ok');
});

test('global unknown route returns 404', async () => {
  const r = await request(app).get('/__unknown__');
  expect(r.status).toBe(404);
  expect(r.body.error).toBe('接口不存在');
});
