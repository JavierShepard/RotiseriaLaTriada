const db = require('../config/db');

const Comanda = {
  getAll: async () => {
    try {
      const [comandas] = await db.query('SELECT * FROM comandas');
      const comandasWithProducts = await Promise.all(
        comandas.map(async (comanda) => {
          const productos = await Comanda.getProductosByComandaId(comanda.id);
          return { ...comanda, productos };
        })
      );
      return comandasWithProducts;
    } catch (err) {
      console.error('Error al obtener todas las comandas:', err.message);
      throw new Error('Error al obtener todas las comandas.');
    }
  },

  getById: async (id) => {
    try {
      const [results] = await db.query('SELECT * FROM comandas WHERE id = ?', [id]);
      if (results.length === 0) return null;

      const comanda = results[0];
      const productos = await Comanda.getProductosByComandaId(comanda.id);
      return { ...comanda, productos };
    } catch (err) {
      console.error(`Error al obtener la comanda con ID ${id}:`, err.message);
      throw new Error('Error al obtener la comanda.');
    }
  },

  // Crear una nueva comanda
  create: async ({ precio_total, cotizacion_dolar, estado }) => {
    const [result] = await db.query(
      'INSERT INTO comandas (precio_total, cotizacion_dolar, estado, created_at) VALUES (?, ?, ?, NOW())',
      [precio_total, cotizacion_dolar, estado]
    );
    return result.insertId;
  },

  // Agregar productos a una comanda
  addProductoToComanda: async ({ id_comanda, id_producto, cantidad, subtotal }) => {
    await db.query(
      'INSERT INTO comanda_productos (id_comanda, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)',
      [id_comanda, id_producto, cantidad, subtotal]
    );
  },

  updateById: async (id, { precio_total, cotizacion_dolar, estado, productos }) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        'UPDATE comandas SET precio_total = ?, cotizacion_dolar = ?, estado = ? WHERE id = ?',
        [precio_total, cotizacion_dolar, estado, id]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return null;
      }

      await connection.query('DELETE FROM comanda_productos WHERE id_comanda = ?', [id]);
      await Promise.all(
        productos.map(({ id_producto, cantidad, subtotal }) =>
          connection.query(
            'INSERT INTO comanda_productos (id_comanda, id_producto, cantidad, subtotal) VALUES (?, ?, ?, ?)',
            [id, id_producto, cantidad, subtotal]
          )
        )
      );

      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      console.error(`Error al actualizar la comanda con ID ${id}:`, err.message);
      throw new Error('Error al actualizar la comanda.');
    } finally {
      connection.release();
    }
  },

  deleteById: async (id) => {
    try {
      const [result] = await db.query('DELETE FROM comandas WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (err) {
      console.error(`Error al eliminar la comanda con ID ${id}:`, err.message);
      throw new Error('Error al eliminar la comanda.');
    }
  },

  getProductosByComandaId: async (id_comanda) => {
    try {
      const [productos] = await db.query('SELECT * FROM comanda_productos WHERE id_comanda = ?', [id_comanda]);
      return productos;
    } catch (err) {
      console.error(`Error al obtener productos de la comanda con ID ${id_comanda}:`, err.message);
      throw new Error('Error al obtener productos de la comanda.');
    }
  },
};

module.exports = Comanda;
