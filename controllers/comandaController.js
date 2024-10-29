// controllers/comandaController.js
const Comanda = require('../models/Comanda');
const Producto = require('../models/Producto');
const axios = require('axios');
require('dotenv').config();

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

const createComanda = async (req, res) => {
  const { productos } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).send('Token de autorización faltante.');
  const tokenValido = await validarToken(token);
  if (!tokenValido) return res.status(401).send('No autorizado. Token inválido.');

  if (!productos || productos.length === 0) return res.status(400).send('Debes agregar al menos un producto');

  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const cotizacionDolar = response.data.rates.ARS;

    let precioTotal = 0;
    const productosProcesados = await Promise.all(
      productos.map(async (item) => {
        const { id_producto, cantidad } = item;
        const producto = await Producto.getByIdPromise(id_producto);

        if (!producto) throw new Error(`Producto con id ${id_producto} no encontrado`);
        if (producto.stock < cantidad) throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);

        const subtotal = producto.precio * cantidad * cotizacionDolar;
        precioTotal += subtotal;

        return { id_producto, cantidad, subtotal };
      })
    );

    const nuevaComanda = {
      precio_total: precioTotal,
      cotizacion_dolar: cotizacionDolar,
    };

    const comandaId = await Comanda.create(nuevaComanda);

    await Promise.all(
      productosProcesados.map(async (producto) => {
        await Comanda.addProductoToComanda({
          id_comanda: comandaId,
          id_producto: producto.id_producto,
          cantidad: producto.cantidad,
          subtotal: producto.subtotal,
        });
        await Producto.updateStock(producto.id_producto, producto.cantidad);
      })
    );

    res.status(201).send('Comanda creada exitosamente con múltiples productos');
  } catch (error) {
    res.status(500).send('Error al crear la comanda: ' + error.message);
  }
};

const updateComanda = async (req, res) => {
  const { id } = req.params;
  const actualizacion = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).send('Token de autorización faltante.');

  const tokenValido = await validarToken(token);
  if (!tokenValido) return res.status(401).send('No autorizado. Token inválido.');

  try {
    const updatedComanda = await new Promise((resolve, reject) => {
      Comanda.updateById(id, actualizacion, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    if (!updatedComanda) return res.status(404).json({ error: 'Comanda no encontrada' });

    res.status(200).json({ message: 'Comanda actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la comanda: ' + error.message });
  }
};

const deleteComanda = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).send('Token de autorización faltante.');

  const tokenValido = await validarToken(token);
  if (!tokenValido) return res.status(401).send('No autorizado. Token inválido.');

  try {
    const deletedComanda = await new Promise((resolve, reject) => {
      Comanda.deleteById(id, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    if (!deletedComanda) return res.status(404).json({ error: 'Comanda no encontrada' });

    res.status(200).send('Comanda eliminada');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Exportamos todas las funciones de controlador
module.exports = {
  createComanda,
  updateComanda,
  deleteComanda,
};
