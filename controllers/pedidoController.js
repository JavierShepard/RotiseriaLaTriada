const Pedido = require('../models/pedido');
const Producto = require('../models/Producto');
const db = require('../config/db'); // Importar la base de datos
const axios = require('axios'); // Para obtener la cotización del dólar

// Variables para el caché
let cotizacionDolarCache = null;
let cotizacionDolarTimestamp = 0;

// Función para obtener la cotización del dólar
async function getCotizacionDolar() {
  const ahora = Date.now();
  
  // Si la cotización está en caché y es reciente (menos de una hora)
  if (cotizacionDolarCache && (ahora - cotizacionDolarTimestamp) < 60 * 60 * 1000) {
    return cotizacionDolarCache;
  }

  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    cotizacionDolarCache = response.data.rates.ARS; // Obtener la tasa en ARS
    cotizacionDolarTimestamp = ahora; // Actualizar el timestamp
    return cotizacionDolarCache;
  } catch (error) {
    console.error('Error al obtener la cotización del dólar:', error.message);
    throw new Error('No se pudo obtener la cotización del dólar');
  }
}
// Obtener todos los pedidos
/*
exports.getAllPedidos = async (req, res) => {
  try {
    // Obtener todos los pedidos
    const pedidos = await Pedido.getAll();

    // Agregar productos a cada pedido
    for (const pedido of pedidos) {
      const [productos] = await db.query(
        'SELECT producto_id AS id, cantidad, subtotal FROM pedido_productos WHERE pedido_id = ?',
        [pedido.id]
      );
      pedido.productos = productos; // Añadir productos al pedido
    }

    res.status(200).json({ success: true, data: pedidos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};*/
