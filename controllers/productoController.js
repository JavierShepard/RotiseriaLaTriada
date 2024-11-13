const Producto = require('../models/Producto');
const axios = require('axios');

// Función para validar el token en dos endpoints
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

// Obtener todos los productos
exports.getAllProductos = async (req, res) => {
  try {
    const productos = await Producto.getAll();
    res.status(200).json({ success: true, data: productos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await Producto.getByIdPromise(id);
    if (!producto) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    res.status(200).json({ success: true, data: producto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  const { nombre, stock, precio } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token de autorización faltante.' });
  }

  const tokenValido = await validarToken(token);
  if (!tokenValido) {
    return res.status(401).json({ success: false, error: 'No autorizado. Token inválido.' });
  }

  try {
    const nuevoProducto = { nombre, stock, precio };
    const result = await Producto.create(nuevoProducto);
    res.status(201).json({ success: true, data: { id: result.insertId, ...nuevoProducto } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al crear el producto: ' + error.message });
  }
};

// Actualizar un producto por ID
exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, stock, precio } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Token de autorización faltante.' });
  }

  const tokenValido = await validarToken(token);
  if (!tokenValido) {
    return res.status(401).json({ success: false, error: 'No autorizado. Token inválido.' });
  }

  try {
    const result = await Producto.updateById(id, { nombre, stock, precio });
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    const updatedProducto = await Producto.getByIdPromise(id);
    res.status(200).json({ success: true, data: updatedProducto });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al actualizar el producto: ' + error.message });
  }
};

// Eliminar un producto por ID
exports.deleteProducto = async (req, res) => {
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
    const producto = await Producto.getByIdPromise(id);
    if (!producto) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado' });
    }
    await Producto.deleteById(id);
    res.status(204).send(); // No Content
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error al eliminar el producto: ' + error.message });
  }
};
