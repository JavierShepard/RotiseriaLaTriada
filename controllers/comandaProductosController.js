const ComandaProducto = require('../models/ComandaProducto');
// Obtener productos de una comanda específica por su id_comanda
exports.getProductosByComandaId = (req, res) => {
  const { id_comanda } = req.params;

  ComandaProducto.getByComandaId(id_comanda, (err, productos) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!productos || productos.length === 0) return res.status(404).json({ error: 'No se encontraron productos para esta comanda' });
    
    res.json(productos);
  });
};

// Obtener todos los registros de comanda_productos
exports.getAllComandaProductos = (req, res) => {
  ComandaProducto.getAll((err, registros) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(registros);
  });
};


// Crear un nuevo registro en comanda_productos
exports.createComandaProducto = (req, res) => {
  const { id_comanda, id_producto, cantidad, subtotal } = req.body;

  ComandaProducto.create({ id_comanda, id_producto, cantidad, subtotal }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Producto agregado a la comanda exitosamente', result });
  });
};

// Actualizar un registro en comanda_productos
exports.updateComandaProducto = (req, res) => {
  const { id } = req.params;
  const { cantidad, subtotal } = req.body;

  ComandaProducto.updateById(id, { cantidad, subtotal }, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.status(200).json({ message: 'Registro actualizado exitosamente' });
  });
};

// Eliminar un registro en comanda_productos
exports.deleteComandaProducto = (req, res) => {
  const { id } = req.params;

  ComandaProducto.deleteById(id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Registro no encontrado' });
    res.status(200).json({ message: 'Registro eliminado exitosamente' });
  });
};
// Obtener productos por id_comanda
exports.getProductosByComandaId = (req, res) => {
  const { id_comanda } = req.params;

  ComandaProducto.getByComandaId(id_comanda, (err, productos) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!productos || productos.length === 0) return res.status(404).json({ error: 'No se encontraron productos para esta comanda' });
    
    res.json(productos);
  });
};
exports.updateComanda = async (req, res) => {
  const { id } = req.params;
  const { precio_total, cotizacion_dolar, productos } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).send('Token de autorización faltante.');

  // Validación del token
  const tokenValido = await validarToken(token);
  if (!tokenValido) return res.status(401).send('No autorizado. Token inválido.');

  try {
    // Primero, eliminamos los productos existentes asociados con esta comanda
    await ComandaProducto.deleteByComandaId(id);

    // Luego, actualizamos la comanda con los nuevos valores
    const cotizacionDolar = await getCotizacionDolar(); // Obtener la cotización más reciente
    const actualizacion = { precio_total, cotizacion_dolar: cotizacionDolar };

    // Llamar a la función de actualización de la comanda
    const comandaActualizada = await Comanda.updateById(id, actualizacion);

    if (!comandaActualizada) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }

    // Aquí, puedes volver a agregar los productos actualizados (si es necesario)
    if (productos && productos.length > 0) {
      // Aquí agregas los productos de la misma forma que lo haces al crear la comanda
      const productosProcesados = await Promise.all(productos.map(async (item) => {
        const { id_producto, cantidad } = item;
        const producto = await Producto.getByIdPromise(id_producto);

        if (!producto) throw new Error(`Producto con id ${id_producto} no encontrado`);
        if (producto.stock < cantidad) throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);

        const subtotal = producto.precio * cantidad * cotizacionDolar;
        return { id_producto, cantidad, subtotal };
      }));

      // Luego, agregas los productos a la comanda
      await Promise.all(productosProcesados.map(async (producto) => {
        await ComandaProducto.addProductoToComanda({
          id_comanda: id,
          id_producto: producto.id_producto,
          cantidad: producto.cantidad,
          subtotal: producto.subtotal
        });

        // Actualizar el stock de los productos
        await Producto.updateStock(producto.id_producto, producto.cantidad);
      }));
    }

    // Responder con la comanda actualizada
    res.status(200).json({ success: true, data: comandaActualizada });
  } catch (error) {
    console.error("Error al actualizar la comanda:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};