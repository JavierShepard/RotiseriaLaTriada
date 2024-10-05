const db = require('../config/db');

const Producto = {
  getAll: (callback) => {
    db.query('SELECT * FROM productos', (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },
  
  getById: (id, callback) => {
    db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
      if (err) return callback(err, null);
      if (!results.length) return callback(null, null);
      callback(null, results[0]);
    });
  },

  create: (producto, callback) => {
    const { nombre, stock, precio } = producto;
    db.query('INSERT INTO productos (nombre, stock, precio) VALUES (?, ?, ?)', 
    [nombre, stock, precio], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },

  updateById: (id, producto, callback) => {
    db.query('UPDATE productos SET ? WHERE id = ?', [producto, id], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },

  deleteById: (id, callback) => {
    db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },
};

module.exports = Producto;
