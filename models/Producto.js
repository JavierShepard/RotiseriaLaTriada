// models/Producto.js
const db = require('../config/db');

const Producto = {
  getAll: (callback) => {
    db.query('SELECT * FROM productos', callback);
  },

  getByIdPromise: (id) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);  // Devolver el primer resultado
      });
    });
  },

  updateStock: (id, cantidad) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
};

module.exports = Producto;
