const Pedido = require ('../models/pedido');
const Producto = require('../models/Producto');
//const { getCotizacionDolar } = require('../utils/dolarUtils');
let cotizacionDolarCache = null;
let lastCotizacionTimestamp = 0;

async function getCotizacionDolar() {
  const now = Date.now();
  if (cotizacionDolarCache && (now - lastCotizacionTimestamp) < 10 * 60 * 1000) {
    return cotizacionDolarCache; // Devuelve la cotización en caché si es reciente
  }
  
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    if (response.data && response.data.rates && response.data.rates.ARS) {
      cotizacionDolarCache = response.data.rates.ARS;
      lastCotizacionTimestamp = now;
      return cotizacionDolarCache;
    } else {
      throw new Error('La respuesta de la API no contiene la tasa ARS.');
    }
  } catch (error) {
    console.error("Error al obtener la cotización del dólar:", error.message);
    throw new Error("No se pudo obtener la cotización del dólar. Por favor intente más tarde.");
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

// Actualizar un pedido (por ejemplo, cambiar estado)
exports.updatePedido = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const pedido = await Pedido.getById(id);
    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    await Pedido.updateById(id, { estado });
    res.status(200).json({ success: true, data: { id, estado } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al actualizar el pedido: ' + error.message });
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

    await Pedido.deleteById(id);
    res.status(200).json({ success: true, data: pedido });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al eliminar el pedido: ' + error.message });
  }
};
