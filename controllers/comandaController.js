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
// Añadir este método si no está definido
exports.getComandaById = (req, res) => {
  const { id } = req.params;
  Comanda.getById(id, (err, comanda) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!comanda) return res.status(404).json({ error: 'Comanda no encontrada' });
    res.json(comanda);
  });
};

// Crear una nueva comanda con múltiples productos
exports.createComanda = async (req, res) => {
  const { productos } = req.body;

  if (!productos || productos.length === 0) {
    return res.status(400).send('Debes agregar al menos un producto');
  }

  const token = req.headers.authorization?.split(' ')[1]; // Recuperar el token
  if (!token) {
    return res.status(401).send('Token de autorización faltante.');
  }

  try {
    // Validar el token
    await axios.get('https://taller6-alejo.onrender.com/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Obtener cotización del dólar
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
    const cotizacionDolar = response.data.rates.ARS;

    let precioTotal = 0;
    const productosProcesados = await Promise.all(productos.map(async (item) => {
      const { id_producto, cantidad } = item;
      const producto = await Producto.getByIdPromise(id_producto);

      if (!producto) {
        throw new Error(`Producto con id ${id_producto} no encontrado`);
      }

      if (producto.stock < cantidad) {
        throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);
      }

      const subtotal = producto.precio * cantidad * cotizacionDolar;
      precioTotal += subtotal;

      return { id_producto, cantidad, subtotal };
    }));

    const nuevaComanda = {
      precio_total: precioTotal,
      cotizacion_dolar: cotizacionDolar,
    };

    const comandaId = await Comanda.create(nuevaComanda);

    await Promise.all(productosProcesados.map(async (producto) => {
      await Comanda.addProductoToComanda({
        id_comanda: comandaId,
        id_producto: producto.id_producto,
        cantidad: producto.cantidad,
        subtotal: producto.subtotal,
      });

      await Producto.updateStock(producto.id_producto, producto.cantidad);
    }));

    res.status(201).send('Comanda creada exitosamente con múltiples productos');
  } catch (error) {
    res.status(500).send('Error al crear la comanda: ' + error.message);
  }
};


exports.updateComanda = async (req, res) => {
  const { id } = req.params;
  const actualizacion = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token de autorización faltante.');
  }

  try {
    // Validar el token
    await axios.get('https://taller6-alejo.onrender.com/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await axios.put(
      `https://rotiserialatriada.onrender.com/api/comandas/${id}`,
      actualizacion,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteComanda = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token de autorización faltante.');
  }

  try {
    // Validar el token
    await axios.get('https://taller6-alejo.onrender.com/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await axios.delete(
      `https://rotiserialatriada.onrender.com/api/comandas/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 204) {
      res.status(200).send('Comanda eliminada');
    } else {
      res.status(404).send('Comanda no encontrada');
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Función que llama al endpoint /me y devuelve el usuario
exports.getUsuario = async (req, res) => {
  try {
    const response = await axios.get('https://https://taller6-alejo.onrender.com/me', {
      headers: {
        'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1]}`  // Recuperar el token
      }
    });

    if (response.status === 200) {
      return res.json(response.data);
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).send('No autorizado. Verifica tu token.');
    } else {
      return res.status(500).send('Error al obtener el usuario: ' + error.message);
    }
  }
};

