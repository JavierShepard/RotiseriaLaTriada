const Pedido = require ('../models/pedido');
const Producto = require('../models/Producto');
let cotizacionDolarCache = null;
let lastCotizacionTimestamp = 0;

async function getCotizacionDolar() {
  const now = Date.now();
  if (cotizacionDolarCache && (now - lastCotizacionTimestamp) < 10 * 60 * 1000) {
    // Retorna la cotización en caché si es reciente (10 minutos)
    return cotizacionDolarCache;
  }
  
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    cotizacionDolarCache = response.data.rates.ARS;
    lastCotizacionTimestamp = now;
    return cotizacionDolarCache;
  } catch (error) {
    console.error("Error al obtener la cotización del dólar:", error.message);
    throw new Error("No se pudo obtener la cotización del dólar");
  }
}

// Obtener todos los pedidos
exports.getAllPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.getAll();
    res.status(200).json({ success: true, data: pedidos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtener un pedido por ID
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
};

exports.createPedido = async (req, res) => {
  const { producto_id, cantidad } = req.body;

  try {
    // Verificar que se reciba el producto_id
    if (!producto_id) {
      return res.status(400).json({ success: false, error: 'El campo producto_id es obligatorio.' });
    }

    // Verificar que se reciba la cantidad
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ success: false, error: 'La cantidad debe ser mayor a 0.' });
    }

    // Verificar que el producto exista
    const producto = await Producto.getByIdPromise(producto_id);
    if (!producto) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }

    // Verificar stock disponible
    if (producto.stock < cantidad) {
      return res.status(400).json({ success: false, error: 'Stock insuficiente' });
    }

    // Obtener cotización del dólar
    const cotizacionDolar = await getCotizacionDolar();

    // Calcular precio total en dólares
    const precioTotal = producto.precio * cantidad;

    // Crear pedido con estado inicial "Pendiente"
    const nuevoPedido = {
      precio_total: precioTotal,
      cotizacion_dolar: cotizacionDolar,
      estado: 'Pendiente',
    };
    const result = await Pedido.create(nuevoPedido);

    // Actualizar stock del producto
    await Producto.updateById(producto_id, { stock: producto.stock - cantidad });

    res.status(201).json({
      success: true,
      data: { id: result.insertId, ...nuevoPedido },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al crear el pedido: ' + error.message });
  }
};

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
      error: 'Error al eliminar el pedido: ' + error.message,
    });
  }
};