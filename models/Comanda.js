// models/Comanda.js
const db = require('../config/db');

const Comanda = {
  create: (comanda, callback) => {
    db.query(
      'INSERT INTO comandas (id_producto, cantidad, precio_total, cotizacion_dolar) VALUES (?, ?, ?, ?)', 
      [comanda.id_producto, comanda.cantidad, comanda.precio_total, comanda.cotizacion_dolar], 
      callback
    );
  }
};

module.exports = Comanda;
