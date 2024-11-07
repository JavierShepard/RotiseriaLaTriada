const db = require('../config/db');

const Comanda = {
  // Obtener todas las comandas
  getAll: async (callback) => {
    try {
      const [results] = await db.query('SELECT * FROM comandas');
      callback(null, results);
    } catch (err) {
      console.error("Error al obtener las comandas: ", err);
      callback(err, null);
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
 updateById: (id, actualizacion, callback) => {
  db.query('UPDATE comandas SET ? WHERE id = ?', [actualizacion, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar la comanda:', err);
      return callback(err, null);
    }
    if (result.affectedRows === 0) {
      return callback(null, null); // No se encontró la comanda
    }
    callback(null, result);
  });
},
  // Obtener una comanda por ID
  getById: (id, callback) => {
    db.query('SELECT * FROM comandas WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error al obtener la comanda con ID:', err);
        return callback(err, null);
      }
      if (results.length === 0) return callback(null, null);  // No se encontró la comanda
      callback(null, results[0]);  // Retorna la comanda encontrada
    });
  },

  // Eliminar una comanda por ID
  deleteById: (id, callback) => {
    db.query('DELETE FROM comandas WHERE id = ?', [id], (err, result) => {
      if (err) {
        console.error('Error al eliminar la comanda:', err);
        return callback(err, null);
      }
      if (result.affectedRows === 0) {
        return callback(null, null);  // No se encontró la comanda
      }
      callback(null, result);
    });
  }
};

module.exports = Comanda;
