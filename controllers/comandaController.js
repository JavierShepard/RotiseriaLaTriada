const Comanda = require('../models/Comanda');
const Producto = require('../models/Producto');
const axios = require('axios');
require('dotenv').config();

// Obtener todas las comandas
exports.getAllComandas = (req, res) => {
  Comanda.getAll((err, comandas) => {
    if (err) {
      console.error('Error al obtener comandas:', err);
      return res.status(500).send('Error al obtener comandas');
    }
    res.status(200).json(comandas);
  });
};

// Obtener una comanda por ID
exports.getComandaById = (req, res) => {
  const { id } = req.params;
  Comanda.getById(id, (err, comanda) => {
    if (err) {
      console.error('Error al obtener la comanda:', err);
      return res.status(500).send('Error al obtener la comanda');
    }
    if (!comanda.length) return res.status(404).send('Comanda no encontrada');
    res.status(200).json(comanda[0]);
  });
};

// Crear una nueva comanda con múltiples productos
exports.createComanda = async (req, res) => {
  const { productos } = req.body;  // El cliente debe enviar un array de productos [{id_producto, cantidad}, ...]

  if (!productos || productos.length === 0) {
    return res.status(400).send('Debes agregar al menos un producto');
  }

  try {
    // Obtener cotización del dólar desde una API externa
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const cotizacionDolar = response.data.rates.ARS;

    let precioTotal = 0;  // Para almacenar el precio total de la comanda

    // Validar y calcular el total de la comanda
    const productosProcesados = await Promise.all(productos.map(async (item) => {
      const { id_producto, cantidad } = item;

      // Obtener el producto por ID
      const producto = await Producto.getByIdPromise(id_producto); // Usar promesas para obtener el producto
      if (!producto) throw new Error(`Producto con id ${id_producto} no encontrado`);

      // Verificar que haya suficiente stock
      if (producto.stock < cantidad) throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);

      // Calcular el subtotal para el producto
      const subtotal = producto.precio * cantidad * cotizacionDolar;
      precioTotal += subtotal;

      return {
        id_producto,
        cantidad,
        subtotal
      };
    }));

    // Crear la comanda general en la base de datos
    const nuevaComanda = {
      precio_total: precioTotal,
      cotizacion_dolar: cotizacionDolar
    };

    const comandaId = await Comanda.create(nuevaComanda); // Insertar la comanda en la tabla 'comandas' y obtener el ID

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
    }));

    res.status(201).send('Comanda creada exitosamente con múltiples productos');
  } catch (error) {
    console.error('Error al crear la comanda:', error.message);
    res.status(500).send('Error al crear la comanda');
  }
};

// Actualizar una comanda por ID
exports.updateComanda = async (req, res) => {
  const { id } = req.params;
  const { productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).send('Debes proporcionar productos para actualizar');
  }

  try {
    const comandaExistente = await Comanda.getByIdPromise(id);
    if (!comandaExistente) return res.status(404).send('Comanda no encontrada');

    let precioTotal = 0;
    const cotizacionDolar = comandaExistente.cotizacion_dolar;

    const productosProcesados = await Promise.all(productos.map(async (item) => {
      const { id_producto, cantidad } = item;
      const producto = await Producto.getByIdPromise(id_producto);
      if (!producto) throw new Error(`Producto con id ${id_producto} no encontrado`);
      if (producto.stock < cantidad) throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);

      const subtotal = producto.precio * cantidad * cotizacionDolar;
      precioTotal += subtotal;

      return { id_producto, cantidad, subtotal };
    }));

    const comandaActualizada = { precio_total: precioTotal };
    await Comanda.updateById(id, comandaActualizada);

    await Comanda.clearComandaProductos(id);
    await Promise.all(productosProcesados.map(async (producto) => {
      await Comanda.addProductoToComanda({
        id_comanda: id,
        id_producto: producto.id_producto,
        cantidad: producto.cantidad,
        subtotal: producto.subtotal
      });
      await Producto.updateStock(producto.id_producto, producto.cantidad);
    }));

    res.status(200).send('Comanda actualizada exitosamente');
  } catch (error) {
    console.error('Error al actualizar la comanda:', error.message);
    res.status(500).send('Error al actualizar la comanda');
  }
};

// Eliminar una comanda por ID
exports.deleteComanda = (req, res) => {
  const { id } = req.params;

  Comanda.deleteById(id, (err, result) => {
    if (err) {
      console.error('Error al eliminar la comanda:', err);
      return res.status(500).send('Error al eliminar la comanda');
    }
    if (result.affectedRows === 0) return res.status(404).send('Comanda no encontrada');
    res.status(200).send('Comanda eliminada exitosamente');
  });
};
