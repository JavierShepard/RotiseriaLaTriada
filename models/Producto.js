const db = require('../config/db');

const Producto = {
  // Obtener todos los productos
  getAll: async () => {
    try {
      const [results] = await db.query('SELECT * FROM productos');
      return results;
    } catch (err) {
      throw err;
    }
  },

  // Obtener un producto por ID
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
  create: async (producto) => {
    const { nombre, stock, precio } = producto;
    try {
      const [result] = await db.query(
        'INSERT INTO productos (nombre, stock, precio) VALUES (?, ?, ?)',
        [nombre, stock, precio]
      );
      return result;
    } catch (err) {
      throw err;
    }
  },

  // Actualizar un producto por ID
  updateById: async (id, producto) => {
    try {
      const [result] = await db.query('UPDATE productos SET ? WHERE id = ?', [producto, id]);
      return result;
    } catch (err) {
      throw err;
    }
  },

  // Eliminar un producto por ID
  deleteById: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
      return result;
    } catch (err) {
      throw err;
    }
  }
};

module.exports = Producto;
