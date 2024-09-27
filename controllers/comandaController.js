// controllers/comandaController.js
const Comanda = require('../models/Comanda');
const Producto = require('../models/Producto');
const axios = require('axios');
require('dotenv').config();
exports.getAllComandas = (req, res) => {
  Comanda.getAll((err, comandas) => {
    if (err) return res.status(500).send(err);
    res.json(comandas);
  });
};
// Crear una nueva comanda con múltiples productos
exports.createComanda = async (req, res) => {
  const { productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).send('Debes agregar al menos un producto');
  }

  try {
    console.log("Solicitud de comanda recibida con productos:", productos);

    // Obtener cotización del dólar desde una API externa
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const cotizacionDolar = response.data.rates.ARS;
    console.log("Cotización del dólar obtenida:", cotizacionDolar);

    let precioTotal = 0;  // Para almacenar el precio total de la comanda

    // Validar y calcular el total de la comanda
    const productosProcesados = await Promise.all(productos.map(async (item) => {
      const { id_producto, cantidad } = item;

      console.log("Procesando producto con id:", id_producto);

      // Obtener el producto por ID
      const producto = await Producto.getByIdPromise(id_producto);
      if (!producto) {
        console.error(`Producto con id ${id_producto} no encontrado`);
        throw new Error(`Producto con id ${id_producto} no encontrado`);
      }

      // Verificar que haya suficiente stock
      if (producto.stock < cantidad) {
        console.error(`Stock insuficiente para el producto ${producto.nombre}`);
        throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);
      }

      // Calcular el subtotal para el producto
      const subtotal = producto.precio * cantidad * cotizacionDolar;
      precioTotal += subtotal;

      return {
        id_producto,
        cantidad,
        subtotal
      };
    }));

    console.log("Productos procesados correctamente:", productosProcesados);

    // Crear la comanda general en la base de datos
    const nuevaComanda = {
      precio_total: precioTotal,
      cotizacion_dolar: cotizacionDolar
    };

    const comandaId = await Comanda.create(nuevaComanda);
    console.log("Comanda creada con ID:", comandaId);

    // Insertar cada producto en la tabla 'comanda_productos'
    await Promise.all(productosProcesados.map(async (producto) => {
      await Comanda.addProductoToComanda({
        id_comanda: comandaId,
        id_producto: producto.id_producto,
        cantidad: producto.cantidad,
        subtotal: producto.subtotal
      });

      // Actualizar el stock de los productos
      await Producto.updateStock(producto.id_producto, producto.cantidad);
      console.log(`Stock actualizado para producto con id ${producto.id_producto}`);
    }));

    res.status(201).send('Comanda creada exitosamente con múltiples productos');
  } catch (error) {
    console.error('Error al crear la comanda:', error.message);
    res.status(500).send('Error al crear la comanda: ' + error.message);
  }
};
// Obtener una comanda por ID
exports.getComandaById = (req, res) => {
  const { id } = req.params;
  Comanda.getById(id, (err, comanda) => {
    if (err) return res.status(500).send(err);
    if (!comanda) return res.status(404).send('Comanda no encontrada');
    res.json(comanda);
  });
};

// Actualizar una comanda por ID
exports.updateComanda = (req, res) => {
  const { id } = req.params;
  const actualizacion = req.body;
  Comanda.updateById(id, actualizacion, (err, result) => {
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
