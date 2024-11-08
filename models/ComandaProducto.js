const db = require('../config/db');

const ComandaProducto = {
  // Eliminar productos asociados a una comanda por el ID de la comanda
  deleteByComandaId: (id_comanda) => {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM comanda_productos WHERE id_comanda = ?', [id_comanda], (err, result) => {
        if (err) {
          console.error('Error al eliminar productos de la comanda:', err);
          return reject(err); // Rechazar la promesa con el error.
        }
        resolve(result); // Resolver la promesa si la eliminación fue exitosa.
      });
    });
  },
  // Obtener todos los registros de comanda_productos
  getAll: async (callback) => {
    try {
      const [results] = await db.query('SELECT * FROM comanda_productos');
      callback(null, results);
    } catch (err) {
      callback(err, null);
    }
  },

  // Obtener todos los registros de comanda_productos por id_comanda
  getByComandaId: async (id_comanda, callback) => {
    try {
      const [results] = await db.query(
        `SELECT cp.*, p.nombre AS producto_nombre
         FROM comanda_productos cp
         JOIN productos p ON cp.id_producto = p.id
         WHERE cp.id_comanda = ?`,
        [id_comanda]
      );
      callback(null, results);
    } catch (err) {
      callback(err, null);
    }
  },

  // Crear un nuevo registro en comanda_productos
  create: async (detalleComanda, callback = () => {}) => {
    try {
      const [result] = await db.query(
        'INSERT INTO comanda_productos (id_comanda, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)',
        [detalleComanda.id_comanda, detalleComanda.id_producto, detalleComanda.cantidad, detalleComanda.subtotal]
      );
      callback(null, result);
    } catch (err) {
      callback(err, null);
    }
  },

  // Actualizar un registro en comanda_productos por ID
  updateById: async (id, detalleComanda, callback) => {
    try {
      const [result] = await db.query(
        'UPDATE comanda_productos SET cantidad = ?, subtotal = ? WHERE id = ?',
        [detalleComanda.cantidad, detalleComanda.subtotal, id]
      );
      callback(null, result);
    } catch (err) {
      callback(err, null);
    }
  },

  // Eliminar un registro en comanda_productos por ID
  deleteById: async (id, callback) => {
    try {
      const [result] = await db.query('DELETE FROM comanda_productos WHERE id = ?', [id]);
      callback(null, result);
    } catch (err) {
      callback(err, null);
    }
  }
  
};

module.exports = ComandaProducto;
