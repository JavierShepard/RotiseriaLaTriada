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
    const { precio_total, cotizacion_dolar, estado } = pedido;
    try {
      const [result] = await db.query(
        'INSERT INTO pedidos (precio_total, cotizacion_dolar, estado) VALUES (?, ?, ?)',
        [precio_total, cotizacion_dolar, estado]
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
