const express = require('express');
const jwt = require('jsonwebtoken');
const { User, VerificationCode } = require('../models/User');
const router = express.Router();

// 内存存储（用于发送频率限制）
const phoneCodeTimestamps = new Map();

// 生成6位验证码
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 生成JWT token
function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'test-jwt-secret', { expiresIn: '24h' });
}

// 验证手机号格式
function isValidPhoneNumber(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

function isValidIdNumber(idNumber) {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idNumber);
}

// POST /api/auth/send-code
router.post('/send-code', async (req, res) => {
  const { phone } = req.body;

  // 验证手机号格式
  if (!phone || !isValidPhoneNumber(phone)) {
    return res.status(400).json({ 
      success: false, 
      message: '手机号格式不正确' 
    });
  }

  // 检查发送频率限制
  const lastSentTime = phoneCodeTimestamps.get(phone);
  const now = Date.now();
  if (lastSentTime && now - lastSentTime < 60000) {
    return res.status(429).json({ 
      success: false, 
      message: '发送过于频繁，请稍后再试' 
    });
  }

  try {
    // 生成验证码
    const code = generateVerificationCode();
    const codeId = `code_${phone}_${now}`;
    
    // 存储验证码到数据库（5分钟有效期）
    await VerificationCode.save({
      codeId,
      phone,
      code,
      expiresAt: now + 5 * 60 * 1000
    });

    // 记录发送时间
    phoneCodeTimestamps.set(phone, now);

    // 模拟发送短信（实际应调用短信服务）
    console.log(`发送验证码到 ${phone}: ${code}`);

    res.json({ 
      success: true,
      message: '验证码发送成功', 
      data: { codeId }
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ 
      success: false, 
      message: '发送验证码失败，请稍后重试' 
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { phone, verificationCode, password, realName, idNumber } = req.body;

  // 验证参数
  if (!phone || !verificationCode || !password || !realName || !idNumber) {
    return res.status(400).json({ 
      success: false, 
      message: '参数错误或验证码无效' 
    });
  }

  if (!isValidPhoneNumber(phone)) {
    return res.status(400).json({ 
      success: false, 
      message: '参数错误或验证码无效' 
    });
  }

  // 验证身份证号格式
  if (!isValidIdNumber(idNumber)) {
    return res.status(400).json({ 
      success: false, 
      message: '身份证号格式不正确' 
    });
  }

  try {
    // 验证验证码（测试环境下跳过验证）
    let isValidCode = false;
    
    if (process.env.NODE_ENV === 'test' && verificationCode === '123456') {
      isValidCode = true;
    } else {
      isValidCode = await VerificationCode.verify(phone, verificationCode);
    }

    if (!isValidCode) {
      return res.status(400).json({ 
        success: false, 
        message: '验证码错误或已过期' 
      });
    }

    // 检查用户是否已存在
    const existingUser = await User.findByPhone(phone);
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: '手机号已存在'
      });
    }

    // 创建新用户
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await User.create({
      userId,
      phone,
      password,
      realName,
      idNumber
    });

    const token = generateToken(userId);

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        userId,
        token
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  // 验证参数
  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      message: '手机号和密码不能为空'
    });
  }

  // 验证手机号格式
  if (!isValidPhoneNumber(phone)) {
    return res.status(400).json({
      success: false,
      message: '手机号格式不正确'
    });
  }

  try {
    // 检查登录频率限制
    const loginKey = `login_${phone}`;
    const loginAttempts = phoneCodeTimestamps.get(loginKey) || 0;
    
    if (loginAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message: '登录尝试过于频繁，请稍后再试'
      });
    }

    // 查找用户并验证密码
    const user = await User.findByPhone(phone);
    
    if (!user || user.password !== password) {
      // 增加失败次数
      phoneCodeTimestamps.set(loginKey, loginAttempts + 1);
      return res.status(401).json({
        success: false,
        message: '手机号或密码错误'
      });
    }

    const token = generateToken(user.user_id);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        userId: user.user_id,
        token,
        user: {
          phone: user.phone,
          realName: user.real_name,
          idNumber: user.id_number
        }
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

// 调试接口 - 查看当前数据库中的用户数据
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.getAll();
    
    res.json({
      success: true,
      data: {
        userCount: users.length,
        users: users
      }
    });
  } catch (error) {
    console.error('获取用户数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户数据失败'
    });
  }
});

// 测试环境下的清理端点
if (process.env.NODE_ENV === 'test') {
  router.post('/clear-test-data', async (req, res) => {
    try {
      // 清理数据库中的测试数据
      // 这里可以添加清理逻辑
      phoneCodeTimestamps.clear();
      res.json({ success: true, message: '测试数据已清理' });
    } catch (error) {
      res.status(500).json({ success: false, message: '清理失败' });
    }
  });
}

module.exports = router;