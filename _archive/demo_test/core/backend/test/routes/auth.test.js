const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');

const validId = '110105199001011234';
const phone = '13900000001';
const email = 'test1@example.com';
const username = 'user_test1';
const password = 'Passw0rd!';

async function clear() {
  await request(app).post('/api/auth/clear-test-data');
}

async function register(u = { username, email, phone, password, realName: '测试用户', idNumber: validId }) {
  const res = await request(app).post('/api/auth/register').send({
    username: u.username,
    email: u.email,
    phone: u.phone,
    verificationCode: '123456',
    password: u.password,
    realName: u.realName,
    idNumber: u.idNumber
  });
  return res;
}

async function login(identifier = phone, pwd = password) {
  const res = await request(app).post('/api/auth/login').send({ identifier, password: pwd });
  return res;
}

beforeEach(async () => {
  await clear();
});

test('send-code invalid phone', async () => {
  const r = await request(app).post('/api/auth/send-code').send({ phone: '123' });
  expect(r.status).toBe(400);
  expect(r.body.success).toBe(false);
  expect(r.body.message).toBe('手机号格式不正确');
});

test('send-code success returns code in test env', async () => {
  const r = await request(app).post('/api/auth/send-code').send({ phone });
  expect(r.status).toBe(200);
  expect(r.body.success).toBe(true);
  expect(r.body.data.codeId).toBeDefined();
  expect(r.body.data.code).toBeDefined();
});

test('register missing params', async () => {
  const r = await request(app).post('/api/auth/register').send({});
  expect(r.status).toBe(400);
});

test('register invalid fields', async () => {
  let r = await request(app).post('/api/auth/register').send({ username: '1bad', email, phone, verificationCode: '123456', password, realName: 'a', idNumber: validId });
  expect(r.status).toBe(400);
  r = await request(app).post('/api/auth/register').send({ username, email: 'bad', phone, verificationCode: '123456', password, realName: 'a', idNumber: validId });
  expect(r.status).toBe(400);
  r = await request(app).post('/api/auth/register').send({ username, email, phone: '123', verificationCode: '123456', password, realName: 'a', idNumber: validId });
  expect(r.status).toBe(400);
  r = await request(app).post('/api/auth/register').send({ username, email, phone, verificationCode: '123456', password, realName: 'a', idNumber: 'bad' });
  expect(r.status).toBe(400);
});

test('register success and duplicate conflict', async () => {
  const r1 = await register();
  expect(r1.status).toBe(201);
  const r2 = await request(app).post('/api/auth/register').send({ username: username + '2', email: 'test2@example.com', phone, verificationCode: '123456', password, realName: '测试用户', idNumber: '110105199001011235' });
  expect(r2.status).toBe(400);
});

test('login validations and success', async () => {
  const r0 = await request(app).post('/api/auth/login').send({});
  expect(r0.status).toBe(400);
  const r404 = await request(app).post('/api/auth/login').send({ identifier: 'nouser', password });
  expect(r404.status).toBe(404);
  await register();
  const r401 = await request(app).post('/api/auth/login').send({ identifier: phone, password: 'bad' });
  expect(r401.status).toBe(401);
  const r = await login(phone, password);
  expect(r.status).toBe(200);
  expect(r.body.data.token).toBeDefined();
});

test('login rate limit after failures', async () => {
  await register();
  for (let i = 0; i < 5; i++) {
    await request(app).post('/api/auth/login').send({ identifier: phone, password: 'bad' });
  }
  const r = await request(app).post('/api/auth/login').send({ identifier: phone, password: 'bad' });
  expect(r.status).toBe(429);
});

test('me unauthorized and not found and success', async () => {
  const r401 = await request(app).get('/api/auth/me');
  expect(r401.status).toBe(401);
  const fake = jwt.sign({ userId: 'no_user' }, process.env.JWT_SECRET || 'test-jwt-secret');
  const r404 = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${fake}`);
  expect(r404.status).toBe(404);
  await register();
  const lg = await login();
  const token = lg.body.data.token;
  const r = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
  expect(r.status).toBe(200);
  expect(r.body.data.userId).toBe(username);
});

test('change-password validations and success', async () => {
  const r401 = await request(app).post('/api/auth/change-password');
  expect(r401.status).toBe(401);
  await register();
  const lg = await login();
  const token = lg.body.data.token;
  let r = await request(app).post('/api/auth/change-password').set('Authorization', `Bearer ${token}`).send({});
  expect(r.status).toBe(400);
  r = await request(app).post('/api/auth/change-password').set('Authorization', `Bearer ${token}`).send({ oldPassword: password, newPassword: '123' });
  expect(r.status).toBe(400);
  r = await request(app).post('/api/auth/change-password').set('Authorization', `Bearer ${token}`).send({ oldPassword: 'bad', newPassword: 'Passw0rd2!' });
  expect(r.status).toBe(400);
  r = await request(app).post('/api/auth/change-password').set('Authorization', `Bearer ${token}`).send({ oldPassword: password, newPassword: 'Passw0rd2!' });
  expect(r.status).toBe(200);
  const l2 = await request(app).post('/api/auth/login').send({ identifier: phone, password: 'Passw0rd2!' });
  expect(l2.status).toBe(200);
});

test('forgot password send and reset', async () => {
  await register();
  const s = await request(app).post('/api/auth/forgot/send-code').send({ recipient: phone, idNumber: validId });
  expect(s.status).toBe(200);
  const code = s.body.data.code;
  const r = await request(app).post('/api/auth/forgot/reset').send({ recipient: phone, idNumber: validId, verificationCode: code, newPassword: 'Passw0rd3!' });
  expect(r.status).toBe(200);
  const l = await request(app).post('/api/auth/login').send({ identifier: phone, password: 'Passw0rd3!' });
  expect(l.status).toBe(200);
});

test('debug users returns list', async () => {
  await register();
  const r = await request(app).get('/api/auth/debug/users');
  expect(r.status).toBe(200);
  expect(r.body.data.userCount).toBeGreaterThanOrEqual(1);
});