// Obtener todos los pedidos
exports.getAllPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.getAll();

    for (const pedido of pedidos) {
      const [productos] = await db.query(
        'SELECT producto_id AS id, cantidad, subtotal FROM pedido_productos WHERE pedido_id = ?',
        [pedido.id]
      );
      pedido.productos = productos; // Agregar productos al pedido
    }

    res.status(200).json({ success: true, data: pedidos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
/* Obtener un pedido por ID
exports.getPedidoById = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await Pedido.getById(id);
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }
    res.status(200).json({ success: true, data: pedido });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};*/
exports.getPedidoById = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await Pedido.getById(id);
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    const [productos] = await db.query(
      'SELECT producto_id AS id, cantidad, subtotal FROM pedido_productos WHERE pedido_id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      data: {
        ...pedido,
        productos,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al obtener el pedido: ' + error.message });
  }
};


/*
exports.createPedido = async (req, res) => {
  const { productos } = req.body; // Lista de productos [{producto_id, cantidad}]
  const cotizacionDolar = 300; // Valor estático

  try {
    // Validar que se envíen productos
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ success: false, error: 'Debe proporcionar una lista de productos.' });
    }

    // Validar que cada producto tenga la información requerida
    for (const producto of productos) {
      if (!producto.producto_id || !producto.cantidad || producto.cantidad <= 0) {
        return res.status(400).json({ success: false, error: 'Cada producto debe tener producto_id y una cantidad válida.' });
      }
    }

    // Crear el pedido principal
    const nuevoPedido = {
      precio_total: 0, // Se calculará más adelante
      cotizacion_dolar: cotizacionDolar,
      estado: 'Pendiente',
    };
    const result = await Pedido.create(nuevoPedido);
    const pedidoId = result.insertId;

    let precioTotal = 0;

    // Procesar cada producto
    for (const producto of productos) {
      const productoData = await Producto.getByIdPromise(producto.producto_id);
      if (!productoData) {
        return res.status(404).json({ success: false, error: `Producto con ID ${producto.producto_id} no encontrado.` });
      }

      // Verificar stock disponible
      if (productoData.stock < producto.cantidad) {
        return res.status(400).json({ success: false, error: `Stock insuficiente para el producto ID ${producto.producto_id}.` });
      }

      // Calcular subtotal y reducir stock
      const subtotal = productoData.precio * producto.cantidad;
      precioTotal += subtotal;

      await Producto.updateById(producto.producto_id, {
        stock: productoData.stock - producto.cantidad,
      });

      // Guardar en la tabla `pedido_productos`
      await db.query(
        'INSERT INTO pedido_productos (pedido_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)',
        [pedidoId, producto.producto_id, producto.cantidad, subtotal]
      );
    }

    // Actualizar el precio total del pedido
    await Pedido.updateById(pedidoId, { precio_total: precioTotal });

    res.status(201).json({
      success: true,
      message: 'Pedido creado con éxito.',
      data: {
        id: pedidoId,
        precio_total: precioTotal,
        cotizacion_dolar: cotizacionDolar,
        estado: 'Pendiente',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al crear el pedido: ' + error.message });
  }
};*/


// Crear un pedido
exports.createPedido = async (req, res) => {
  const { productos } = req.body;

  try {
    // Validar que se envíen productos
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ success: false, error: 'Debe proporcionar una lista de productos.' });
    }

    for (const producto of productos) {
      if (!producto.producto_id || !producto.cantidad || producto.cantidad <= 0) {
        return res.status(400).json({ success: false, error: 'Cada producto debe tener producto_id y una cantidad válida.' });
      }
    }

    // Obtener cotización del dólar
    const cotizacionDolar = await getCotizacionDolar();

    // Crear el pedido principal
    const nuevoPedido = {
      precio_total: 0, // Se calculará
      cotizacion_dolar: cotizacionDolar,
      estado: 'Pendiente',
    };
    const result = await Pedido.create(nuevoPedido);
    const pedidoId = result.insertId;

    let precioTotalDolares = 0;

    for (const producto of productos) {
      const productoData = await Producto.getByIdPromise(producto.producto_id);
      if (!productoData) {
        return res.status(404).json({ success: false, error: `Producto con ID ${producto.producto_id} no encontrado.` });
      }

      if (productoData.stock < producto.cantidad) {
        return res.status(400).json({ success: false, error: `Stock insuficiente para el producto ID ${producto.producto_id}.` });
      }

      const subtotal = productoData.precio * producto.cantidad;
      precioTotalDolares += subtotal;

      await Producto.updateById(producto.producto_id, {
        stock: productoData.stock - producto.cantidad,
      });

      await db.query(
        'INSERT INTO pedido_productos (pedido_id, producto_id, cantidad, subtotal) VALUES (?, ?, ?, ?)',
        [pedidoId, producto.producto_id, producto.cantidad, subtotal]
      );
    }

    // Calcular precio total en pesos argentinos
    const precioTotalPesos = precioTotalDolares * cotizacionDolar;

    await Pedido.updateById(pedidoId, { precio_total: precioTotalPesos });

    res.status(201).json({
      success: true,
      message: 'Pedido creado con éxito.',
      data: {
        id: pedidoId,
        precio_total_dolares: precioTotalDolares,
        precio_total_pesos: precioTotalPesos,
        cotizacion_dolar: cotizacionDolar,
        estado: 'Pendiente',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al crear el pedido: ' + error.message });
  }
};

// Actualizar un pedido
exports.updatePedido = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const pedido = await Pedido.getById(id);
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    // Actualizar estado del pedido
    await Pedido.updateById(id, { estado });

    // Devolver información sobre el producto relacionado
    const productoId = pedido.producto_id;

    res.status(200).json({
      success: true,
      message: 'Pedido actualizado',
      data: {
        pedido_id: id,
        producto_actualizado: { id: productoId, estado },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al actualizar el pedido: ' + error.message,
    });
  }
};

// Eliminar un pedido
exports.deletePedido = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await Pedido.getById(id);
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    // Eliminar el pedido
    await Pedido.deleteById(id);

    // Devolver respuesta con código 204
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error al eliminar el pedido: ' + error.message });
  }
};
