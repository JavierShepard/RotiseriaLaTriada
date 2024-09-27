const db = require('../config/db');

const Comanda = {
  // Obtener todas las comandas
  getAll: (callback) => {
    db.query('SELECT * FROM comandas', (err, results) => {
      if (err) {
        console.error("Error al obtener las comandas: ", err);
        return callback(err, null);
      }
      callback(null, results);
    });
  },

  // Crear una nueva comanda
  create: (comanda) => {
    return new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO comandas (precio_total, cotizacion_dolar) VALUES (?, ?)', 
        [comanda.precio_total, comanda.cotizacion_dolar], 
        (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);  // Devolvemos el ID de la comanda recién creada
        }
      );
    });
  },

  // Asociar un producto a una comanda
  addProductoToComanda: (detalleComanda) => {
    return new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO comanda_productos (id_comanda, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)',
        [detalleComanda.id_comanda, detalleComanda.id_producto, detalleComanda.cantidad, detalleComanda.subtotal],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }
};

module.exports = Comanda;
