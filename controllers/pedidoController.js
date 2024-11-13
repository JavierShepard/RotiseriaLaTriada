const Pedido = require('../models/pedido');
const Producto = require('../models/Producto');
const db = require('../config/db');
const axios = require('axios');

// Variables para el caché de cotización del dólar
let cotizacionDolarCache = null;
let cotizacionDolarTimestamp = 0;

// Función para obtener la cotización del dólar
async function getCotizacionDolar() {
  const ahora = Date.now();
  
  // Usar caché si es reciente (menos de una hora)
  if (cotizacionDolarCache && (ahora - cotizacionDolarTimestamp) < 60 * 60 * 1000) {
    return cotizacionDolarCache;
  }

  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    cotizacionDolarCache = response.data.rates.ARS;
    cotizacionDolarTimestamp = ahora;
    return cotizacionDolarCache;
  } catch (error) {
    console.error('Error al obtener la cotización del dólar:', error.message);
    throw new Error('No se pudo obtener la cotización del dólar.');
  }
}

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
    console.error('Error al obtener los pedidos:', error.message);
    res.status(500).json({ success: false, error: 'Error al obtener los pedidos.' });
  }
};

// Obtener un pedido por ID
exports.getPedidoById = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await Pedido.getById(id);
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado.' });
    }

    const [productos] = await db.query(
      'SELECT producto_id AS id, cantidad, subtotal FROM pedido_productos WHERE pedido_id = ?',
      [id]
    );

    pedido.productos = productos;

    res.status(200).json({ success: true, data: pedido });
  } catch (error) {
    console.error('Error al obtener el pedido:', error.message);
    res.status(500).json({ success: false, error: 'Error al obtener el pedido.' });
  }
};

/* Crear un pedido
exports.createPedido = async (req, res) => {
  const { productos } = req.body;

  try {
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ success: false, error: 'Debe proporcionar una lista de productos.' });
    }

    for (const producto of productos) {
      if (!producto.producto_id || !producto.cantidad || producto.cantidad <= 0) {
        return res.status(400).json({ success: false, error: 'Cada producto debe tener producto_id y una cantidad válida.' });
      }
    }

    const cotizacionDolar = await getCotizacionDolar();

    const nuevoPedido = {
      precio_total: 0, // Se calcula más adelante
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

    const precioTotalPesos = precioTotalDolares * cotizacionDolar;

    await Pedido.updateById(pedidoId, { precio_total: precioTotalPesos });

    res.status(201).json({
      success: true,
      data: {
        id: pedidoId,
        precio_total: precioTotalPesos,
        estado: 'Pendiente',
      },
    });
  } catch (error) {
    console.error('Error al crear el pedido:', error.message);
    res.status(500).json({ success: false, error: 'Error al crear el pedido.' });
  }
};*/
// Crear un pedido
exports.createPedido = async (req, res) => {
  const { productos } = req.body;

  try {
    if (!Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Debe proporcionar una lista de productos.' });
    }

    for (const producto of productos) {
      if (!producto.producto_id || !producto.cantidad || producto.cantidad <= 0) {
        return res.status(400).json({ error: 'Cada producto debe tener producto_id y una cantidad válida.' });
      }
    }

    const cotizacionDolar = await getCotizacionDolar();

    const nuevoPedido = {
      precio_total: 0,
      cotizacion_dolar: cotizacionDolar,
      estado: 'Pendiente',
    };
    const result = await Pedido.create(nuevoPedido);
    const pedidoId = result.insertId;

    let precioTotalDolares = 0;

    for (const producto of productos) {
      const productoData = await Producto.getByIdPromise(producto.producto_id);
      if (!productoData) {
        return res.status(404).json({ error: `Producto con ID ${producto.producto_id} no encontrado.` });
      }

      if (productoData.stock < producto.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para el producto ID ${producto.producto_id}.` });
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

    const precioTotalPesos = precioTotalDolares * cotizacionDolar;

    await Pedido.updateById(pedidoId, { precio_total: precioTotalPesos });

    res.status(201).json({
      id: pedidoId,
      precio_total: precioTotalPesos,
      estado: 'Pendiente',
    });
  } catch (error) {
    console.error('Error al crear el pedido:', error.message);
    res.status(500).json({ error: 'Error al crear el pedido.' });
  }
};


/* Actualizar un pedido
exports.updatePedido = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const pedido = await Pedido.getById(id);
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado.' });
    }

    await Pedido.updateById(id, { estado });

    res.status(200).json({
      success: true,
      data: {
        pedido_id: id,
        estado,
      },
    });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error.message);
    res.status(500).json({ success: false, error: 'Error al actualizar el pedido.' });
  }
};*/
// Actualizar un pedido
exports.updatePedido = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const pedido = await Pedido.getById(id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    await Pedido.updateById(id, { estado });

    res.status(200).json({
      pedido_id: id,
      estado,
    });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error.message);
    res.status(500).json({ error: 'Error al actualizar el pedido.' });
  }
};


// Eliminar un pedido
exports.deletePedido = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = await Pedido.getById(id);
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado.' });
    }

    await Pedido.deleteById(id);

    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Error al eliminar el pedido:', error.message);
    res.status(500).json({ success: false, error: 'Error al eliminar el pedido.' });
  }
};
