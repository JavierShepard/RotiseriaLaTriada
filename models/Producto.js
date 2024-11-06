const db = require('../config/db');

const Producto = {
  // Obtener todos los productos
  getAll: async (callback) => {
    try {
      const [results] = await db.query('SELECT * FROM productos');
      callback(null, results);
    } catch (err) {
      callback(err, null);
    }
  },

  // Obtener un producto por ID (con promesa)
  getById: async (id, callback) => {
    try {
      const [results] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
      if (results.length === 0) return callback(null, null);
      callback(null, results[0]);
    } catch (err) {
      callback(err, null);
    }
  },

  // Obtener un producto por ID usando promesas
  getByIdPromise: async (id) => {
    try {
      const [results] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
      if (results.length === 0) return null;
      return results[0];
    } catch (err) {
      throw err;
    }
  },

  // Crear un nuevo producto
  create: async (producto, callback) => {
    const { nombre, stock, precio } = producto;
    try {
      const [result] = await db.query(
        'INSERT INTO productos (nombre, stock, precio) VALUES (?, ?, ?)',
        [nombre, stock, precio]
      );
      callback(null, result);
    } catch (err) {
      callback(err, null);
    }
  },

  // Actualizar un producto por ID
  updateById: async (id, producto, callback) => {
    try {
      const [result] = await db.query('UPDATE productos SET ? WHERE id = ?', [producto, id]);
      callback(null, result);
    } catch (err) {
      callback(err, null);
    }
  },

  // Actualizar el stock de un producto
  updateStock: async (id, cantidad) => {
    try {
      const [result] = await db.query(
        'UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [cantidad, id, cantidad]
      );
      if (result.affectedRows === 0) {
        throw new Error(`Stock insuficiente para el producto con ID ${id}`);
      }
      return result;
    } catch (err) {
      throw err;
    }
  },

  // Eliminar un producto por ID
  deleteById: async (id, callback) => {
    try {
      const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
      callback(null, result);
    } catch (err) {
      callback(err, null);
    }
  }
};

module.exports = Producto;
