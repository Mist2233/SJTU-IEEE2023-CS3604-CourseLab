const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'users.db');
console.log('数据库路径:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('连接数据库失败:', err);
    return;
  }
  console.log('数据库连接成功');
});

// 查询用户表
db.all("SELECT * FROM users", [], (err, rows) => {
  if (err) {
    console.error('查询用户表失败:', err);
  } else {
    console.log('\n=== 用户表数据 ===');
    console.log('用户数量:', rows.length);
    if (rows.length > 0) {
      rows.forEach((row, index) => {
        console.log(`用户 ${index + 1}:`, {
          user_id: row.user_id,
          phone: row.phone,
          real_name: row.real_name,
          id_number: row.id_number,
          created_at: row.created_at
        });
      });
    } else {
      console.log('用户表为空');
    }
  }
});

// 查询验证码表
db.all("SELECT * FROM verification_codes", [], (err, rows) => {
  if (err) {
    console.error('查询验证码表失败:', err);
  } else {
    console.log('\n=== 验证码表数据 ===');
    console.log('验证码数量:', rows.length);
    if (rows.length > 0) {
      rows.forEach((row, index) => {
        console.log(`验证码 ${index + 1}:`, {
          code_id: row.code_id,
          phone: row.phone,
          code: row.code,
          expires_at: new Date(row.expires_at).toLocaleString(),
          created_at: row.created_at
        });
      });
    } else {
      console.log('验证码表为空');
    }
  }
  
  // 关闭数据库连接
  db.close((err) => {
    if (err) {
      console.error('关闭数据库失败:', err);
    } else {
      console.log('\n数据库连接已关闭');
    }
  });
});