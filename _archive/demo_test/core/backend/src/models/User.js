const { db } = require('../database/init');

class User {
  // 创建用户
  static create(userData) {
    return new Promise((resolve, reject) => {
      const { userId, phone, password, realName, idNumber, email } = userData;
      
      db.run(
        `INSERT INTO users (user_id, phone, password, real_name, id_number, email) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, phone, password, realName, idNumber, email || null],
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

  // 更新密码（按 user_id）
  static updatePasswordByUserId(userId, newPassword) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE users SET password = ? WHERE user_id = ?`,
        [newPassword, userId],
        function (err) {
          if (err) return reject(err)
          resolve(this.changes > 0)
        }
      )
    })
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

  static updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      db.run(
        `UPDATE users SET last_login = ? WHERE user_id = ?`,
        [now, userId],
        function(err) {
          if (err) return reject(err);
          resolve(this.changes > 0);
        }
      );
    });
  }

  // 根据身份证查找用户
  static findByIdNumber(idNumber) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE id_number = ?`,
        [idNumber],
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

  // 根据邮箱查找用户
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM users WHERE email = ?`,
        [email],
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

  // 失效指定手机号下的旧验证码
  static invalidateByPhone(phone) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE verification_codes SET used = 1 WHERE phone = ? AND used = 0`,
        [phone],
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

  // 失效指定接收者（手机号或邮箱）的旧验证码
  static invalidateByRecipient(recipient) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE verification_codes SET used = 1 WHERE phone = ? AND used = 0`,
        [recipient],
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

  // 验证接收者（手机号或邮箱）与验证码
  static verifyRecipient(recipient, code) {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      db.get(
        `SELECT * FROM verification_codes 
         WHERE phone = ? AND code = ? AND used = 0 AND expires_at > ?
         ORDER BY created_at DESC LIMIT 1`,
        [recipient, code, now],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
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
