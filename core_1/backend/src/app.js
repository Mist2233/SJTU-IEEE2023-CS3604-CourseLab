const express = require('express');
const cors = require('cors');
const { initDatabase } = require('./database/init');
const authRoutes = require('./routes/auth');
const trainRoutes = require('./routes/trains');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const passwordRoutes = require('./routes/password');
const accountRoutes = require('./routes/account');
const faceRoutes = require('./routes/face');

const app = express();

// 初始化数据库
initDatabase().catch(err => {
  console.error('数据库初始化失败:', err);
});

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 路由配置
app.use('/api/auth', authRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/password/reset/face', faceRoutes);

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: '12306购票系统后端服务运行正常'
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: '接口不存在',
    path: req.originalUrl,
    method: req.method
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
});

const net = require('net');
const PORT = process.env.PORT || 3000;

async function isPortAvailable(port) {
  return await new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port);
  });
}

async function choosePort(preferred) {
  const base = Number(preferred);
  for (let i = 0; i < 20; i++) {
    const candidate = base + i;
    if (await isPortAvailable(candidate)) return candidate;
  }
  return 0;
}

if (process.env.NODE_ENV !== 'test') {
  (async () => {
    const chosen = await choosePort(PORT);
    const server = app.listen(chosen, () => {
      const p = server.address().port;
      console.log(`12306购票系统后端服务启动成功`);
      console.log(`服务地址: http://localhost:${p}`);
      console.log(`健康检查: http://localhost:${p}/health`);
    });
    server.on('error', (err) => {
      console.error('服务器启动失败:', err);
      process.exit(1);
    });
  })();
}

module.exports = app;
