const request = require('supertest');
const app = require('../../src/app');
const ordersMod = require('../../src/routes/orders');

const user = { username: 'pay_user', email: 'pay@example.com', phone: '13900000004', password: 'PayPwd1!', realName: '支付用户', idNumber: '110105199401011234' };
const user2 = { username: 'pay_user2', email: 'pay2@example.com', phone: '13900000005', password: 'PayPwd2!', realName: '支付用户2', idNumber: '110105199501011234' };

async function clear() { await request(app).post('/api/auth/clear-test-data'); }
async function register(u) { return request(app).post('/api/auth/register').send({ ...u, verificationCode: '123456' }); }
async function login(id, pwd) { return request(app).post('/api/auth/login').send({ identifier: id, password: pwd }); }

beforeEach(async () => { await clear(); });

test('initiate auth and params', async () => {
  let r = await request(app).post('/api/payments/initiate');
  expect(r.status).toBe(401);
  await register(user);
  const lg = await login(user.phone, user.password);
  const token = lg.body.data.token;
  r = await request(app).post('/api/payments/initiate').set('Authorization', `Bearer ${token}`).send({});
  expect(r.status).toBe(400);
  r = await request(app).post('/api/payments/initiate').set('Authorization', `Bearer ${token}`).send({ orderId: 'NO', paymentMethod: 'bad' });
  expect(r.status).toBe(400);
});

test('initiate not found and permission and expired and success', async () => {
  await register(user);
  await register(user2);
  const lg1 = await login(user.phone, user.password);
  const lg2 = await login(user2.phone, user2.password);
  const t1 = lg1.body.data.token;
  const t2 = lg2.body.data.token;
  let r = await request(app).post('/api/payments/initiate').set('Authorization', `Bearer ${t1}`).send({ orderId: 'NO_ORDER', paymentMethod: 'alipay' });
  expect(r.status).toBe(404);
  const { db } = require('../../src/database/init');
  const oid = `ORD_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
  const deadline = new Date(Date.now()+30*60*1000).toISOString();
  await new Promise((resolve,reject)=>{
    db.run(`INSERT INTO orders (order_id,user_id,train_number,date,from_station,to_station,total_amount,status,payment_deadline) VALUES (?,?,?,?,?,?,?,?,?)`, [oid, user.username, 'D321', '2030-01-01', '北京', '上海', 553, 'PENDING_PAYMENT', deadline], function(err){ if (err) reject(err); else resolve(); });
  });
  await new Promise((resolve,reject)=>{
    db.run(`INSERT INTO order_passengers (order_id,name,id_number,seat_type) VALUES (?,?,?,?)`, [oid,'张三','110105199001011234','二等座'], function(err){ if (err) reject(err); else resolve(); });
  });
  r = await request(app).post('/api/payments/initiate').set('Authorization', `Bearer ${t2}`).send({ orderId: oid, paymentMethod: 'alipay' });
  expect(r.status).toBe(401);
  const mem = ordersMod.orders.get(oid);
  mem.paymentDeadline = new Date(Date.now() - 60*1000).toISOString();
  r = await request(app).post('/api/payments/initiate').set('Authorization', `Bearer ${t1}`).send({ orderId: oid, paymentMethod: 'alipay' });
  expect(r.status).toBe(400);
  mem.paymentDeadline = new Date(Date.now() + 30*60*1000).toISOString();
  r = await request(app).post('/api/payments/initiate').set('Authorization', `Bearer ${t1}`).send({ orderId: oid, paymentMethod: 'wechat' });
  expect(r.status).toBe(200);
  if (r.body.data.qrCode === undefined) throw new Error('missing qrCode');
});

test('callback validations and success', async () => {
  await register(user);
  const lg = await login(user.phone, user.password);
  const t = lg.body.data.token;
  const { db } = require('../../src/database/init');
  const oid = `ORD_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
  const deadline = new Date(Date.now()+30*60*1000).toISOString();
  await new Promise((resolve,reject)=>{
    db.run(`INSERT INTO orders (order_id,user_id,train_number,date,from_station,to_station,total_amount,status,payment_deadline) VALUES (?,?,?,?,?,?,?,?,?)`, [oid, user.username, 'D321', '2030-01-01', '北京', '上海', 553, 'PENDING_PAYMENT', deadline], function(err){ if (err) reject(err); else resolve(); });
  });
  await new Promise((resolve,reject)=>{
    db.run(`INSERT INTO order_passengers (order_id,name,id_number,seat_type) VALUES (?,?,?,?)`, [oid,'张三','110105199001011234','二等座'], function(err){ if (err) reject(err); else resolve(); });
  });
  const init = await request(app).post('/api/payments/initiate').set('Authorization', `Bearer ${t}`).send({ orderId: oid, paymentMethod: 'alipay' });
  const pid = init.body.data.paymentId;
  let r = await request(app).post('/api/payments/callback').send({});
  expect(r.status).toBe(400);
  r = await request(app).post('/api/payments/callback').send({ paymentId: pid, orderId: oid, status: 'SUCCESS', transactionId: 'tx1', amount: 1, signature: 'bad' });
  expect(r.status).toBe(400);
  r = await request(app).post('/api/payments/callback').send({ paymentId: 'NO', orderId: oid, status: 'SUCCESS', transactionId: 'tx1', amount: 553, signature: 'mock_signature' });
  expect(r.status).toBe(400);
  r = await request(app).post('/api/payments/callback').send({ paymentId: pid, orderId: 'NO', status: 'SUCCESS', transactionId: 'tx1', amount: 553, signature: 'mock_signature' });
  expect(r.status).toBe(400);
  r = await request(app).post('/api/payments/callback').send({ paymentId: pid, orderId: oid, status: 'SUCCESS', transactionId: 'tx1', amount: 999999, signature: 'mock_signature' });
  expect(r.status).toBe(400);
  r = await request(app).post('/api/payments/callback').send({ paymentId: pid, orderId: oid, status: 'SUCCESS', transactionId: 'tx1', amount: 553, signature: 'mock_signature' });
  expect(r.status).toBe(200);
  r = await request(app).post('/api/payments/callback').send({ paymentId: pid, orderId: oid, status: 'SUCCESS', transactionId: 'tx1', amount: 553, signature: 'mock_signature' });
  expect(r.status).toBe(200);
});

test('initiate bankcard returns paymentUrl', async () => {
  await register(user);
  const lg = await login(user.phone, user.password);
  const t = lg.body.data.token;
  const { db } = require('../../src/database/init');
  const oid = `ORD_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
  const deadline = new Date(Date.now()+30*60*1000).toISOString();
  await new Promise((resolve,reject)=>{
    db.run(`INSERT INTO orders (order_id,user_id,train_number,date,from_station,to_station,total_amount,status,payment_deadline) VALUES (?,?,?,?,?,?,?,?,?)`, [oid, user.username, 'D321', '2030-01-01', '北京', '上海', 553, 'PENDING_PAYMENT', deadline], function(err){ if (err) reject(err); else resolve(); });
  });
  await new Promise((resolve,reject)=>{
    db.run(`INSERT INTO order_passengers (order_id,name,id_number,seat_type) VALUES (?,?,?,?)`, [oid,'张三','110105199001011234','二等座'], function(err){ if (err) reject(err); else resolve(); });
  });
  const r = await request(app).post('/api/payments/initiate').set('Authorization', `Bearer ${t}`).send({ orderId: oid, paymentMethod: 'bankcard' });
  expect(r.status).toBe(200);
  expect(typeof r.body.data.paymentUrl).toBe('string');
});
