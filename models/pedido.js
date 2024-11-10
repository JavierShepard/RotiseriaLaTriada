const db = require('../config/db');

const Pedido = {
  getAll: async () => {
    try {
      const [results] = await db.query('SELECT * FROM pedidos');
      return results;
    } catch (err) {
      throw err;
    }
  },

  getById: async (id) => {
    try {
      const [results] = await db.query('SELECT * FROM pedidos WHERE id = ?', [id]);
      if (results.length === 0) return null;
      return results[0];
    } catch (err) {
      throw err;
    }
  },

  create: async (pedido) => {
    const { producto_id, cantidad, precio_dolar, precio_pesos } = pedido;
    try {
      const [result] = await db.query(
        'INSERT INTO pedidos (producto_id, cantidad, precio_dolar, precio_pesos) VALUES (?, ?, ?, ?)',
        [producto_id, cantidad, precio_dolar, precio_pesos]
      );
      return result;
    } catch (err) {
      throw err;
    }
  },

  updateById: async (id, pedido) => {
    try {
      const [result] = await db.query('UPDATE pedidos SET ? WHERE id = ?', [pedido, id]);
      return result;
    } catch (err) {
      throw err;
    }
  },

  deleteById: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM pedidos WHERE id = ?', [id]);
      return result;
    } catch (err) {
      throw err;
    }
  }
};

module.exports = Pedido;
