const db = require('../config/db');

const Comanda = {
  getAll: async () => {
    const [results] = await db.query('SELECT * FROM comandas');
    return results.map((comanda) => ({
      ...comanda,
      productos: JSON.parse(comanda.productos || '[]'),
    }));
  },

  getById: async (id) => {
    const [results] = await db.query('SELECT * FROM comandas WHERE id = ?', [id]);
    if (results.length === 0) return null;
    const comanda = results[0];
    return { ...comanda, productos: JSON.parse(comanda.productos || '[]') };
  },

  create: async ({ precio_total, cotizacion_dolar, productos, estado = 'Pendiente' }) => {
    const [result] = await db.query(
      'INSERT INTO comandas (precio_total, cotizacion_dolar, productos, estado, created_at) VALUES (?, ?, ?, ?, NOW())',
      [precio_total, cotizacion_dolar, JSON.stringify(productos), estado]
    );
    return result.insertId;
  },

  updateById: async (id, { precio_total, cotizacion_dolar, productos, estado }) => {
    const [result] = await db.query(
      'UPDATE comandas SET precio_total = ?, cotizacion_dolar = ?, productos = ?, estado = ? WHERE id = ?',
      [precio_total, cotizacion_dolar, JSON.stringify(productos), estado, id]
    );
    if (result.affectedRows === 0) return null;
    return result;
  },

  deleteById: async (id) => {
    const [result] = await db.query('DELETE FROM comandas WHERE id = ?', [id]);
    if (result.affectedRows === 0) return null;
    return result;
  },
};

module.exports = Comanda;
