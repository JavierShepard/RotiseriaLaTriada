const Comanda = require('../models/Comanda');
const Producto = require('../models/Producto'); // Usaremos el modelo Producto para cálculos
const axios = require('axios');

// Variables para la cotización del dólar
let cotizacionDolarCache = null;
let lastCotizacionTimestamp = 0;

async function getCotizacionDolar() {
  const now = Date.now();
  if (cotizacionDolarCache && (now - lastCotizacionTimestamp) < 10 * 60 * 1000) {
    return cotizacionDolarCache; // Retorna la cotización en caché si es reciente
  }

  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    cotizacionDolarCache = response.data.rates.ARS;
    lastCotizacionTimestamp = now;
    return cotizacionDolarCache;
  } catch (error) {
    console.error('Error al obtener la cotización del dólar:', error.message);
    throw new Error('No se pudo obtener la cotización del dólar');
  }
}

exports.getAllComandas = async (req, res) => {
  try {
    const comandas = await Comanda.getAll();
    res.status(200).json({ success: true, data: comandas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getComandaById = async (req, res) => {
  const { id } = req.params;

  try {
    const comanda = await Comanda.getById(id);
    if (!comanda) {
      return res.status(404).json({ success: false, error: 'Comanda no encontrada' });
    }
    res.status(200).json({ success: true, data: comanda });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createComanda = async (req, res) => {
  const { productos } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, error: 'Token de autorización faltante.' });

  try {
    // Validar el token
    const tokenValido = await validarToken(token);
    if (!tokenValido) return res.status(401).json({ success: false, error: 'Token inválido.' });

    if (!productos || productos.length === 0) {
      return res.status(400).json({ success: false, error: 'Debes agregar al menos un producto.' });
    }

    const cotizacionDolar = await getCotizacionDolar();

    let precioTotal = 0;
    const productosProcesados = await Promise.all(
      productos.map(async (item) => {
        const { id_producto, cantidad } = item;
        const producto = await Producto.getByIdPromise(id_producto);

        if (!producto) throw new Error(`Producto con id ${id_producto} no encontrado.`);
        if (producto.stock < cantidad) throw new Error(`Stock insuficiente para el producto ${producto.nombre}.`);

        const subtotal = producto.precio * cantidad * cotizacionDolar;
        precioTotal += subtotal;

        return { id_producto, cantidad, subtotal };
      })
    );

    const nuevaComanda = {
      precio_total: precioTotal,
      cotizacion_dolar: cotizacionDolar,
      estado: 'Pendiente',
    };

    const comandaId = await Comanda.create(nuevaComanda);

    res.status(201).json({ success: true, message: 'Comanda creada exitosamente', data: { id: comandaId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
