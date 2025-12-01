const { db } = require('../database/init')

class Order {
  static create(order) {
    return new Promise((resolve, reject) => {
      const {
        orderId,
        userId,
        trainNumber,
        date,
        from,
        to,
        totalAmount,
        status,
        paymentDeadline
      } = order

      db.run(
        `INSERT INTO orders (order_id, user_id, train_number, date, from_station, to_station, total_amount, status, payment_deadline)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, userId, trainNumber, date, from, to, totalAmount, status, paymentDeadline],
        function (err) {
          if (err) return reject(err)
          resolve({ id: this.lastID, orderId })
        }
      )
    })
  }

  static addPassengers(orderId, passengers) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(
        `INSERT INTO order_passengers (order_id, name, id_number, seat_type) VALUES (?, ?, ?, ?)`
      )
      db.serialize(() => {
        try {
          passengers.forEach(p => {
            stmt.run(orderId, p.name, p.idNumber, p.seatType)
          })
          stmt.finalize(err => {
            if (err) return reject(err)
            resolve(true)
          })
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  static getById(orderId) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM orders WHERE order_id = ?`, [orderId], (err, orderRow) => {
        if (err) return reject(err)
        if (!orderRow) return resolve(null)
        db.all(`SELECT name, id_number as idNumber, seat_type as seatType FROM order_passengers WHERE order_id = ?`, [orderId], (pErr, passengers) => {
          if (pErr) return reject(pErr)
          const order = {
            orderId: orderRow.order_id,
            userId: orderRow.user_id,
            trainNumber: orderRow.train_number,
            date: orderRow.date,
            from: orderRow.from_station,
            to: orderRow.to_station,
            passengers,
            totalAmount: orderRow.total_amount,
            status: orderRow.status,
            paymentDeadline: orderRow.payment_deadline,
            createdAt: orderRow.created_at
          }
          if (orderRow.ticket_info && orderRow.status === 'PAID') {
            try {
              order.ticketInfo = JSON.parse(orderRow.ticket_info)
            } catch (_) {}
          }
          resolve(order)
        })
      })
    })
  }

  static listByUser(userId, { status, page = 1, pageSize = 10 } = {}) {
    return new Promise((resolve, reject) => {
      const offset = (parseInt(page) - 1) * parseInt(pageSize)
      const params = [userId]
      let where = `WHERE user_id = ?`
      if (status) {
        where += ` AND status = ?`
        params.push(status)
      }

      db.all(
        `SELECT o.order_id, o.train_number, o.date, o.from_station, o.to_station, o.total_amount, o.status, o.payment_deadline, o.created_at, o.ticket_info,
                t.departure_time as dep_time, t.arrival_time as arr_time
         FROM orders o LEFT JOIN trains t ON o.train_number = t.train_number
         ${where.replace(/orders/g,'o')}
         ORDER BY datetime(o.created_at) DESC
         LIMIT ? OFFSET ?`,
        [...params, parseInt(pageSize), offset],
        (err, rows) => {
          if (err) return reject(err)
          db.get(
            `SELECT COUNT(*) as cnt FROM orders ${where}`,
            params,
            (cErr, countRow) => {
              if (cErr) return reject(cErr)
              const orders = rows.map(r => {
                const o = {
                  orderId: r.order_id,
                  trainNumber: r.train_number,
                  date: r.date,
                  from: r.from_station,
                  to: r.to_station,
                  totalAmount: r.total_amount,
                  status: r.status,
                  paymentDeadline: r.payment_deadline,
                  createdAt: r.created_at,
                  departureTime: r.dep_time,
                  arrivalTime: r.arr_time
                }
                if (r.ticket_info && r.status === 'PAID') {
                  try { o.ticketInfo = JSON.parse(r.ticket_info) } catch (_) {}
                }
                return o
              })
              if (orders.length === 0) {
                return resolve({
                  orders,
                  pagination: {
                    page: parseInt(page),
                    pageSize: parseInt(pageSize),
                    totalPages: Math.ceil(countRow.cnt / parseInt(pageSize)),
                    totalOrders: countRow.cnt,
                    hasNextPage: offset + parseInt(pageSize) < countRow.cnt,
                    hasPrevPage: parseInt(page) > 1
                  }
                })
              }
              let pending = orders.length
              orders.forEach((o, idx) => {
                db.all(
                  `SELECT name, id_number as idNumber, seat_type as seatType FROM order_passengers WHERE order_id = ?`,
                  [o.orderId],
                  (pErr, passengers) => {
                    // 若查询乘客失败，不影响主流程，使用空数组
                    orders[idx].passengers = Array.isArray(passengers) ? passengers : []
                    pending -= 1
                    if (pending === 0) {
                      resolve({
                        orders,
                        pagination: {
                          page: parseInt(page),
                          pageSize: parseInt(pageSize),
                          totalPages: Math.ceil(countRow.cnt / parseInt(pageSize)),
                          totalOrders: countRow.cnt,
                          hasNextPage: offset + parseInt(pageSize) < countRow.cnt,
                          hasPrevPage: parseInt(page) > 1
                        }
                      })
                    }
                  }
                )
              })
            }
          )
        }
      )
    })
  }

  static updateStatus(orderId, status) {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE orders SET status = ? WHERE order_id = ?`, [status, orderId], function (err) {
        if (err) return reject(err)
        resolve(this.changes > 0)
      })
    })
  }

  static setPaid(orderId, ticketInfo) {
    return new Promise((resolve, reject) => {
      const json = JSON.stringify(ticketInfo || {})
      const paidAt = new Date().toISOString()
      db.run(`UPDATE orders SET status = 'PAID', paid_at = ?, ticket_info = ? WHERE order_id = ?`, [paidAt, json, orderId], function (err) {
        if (err) return reject(err)
        resolve(this.changes > 0)
      })
    })
  }
}

module.exports = { Order }
