const Producto = require('../models/Producto');

exports.getAllProductos = (req, res) => {
  Producto.getAll((err, productos) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(productos);
  });
};

// Crear un nuevo producto
exports.createProducto = (req, res) => {
  const nuevoProducto = {
    nombre: req.body.nombre,
    stock: req.body.stock,
    precio: req.body.precio,
  };

  Producto.create(nuevoProducto, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Producto creado exitosamente' });
  });
};

// Actualizar un producto por ID
exports.updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, stock, precio } = req.body;
  const token = req.headers.authorization?.split(' ')[1];  // Recuperar el token

  try {
    const response = await axios.put(
      `https://rotiserialatriada.onrender.com/api/productos/${id}`,
      { nombre, stock, precio },
      {
        headers: {
          Authorization: `Bearer ${token}`  // Pasar el token
        }
      }
    );

    if (response.status === 200) {
      res.status(200).json({ message: 'Producto actualizado exitosamente' });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar un producto por ID
exports.deleteProducto = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization?.split(' ')[1];  // Recuperar el token

  try {
    const response = await axios.delete(
      `https://rotiserialatriada.onrender.com/api/productos/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`  // Pasar el token
        }
      }
    );

    if (response.status === 204) {
      res.status(200).json({ message: 'Producto eliminado' });
    } else {
      res.status(404).json({ error: 'Producto no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};