const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径
const dbPath = path.join(__dirname, '../../database/users.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('数据库连接成功:', dbPath);
  }
});

// 初始化数据库表
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    // 创建用户表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        real_name TEXT NOT NULL,
        id_number TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('创建用户表失败:', err.message);
        reject(err);
      } else {
        console.log('用户表创建成功');
        
        // 创建验证码表
        db.run(`
          CREATE TABLE IF NOT EXISTS verification_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code_id TEXT UNIQUE NOT NULL,
            phone TEXT NOT NULL,
            code TEXT NOT NULL,
            expires_at INTEGER NOT NULL,
            used INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('创建验证码表失败:', err.message);
            reject(err);
          } else {
            console.log('验证码表创建成功');
            resolve();
          }
        });
      }
    });
  });
};

module.exports = {
  db,
  initDatabase
};