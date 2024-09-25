// models/Producto.js
const db = require('../config/db');

const Producto = {
  getAll: (callback) => {
    db.query('SELECT * FROM productos', callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM productos WHERE id = ?', [id], callback);
  },

  create: (producto, callback) => {
    db.query('INSERT INTO productos (nombre, stock, precio) VALUES (?, ?, ?)', 
    [producto.nombre, producto.stock, producto.precio], callback);
  },

  updateById: (id, producto, callback) => {
    db.query('UPDATE productos SET nombre = ?, stock = ?, precio = ? WHERE id = ?', 
    [producto.nombre, producto.stock, producto.precio, id], callback);
  },

  deleteById: (id, callback) => {
    db.query('DELETE FROM productos WHERE id = ?', [id], callback);
  },

  updateStock: (id, stock, callback) => {
    db.query('UPDATE productos SET stock = ? WHERE id = ?', [stock, id], callback);
  }
};

module.exports = Producto;
