const request = require('supertest');
const app = require('../../src/app');
const { Order } = require('../../src/models/Order');
const { db } = require('../../src/database/init');

const user = { username: 'order_user', email: 'order@example.com', phone: '13900000002', password: 'OrderPwd1!', realName: '订票用户', idNumber: '110105199201011234' };
const user2 = { username: 'order_user2', email: 'order2@example.com', phone: '13900000003', password: 'OrderPwd2!', realName: '订票用户2', idNumber: '110105199301011234' };

async function clear() { await request(app).post('/api/auth/clear-test-data'); }
async function register(u) { return request(app).post('/api/auth/register').send({ ...u, verificationCode: '123456' }); }
async function login(id, pwd) { return request(app).post('/api/auth/login').send({ identifier: id, password: pwd }); }

function validPassenger(seatType='二等座') { return { name: '张三', idNumber: '110105199001011234', seatType }; }

async function insertOrder(userId, status='PENDING_PAYMENT') {
  const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
  const paymentDeadline = new Date(Date.now() + 30*60*1000).toISOString();
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO orders (order_id, user_id, train_number, date, from_station, to_station, total_amount, status, payment_deadline) VALUES (?,?,?,?,?,?,?,?,?)`,
      [orderId, userId, 'D321', '2030-01-01', '北京', '上海', 553, status, paymentDeadline],
      function(err){ if (err) reject(err); else resolve(); }
    );
  });
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO order_passengers (order_id, name, id_number, seat_type) VALUES (?,?,?,?)`,
      [orderId, '张三', '110105199001011234', '二等座'],
      function(err){ if (err) reject(err); else resolve(); }
    );
  });
  return orderId;
}

beforeEach(async () => { await clear(); });

test('create order auth and validation', async () => {
  let r = await request(app).post('/api/orders');
  expect(r.status).toBe(401);
  await register(user);
  const lg = await login(user.phone, user.password);
  const token = lg.body.data.token;
  r = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({});
  expect(r.status).toBe(400);
  r = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({ trainNumber: 'D321', date: '2030-01-01', from: '北京', to: '上海', passengers: [{ name: '张三', idNumber: '', seatType: '二等座' }] });
  expect(r.status).toBe(400);
  r = await request(app).post('/api/orders').set('Authorization', `Bearer ${token}`).send({ trainNumber: 'D321', date: '2030-01-01', from: '北京', to: '上海', passengers: [validPassenger('不存在')] });
  expect(r.status).toBe(400);
});

test('fetch order detail success via DB inserted order', async () => {
  await register(user);
  const lg = await login(user.phone, user.password);
  const token = lg.body.data.token;
  const oid = await insertOrder(user.username);
  const q = await request(app).get(`/api/orders/${oid}`).set('Authorization', `Bearer ${token}`);
  expect(q.status).toBe(200);
  expect(q.body.data.orderId).toBe(oid);
});

test('order access control and not found', async () => {
  await register(user);
  await register(user2);
  const lg1 = await login(user.phone, user.password);
  const lg2 = await login(user2.phone, user2.password);
  const t1 = lg1.body.data.token;
  const t2 = lg2.body.data.token;
  const oid = await insertOrder(user.username);
  const q403 = await request(app).get(`/api/orders/${oid}`).set('Authorization', `Bearer ${t2}`);
  expect(q403.status).toBe(403);
  const q404 = await request(app).get(`/api/orders/NO_SUCH`).set('Authorization', `Bearer ${t1}`);
  expect(q404.status).toBe(404);
});

test('cancel order state validation and success', async () => {
  await register(user);
  const lg = await login(user.phone, user.password);
  const token = lg.body.data.token;
  const oid = await insertOrder(user.username);
  await Order.updateStatus(oid, 'PAID');
  const bad = await request(app).post(`/api/orders/${oid}/cancel`).set('Authorization', `Bearer ${token}`);
  expect(bad.status).toBe(400);
  await Order.updateStatus(oid, 'PENDING_PAYMENT');
  const ok = await request(app).post(`/api/orders/${oid}/cancel`).set('Authorization', `Bearer ${token}`);
  expect(ok.status).toBe(200);
});

test('refund only paid and success', async () => {
  await register(user);
  const lg = await login(user.phone, user.password);
  const token = lg.body.data.token;
  const oid = await insertOrder(user.username);
  const bad = await request(app).post(`/api/orders/${oid}/refund`).set('Authorization', `Bearer ${token}`);
  expect(bad.status).toBe(400);
  await Order.updateStatus(oid, 'PAID');
  const ok = await request(app).post(`/api/orders/${oid}/refund`).set('Authorization', `Bearer ${token}`);
  expect(ok.status).toBe(200);
});

test('list orders of user', async () => {
  await register(user);
  const lg = await login(user.phone, user.password);
  const token = lg.body.data.token;
  let r = await request(app).get(`/api/orders/user/${user.username}`).set('Authorization', `Bearer ${token}`);
  expect(r.status).toBe(200);
  const lg2 = await login(user.phone, user.password);
  const token2 = lg2.body.data.token;
  r = await request(app).get(`/api/orders/user/${user.username}x`).set('Authorization', `Bearer ${token2}`);
  expect(r.status).toBe(403);
});

test('order list pagination and status filtering', async () => {
  await register(user);
  const lg = await login(user.phone, user.password);
  const token = lg.body.data.token;
  await insertOrder(user.username, 'PENDING_PAYMENT');
  await insertOrder(user.username, 'PAID');
  await insertOrder(user.username, 'CANCELLED');
  const r = await request(app)
    .get(`/api/orders/user/${user.username}?status=PAID&page=1&pageSize=1`)
    .set('Authorization', `Bearer ${token}`);
  expect(r.status).toBe(200);
  expect(r.body.data.pagination.totalOrders).toBe(1);
  expect(r.body.data.orders.length).toBe(1);
  expect(r.body.data.orders[0].status).toBe('PAID');
});
