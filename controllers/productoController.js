const Producto = require('../models/Producto');

exports.getAllProductos = (req, res) => {
  Producto.getAll((err, productos) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(productos);
  });
};
// Añadir este método si no está definido
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

  try {
    // Validar el token
    await axios.get('https://taller6-alejo.onrender.com/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const nuevoProducto = { nombre, stock, precio };

    Producto.create(nuevoProducto, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Producto creado exitosamente', result });
    });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).send('No autorizado. Verifica tu token.');
    }
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

  try {
    // Validar el token
    await axios.get('https://taller6-alejo.onrender.com/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    Producto.updateById(id, { nombre, stock, precio }, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!result) return res.status(404).json({ error: 'Producto no encontrado' });
      res.status(200).json({ message: 'Producto actualizado exitosamente' });
    });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).send('No autorizado. Verifica tu token.');
    }
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

  try {
    // Validar el token
    await axios.get('https://taller6-alejo.onrender.com/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    Producto.deleteById(id, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!result) return res.status(404).json({ error: 'Producto no encontrado' });
      res.status(200).json({ message: 'Producto eliminado exitosamente' });
    });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).send('No autorizado. Verifica tu token.');
    }
    res.status(500).json({ error: 'Error al eliminar el producto: ' + error.message });
  }
};