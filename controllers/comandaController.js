const Comanda = require('../models/Comanda');
const Producto = require('../models/Producto');
const ComandaProducto = require('../models/ComandaProducto');
const axios = require('axios');
const db = require('../config/db');
require('dotenv').config();

// Validación de token en dos endpoints
async function validarToken(token) {
  try {
    const response = await axios.get('https://taller6-alejo.onrender.com/usuarios/1', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) return true;
  } catch (error) {
    console.error('Token no válido en el primer endpoint:', error.message);
  }

  try {
    await axios.get('https://taller6-alejo.onrender.com/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true;
  } catch (error) {
    console.error('Token no válido en el segundo endpoint:', error.message);
  }

  return false;
}

// Obtener todas las comandas
exports.getAllComandas = async (req, res) => {
  try {
    const comandas = await Comanda.getAll();
    res.status(200).json({ success: true, data: comandas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtener comanda por ID
exports.getComandaById = async (req, res) => {
  const { id } = req.params;
  try {
    const comanda = await Comanda.getByIdPromise(id);
    if (!comanda) {
      return res.status(404).json({ success: false, error: 'Comanda no encontrada' });
    }
    res.status(200).json({ success: true, data: comanda });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Crear una comanda
exports.createComanda = async (req, res) => {
  const { productos } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token de autorización faltante.' });
  }

  const tokenValido = await validarToken(token);
  if (!tokenValido) {
    return res.status(401).json({ success: false, error: 'No autorizado. Token inválido.' });
  }

  if (!productos || productos.length === 0) {
    return res.status(400).json({ success: false, error: 'Debes agregar al menos un producto.' });
  }

  try {
    // Obtener cotización del dólar
    const cotizacionDolar = await getCotizacionDolar();

    let precioTotal = 0;
    const productosProcesados = await Promise.all(productos.map(async (item) => {
      const { id_producto, cantidad } = item;
      const producto = await Producto.getByIdPromise(id_producto);

      if (!producto) throw new Error(`Producto con id ${id_producto} no encontrado`);
      if (producto.stock < cantidad) throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);

      const subtotal = producto.precio * cantidad * cotizacionDolar;
      precioTotal += subtotal;

      return { id_producto, cantidad, subtotal };
    }));

    const nuevaComanda = {
      precio_total: precioTotal,
      cotizacion_dolar: cotizacionDolar,
    };

    // Crear la comanda en la base de datos y obtener su ID
    const comandaId = await Comanda.create(nuevaComanda);

    // Registrar cada producto en comanda_productos y actualizar el stock
    await Promise.all(productosProcesados.map(async (producto) => {
      await ComandaProducto.create({
        id_comanda: comandaId,
        id_producto: producto.id_producto,
        cantidad: producto.cantidad,
        subtotal: producto.subtotal,
      });

      await Producto.updateStock(producto.id_producto, producto.cantidad);
    }));

    res.status(201).json({ success: true, data: { ...nuevaComanda, productos: productosProcesados } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al crear la comanda: ' + error.message });
  }
};

// Eliminar una comanda
exports.deleteComanda = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token de autorización faltante.' });
  }

  const tokenValido = await validarToken(token);
  if (!tokenValido) {
    return res.status(401).json({ success: false, error: 'No autorizado. Token inválido.' });
  }

  try {
    const comanda = await Comanda.getByIdPromise(id);
    if (!comanda) {
      return res.status(404).json({ success: false, error: 'Comanda no encontrada' });
    }

    await Comanda.deleteById(id);
    res.status(200).json({ success: true, data: comanda });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Actualizar una comanda
exports.updateComanda = async (req, res) => {
  const { id } = req.params;
  const { productos } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token de autorización faltante.' });
  }

  const tokenValido = await validarToken(token);
  if (!tokenValido) {
    return res.status(401).json({ success: false, error: 'No autorizado. Token inválido.' });
  }

  if (!productos || productos.length === 0) {
    return res.status(400).json({ success: false, error: 'Debes agregar al menos un producto.' });
  }

  try {
    const cotizacionDolar = await getCotizacionDolar();

    let precioTotal = 0;
    const productosProcesados = await Promise.all(productos.map(async (item) => {
      const { id_producto, cantidad } = item;
      const producto = await Producto.getByIdPromise(id_producto);

      if (!producto) throw new Error(`Producto con id ${id_producto} no encontrado`);
      if (producto.stock < cantidad) throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);

      const subtotal = producto.precio * cantidad * cotizacionDolar;
      precioTotal += subtotal;

      return { id_producto, cantidad, subtotal };
    }));

    const comandaActualizada = {
      precio_total: precioTotal,
      cotizacion_dolar: cotizacionDolar,
    };

    await Comanda.updateById(id, comandaActualizada);

    await ComandaProducto.deleteByComandaId(id);
    await Promise.all(productosProcesados.map(async (producto) => {
      await ComandaProducto.create({
        id_comanda: id,
        id_producto: producto.id_producto,
        cantidad: producto.cantidad,
        subtotal: producto.subtotal,
      });

      await Producto.updateStock(producto.id_producto, producto.cantidad);
    }));

    res.status(200).json({ success: true, data: { ...comandaActualizada, productos: productosProcesados } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al actualizar la comanda: ' + error.message });
  }
};
