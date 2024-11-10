const db = require('../config/db');

const Comanda = {
  // Crear una nueva comanda
  create: async (comanda) => {
    const { precio_total, cotizacion_dolar, estado } = comanda;
    try {
      const [result] = await db.query(
        'INSERT INTO comandas (precio_total, cotizacion_dolar, estado) VALUES (?, ?, ?)',
        [precio_total, cotizacion_dolar, estado]
      );
      return result.insertId;
    } catch (err) {
      throw err;
    }
  },

  // Obtener todas las comandas
  getAll: async () => {
    try {
      const [results] = await db.query('SELECT * FROM comandas');
      return results;
    } catch (err) {
      throw err;
    }
  },

  // Obtener una comanda por ID
  getById: async (id) => {
    try {
      const [results] = await db.query('SELECT * FROM comandas WHERE id = ?', [id]);
      if (results.length === 0) return null;
      return results[0];
    } catch (err) {
      throw err;
    }
  },

  // Actualizar una comanda por ID
  updateById: async (id, comanda) => {
    try {
      const [result] = await db.query('UPDATE comandas SET ? WHERE id = ?', [comanda, id]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  },

  // Eliminar una comanda por ID
  deleteById: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM comandas WHERE id = ?', [id]);
      return result.affectedRows;
    } catch (err) {
      throw err;
    }
  },
};

module.exports = Comanda;
