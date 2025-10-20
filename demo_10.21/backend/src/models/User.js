const { db } = require('../database/init');

class User {
  // 创建用户
  static create(userData) {
    return new Promise((resolve, reject) => {
      const { userId, phone, password, realName, idNumber } = userData;
      
      db.run(
        `INSERT INTO users (user_id, phone, password, real_name, id_number) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, phone, password, realName, idNumber],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ userId, id: this.lastID });
          }
        }
      );
    });
  }

  // 根据手机号查找用户
  static findByPhone(phone) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE phone = ?`,
        [phone],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // 根据用户ID查找用户
  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE user_id = ?`,
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  // 获取所有用户（调试用）
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT user_id, phone, real_name, created_at FROM users`,
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
}

class VerificationCode {
  // 保存验证码
  static save(codeData) {
    return new Promise((resolve, reject) => {
      const { codeId, phone, code, expiresAt } = codeData;
      
      db.run(
        `INSERT INTO verification_codes (code_id, phone, code, expires_at) 
         VALUES (?, ?, ?, ?)`,
        [codeId, phone, code, expiresAt],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ codeId, id: this.lastID });
          }
        }
      );
    });
  }

  // 验证验证码
  static verify(phone, code) {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      
      db.get(
        `SELECT * FROM verification_codes 
         WHERE phone = ? AND code = ? AND used = 0 AND expires_at > ?
         ORDER BY created_at DESC LIMIT 1`,
        [phone, code, now],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            // 标记验证码为已使用
            db.run(
              `UPDATE verification_codes SET used = 1 WHERE id = ?`,
              [row.id],
              (updateErr) => {
                if (updateErr) {
                  reject(updateErr);
                } else {
                  resolve(true);
                }
              }
            );
          } else {
            resolve(false);
          }
        }
      );
    });
  }

  // 清理过期验证码
  static cleanExpired() {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      
      db.run(
        `DELETE FROM verification_codes WHERE expires_at < ?`,
        [now],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes);
          }
        }
      );
    });
  }
}

module.exports = {
  User,
  VerificationCode
};