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
    res.status(200).json(productos); // Devolver solo los productos
  } catch (error) {
    res.status(500).json({ error: error.message }); // Dejar el mensaje de error
  }
};


// Obtener un producto por ID
exports.getProductoById = async (req, res) => {
  const { id } = req.params;

  try {
    const producto = await Producto.getByIdPromise(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' }); // Mantener mensaje de error
    }
    res.status(200).json(producto); // Devolver solo el producto
  } catch (error) {
    res.status(500).json({ error: error.message }); // Dejar el mensaje de error
  }
};

/* Crear un nuevo producto
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
*/
// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  const { nombre, stock, precio } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autorización faltante.' });
  }

  const tokenValido = await validarToken(token);
  if (!tokenValido) {
    return res.status(401).json({ error: 'No autorizado. Token inválido.' });
  }

  try {
    const nuevoProducto = { nombre, stock, precio };
    const result = await Producto.create(nuevoProducto);
    res.status(201).json({ id: result.insertId, ...nuevoProducto }); // Devolver solo los detalles del producto
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto: ' + error.message });
  }
};


/* Actualizar un producto existente
exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, stock, precio } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autorización faltante.' });
  }

  const tokenValido = await validarToken(token);
  if (!tokenValido) {
    return res.status(401).json({ error: 'No autorizado. Token inválido.' });
  }

  try {
    await Producto.update(id, { nombre, stock, precio });
    res.status(204).send(); // Retorna un estado 204 sin cuerpo
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto: ' + error.message });
  }
};*/
/* Actualizar un producto existente
exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, stock, precio } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autorización faltante.' });
  }

  const tokenValido = await validarToken(token);
  if (!tokenValido) {
    return res.status(401).json({ error: 'No autorizado. Token inválido.' });
  }

  try {
    await Producto.update(id, { nombre, stock, precio });
    res.status(204).send(); // Retorna un estado 204 sin cuerpo
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto: ' + error.message });
  }
};*/
// Actualizar un producto existente
exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, stock, precio } = req.body;
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de autorización faltante.' });
  }

  const tokenValido = await validarToken(token);
  if (!tokenValido) {
    return res.status(401).json({ error: 'No autorizado. Token inválido.' });
  }

  try {
    // Verificar que el producto existe
    const productoExistente = await Producto.getByIdPromise(id);
    if (!productoExistente) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Preparar el objeto con los campos a actualizar (puedes actualizar solo lo que recibas)
    const fieldsToUpdate = {};
    if (nombre) fieldsToUpdate.nombre = nombre;
    if (stock !== undefined) fieldsToUpdate.stock = stock;
    if (precio !== undefined) fieldsToUpdate.precio = precio;

    // Actualizar el producto en la base de datos
    await Producto.updateById(id, fieldsToUpdate);

    // Responder con un 204 (sin cuerpo)
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el producto: ' + error.message });
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
