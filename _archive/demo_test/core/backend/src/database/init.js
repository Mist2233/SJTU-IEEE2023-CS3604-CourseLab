const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 数据库文件路径（测试环境使用内存数据库，避免数据污染）
const dbPath = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : path.join(__dirname, '../../database/users.db');

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接失败:', err.message);
  } else {
    console.log('数据库连接成功:', dbPath);
  }
});

// 立即初始化数据库表，避免测试期间的竞态条件
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      real_name TEXT NOT NULL,
      id_number TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `, (err) => {
    if (err) {
      console.error('创建用户表失败:', err.message);
    } else {
      console.log('用户表创建成功');
      const ensureUnique = (col, indexName, excludeNull) => {
        const where = excludeNull ? `WHERE ${col} IS NOT NULL` : '';
        db.all(`SELECT ${col} AS v, COUNT(*) AS c FROM users ${where} GROUP BY ${col} HAVING COUNT(*) > 1`, [], (eDup, rowsDup) => {
          if (eDup) {
            console.warn(`检查 ${col} 重复失败:`, eDup.message);
            return;
          }
          if (Array.isArray(rowsDup) && rowsDup.length > 0) {
            console.warn(`检测到 ${col} 存在重复 ${rowsDup.length} 项，跳过唯一索引创建`);
          } else {
            db.run(`CREATE UNIQUE INDEX IF NOT EXISTS ${indexName} ON users(${col})`, [], (eIdx) => {
              if (eIdx) console.warn(`创建 ${col} 唯一索引失败:`, eIdx.message);
            });
          }
        });
      };
      ensureUnique('id_number', 'idx_users_id_number', false);

      // 检查是否已有 email 列，若没有则添加，并创建唯一索引
      db.all(`PRAGMA table_info(users)`, [], (eInfo, rows) => {
        if (eInfo) {
          console.warn('检查用户表结构失败:', eInfo.message);
          return;
        }
        const hasEmail = Array.isArray(rows) && rows.some(r => r.name === 'email');
        const hasLastLogin = Array.isArray(rows) && rows.some(r => r.name === 'last_login');
        const ensureEmailIndex = () => ensureUnique('email', 'idx_users_email', true);
        if (!hasEmail) {
          db.run(`ALTER TABLE users ADD COLUMN email TEXT`, [], (eAdd) => {
            if (eAdd) {
              console.warn('添加邮箱列失败:', eAdd.message);
            } else {
              console.log('邮箱列已添加');
            }
            ensureEmailIndex();
          });
        } else {
          ensureEmailIndex();
        }

        if (!hasLastLogin) {
          db.run(`ALTER TABLE users ADD COLUMN last_login DATETIME`, [], (eAdd2) => {
            if (eAdd2) console.warn('添加最后登录列失败:', eAdd2.message);
            else console.log('最后登录列已添加');
          });
        }
      });
    }
  });

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
    } else {
      console.log('验证码表创建成功');
    }
  });

  // 订单主表
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      train_number TEXT NOT NULL,
      date TEXT NOT NULL,
      from_station TEXT NOT NULL,
      to_station TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      status TEXT NOT NULL,
      payment_deadline TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      paid_at TEXT,
      ticket_info TEXT
    )
  `, (err) => {
    if (err) {
      console.error('创建订单表失败:', err.message);
    } else {
      console.log('订单表创建成功');
    }
  });

  // 订单乘客表
  db.run(`
    CREATE TABLE IF NOT EXISTS order_passengers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      name TEXT NOT NULL,
      id_number TEXT NOT NULL,
      seat_type TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('创建订单乘客表失败:', err.message);
    } else {
      console.log('订单乘客表创建成功');
    }
  });

  // 常用乘车人表
  db.run(`
    CREATE TABLE IF NOT EXISTS user_passengers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      name_en TEXT,
      cert_type TEXT NOT NULL,
      id_number TEXT NOT NULL,
      phone TEXT,
      passenger_type TEXT NOT NULL DEFAULT '成人',
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建常用乘车人表失败:', err.message);
    } else {
      console.log('常用乘车人表创建成功');
      db.run(`CREATE INDEX IF NOT EXISTS idx_user_passengers_user ON user_passengers(user_id)`, [], () => {});
    }
  });

  // 列车信息表
  db.run(`
    CREATE TABLE IF NOT EXISTS trains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      train_number TEXT NOT NULL,
      departure_station TEXT NOT NULL,
      arrival_station TEXT NOT NULL,
      departure_time TEXT NOT NULL,
      arrival_time TEXT NOT NULL,
      duration TEXT NOT NULL,
      type_prefix TEXT NOT NULL,
      business_class INTEGER DEFAULT 0,
      first_class INTEGER DEFAULT 0,
      second_class INTEGER DEFAULT 0,
      premium_sleeper INTEGER DEFAULT 0,
      soft_sleeper INTEGER DEFAULT 0,
      hard_sleeper INTEGER DEFAULT 0,
      hard_seat INTEGER DEFAULT 0
    )
  `, (err) => {
    if (err) {
      console.error('创建列车表失败:', err.message);
    } else {
      console.log('列车表创建成功');
      // 如为空则进行种子数据初始化
      db.get('SELECT COUNT(*) AS cnt FROM trains', [], (cErr, row) => {
        if (cErr) {
          console.error('检查列车表失败:', cErr.message);
          return;
        }
        if ((row?.cnt || 0) === 0) {
          const seed = [
            // 高速 北京南→上海虹桥
            ['G103','北京南','上海虹桥','06:20','10:38','4小时18分','G',3,9,120,0,0,0,0],
            ['G104','北京南','上海虹桥','06:17','10:17','4小时00分','G',9,2,0,0,0,0,0],
            ['G106','北京南','上海虹桥','07:00','11:05','4小时05分','G',13,19,0,0,0,0,0],
            ['G108','北京南','上海虹桥','08:00','12:05','4小时05分','G',10,0,0,0,0,0,0],
            ['G110','北京南','上海虹桥','08:38','12:54','4小时16分','G',3,2,0,0,0,0,0],
            ['G112','北京南','上海虹桥','09:05','13:22','4小时17分','G',0,0,13,0,0,0,0],
            ['G114','北京南','上海虹桥','09:43','13:57','4小时14分','G',6,0,0,0,0,0,0],
            ['G116','北京南','上海虹桥','10:26','14:36','4小时10分','G',1,8,0,0,0,0,0],
            ['G10','北京南','上海虹桥','10:34','15:34','5小时00分','G',20,0,0,0,0,0,0],
            // 动车
            ['D321','北京','上海','11:00','19:30','8小时30分','D',0,25,120,0,0,0,0],
            ['D102','北京','天津','12:10','13:00','0小时50分','D',0,30,200,0,0,0,0],
            ['D203','上海','杭州','08:20','09:15','0小时55分','D',0,20,180,0,0,0,0],
            // 直达
            ['Z21','北京西','上海','20:00','07:30+1','11小时30分','Z',0,0,0,4,20,40,0],
            ['Z22','上海','北京','21:00','08:00+1','11小时00分','Z',0,0,0,8,24,60,0],
            // 特快
            ['T109','北京','上海','19:30','12:58+1','17小时28分','T',0,0,0,0,15,80,200],
            ['T12','上海','南京','07:15','11:45','4小时30分','T',0,0,0,0,10,40,120],
            // 快速
            ['K528','北京','济南','06:00','12:30','6小时30分','K',0,0,0,0,10,30,150],
            ['K312','南京','合肥','16:20','18:50','2小时30分','K',0,0,0,0,6,20,100]
          ];
          const stmt = db.prepare(`INSERT INTO trains (
            train_number, departure_station, arrival_station, departure_time, arrival_time, duration, type_prefix,
            business_class, first_class, second_class, premium_sleeper, soft_sleeper, hard_sleeper, hard_seat
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
          db.serialize(() => {
            seed.forEach(r => stmt.run(r));
            stmt.finalize(err2 => {
              if (err2) console.error('插入列车种子数据失败:', err2.message);
              else console.log('列车种子数据已初始化');
            });
          });
        } else if ((row?.cnt || 0) < 40) {
          const pairs = [
            ['北京南','上海虹桥'], ['北京南','广州南'], ['北京南','深圳北'],
            ['上海虹桥','北京南'], ['上海虹桥','广州南'], ['上海虹桥','深圳北'],
            ['广州南','北京南'], ['广州南','上海虹桥'], ['广州南','深圳北'],
            ['深圳北','北京南'], ['深圳北','上海虹桥'], ['深圳北','广州南']
          ];
          const types = ['G','D','K','Z','T'];
          const addHours = (hhmm, hours) => {
            const [h,m] = hhmm.split(':').map(x=>parseInt(x,10));
            const total = h + hours;
            const next = total >= 24;
            const nh = (total % 24).toString().padStart(2,'0');
            return nh + ':' + (m.toString().padStart(2,'0')) + (next ? '+1' : '');
          };
          const durationFor = (type, from, to) => {
            const longPair = (a,b) => (a.includes('北京') && b.includes('广州')) || (a.includes('北京') && b.includes('深圳')) || (a.includes('上海') && b.includes('广州')) || (a.includes('上海') && b.includes('深圳'));
            const shortPair = (a,b) => (a.includes('广州') && b.includes('深圳'));
            if (type==='G') return shortPair(from,to) ? 1 : (longPair(from,to) ? 10 : 4);
            if (type==='D') return shortPair(from,to) ? 1 : (longPair(from,to) ? 12 : 8);
            if (type==='K') return shortPair(from,to) ? 3 : (longPair(from,to) ? 16 : 12);
            if (type==='Z') return shortPair(from,to) ? 4 : (longPair(from,to) ? 14 : 11);
            if (type==='T') return shortPair(from,to) ? 5 : (longPair(from,to) ? 16 : 13);
            return 8;
          };
          const makeNum = (type, base, idx) => type + (base + idx);
          const extra = [];
          let baseNo = 300;
          pairs.forEach(([from, to]) => {
            for (let i=0;i<12;i++) {
              const type = types[i % types.length];
              const depH = (6 + (i%12)).toString().padStart(2,'0') + ':00';
              const dur = durationFor(type, from, to);
              const arr = addHours(depH, dur);
              const durStr = (dur>=24? Math.floor(dur/24)+'天':'') + Math.floor(dur)+'小时00分';
              const tn = makeNum(type, baseNo, i);
              const seats = type==='G' ? [5,10,100,0,0,0,0] : type==='D' ? [0,30,180,0,0,0,0] : type==='K' ? [0,0,0,0,10,40,180] : type==='Z' ? [0,0,0,6,20,50,0] : [0,0,0,0,10,60,160];
              extra.push([tn, from, to, depH, arr, durStr, type, ...seats]);
            }
            baseNo += 20;
          });
          const stmt2 = db.prepare(`INSERT INTO trains (
            train_number, departure_station, arrival_station, departure_time, arrival_time, duration, type_prefix,
            business_class, first_class, second_class, premium_sleeper, soft_sleeper, hard_sleeper, hard_seat
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
          db.serialize(() => {
            extra.forEach(r => stmt2.run(r));
            stmt2.finalize(err3 => {
              if (err3) console.error('追加列车数据失败:', err3.message);
              else console.log('列车额外数据已追加', extra.length);
            });
          });
        }
      });
    }
  });
});

// 保留兼容的初始化函数（立即解析）
const initDatabase = () => Promise.resolve();

module.exports = {
  db,
  initDatabase
};
