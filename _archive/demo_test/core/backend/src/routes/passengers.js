const express = require('express');
const jwt = require('jsonwebtoken');
const { PassengerModel } = require('../models/Passenger');
const router = express.Router();

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.substring(7) : '';
  if (!token) return res.status(401).json({ success: false, message: '未授权' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'test-jwt-secret');
    next();
  } catch (_) {
    return res.status(401).json({ success: false, message: '未授权' });
  }
};

function isValidId(id) { return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(id); }

router.get('/', authenticate, async (req, res) => {
  try {
    const { page=1, pageSize=10 } = req.query;
    const result = await PassengerModel.list(req.user.userId, { page, pageSize });
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: '获取乘车人失败' });
  }
});

router.post('/', authenticate, async (req, res) => {
  const p = req.body || {};
  if (!p.name || !p.id_number || !p.phone) return res.status(400).json({ success: false, message: '姓名、证件号码、手机号为必填' });
  if (!p.cert_type) p.cert_type = '身份证';
  if (!isValidId(p.id_number)) return res.status(400).json({ success: false, message: '身份证格式不正确' });
  try {
    const created = await PassengerModel.create(req.user.userId, p);
    res.status(201).json({ success: true, data: created });
  } catch (e) { res.status(500).json({ success: false, message: '新增失败' }); }
});

router.put('/:id', authenticate, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const p = req.body || {};
  if (!p.name || !p.id_number || !p.phone) return res.status(400).json({ success: false, message: '姓名、证件号码、手机号为必填' });
  if (!p.cert_type) p.cert_type = '身份证';
  if (!isValidId(p.id_number)) return res.status(400).json({ success: false, message: '身份证格式不正确' });
  try {
    const ok = await PassengerModel.update(req.user.userId, id, p);
    if (!ok) return res.status(404).json({ success: false, message: '未找到记录' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: '更新失败' }); }
});

router.delete('/:id', authenticate, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const ok = await PassengerModel.delete(req.user.userId, id);
    if (!ok) return res.status(404).json({ success: false, message: '未找到记录' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: '删除失败' }); }
});

router.post('/:id/default', authenticate, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const ok = await PassengerModel.setDefault(req.user.userId, id);
    if (!ok) return res.status(404).json({ success: false, message: '未找到记录' });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: '设置默认失败' }); }
});

module.exports = router;
