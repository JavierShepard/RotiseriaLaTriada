const db = require('../config/db');

const Producto = {
  // Obtener un producto por ID (con promesa)
  getById: (id, callback) => {
    db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
      if (err) return callback(err, null);
      if (results.length === 0) return callback(null, null);
      callback(null, results[0]);
    });
  },

  // Obtener un producto por ID usando promesas
  getByIdPromise: (id) => {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
        if (err) return reject(err);
        if (results.length === 0) return resolve(null);
        resolve(results[0]);
      });
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
  // Método para actualizar el stock de un producto
  updateStock: (id, cantidad) => {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?', 
        [cantidad, id, cantidad],
        (err, result) => {
          if (err) return reject(err);
          if (result.affectedRows === 0) {
            return reject(new Error(`Stock insuficiente para el producto con ID ${id}`));
          }
          resolve(result);
        }
      );
    });
  },
  deleteById: (id, callback) => {
    db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    });
  },
  getAll: (callback) => {
    db.query('SELECT * FROM productos', (err, results) => {
      if (err) return callback(err, null);
      callback(null, results);
    });
  },
};

module.exports = Producto;
