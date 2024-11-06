const db = require('../config/db');

const ComandaProducto = {
  // Obtener todos los registros de comanda_productos
  getAll: (callback) => {
    db.query(
      `SELECT * FROM comanda_productos`,
      (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
      }
    );
  },

  // Obtener todos los registros de comanda_productos por id_comanda
  getByComandaId: (id_comanda, callback) => {
    db.query(
      `SELECT cp.*, p.nombre AS producto_nombre
       FROM comanda_productos cp
       JOIN productos p ON cp.id_producto = p.id
       WHERE cp.id_comanda = ?`,
      [id_comanda],
      (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
      }
    );
  },

  // Crear un nuevo registro en comanda_productos
  create: (detalleComanda, callback = () => {}) => { // Callback por defecto
    db.query(
      'INSERT INTO comanda_productos (id_comanda, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)',
      [detalleComanda.id_comanda, detalleComanda.id_producto, detalleComanda.cantidad, detalleComanda.subtotal],
      (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
      }
    );
  },

  // Actualizar un registro en comanda_productos por ID
  updateById: (id, detalleComanda, callback) => {
    db.query(
      'UPDATE comanda_productos SET cantidad = ?, subtotal = ? WHERE id = ?',
      [detalleComanda.cantidad, detalleComanda.subtotal, id],
      (err, result) => {
        if (err) return callback(err, null);
        callback(null, result);
      }
    );
  },

  // Eliminar un registro en comanda_productos por ID
  deleteById: (id, callback) => {
    db.query('DELETE FROM comanda_productos WHERE id = ?', [id], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  }
};

module.exports = ComandaProducto;
