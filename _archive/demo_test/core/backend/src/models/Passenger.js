const { db } = require('../database/init');

class PassengerModel {
  static list(userId, { page = 1, pageSize = 10 } = {}) {
    return new Promise((resolve, reject) => {
      const offset = (parseInt(page) - 1) * parseInt(pageSize);
      db.all(
        `SELECT id, name, name_en, cert_type, id_number, phone, passenger_type, is_default, created_at
         FROM user_passengers WHERE user_id = ? ORDER BY datetime(created_at) DESC LIMIT ? OFFSET ?`,
        [userId, parseInt(pageSize), offset],
        (err, rows) => {
          if (err) return reject(err);
          db.get(`SELECT COUNT(*) as cnt FROM user_passengers WHERE user_id = ?`, [userId], (cErr, cRow) => {
            if (cErr) return reject(cErr);
            resolve({ passengers: rows || [], total: cRow?.cnt || 0 });
          });
        }
      );
    });
  }

  static create(userId, p) {
    return new Promise((resolve, reject) => {
      const { name, name_en, cert_type, id_number, phone, passenger_type, is_default } = p;
      db.run(
        `INSERT INTO user_passengers (user_id, name, name_en, cert_type, id_number, phone, passenger_type, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, name, name_en || null, cert_type, id_number, phone || null, passenger_type || '成人', is_default ? 1 : 0],
        function(err) {
          if (err) return reject(err);
          resolve({ id: this.lastID });
        }
      );
    });
  }

  static update(userId, id, p) {
    return new Promise((resolve, reject) => {
      const { name, name_en, cert_type, id_number, phone, passenger_type, is_default } = p;
      db.run(
        `UPDATE user_passengers SET name=?, name_en=?, cert_type=?, id_number=?, phone=?, passenger_type=?, is_default=? WHERE id=? AND user_id=?`,
        [name, name_en || null, cert_type, id_number, phone || null, passenger_type || '成人', is_default ? 1 : 0, id, userId],
        function(err) { if (err) return reject(err); resolve(this.changes > 0); }
      );
    });
  }

  static delete(userId, id) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM user_passengers WHERE id=? AND user_id=?`, [id, userId], function(err) {
        if (err) return reject(err); resolve(this.changes > 0);
      });
    });
  }

  static setDefault(userId, id) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run(`UPDATE user_passengers SET is_default=0 WHERE user_id=?`, [userId], function(err){ if (err) return reject(err); });
        db.run(`UPDATE user_passengers SET is_default=1 WHERE id=? AND user_id=?`, [id, userId], function(err){ if (err) return reject(err); resolve(this.changes > 0); });
      });
    });
  }
}

module.exports = { PassengerModel };
