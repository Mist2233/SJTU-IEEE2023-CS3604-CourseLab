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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username) {
  return /^[A-Za-z][A-Za-z0-9_]{5,29}$/.test(username);
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
    // 失效旧验证码
    await VerificationCode.invalidateByPhone(phone);

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

    const data = { codeId };
    if (process.env.NODE_ENV !== 'production') {
      data.code = code;
    }
    res.json({ 
      success: true,
      message: '验证码发送成功', 
      data
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
  const { username, email, phone, verificationCode, password, realName, idNumber } = req.body;

  // 验证参数
  if (!username || !email || !phone || !verificationCode || !password || !realName || !idNumber) {
    console.log('注册失败: 参数缺失');
    return res.status(400).json({ 
      success: false, 
      message: '参数错误或验证码无效' 
    });
  }

  if (!isValidUsername(username)) {
    return res.status(400).json({ success: false, message: '用户名格式不正确' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ success: false, message: '邮箱格式不正确' });
  }

  if (!isValidPhoneNumber(phone)) {
    console.log('注册失败: 手机号格式不正确');
    return res.status(400).json({ 
      success: false, 
      message: '参数错误或验证码无效' 
    });
  }

  // 验证身份证号格式
  if (!isValidIdNumber(idNumber)) {
    console.log('注册失败: 身份证号格式不正确');
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
      console.log('注册失败: 验证码无效', process.env.NODE_ENV, verificationCode);
      return res.status(400).json({ 
        success: false, 
        message: '验证码错误或已过期' 
      });
    }

    // 检查用户是否已存在（手机号、身份证、邮箱、用户名）
    const byPhone = await User.findByPhone(phone);
    if (byPhone) return res.status(400).json({ success: false, message: '手机号已存在' });

    const byId = await User.findByIdNumber(idNumber);
    if (byId) return res.status(400).json({ success: false, message: '身份证已存在' });

    const byEmail = await User.findByEmail(email);
    if (byEmail) return res.status(400).json({ success: false, message: '邮箱已存在' });

    const byUserId = await User.findByUserId(username);
    if (byUserId) return res.status(400).json({ success: false, message: '用户名已存在' });

    // 创建新用户（使用前端用户名作为 user_id）
    const userId = username;
    await User.create({
      userId,
      phone,
      password,
      realName,
      idNumber,
      email
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
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: '账号和密码不能为空' });
  }

  try {
    const loginKey = `login_${identifier}`;
    const loginAttempts = phoneCodeTimestamps.get(loginKey) || 0;
    if (loginAttempts >= 5) {
      return res.status(429).json({ success: false, message: '登录尝试过于频繁，请稍后再试' });
    }

    let user = null;
    if (isValidPhoneNumber(identifier)) {
      user = await User.findByPhone(identifier);
    } else if (isValidEmail(identifier)) {
      user = await User.findByEmail(identifier);
    } else {
      user = await User.findByUserId(identifier);
    }

    if (!user) {
      phoneCodeTimestamps.set(loginKey, loginAttempts + 1);
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    if (user.password !== password) {
      phoneCodeTimestamps.set(loginKey, loginAttempts + 1);
      return res.status(401).json({ success: false, message: '账号或密码错误' });
    }

    const token = generateToken(user.user_id);
    try { await User.updateLastLogin(user.user_id) } catch (_) {}
    res.json({
      success: true,
      message: '登录成功',
      data: {
        userId: user.user_id,
        token,
        user: {
          phone: user.phone,
          realName: user.real_name,
          idNumber: user.id_number,
          email: user.email
        }
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ success: false, message: '登录失败，请稍后重试' });
  }
});

// 忘记密码：发送验证码（2分钟有效，重发立即失效旧码）
router.post('/forgot/send-code', async (req, res) => {
  const { recipient, idNumber } = req.body; // recipient 可为手机号或邮箱
  if (!recipient || !idNumber) {
    return res.status(400).json({ success: false, message: '参数缺失' });
  }
  const isPhone = isValidPhoneNumber(recipient);
  const isMail = isValidEmail(recipient);
  if (!isPhone && !isMail) {
    return res.status(400).json({ success: false, message: '账号格式不正确' });
  }
  if (!isValidIdNumber(idNumber)) {
    return res.status(400).json({ success: false, message: '身份证号格式不正确' });
  }
  try {
    let user = null;
    if (isPhone) user = await User.findByPhone(recipient);
    else user = await User.findByEmail(recipient);
    if (!user || user.id_number !== idNumber) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    await VerificationCode.invalidateByRecipient(recipient);
    const now = Date.now();
    const code = generateVerificationCode();
    const codeId = `fp_${recipient}_${now}`;
    await VerificationCode.save({ codeId, phone: recipient, code, expiresAt: now + 2 * 60 * 1000 });
    console.log(`忘记密码验证码发送至 ${recipient}: ${code}`);
    const data = { codeId };
    if (process.env.NODE_ENV !== 'production') data.code = code;
    res.json({ success: true, message: '验证码发送成功', data });
  } catch (e) {
    console.error('忘记密码发送验证码失败:', e);
    res.status(500).json({ success: false, message: '发送验证码失败，请稍后重试' });
  }
});

// 忘记密码：重置密码
router.post('/forgot/reset', async (req, res) => {
  const { recipient, idNumber, verificationCode, newPassword } = req.body;
  if (!recipient || !idNumber || !verificationCode || !newPassword) {
    return res.status(400).json({ success: false, message: '参数缺失' });
  }
  const isPhone = isValidPhoneNumber(recipient);
  const isMail = isValidEmail(recipient);
  if (!isPhone && !isMail) {
    return res.status(400).json({ success: false, message: '账号格式不正确' });
  }
  if (!isValidIdNumber(idNumber)) {
    return res.status(400).json({ success: false, message: '身份证号格式不正确' });
  }
  try {
    let user = null;
    if (isPhone) user = await User.findByPhone(recipient);
    else user = await User.findByEmail(recipient);
    if (!user || user.id_number !== idNumber) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    const ok = await VerificationCode.verifyRecipient(recipient, verificationCode);
    if (!ok) {
      return res.status(400).json({ success: false, message: '验证码错误或已过期' });
    }
    await User.updatePasswordByUserId(user.user_id, newPassword);
    res.json({ success: true, message: '密码重置成功' });
  } catch (e) {
    console.error('忘记密码重置失败:', e);
    res.status(500).json({ success: false, message: '重置失败，请稍后重试' });
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
  const { db } = require('../database/init');
  router.post('/clear-test-data', async (req, res) => {
    try {
      phoneCodeTimestamps.clear();

      await new Promise((resolve, reject) => {
        db.run('DELETE FROM users', [], function(err) {
          if (err) return reject(err);
          resolve();
        });
      });

      await new Promise((resolve, reject) => {
        db.run('DELETE FROM verification_codes', [], function(err) {
          if (err) return reject(err);
          resolve();
        });
      });

      res.json({ success: true, message: '测试数据已清理' });
    } catch (error) {
      res.status(500).json({ success: false, message: '清理失败' });
    }
  });
}

module.exports = router;
// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.substring(7) : '';
    if (!token) return res.status(401).json({ success: false, message: '未授权' });
    let payload;
    try { payload = jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret') } catch (_) {
      return res.status(401).json({ success: false, message: '未授权' });
    }
    const user = await User.findByUserId(payload.userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
    res.json({ success: true, data: {
      userId: user.user_id,
      phone: user.phone,
      realName: user.real_name,
      idNumber: user.id_number,
      email: user.email,
      createdAt: user.created_at,
      lastLogin: user.last_login
    } });
  } catch (e) {
    res.status(500).json({ success: false, message: '获取用户信息失败' });
  }
});

// 修改密码
router.post('/change-password', async (req, res) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.substring(7) : '';
  if (!token) return res.status(401).json({ success: false, message: '未授权' });
  let payload;
  try { payload = jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret') } catch (_) {
    return res.status(401).json({ success: false, message: '未授权' });
  }
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: '参数缺失' });
  if (newPassword.length < 6 || newPassword.length > 20) return res.status(400).json({ success: false, message: '新密码长度需为6-20位' });
  try {
    const user = await User.findByUserId(payload.userId);
    if (!user) return res.status(404).json({ success: false, message: '用户不存在' });
  if (user.password !== oldPassword) return res.status(400).json({ success: false, message: '旧密码不正确' });
    await User.updatePasswordByUserId(payload.userId, newPassword);
    res.json({ success: true, message: '密码修改成功' });
  } catch (e) {
    res.status(500).json({ success: false, message: '密码修改失败' });
  }
});
