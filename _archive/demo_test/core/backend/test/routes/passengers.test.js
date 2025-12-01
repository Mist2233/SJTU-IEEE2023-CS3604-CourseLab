const request = require('supertest');
const app = require('../../src/app');

const user = { username: 'p_user', email: 'p@example.com', phone: '13900000006', password: 'PPwd1!', realName: '乘客用户', idNumber: '110105199601011234' };

async function clear() { await request(app).post('/api/auth/clear-test-data'); }
async function register(u) { return request(app).post('/api/auth/register').send({ ...u, verificationCode: '123456' }); }
async function login(id, pwd) { return request(app).post('/api/auth/login').send({ identifier: id, password: pwd }); }

beforeEach(async () => { await clear(); });

test('list unauthorized and success', async () => {
  let r = await request(app).get('/api/passengers');
  expect(r.status).toBe(401);
  await register(user);
  const lg = await login(user.phone, user.password);
  const t = lg.body.data.token;
  r = await request(app).get('/api/passengers').set('Authorization', `Bearer ${t}`);
  expect(r.status).toBe(200);
});

test('create validations and success', async () => {
  await register(user);
  const lg = await login(user.phone, user.password);
  const t = lg.body.data.token;
  let r = await request(app).post('/api/passengers').set('Authorization', `Bearer ${t}`).send({});
  expect(r.status).toBe(400);
  r = await request(app).post('/api/passengers').set('Authorization', `Bearer ${t}`).send({ name: '张三', id_number: 'bad', phone: '13900000000' });
  expect(r.status).toBe(400);
  r = await request(app).post('/api/passengers').set('Authorization', `Bearer ${t}`).send({ name: '张三', id_number: '110105199001011234', phone: '13900000000' });
  expect(r.status).toBe(201);
});

test('update validations and not found and success', async () => {
  await register(user);
  const lg = await login(user.phone, user.password);
  const t = lg.body.data.token;
  const created = await request(app).post('/api/passengers').set('Authorization', `Bearer ${t}`).send({ name: '张三', id_number: '110105199001011234', phone: '13900000000' });
  const id = created.body.data.id;
  let r = await request(app).put(`/api/passengers/${id}`).set('Authorization', `Bearer ${t}`).send({});
  expect(r.status).toBe(400);
  r = await request(app).put(`/api/passengers/${id}`).set('Authorization', `Bearer ${t}`).send({ name: '张三', id_number: 'bad', phone: '13900000000' });
  expect(r.status).toBe(400);
  r = await request(app).put(`/api/passengers/${id+999}`).set('Authorization', `Bearer ${t}`).send({ name: '张三', id_number: '110105199001011234', phone: '13900000000' });
  expect(r.status).toBe(404);
  r = await request(app).put(`/api/passengers/${id}`).set('Authorization', `Bearer ${t}`).send({ name: '李四', id_number: '110105199001011234', phone: '13900000000' });
  expect(r.status).toBe(200);
});

test('delete and set default not found and success', async () => {
  await register(user);
  const lg = await login(user.phone, user.password);
  const t = lg.body.data.token;
  const created = await request(app).post('/api/passengers').set('Authorization', `Bearer ${t}`).send({ name: '张三', id_number: '110105199001011234', phone: '13900000000' });
  const id = created.body.data.id;
  let r = await request(app).delete(`/api/passengers/${id+999}`).set('Authorization', `Bearer ${t}`);
  expect(r.status).toBe(404);
  r = await request(app).post(`/api/passengers/${id+999}/default`).set('Authorization', `Bearer ${t}`);
  expect(r.status).toBe(404);
  r = await request(app).post(`/api/passengers/${id}/default`).set('Authorization', `Bearer ${t}`);
  expect(r.status).toBe(200);
  r = await request(app).delete(`/api/passengers/${id}`).set('Authorization', `Bearer ${t}`);
  expect(r.status).toBe(200);
});

