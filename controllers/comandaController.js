// controllers/comandaController.js
const Comanda = require('../models/Comanda');
const Producto = require('../models/Producto');
const axios = require('axios');
require('dotenv').config();

exports.createComanda = async (req, res) => {
  const { id_producto, cantidad } = req.body;

  // Obtener el producto y verificar el stock
  Producto.getById(id_producto, async (err, productos) => {
    if (err) return res.status(500).send(err);
    const producto = productos[0];

    if (!producto) return res.status(404).send('Producto no encontrado');
    if (producto.stock < cantidad) return res.status(400).send('Stock insuficiente');

    // Obtener cotización del dólar desde una API externa
    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      const cotizacionDolar = response.data.rates.ARS; // Cotización del dólar en pesos argentinos

      const precioTotal = producto.precio * cantidad * cotizacionDolar;

      // Crear comanda en la base de datos
      const nuevaComanda = {
        id_producto,
        cantidad,
        precio_total: precioTotal,
        cotizacion_dolar: cotizacionDolar
      };

      Comanda.create(nuevaComanda, (err, result) => {
        if (err) return res.status(500).send(err);

        // Actualizar stock del producto
        const nuevoStock = producto.stock - cantidad;
        Producto.updateStock(id_producto, nuevoStock, (err, result) => {
          if (err) return res.status(500).send(err);
          res.status(201).send('Comanda creada y stock actualizado');
        });
      });
    } catch (error) {
      res.status(500).send('Error al obtener la cotización del dólar');
    }
  });
};
