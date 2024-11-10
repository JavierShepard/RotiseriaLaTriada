const db = require('../config/db');

const Comanda = {
  // Obtener todas las comandas
  getAll: async () => {
    try {
      const [results] = await db.query('SELECT * FROM comandas');
      return results.map((comanda) => ({
        ...comanda,
        productos: parseJSON(comanda.productos), // Parseo seguro
      }));
    } catch (err) {
      console.error('Error al obtener todas las comandas:', err.message);
      throw new Error('Error al obtener todas las comandas.');
    }
  },

  // Obtener una comanda por ID
  getById: async (id) => {
    try {
      const [results] = await db.query('SELECT * FROM comandas WHERE id = ?', [id]);
      if (results.length === 0) return null;

      const comanda = results[0];
      return {
        ...comanda,
        productos: parseJSON(comanda.productos), // Parseo seguro
      };
    } catch (err) {
      console.error(`Error al obtener la comanda con ID ${id}:`, err.message);
      throw new Error('Error al obtener la comanda.');
    }
  },

  // Crear una nueva comanda
  create: async ({ precio_total, cotizacion_dolar, productos, estado = 'Pendiente' }) => {
    const [result] = await db.query(
      'INSERT INTO comandas (precio_total, cotizacion_dolar, productos, estado, created_at) VALUES (?, ?, ?, ?, NOW())',
      [precio_total, cotizacion_dolar, JSON.stringify(productos), estado]
    );
    return result.insertId;
  },

  // Actualizar una comanda por ID
  updateById: async (id, { precio_total, cotizacion_dolar, productos, estado }) => {
    const [result] = await db.query(
      'UPDATE comandas SET precio_total = ?, cotizacion_dolar = ?, productos = ?, estado = ? WHERE id = ?',
      [precio_total, cotizacion_dolar, JSON.stringify(productos), estado, id]
    );
    if (result.affectedRows === 0) return null;
    return result;
  },

  // Eliminar una comanda por ID
  deleteById: async (id) => {
    const [result] = await db.query('DELETE FROM comandas WHERE id = ?', [id]);
    if (result.affectedRows === 0) return null;
    return result;
  },
};

// Función para parsear JSON de forma segura
function parseJSON(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error al parsear JSON:', error.message);
    return []; // Devuelve un array vacío si el JSON es inválido
  }
}

module.exports = Comanda;
