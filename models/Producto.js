// models/Producto.js
const db = require('../config/db');

const Producto = {
  getAll: (callback) => {
    db.query('SELECT * FROM productos', callback);
  },

 // Obtener un producto por ID
 getById: (id, callback) => {
  db.query('SELECT * FROM productos WHERE id = ?', [id], (err, results) => {
    if (err) return callback(err, null);
    if (results.length === 0) return callback(null, null); // Producto no encontrado
    callback(null, results[0]);  // Retornar el primer resultado
  });
},
// Crear un nuevo producto
create: (producto, callback) => {
  db.query(
    'INSERT INTO productos (nombre, stock, precio) VALUES (?, ?, ?)', 
    [producto.nombre, producto.stock, producto.precio], 
    (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    }
  );
},

// Actualizar un producto por ID
updateById: (id, producto, callback) => {
  db.query(
    'UPDATE productos SET nombre = ?, stock = ?, precio = ? WHERE id = ?', 
    [producto.nombre, producto.stock, producto.precio, id],
    (err, result) => {
      if (err) return callback(err, null);
      callback(null, result);
    }
  );
},

// Eliminar un producto por ID
deleteById: (id, callback) => {
  db.query('DELETE FROM productos WHERE id = ?', [id], (err, result) => {
    if (err) return callback(err, null);
    callback(null, result);
  });
}
};

module.exports = Producto;