const Producto = require('../models/Producto');
const axios = require('axios');

// Función para validar el token en dos endpoints
async function validarToken(token) {
  try {
    // Intento de validación con el primer endpoint
    const response = await axios.get('https://taller6-alejo.onrender.com/usuarios/1', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 200) return true; // Token válido con el primer endpoint
  } catch (error) {
    console.error('Token no válido en el primer endpoint:', error.message);
  }

  try {
    // Intento de validación con el segundo endpoint si el primero falla
    await axios.get('https://taller6-alejo.onrender.com/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return true; // Token válido con el segundo endpoint
  } catch (error) {
    console.error('Token no válido en el segundo endpoint:', error.message);
  }

  return false; // Token no válido en ambos endpoints
}

exports.getAllProductos = (req, res) => {
  Producto.getAll((err, productos) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(productos);
  });
};

// Obtener un producto por ID
exports.getProductoById = (req, res) => {
  const { id } = req.params;
  Producto.getById(id, (err, producto) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  });
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  const { nombre, stock, precio } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token de autorización faltante.');
  }

  // Validación del token
  const tokenValido = await validarToken(token);
  if (!tokenValido) return res.status(401).send('No autorizado. Token inválido.');

  try {
    const nuevoProducto = { nombre, stock, precio };
    Producto.create(nuevoProducto, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Producto creado exitosamente', result });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto: ' + error.message });
  }
};

// Actualizar un producto por ID
exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, stock, precio } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token de autorización faltante.');
  }

  // Validación del token
  const tokenValido = await validarToken(token);
  if (!tokenValido) return res.status(401).send('No autorizado. Token inválido.');

  try {
    Producto.updateById(id, { nombre, stock, precio }, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!result) return res.status(404).json({ error: 'Producto no encontrado' });
      res.status(200).json({ message: 'Producto actualizado exitosamente' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto: ' + error.message });
  }
};

// Eliminar un producto por ID
exports.deleteProducto = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).send('Token de autorización faltante.');
  }

  // Validación del token
  const tokenValido = await validarToken(token);
  if (!tokenValido) return res.status(401).send('No autorizado. Token inválido.');

  try {
    Producto.deleteById(id, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!result) return res.status(404).json({ error: 'Producto no encontrado' });
      res.status(200).json({ message: 'Producto eliminado exitosamente' });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el producto: ' + error.message });
  }
};
