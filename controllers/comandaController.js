const Comanda = require('../models/Comanda');
const Producto = require('../models/Producto');
const { getCotizacionDolar, validarToken } = require('../services/cotizacionService');

exports.getAllComandas = async (req, res) => {
  try {
    const comandas = await Comanda.getAll();
    if (comandas.length === 0) {
      return res.status(404).json({ error: 'No se encontraron comandas.' });
    }
    res.status(200).json(comandas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las comandas.' });
  }
};

exports.getComandaById = async (req, res) => {
  const { id } = req.params;
  try {
    const comanda = await Comanda.getById(id);
    if (!comanda) {
      return res.status(404).json({ error: 'Comanda no encontrada.' });
    }

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

exports.createComanda = async (req, res) => {
  const { productos } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  // Validar si el token está presente
  if (!token) return res.status(401).json({ error: 'Token de autorización faltante.' });

  // Validar el token
  const tokenValido = await validarToken(token);
  if (!tokenValido) return res.status(401).json({ error: 'No autorizado. Token inválido.' });

  // Validar si se enviaron productos
  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'Debes agregar al menos un producto.' });
  }

  try {
    // Obtener la cotización del dólar
    const cotizacionDolar = await getCotizacionDolar();

    let precioTotal = 0;

    // Validar productos y calcular subtotales
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

    // Crear la comanda en la tabla `comandas`
    const nuevaComanda = {
      precio_total: precioTotal,
      cotizacion_dolar: cotizacionDolar,
      estado: 'Pendiente',
    };

    const comandaId = await Comanda.create(nuevaComanda);

    // Insertar productos en la tabla `comanda_productos`
    await Promise.all(
      productosProcesados.map(({ id_producto, cantidad, subtotal }) =>
        Comanda.addProductoToComanda({ id_comanda: comandaId, id_producto, cantidad, subtotal })
      )
    );

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
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token de autorización faltante.' });

  const tokenValido = await validarToken(token);
  if (!tokenValido) return res.status(401).json({ error: 'No autorizado. Token inválido.' });

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
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Token de autorización faltante.' });

  const tokenValido = await validarToken(token);
  if (!tokenValido) return res.status(401).json({ error: 'No autorizado. Token inválido.' });

  try {
    const comanda = await Comanda.getById(id);
    if (!comanda) {
      return res.status(404).json({ error: 'Comanda no encontrada.' });
    }

    await Comanda.deleteById(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: `Error al eliminar la comanda: ${error.message}` });
  }
};
