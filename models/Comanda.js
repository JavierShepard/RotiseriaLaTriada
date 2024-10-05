const db = require('../config/db');

const Comanda = {
  // Obtener todas las comandas
  getAll: (callback) => {
    db.query('SELECT * FROM comandas', (err, results) => {
      if (err) {
        console.error("Error al obtener las comandas: ", err);
        return callback(err, null);
      }
      callback(null, results);
    });
  },

  // Crear una nueva comanda
  create: (comanda) => {
    return new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO comandas (precio_total, cotizacion_dolar) VALUES (?, ?)', 
        [comanda.precio_total, comanda.cotizacion_dolar], 
        (err, result) => {
          if (err) return reject(err);
          resolve(result.insertId);  // Devolvemos el ID de la comanda recién creada
        }
      );
    });
  },

  // Asociar un producto a una comanda
  addProductoToComanda: (detalleComanda) => {
    return new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO comanda_productos (id_comanda, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)',
        [detalleComanda.id_comanda, detalleComanda.id_producto, detalleComanda.cantidad, detalleComanda.subtotal],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }
};
// Obtener una comanda por ID
Comanda.getById = (id, callback) => {
  db.query('SELECT * FROM comandas WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error al obtener la comanda con ID:', err);
      return callback(err, null);
    }
    if (results.length === 0) return callback(null, null);  // No se encontró la comanda
    callback(null, results[0]);  // Retorna la comanda encontrada
  });
};
exports.updateComanda = async (req, res) => {
  const { id } = req.params;
  const actualizacion = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token de autorización faltante.');
  }

  try {
    // Validar el token
    await axios.get('https://taller6-alejo.onrender.com/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const updatedComanda = await new Promise((resolve, reject) => {
      Comanda.updateById(id, actualizacion, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    if (!updatedComanda) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }

    res.status(200).json({ message: 'Comanda actualizada exitosamente' });
  } catch (error) {
    console.error('Error en updateComanda:', error);
    if (error.response) {
      return res.status(error.response.status).json({ error: error.response.data });
    }
    res.status(500).json({ error: 'Error al actualizar la comanda: ' + error.message });
  }
};

module.exports = Comanda;
