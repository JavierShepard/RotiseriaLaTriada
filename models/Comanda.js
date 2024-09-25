// models/Comanda.js
const db = require('../config/db');

const Comanda = {
  getAll: (callback) => {
    db.query('SELECT * FROM comandas', callback);
  },

  getById: (id, callback) => {
    db.query('SELECT * FROM comandas WHERE id = ?', [id], callback);
  },

  create: (comanda, callback) => {
    db.query(
      'INSERT INTO comandas (id_producto, cantidad, precio_total, cotizacion_dolar) VALUES (?, ?, ?, ?)', 
      [comanda.id_producto, comanda.cantidad, comanda.precio_total, comanda.cotizacion_dolar], 
      callback
    );
  },

  updateById: (id, comanda, callback) => {
    db.query(
      'UPDATE comandas SET id_producto = ?, cantidad = ?, precio_total = ?, cotizacion_dolar = ? WHERE id = ?', 
      [comanda.id_producto, comanda.cantidad, comanda.precio_total, comanda.cotizacion_dolar, id], 
      callback
    );
  },

  deleteById: (id, callback) => {
    db.query('DELETE FROM comandas WHERE id = ?', [id], callback);
  }
};

module.exports = Comanda;
