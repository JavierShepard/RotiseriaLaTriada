const db = require('../config/db');

const Comanda = {
  // Obtener todas las comandas
  getAll: async () => {
    try {
      const [results] = await db.query('SELECT * FROM comandas');
      return results;
    } catch (err) {
      console.error("Error al obtener las comandas: ", err);
      throw new Error("Error al obtener las comandas");
    }
  },

  // Crear una nueva comanda
  create: (comanda) => {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await db.query(
          'INSERT INTO comandas (precio_total, cotizacion_dolar) VALUES (?, ?)', 
          [comanda.precio_total, comanda.cotizacion_dolar]
        );
        resolve(result.insertId);  // Devolvemos el ID de la comanda recién creada
      } catch (err) {
        reject(err);
      }
    });
  },

  // Asociar un producto a una comanda
  addProductoToComanda: (detalleComanda) => {
    return new Promise(async (resolve, reject) => {
      try {
        const [result] = await db.query(
          'INSERT INTO comanda_productos (id_comanda, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)',
          [detalleComanda.id_comanda, detalleComanda.id_producto, detalleComanda.cantidad, detalleComanda.subtotal]
        );
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  },

  // Actualizar una comanda por ID
  updateById: async (id, actualizacion) => {
    try {
      const [result] = await db.query('UPDATE comandas SET ? WHERE id = ?', [actualizacion, id]);
      if (result.affectedRows === 0) {
        return null; // No se encontró la comanda
      }
      return result;
    } catch (err) {
      console.error('Error al actualizar la comanda:', err);
      throw new Error('Error al actualizar la comanda');
    }
  },

  // Obtener una comanda por ID
  getById: async (id) => {
    try {
      const [results] = await db.query('SELECT * FROM comandas WHERE id = ?', [id]);
      if (results.length === 0) return null; // No se encontró la comanda
      return results[0]; // Retorna la comanda encontrada
    } catch (err) {
      console.error('Error al obtener la comanda con ID:', err);
      throw new Error('Error al obtener la comanda');
    }
  },

  // Eliminar una comanda por ID
  deleteById: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM comandas WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return null; // No se encontró la comanda
      }
      return result;
    } catch (err) {
      console.error('Error al eliminar la comanda:', err);
      throw new Error('Error al eliminar la comanda');
    }
  }
};

module.exports = Comanda;
