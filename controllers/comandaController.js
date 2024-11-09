const Comanda = require('../models/Comanda');
const Producto = require('../models/Producto');
const { getCotizacionDolar } = require('../services/cotizacionService');

// Obtener todas las comandas
exports.getAllComandas = async (req, res) => {
  try {
    const comandas = await Comanda.getAll();
    res.status(200).json(comandas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las comandas.' });
  }
};

// Obtener una comanda por ID
exports.getComandaById = async (req, res) => {
  const { id } = req.params;
  try {
    const comanda = await Comanda.getById(id);
    if (!comanda) return res.status(404).json({ error: 'Comanda no encontrada.' });

    res.status(200).json({
      id: comanda.id,
      precio_total: comanda.precio_total.toFixed(2),
      cotizacion_dolar: comanda.cotizacion_dolar.toFixed(2),
      created_at: comanda.created_at,
      estado: comanda.estado,
      productos: comanda.productos.map((prod) => ({
        id: prod.id_producto,
        cantidad: prod.cantidad,
        subtotal: prod.subtotal.toFixed(2),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la comanda.' });
  }
};

// Crear una nueva comanda
exports.createComanda = async (req, res) => {
  const { productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'Debes agregar al menos un producto.' });
  }

  try {
    const cotizacionDolar = await getCotizacionDolar();
    let precioTotal = 0;

    const productosProcesados = await Promise.all(
      productos.map(async ({ id_producto, cantidad }) => {
        const producto = await Producto.getById(id_producto);
        if (!producto || producto.stock < cantidad) {
          throw new Error(`Producto no disponible o stock insuficiente para el producto ${id_producto}`);
        }

        const subtotal = producto.precio * cantidad * cotizacionDolar;
        precioTotal += subtotal;

        return { id_producto, cantidad, subtotal };
      })
    );

    const nuevaComanda = {
      precio_total: precioTotal,
      cotizacion_dolar: cotizacionDolar,
      productos: productosProcesados,
    };

    const comandaId = await Comanda.create(nuevaComanda);

    res.status(201).json({
      id: comandaId,
      estado: 'Pendiente',
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: `Error al crear la comanda: ${error.message}` });
  }
};

// Actualizar una comanda existente
exports.updateComanda = async (req, res) => {
  const { id } = req.params;
  const { productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'Debes agregar al menos un producto.' });
  }

  try {
    const cotizacionDolar = await getCotizacionDolar();
    let precioTotal = 0;

    const productosProcesados = await Promise.all(
      productos.map(async ({ id_producto, cantidad }) => {
        const producto = await Producto.getById(id_producto);
        if (!producto || producto.stock < cantidad) {
          throw new Error(`Producto no disponible o stock insuficiente para el producto ${id_producto}`);
        }

        const subtotal = producto.precio * cantidad * cotizacionDolar;
        precioTotal += subtotal;

        return { id_producto, cantidad, subtotal };
      })
    );

    const comandaActualizada = {
      precio_total: precioTotal,
      cotizacion_dolar: cotizacionDolar,
      productos: productosProcesados,
    };

    const updatedComanda = await Comanda.updateById(id, comandaActualizada);

    if (!updatedComanda) {
      return res.status(404).json({ error: 'Comanda no encontrada.' });
    }

    res.status(200).json({
      id,
      estado: 'Actualizada',
      productos: productosProcesados.map((prod) => ({
        id: prod.id_producto,
        cantidad: prod.cantidad,
        subtotal: prod.subtotal.toFixed(2),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: `Error al actualizar la comanda: ${error.message}` });
  }
};

// Eliminar una comanda
exports.deleteComanda = async (req, res) => {
  const { id } = req.params;

  try {
    const comanda = await Comanda.getById(id);
    if (!comanda) {
      return res.status(404).json({ error: 'Comanda no encontrada.' });
    }

    await Comanda.deleteById(id);
    res.status(204).send(); // Sin cuerpo en la respuesta
  } catch (error) {
    res.status(500).json({ error: `Error al eliminar la comanda: ${error.message}` });
  }
};
