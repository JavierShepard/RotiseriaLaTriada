const db = require('../config/db');


const Pedido = {
  crear: (precioTotal, cotizacionDolar, estado, productos, callback) => {
    const query = 'INSERT INTO pedidos (precio_total, cotizacion_dolar, estado) VALUES (?, ?, ?)';
    db.query(query, [precioTotal, cotizacionDolar, estado], (err, result) => {
      if (err) return callback(err);

      const pedidoId = result.insertId;

      // Inserción de productos asociados
      productos.forEach(producto => {
        const { id_producto, cantidad, subtotal } = producto;
        const queryComanda = 'INSERT INTO comanda_productos (id_comanda, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)';
        db.query(queryComanda, [pedidoId, id_producto, cantidad, subtotal], err => {
          if (err) return callback(err);
        });
      });

      callback(null, { id: pedidoId, precio_total: precioTotal, cotizacion_dolar: cotizacionDolar, estado });
    });
  },

  actualizar: (id, precioTotal, cotizacionDolar, estado, callback) => {
    const query = 'UPDATE pedidos SET precio_total = ?, cotizacion_dolar = ?, estado = ? WHERE id = ?';
    db.query(query, [precioTotal, cotizacionDolar, estado, id], (err, result) => {
      if (err) return callback(err);
      callback(null, { id, precio_total: precioTotal, cotizacion_dolar: cotizacionDolar, estado });
    });
  },

  eliminar: (id, callback) => {
    const query = 'DELETE FROM pedidos WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  obtenerTodos: (callback) => {
    const query = 'SELECT * FROM pedidos';
    db.query(query, (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  obtenerPorId: (id, callback) => {
    const query = 'SELECT * FROM pedidos WHERE id = ?';
    db.query(query, [id], (err, result) => {
      if (err) return callback(err);
      callback(null, result[0]);
    });
  }
};

module.exports = Pedido;
