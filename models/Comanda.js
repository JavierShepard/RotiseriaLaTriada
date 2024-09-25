// controllers/comandaController.js
const Comanda = require('../models/Comanda');
const Producto = require('../models/Producto');
const axios = require('axios');
require('dotenv').config();

// Obtener todas las comandas
exports.getAllComandas = (req, res) => {
  Comanda.getAll((err, comandas) => {
    if (err) return res.status(500).send(err);
    res.json(comandas);
  });
};

// Obtener una comanda por ID
exports.getComandaById = (req, res) => {
  const { id } = req.params;
  Comanda.getById(id, (err, comanda) => {
    if (err) return res.status(500).send(err);
    if (!comanda.length) return res.status(404).send('Comanda no encontrada');
    res.json(comanda[0]);
  });
};

// Crear una nueva comanda
exports.createComanda = async (req, res) => {
  const { id_producto, cantidad } = req.body;

  Producto.getById(id_producto, async (err, productos) => {
    if (err) return res.status(500).send(err);
    const producto = productos[0];

    if (!producto) return res.status(404).send('Producto no encontrado');
    if (producto.stock < cantidad) return res.status(400).send('Stock insuficiente');

    try {
      const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
      const cotizacionDolar = response.data.rates.ARS;

      const precioTotal = producto.precio * cantidad * cotizacionDolar;

      const nuevaComanda = {
        id_producto,
        cantidad,
        precio_total: precioTotal,
        cotizacion_dolar: cotizacionDolar
      };

      Comanda.create(nuevaComanda, (err, result) => {
        if (err) return res.status(500).send(err);

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

// Actualizar una comanda por ID
exports.updateComanda = (req, res) => {
  const { id } = req.params;
  const { id_producto, cantidad, precio_total, cotizacion_dolar } = req.body;

  Comanda.updateById(id, { id_producto, cantidad, precio_total, cotizacion_dolar }, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).send('Comanda no encontrada');
    res.status(200).send('Comanda actualizada');
  });
};

// Eliminar una comanda por ID
exports.deleteComanda = (req, res) => {
  const { id } = req.params;

  Comanda.deleteById(id, (err, result) => {
    if (err) return res.status(500).send(err);
    if (result.affectedRows === 0) return res.status(404).send('Comanda no encontrada');
    res.status(200).send('Comanda eliminada');
  });
};
